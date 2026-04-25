/**
 * cv-local-extractor.ts
 *
 * Pure regex/rule-based CV field extraction.
 * No AI, no network calls — runs entirely in the browser.
 *
 * Designed for the CV Builder import flow:
 *   Upload PDF/DOCX → parse to text → extractCVFields(text) → populate form
 *
 * Section detection uses a 4-layer approach:
 *   Layer 1 — Normalize heading (lowercase, strip punctuation)
 *   Layer 2 — Exact alias match against comprehensive map
 *   Layer 3 — Fuzzy match (Levenshtein distance ≤ 2) for typos/near-matches
 *   Layer 4 — Content-based fallback for headerless CVs
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ExtractedExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface ExtractedEducation {
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

export interface ExtractedCertification {
  name: string;
  issuer: string;
  year: string;
}

export interface ExtractedLanguage {
  name: string;
  proficiency: string;
}

export interface ExtractedReferee {
  name: string;
  title: string;
  organization: string;
  phone: string;
  email: string;
}

export interface ExtractedCV {
  name: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  skills: string[];
  careerStrengths: string[];
  experience: ExtractedExperience[];
  education: ExtractedEducation[];
  certifications: ExtractedCertification[];
  languages: ExtractedLanguage[];
  referees: ExtractedReferee[];
}

/** Canonical section IDs used internally */
type SectionId =
  | 'professional_summary'
  | 'skills'
  | 'work_experience'
  | 'education'
  | 'certifications'
  | 'professional_qualifications'
  | 'projects'
  | 'languages'
  | 'references'
  | 'awards'
  | 'volunteer_experience'
  | 'publications'
  | 'interests'
  | 'contact_information'
  | 'header';

// ─── Section Alias Database ─────────────────────────────────────────────────
/**
 * Comprehensive alias map. Each canonical ID maps to every known variant
 * of that section heading. This is the SINGLE SOURCE OF TRUTH for section
 * detection — no scattered regex patterns elsewhere.
 *
 * To add a new alias: just append it to the appropriate array.
 */
const CV_SECTION_ALIASES: Record<Exclude<SectionId, 'header'>, string[]> = {
  professional_summary: [
    'professional summary',
    'profile summary',
    'career summary',
    'executive summary',
    'summary',
    'about me',
    'about',
    'personal profile',
    'professional profile',
    'career profile',
    'candidate profile',
    'overview',
    'profile',
    'objective',
    'career objective',
    'professional objective',
    'personal statement',
    'statement of purpose',
  ],

  skills: [
    'skills',
    'key skills',
    'core skills',
    'skills summary',
    'technical skills',
    'professional skills',
    'competencies',
    'core competencies',
    'key competencies',
    'areas of expertise',
    'areas of strength',
    'expertise',
    'strengths',
    'career strengths',
    'capabilities',
    'proficiencies',
    'tools and technologies',
    'technical proficiencies',
    'key strengths',
    'areas of specialisation',
    'areas of specialization',
  ],

  work_experience: [
    'work experience',
    'professional experience',
    'employment history',
    'career history',
    'experience',
    'relevant experience',
    'professional background',
    'employment experience',
    'work history',
    'career experience',
    'positions held',
    'appointments',
    'job history',
    'employment record',
  ],

  education: [
    'education',
    'academic background',
    'academic qualifications',
    'educational background',
    'education background',
    'academic history',
    'qualifications',
    'educational qualifications',
    'academic credentials',
    'education and qualifications',
  ],

  certifications: [
    'certifications',
    'certificates',
    'training and certifications',
    'training & certifications',
    'training certifications',
    'licenses and certifications',
    'professional certifications',
    'courses and certifications',
    'credentials',
    'certifications & training',
    'certifications and training',
  ],

  professional_qualifications: [
    'professional qualifications',
    'professional credentials',
    'professional training',
    'professional courses',
    'professional development',
    'professional membership',
    'professional memberships',
  ],

  projects: [
    'projects',
    'key projects',
    'selected projects',
    'project experience',
    'portfolio',
    'case studies',
    'notable projects',
  ],

  languages: [
    'languages',
    'language skills',
    'language proficiency',
    'spoken languages',
  ],

  references: [
    'references',
    'referees',
    'professional references',
    'references available upon request',
  ],

  awards: [
    'awards',
    'honors',
    'honours',
    'awards and honors',
    'awards and honours',
    'awards & honors',
    'awards & honours',
    'achievements',
    'accomplishments',
    'recognition',
  ],

  volunteer_experience: [
    'volunteer experience',
    'volunteering',
    'community service',
    'community involvement',
    'social work',
    'voluntary work',
    'community engagement',
  ],

  publications: [
    'publications',
    'papers',
    'research papers',
    'articles',
    'published works',
    'journals',
  ],

  interests: [
    'interests',
    'hobbies',
    'interests and hobbies',
    'hobbies and interests',
    'personal interests',
  ],

  contact_information: [
    'contact',
    'contact information',
    'personal details',
    'personal information',
    'bio data',
    'biodata',
    'contact details',
  ],
};

// ─── Layer 1: Normalization ──────────────────────────────────────────────────

/**
 * Normalize a heading string for matching:
 *   "PROFESSIONAL SUMMARY:" → "professional summary"
 *   "  Career Profile  " → "career profile"
 *   "Skills | Technical" → "skills technical" (pipe treated as word sep)
 */
function normalizeHeading(raw: string): string {
  return raw
    .trim()
    // Strip trailing punctuation: colons, dashes, periods
    .replace(/[:\-–—.]+$/, '')
    .trim()
    // Replace pipes, ampersands with spaces
    .replace(/[|&]/g, ' ')
    // Collapse multiple whitespace
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

// ─── Layer 3: Levenshtein Distance (no external dependency) ──────────────────

/**
 * Compute the Levenshtein edit distance between two strings.
 * O(n*m) time, O(min(n,m)) space — fast enough for heading matching.
 */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  // Use single-row optimization
  let prev = new Array(lb + 1);
  let curr = new Array(lb + 1);
  for (let j = 0; j <= lb; j++) prev[j] = j;

  for (let i = 1; i <= la; i++) {
    curr[0] = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[lb];
}

/** Maximum edit distance to consider a fuzzy match. */
const FUZZY_THRESHOLD = 2;

// ─── Build fast lookup structures ────────────────────────────────────────────

/**
 * Build a Set of normalized aliases for O(1) exact lookup.
 * Also store the canonical ID for each alias.
 */
const ALIAS_TO_SECTION = new Map<string, SectionId>();
const SECTION_IDS = Object.keys(CV_SECTION_ALIASES) as SectionId[];

for (const sectionId of SECTION_IDS) {
  for (const alias of CV_SECTION_ALIASES[sectionId]) {
    ALIAS_TO_SECTION.set(alias, sectionId);
  }
}

// ─── Layer 2 + 3: Section matching ───────────────────────────────────────────

/**
 * Try to match a raw heading line to a canonical section ID.
 *
 * Strategy:
 *   1. Normalize the heading
 *   2. Exact match against alias map
 *   3. Fuzzy match (Levenshtein ≤ 2) — best match wins
 *
 * Returns the canonical SectionId, or null if no match.
 */
function matchSection(rawHeading: string): SectionId | null {
  const normalized = normalizeHeading(rawHeading);
  if (!normalized || normalized.length < 2) return null;

  // Layer 2: Exact match
  const exactMatch = ALIAS_TO_SECTION.get(normalized);
  if (exactMatch) return exactMatch;

  // Layer 3: Fuzzy match — find the alias with lowest edit distance
  // Only check if the lengths are close (avoid O(n*m) for wildly different strings)
  let bestMatch: SectionId | null = null;
  let bestDist = Infinity;

  for (const [alias, sectionId] of ALIAS_TO_SECTION) {
    const lenDiff = Math.abs(alias.length - normalized.length);
    if (lenDiff > FUZZY_THRESHOLD) continue; // Can't match within threshold

    const dist = levenshtein(normalized, alias);
    if (dist < bestDist && dist <= FUZZY_THRESHOLD) {
      bestDist = dist;
      bestMatch = sectionId;
    }
  }

  return bestMatch;
}

// ─── Heading detection ───────────────────────────────────────────────────────

/**
 * A line is a heading candidate if it:
 *   - Is short (≤ 80 chars)
 *   - Is mostly uppercase or Title Case (not paragraph text)
 *   - Doesn't start with a bullet
 *   - Doesn't look like a data line (no dates, emails, long prose)
 */
function isHeadingCandidate(line: string): boolean {
  if (line.length < 2 || line.length > 80) return false;
  if (/^[•·▪▸►→●\-\*\d]/.test(line)) return false;
  if (EMAIL_RE.test(line)) return false;
  // Very long lines are prose, not headings
  if (line.split(/\s+/).length > 8) return false;
  return true;
}

// ─── Layer 4: Content-based fallback detection ───────────────────────────────

const CONTENT_CLUE_PATTERNS: { section: SectionId; patterns: RegExp[] }[] = [
  {
    section: 'work_experience',
    patterns: [
      /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s*\d{4}\s*[-–—to]+\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?|present|current|to date)/i,
      /\bmanager\b.*\b(?:ltd|inc|corp|company|group|organi)/i,
      /\bat\s+(?:Google|Microsoft|Amazon|Safaricom|KCB|Equity|Co-op|NCBA|KRA|IEBC|UN)/i,
    ],
  },
  {
    section: 'education',
    patterns: [
      /\b(?:bachelor|master|phd|diploma|degree)\s+(?:of|in|s)/i,
      /\b(?:university|college|institute|polytechnic|academy)\b/i,
      /\bkenya\s+certificate\s+of/i,
    ],
  },
  {
    section: 'languages',
    patterns: [
      /(?:fluent|native|intermediate|beginner|advanced)\b/i,
    ],
  },
  {
    section: 'references',
    patterns: [
      /(?:referees?|references?)\s*(?:available\s+)?(?:upon\s+)?request/i,
    ],
  },
];

/**
 * For CVs with no clear headings, try to detect sections by content clues.
 * Returns an array of { section, startLineIndex } hints.
 * Only used when fewer than 2 headings were found via Layers 1-3.
 */
function detectSectionsByContent(allLines: string[]): { section: SectionId; lineIdx: number }[] {
  const hints: { section: SectionId; lineIdx: number }[] = [];

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    for (const { section, patterns } of CONTENT_CLUE_PATTERNS) {
      if (patterns.some((re) => re.test(line))) {
        hints.push({ section, lineIdx: i });
        break; // One match per line is enough
      }
    }
  }

  return hints;
}

// ─── Section splitter ────────────────────────────────────────────────────────

interface SectionBlock {
  section: SectionId;
  lines: string[];
}

/**
 * Split CV text into labelled section blocks.
 *
 * Algorithm:
 *   1. Scan each line for heading candidates
 *   2. Try Layer 2 (exact) + Layer 3 (fuzzy) matching
 *   3. If too few headings found, apply Layer 4 (content clues)
 *   4. Group lines between headings into blocks
 */
function splitIntoSections(allLines: string[]): SectionBlock[] {
  const sections: SectionBlock[] = [];
  let currentSection: SectionId = 'header';
  let currentLines: string[] = [];

  // Phase 1: Try alias + fuzzy matching on every line
  let headingCount = 0;
  const lineSectionMap = new Map<number, SectionId>(); // lineIdx → matched section

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    if (isHeadingCandidate(line)) {
      const matched = matchSection(line);
      if (matched) {
        lineSectionMap.set(i, matched);
        headingCount++;
      }
    }
  }

  // Phase 2: If we found fewer than 2 headings, apply content-based fallback
  if (headingCount < 2) {
    const contentHints = detectSectionsByContent(allLines);
    for (const hint of contentHints) {
      // Don't override an existing heading match
      if (!lineSectionMap.has(hint.lineIdx)) {
        lineSectionMap.set(hint.lineIdx, hint.section);
      }
    }
  }

  // Phase 3: Walk through lines and group into sections
  for (let i = 0; i < allLines.length; i++) {
    const matched = lineSectionMap.get(i);
    if (matched) {
      // Flush previous section
      if (currentLines.length > 0) {
        sections.push({ section: currentSection, lines: currentLines });
      }
      currentSection = matched;
      currentLines = [];
    } else {
      currentLines.push(allLines[i]);
    }
  }

  // Flush last section
  if (currentLines.length > 0) {
    sections.push({ section: currentSection, lines: currentLines });
  }

  return sections;
}

// ─── Section helpers ─────────────────────────────────────────────────────────

/**
 * Get all lines belonging to a given section (or set of section IDs).
 * Merges multiple blocks of the same logical section.
 */
function getSectionLines(
  sections: SectionBlock[],
  ...targets: SectionId[]
): string[] {
  const targetSet = new Set(targets);
  return sections
    .filter((s) => targetSet.has(s.section))
    .flatMap((s) => s.lines);
}

// ─── Generic helpers ─────────────────────────────────────────────────────────

function splitLines(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

/**
 * Pre-clean raw CV text before parsing to remove common artifacts.
 * Strips image placeholders, LaTeX artifacts, browser print artifacts,
 * and collapses excessive blank lines.
 */
function preCleanText(raw: string): string {
  let cleaned = raw;

  // Strip image[[...]] placeholders
  cleaned = cleaned.replace(/image\[\[[^\]]*\]\]/g, '');

  // Clean ^{...} LaTeX/MathJax artifacts (replace with content inside braces)
  cleaned = cleaned.replace(/\^\{([^}]*)\}/g, '$1');

  // Remove lines that are browser print artifacts
  const lines = cleaned.split(/\r?\n/);
  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return false; // blank lines handled below
    if (/^about:blank$/i.test(trimmed)) return false;
    if (/^\d{1,2}\/\d{1,2}\/\d{2},\s*\d{1,2}:\d{2}\s*[AaPp][Mm]$/.test(trimmed)) return false;
    if (/^\d+\/\d+$/.test(trimmed) && trimmed.length <= 10) return false;
    if (/^Page\s+\d+\s+of\s+\d+$/i.test(trimmed)) return false;
    return true;
  });

  // Rejoin and collapse multiple blank lines into single newline
  return filtered.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const grab = (text: string, pattern: RegExp): string | null => {
  const m = text.match(pattern);
  return m ? (m[1]?.trim() || null) : null;
};

const cap = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// ─── Contact extraction ──────────────────────────────────────────────────────

const EMAIL_RE = /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/;
const PHONE_RE = /(?:(?:\+254|254|0)(?:7[0-9]|1[0-9])[0-9]{7})/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/i;
const PORTFOLIO_RE = /(?:https?:\/\/)(?!.*linkedin\.com)(?!.*google\.com)(?!.*facebook\.com)[^\s"<>]+\.[a-zA-Z]{2,}/gi;

function extractEmail(text: string): string {
  const m = text.match(EMAIL_RE);
  return m ? m[1] : '';
}

function extractPhone(text: string): string {
  const labeledPhone = grab(text, /(?:phone|tel|mobile|cell)\s*[:\-–]?\s*(\+?\d[\d\s\-+]{7,})/i);
  if (labeledPhone) return normalizePhone(labeledPhone);
  const m = text.match(PHONE_RE);
  return m ? normalizePhone(m[0]) : '';
}

function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-()]/g, '');
  if (/^07/.test(p) && p.length >= 10) p = '+254' + p.slice(1);
  else if (/^7/.test(p) && p.length === 9) p = '+254' + p;
  else if (/^254/.test(p) && !p.startsWith('+')) p = '+' + p;
  return p;
}

function extractLinkedIn(text: string): string {
  const m = text.match(LINKEDIN_RE);
  return m ? `https://linkedin.com/in/${m[1]}` : '';
}

function extractPortfolio(text: string): string {
  const matches = text.match(PORTFOLIO_RE);
  if (!matches) return '';
  const priorities = ['github.com', 'behance.net', 'dribbble.com', 'portfolio', '.me', '.dev', '.io'];
  for (const url of matches) {
    if (priorities.some((p) => url.toLowerCase().includes(p))) return url;
  }
  return matches[0] || '';
}

function extractLocation(text: string): string {
  const labeled = grab(text, /(?:location|address|city|residence|county)\s*[:\-–]\s*(.+)/i);
  if (labeled) return labeled.replace(/[.,;]$/, '').trim();

  const kenyaRe = new RegExp(
    [
      'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
      'Kitale', 'Garissa', 'Machakos', 'Meru', 'Nyeri', 'Embu', 'Lamu',
      'Naivasha', 'Ngong', 'Ruiru', 'Kikuyu', 'Westlands', 'Kilimani',
      'Karen', 'Rongai', 'Athi River', 'Juja', 'Karuri', 'Kasarani',
      'Kamakis', 'Utawala', 'Mlolongo', 'Syokimau', 'Kitengela',
      'Ongata Rongai', 'Nyahururu', 'Narok', 'Kakamega', 'Bungoma',
      'Kisii', 'Homa Bay', 'Migori', 'Siaya', 'Busia', 'Vihiga',
      'Turkana', 'Marsabit', 'Isiolo', 'Mandera', 'Wajir', 'Moyale',
      'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Nandi', 'Elgeyo Marakwet',
      'Baringo', 'Laikipia', 'Nyandarua', 'Kirinyaga',
      'Kiambu', 'Makueni', 'Kitui', 'Kajiado',
      'Kericho', 'Bomet', 'Nyamira', 'Upper Hill',
    ].join('|') + '(?:\\s*,?\\s*Kenya)?',
    'i',
  );
  const m = text.match(kenyaRe);
  if (m) return m[0].replace(/,\s*Kenya$/i, '').trim();
  return '';
}

// ─── Name & Title extraction ─────────────────────────────────────────────────

function extractNameAndTitle(headerLines: string[], email: string): { name: string; title: string } {
  let name = '';
  let title = '';

  if (headerLines.length > 0) {
    const first = headerLines[0];
    if (/^[A-Z][A-Z.\'\-\s]{1,50}$/.test(first) && !/@|http/i.test(first)) {
      name = first.trim();
    } else if (/^[A-Z][a-zA-Z.\'\- ]{1,50}$/.test(first) && !/@|http/i.test(first)) {
      name = first.trim();
    }
  }

  if (headerLines.length > 1 && name) {
    const second = headerLines[1];
    if (second.length < 60 && !matchSection(second) && !/@|\d{4}|http/i.test(second)) {
      title = second.trim();
    }
  }

  if (!name && email) {
    const local = email.split('@')[0];
    const parts = local.replace(/[._\-]/g, ' ').split(' ');
    name = parts
      .filter((p) => p.length > 1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  }

  return { name, title };
}

// ─── Summary extraction ──────────────────────────────────────────────────────

function extractSummary(sections: SectionBlock[]): string {
  const summaryLines = getSectionLines(sections, 'professional_summary');
  if (summaryLines.length === 0) return '';
  return summaryLines.join(' ').replace(/\s{2,}/g, ' ').trim();
}

// ─── Skills extraction ───────────────────────────────────────────────────────

const SKILL_SEPARATORS = /[;,|•·▪▸►→●)\]}>\/+]/;

/**
 * Check if a line from the skills section matches a career strength pattern.
 * Used by both extractCareerStrengths (to extract) and extractSkills (to skip).
 * Matches:
 *   - Single-line: "Category: Description" or "Category – Description"
 *   - Multi-line header: "Category:" or "Category –" at end of line
 */
function isCareerStrengthLine(line: string): boolean {
  // Single-line: category followed by separator and 10+ char description
  if (/^\s*[A-Z][A-Za-z\s/()\-]{2,40}\s*(?::|[–—])\s+(.{10,})/.test(line)) return true;
  // Multi-line category header: ends with colon or dash
  if (/^\s*[A-Z][A-Za-z\s/()\-]{2,40}\s*(?::|[–—])\s*$/.test(line)) return true;
  return false;
}

function extractSkills(sections: SectionBlock[]): string[] {
  const skills = new Set<string>();
  const seen = new Set<string>();

  // ── Phase A: Accept-all from explicit skill sections ──
  // Skills and professional_qualifications: split by separators, accept ALL items as-is.
  // Domain-agnostic — no filtering against any predefined skill set.
  // Only skips career-strength lines (Category: Description patterns) to avoid duplication.
  for (const sectionId of ['skills', 'professional_qualifications'] as SectionId[]) {
    const sectionLines = getSectionLines(sections, sectionId);
    for (const rawLine of sectionLines) {
      // Skip career-strength lines to avoid duplication
      if (isCareerStrengthLine(rawLine)) continue;

      const parts = rawLine.split(SKILL_SEPARATORS);
      for (const part of parts) {
        const trimmed = part.trim().replace(/^[-–—:]\s*/, '');
        const normalized = trimmed.toLowerCase();
        // Accept all items: 2-50 chars, deduplicated
        if (trimmed.length >= 2 && trimmed.length <= 50) {
          if (!seen.has(normalized)) {
            seen.add(normalized);
            skills.add(cap(normalized));
          }
        }
      }
    }
  }

  // Header section: only lines that look like skill bars (contain 2+ separators)
  const headerLines = getSectionLines(sections, 'header');
  for (const rawLine of headerLines) {
    if (isCareerStrengthLine(rawLine)) continue;
    // Skip lines that look like contact info (emails, phone numbers, URLs)
    if (/@|\+?\d{7,}|https?:\/\//i.test(rawLine)) continue;
    const sepCount = (rawLine.match(SKILL_SEPARATORS) || []).length;
    if (sepCount < 2) continue;

    const parts = rawLine.split(SKILL_SEPARATORS);
    for (const part of parts) {
      const trimmed = part.trim().replace(/^[-–—:]\s*/, '');
      const normalized = trimmed.toLowerCase();
      if (trimmed.length >= 2 && trimmed.length <= 50) {
        if (!seen.has(normalized)) {
          seen.add(normalized);
          skills.add(cap(normalized));
        }
      }
    }
  }

  // No Phase B — we no longer scan experience prose against a fixed skill set.
  // Skills are only extracted from explicit skills sections (domain-agnostic).

  return [...skills].slice(0, 40);
}

// ─── Career Strengths extraction ─────────────────────────────────────────────

/**
 * Extract "Category: Description" patterns from the skills section.
 * Supports:
 *   - Single-line: "Category: Description" or "Category – Description"
 *   - Multi-line: category header (ending with : or –) on one line, description on next line(s)
 * Returns an array of "Category: Description" strings with full, untruncated text.
 */
function extractCareerStrengths(sections: SectionBlock[]): string[] {
  const strengths: string[] = [];
  const skillLines = getSectionLines(sections, 'skills');

  let i = 0;
  while (i < skillLines.length) {
    const line = skillLines[i];

    // Single-line: "Category: Description" or "Category – Description"
    const singleLine = line.match(/^\s*([A-Z][A-Za-z\s/()\-]{2,40})\s*(?::|[–—])\s+(.{10,})/);
    if (singleLine) {
      const category = singleLine[1].trim();
      const description = singleLine[2].trim();
      strengths.push(`${category}: ${description}`);
      i++; continue;
    }

    // Multi-line: category header ending with : or –, description on next line(s)
    const catWithSep = line.match(/^\s*([A-Z][A-Za-z\s/()\-]{2,40})\s*(?::|[–—])\s*$/);
    if (catWithSep && catWithSep[1].trim().length >= 3 && i + 1 < skillLines.length) {
      const category = catWithSep[1].trim();
      const descParts: string[] = [];
      let j = i + 1;
      // Collect up to 3 description lines until we hit a new category or blank
      for (let k = 0; k < 3 && j < skillLines.length; k++, j++) {
        const next = skillLines[j].trim();
        if (!next) break;
        // Stop if next line looks like a new category header
        if (/^[A-Z][A-Za-z\s/()\-]{2,40}\s*(?::|[–—])/i.test(next) && next.length < 50) break;
        descParts.push(next);
      }
      if (descParts.length > 0) {
        const description = descParts.join(' ').replace(/\s{2,}/g, ' ').trim();
        strengths.push(`${category}: ${description}`);
        i = j; continue;
      }
    }

    i++;
  }

  return strengths;
}

// ─── Date parsing utilities ──────────────────────────────────────────────────

const CURRENT_RE = /\b(?:present|current|now|to\s+date|ongoing)\b/i;

function parseDate(raw: string): string {
  if (!raw) return '';
  const s = raw.trim().replace(/[,.\s]+$/, '');
  if (CURRENT_RE.test(s)) return 'Present';
  const m = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (m) return `${cap(m[1])} ${m[2]}`;
  if (/^\d{4}$/.test(s)) return s;
  const ym = s.match(/^(\d{4})[-\/](\d{1,2})$/);
  if (ym) return `${cap(monthNumToName(+ym[2]))} ${ym[1]}`;
  return s;
}

function monthNumToName(n: number): string {
  const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names[n] || '';
}

function extractDateRange(line: string): { start: string; end: string; isCurrent: boolean } | null {
  const fullRange = line.match(
    /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4})\s*[-–—to]+\s*((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4})|\b(?:Present|Current|To\s+Date|Ongoing)\b)/i,
  );
  if (fullRange) {
    return { start: parseDate(fullRange[1]), end: parseDate(fullRange[2]), isCurrent: CURRENT_RE.test(fullRange[2]) };
  }

  const yearRange = line.match(/\b((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2})\b/);
  if (yearRange) return { start: yearRange[1], end: yearRange[2], isCurrent: false };

  const singleMonth = line.match(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4})\b/i);
  if (singleMonth) return { start: parseDate(singleMonth[1]), end: '', isCurrent: false };

  const singleYear = line.match(/\b((?:19|20)\d{2})\b/);
  if (singleYear) return { start: singleYear[1], end: '', isCurrent: false };

  return null;
}

// ─── Experience extraction ───────────────────────────────────────────────────

function extractExperience(sections: SectionBlock[]): ExtractedExperience[] {
  const results: ExtractedExperience[] = [];
  const expLines = getSectionLines(sections, 'work_experience');
  if (expLines.length === 0) return results;

  let i = 0;
  while (i < expLines.length) {
    const line = expLines[i];

    if (/^key\s+contributions?\s*[:\-–]?\s*$/i.test(line)) { i++; continue; }
    if (line.length < 2) { i++; continue; }

    const isInBriefSection = i > 0 &&
      /(?:other\s+work|additional|brief|part[- ]time)\s/i.test(expLines[i - 1]);

    if (/^[•·▪▸►→●\-\*]\s/.test(line) && results.length > 0 && !isInBriefSection) {
      const desc = line.replace(/^[•·▪▸►→●\-\*]\s*/, '').trim();
      if (desc) {
        const prev = results[results.length - 1].description;
        results[results.length - 1].description = prev ? prev + '\n' + desc : desc;
      }
      i++; continue;
    }

    // Sub-section header: "Other Work Experience (Brief Roles)"
    if (/^(?:other\s+work|additional|brief|internships?|volunteer|part[- ]time)\s/i.test(line) && !extractDateRange(line)) {
      i++;
      while (i < expLines.length) {
        const bl = expLines[i];
        if (!/^[•·▪▸►→●\-\*]\s/.test(bl) && bl.length > 2 && matchSection(bl)) break;
        if (!/^[•·▪▸►→●\-\*]\s/.test(bl) && extractDateRange(bl)) break;
        if (/^[•·▪▸►→●\-\*]\s/.test(bl)) {
          const content = bl.replace(/^[•·▪▸►→●\-\*]\s*/, '');
          const bulletDate = extractDateRange(content);
          let bulletRole = ''; let bulletCompany = ''; let bulletDesc = '';
          if (bulletDate) {
            const cwd = content.replace(/\|\s*.*$/, '')
              .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}|Present|Current|To\s+Date|Ongoing)/gi, '')
              .replace(/\b((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2})\b/g, '').replace(/\s*[-–—]\s*$/, '').trim();
            if (cwd.includes(' – ') || cwd.includes(' - ')) {
              const parts = cwd.split(/\s*[-–—]\s*/);
              bulletRole = parts[0].trim(); bulletCompany = parts.slice(1).join(', ').trim();
            } else bulletRole = cwd;
            const ap = content.match(/\|\s*(?:.*?\d{4}\s*[-–—to]+\s*(?:\d{4}|Present|Current|To Date|Ongoing))\s*[-–—]?\s*(.+)/i);
            if (ap) bulletDesc = ap[1].trim();
          } else {
            if (content.includes(' – ') || content.includes(' - ')) {
              const parts = content.split(/\s*[-–—]\s*/);
              bulletRole = parts[0].trim(); bulletCompany = parts.slice(1).join(', ').trim();
            } else bulletRole = content.trim();
          }
          if (bulletRole || bulletCompany) {
            results.push({ role: bulletRole, company: bulletCompany, startDate: bulletDate?.start || '', endDate: bulletDate?.isCurrent ? '' : bulletDate?.end || '', current: bulletDate?.isCurrent || false, description: bulletDesc });
          }
        }
        i++;
      }
      continue;
    }

    const dateOnThisLine = extractDateRange(line);
    const nextLine = i + 1 < expLines.length ? expLines[i + 1] : '';
    const dateOnNextLine = extractDateRange(nextLine);
    let dates: { start: string; end: string; isCurrent: boolean } | null = null;
    let role = ''; let company = ''; let remaining = '';

    if (dateOnThisLine) {
      dates = dateOnThisLine;
      const lwd = line.replace(/\|\s*.*$/, '')
        .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}|Present|Current|To\s+Date|Ongoing)/gi, '')
        .replace(/\b((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2})\b/g, '').replace(/\s*[-–—]\s*$/, '').trim();
      if (lwd.includes(' – ') || lwd.includes(' - ') || lwd.includes(' — ')) {
        const parts = lwd.split(/\s*[-–—]\s*/);
        role = parts[0].trim(); company = parts[1]?.trim() || '';
        if (parts.length > 2 && !/\d{4}/.test(parts[2])) company += ', ' + parts[2].trim();
      } else if (lwd.includes(' at ')) {
        const ap = lwd.split(/\s+at\s+/i); role = ap[0].trim(); company = ap[1]?.trim() || '';
      } else if (lwd.includes(' | ')) {
        const pp = lwd.split(/\s*\|\s*/); role = pp[0].trim(); company = pp[1]?.trim() || '';
      } else role = lwd;
      if (!company && i + 1 < expLines.length) {
        const nxt = expLines[i + 1].trim();
        if (nxt.length > 2 && nxt.length < 80 && !/^[•·▪▸►→●\-\*]/.test(nxt) && !/^key\s+contributions/i.test(nxt) && !extractDateRange(nxt)) {
          company = nxt.replace(/\s*[-–—]\s*$/, '').trim(); i++;
        }
      }
      const dl: string[] = []; i++;
      while (i < expLines.length) {
        const d = expLines[i];
        if (!/^[•·▪▸►→●\-\*]\s/.test(d) && extractDateRange(d)) break;
        if (/^(?:other\s+work|additional|brief|internships?|volunteer|part[- ]time)\s/i.test(d) && !extractDateRange(d)) break;
        if (/^key\s+contributions?\s*[:\-–]?\s*$/i.test(d)) { i++; continue; }
        dl.push(d.replace(/^[•·▪▸►→●\-\*]\s*/, '').trim()); i++;
      }
      remaining = dl.join('\n').trim();
    } else if (dateOnNextLine) {
      dates = dateOnNextLine;
      if (line.includes(' – ') || line.includes(' - ') || line.includes(' — ')) {
        const parts = line.split(/\s*[-–—]\s*/); role = parts[0].trim(); company = parts[1]?.trim() || '';
      } else if (line.includes(' at ')) {
        const ap = line.split(/\s+at\s+/i); role = ap[0].trim(); company = ap[1]?.trim() || '';
      } else if (line.includes(' | ')) {
        const pp = line.split(/\s*\|\s*/); role = pp[0].trim(); company = pp[1]?.trim() || '';
      } else role = line;
      i += 2;
      const dl: string[] = [];
      while (i < expLines.length) {
        const d = expLines[i];
        if (!/^[•·▪▸►→●\-\*]\s/.test(d) && extractDateRange(d)) break;
        if (/^(?:other\s+work|additional|brief|internships?|volunteer|part[- ]time)\s/i.test(d) && !extractDateRange(d)) break;
        if (/^key\s+contributions?\s*[:\-–]?\s*$/i.test(d)) { i++; continue; }
        dl.push(d.replace(/^[•·▪▸►→●\-\*]\s*/, '').trim()); i++;
      }
      remaining = dl.join('\n').trim();
    } else {
      if (/^[•·▪▸►→●\-\*]\s/.test(line)) {
        const content = line.replace(/^[•·▪▸►→●\-\*]\s*/, '');
        const bulletDate = extractDateRange(content);
        let bulletRole = ''; let bulletCompany = ''; let bulletDesc = '';
        if (bulletDate) {
          const cwd = content.replace(/\|\s*.*$/, '')
            .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}|Present|Current|To\s+Date|Ongoing)/gi, '')
            .replace(/\b((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2})\b/g, '').replace(/\s*[-–—]\s*$/, '').trim();
          if (cwd.includes(' – ') || cwd.includes(' - ')) {
            const parts = cwd.split(/\s*[-–—]\s*/); bulletRole = parts[0].trim(); bulletCompany = parts.slice(1).join(', ').trim();
          } else bulletRole = cwd;
          const ap = content.match(/\|\s*(?:.*?\d{4}\s*[-–—to]+\s*(?:\d{4}|Present|Current|To Date|Ongoing)\s*[-–—]?\s*)(.+)/i);
          if (ap) bulletDesc = ap[1].trim();
        } else {
          if (content.includes(' – ') || content.includes(' - ')) {
            const parts = content.split(/\s*[-–—]\s*/); bulletRole = parts[0].trim(); bulletCompany = parts.slice(1).join(', ').trim();
          } else bulletRole = content.trim();
        }
        if (bulletRole || bulletCompany) {
          results.push({ role: bulletRole, company: bulletCompany, startDate: bulletDate?.start || '', endDate: bulletDate?.isCurrent ? '' : bulletDate?.end || '', current: bulletDate?.isCurrent || false, description: bulletDesc });
        }
      }
      i++; continue;
    }

    if (role || company) {
      results.push({ role, company, startDate: dates?.start || '', endDate: dates?.isCurrent ? '' : dates?.end || '', current: dates?.isCurrent || false, description: remaining });
    }
  }
  return results;
}

// ─── Education extraction ────────────────────────────────────────────────────

function extractEducation(sections: SectionBlock[]): ExtractedEducation[] {
  const results: ExtractedEducation[] = [];
  const eduLines = getSectionLines(sections, 'education');
  if (eduLines.length === 0) return results;

  const DEGREE_RE = /\b(?:bachelor|master|phd|doctor|diploma|certificate|associate|undergraduate|postgraduate|honours?|degree|b\.?\s*sc|m\.?\s*sc|m\.?\s*ba|b\.?\s*a|b\.?\s*com|m\.?\s*com|b\.?\s*tech|m\.?\s*tech|b\.?\s*eng|m\.?\s*eng|bcs|mcs)\b/i;
  const KCSE_RE = /\bkenya\s+certificate\s+of\s+secondary\s+education\b/i;
  const KCPE_RE = /\bkenya\s+certificate\s+of\s+primary\s+education\b/i;
  const INST_RE = /\b(?:university|college|institute|polytechnic|academy|school|boys\s+high|girls\s+high|high\s+school|primary\s+school|secondary)\b/i;

  let i = 0;
  while (i < eduLines.length) {
    const line = eduLines[i];
    if (/^[•·▪▸►→●\-\*]\s/.test(line)) { i++; continue; }

    let degree = ''; let field = ''; let institution = ''; let startYear = ''; let endYear = '';
    const hasDegree = DEGREE_RE.test(line) || KCSE_RE.test(line) || KCPE_RE.test(line);
    const nextLine = i + 1 < eduLines.length ? eduLines[i + 1] : '';

    if (hasDegree) {
      const degreeMatch = line.match(DEGREE_RE);
      if (degreeMatch) {
        const idx = line.toLowerCase().indexOf(degreeMatch[0].toLowerCase());
        // First try pipe separator (common: "BSc IT | Sep 2017 – Nov 2021")
        let degreePart = line.slice(idx);
        const pipeIdx = degreePart.indexOf('|');
        if (pipeIdx > 0) {
          // Check if the pipe is followed by a date (year or month)
          const afterPipe = degreePart.slice(pipeIdx + 1).trim();
          if (/^\d{4}|^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*/i.test(afterPipe)) {
            degreePart = degreePart.slice(0, pipeIdx);
          }
        }
        // Then look for dash separators within the degree part
        const de = degreePart.indexOf('–', idx > 0 ? 0 : idx); const de2 = degreePart.indexOf('-', idx > 0 ? 0 : idx);
        let endIdx = -1;
        if (de > -1 && de2 > -1) endIdx = Math.min(de, de2);
        else if (de > -1) endIdx = de;
        else if (de2 > -1) endIdx = de2;
        const rawDegree = endIdx > -1 ? degreePart.slice(0, endIdx).trim() : degreePart.trim();
        degree = rawDegree
          .replace(/\s*[-–(]\s*(?:second|first|third)\s+class\s+honours?\s*(?:\(upper\s+division\)|\(lower\s+division\))?\s*\)?\s*/gi, '')
          .replace(/\s*[-–(]\s*(?:pass|credit|distinction)\s*\)?\s*/gi, '').trim();
        const fm = line.match(/\(([^)]+)\)/);
        if (fm) {
          const f = fm[1].trim();
          if (/\b(?:option|major|concentration|specialisation|specialization)\b/i.test(f)) field = f.replace(/\boption\b/i, '').replace(/^\s*(?:in|of)\s+/i, '').trim();
          else if (!/honours?|class|division|pass|credit|distinction|grade/i.test(f)) field = f;
        }
        if (!field) {
          const im = line.match(/\b(?:bachelor|master|diploma)\s+(?:of\s+)?(?:science|arts|commerce|technology|engineering|business|education|law|medicine)\s+in\s+([a-zA-Z\s&+]+)/i);
          if (im) field = im[1].trim();
        }
      }
      if (KCSE_RE.test(line)) { degree = 'Kenya Certificate of Secondary Education'; const gm = line.match(/\(([A-F]\s*(?:[-+])?)\)/); if (gm) field = `Grade: ${gm[1].trim()}`; }
      if (KCPE_RE.test(line)) { degree = 'Kenya Certificate of Primary Education'; }
      if (INST_RE.test(nextLine)) {
        institution = nextLine.split(/\s*[-|–—]\s*/)[0].replace(/\|.*$/, '').trim();
        // Extract dates from the degree line first, then fall back to institution line
        const dd = extractDateRange(line);
        const id = dd || extractDateRange(nextLine);
        if (id) { startYear = startYear || id.start; endYear = id.isCurrent ? '' : id.end; }
        // Also try to get a date from the institution line if degree line had none
        if (!dd) { const id2 = extractDateRange(nextLine); if (id2) { startYear = id2.start; endYear = id2.isCurrent ? '' : id2.end; } }
        i += 2;
      } else {
        const ld = extractDateRange(line); if (ld) { startYear = ld.start; endYear = ld.isCurrent ? '' : ld.end; }
        i++;
      }
      if (degree || institution) results.push({ institution, degree, field, startYear, endYear });
    } else if (INST_RE.test(line)) {
      institution = line.split(/\s*[-|–—]\s*/)[0].replace(/\|.*$/, '').trim();
      const ld = extractDateRange(line); if (ld) { startYear = ld.start; endYear = ld.isCurrent ? '' : ld.end; }
      if (DEGREE_RE.test(nextLine)) { const dm = nextLine.match(DEGREE_RE); degree = dm ? dm[0].trim() : ''; i += 2; }
      else i++;
      if (institution) results.push({ institution, degree, field, startYear, endYear });
    } else i++;
  }
  return results;
}

// ─── Certifications extraction ───────────────────────────────────────────────

function extractCertifications(sections: SectionBlock[]): ExtractedCertification[] {
  const results: ExtractedCertification[] = [];
  const certLines = getSectionLines(sections, 'certifications', 'professional_qualifications');
  if (certLines.length === 0) return results;

  for (const line of certLines) {
    if (line.length < 3) continue;
    const cl = line.replace(/^[•·▪▸►→●\-\*]\s*/, '').trim();
    const yearMatch = cl.match(/\b((?:19|20)\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : '';
    const pipeSplit = cl.split(/\s*\|\s*/).filter((p) => p.trim());
    const dashSplit = cl.split(/\s*[-–—]\s*/).filter((p) => p.trim());
    let name = ''; let issuer = '';

    if (pipeSplit.length >= 2) {
      const fp = pipeSplit[0].trim();
      const fds = fp.split(/\s*[-–—]\s*/).filter((p) => p.trim());
      if (fds.length >= 2) {
        name = fds[0].trim();
        const rof = fds.slice(1).join(' – ').replace(/\b(?:ongoing|present|current|completed|in\s+progress)\b.*$/i, '').trim();
        if (rof.length > 1) issuer = rof;
      } else name = fp;
      if (!issuer && pipeSplit.length >= 2) {
        const ip = pipeSplit[1].replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}.*$/i, '').replace(/\b(?:19|20)\d{2}\b.*$/, '').replace(/\s*[-–—]\s*$/, '').trim();
        if (ip.length > 1 && !/^\d+$/.test(ip)) issuer = ip;
      }
    } else if (dashSplit.length >= 2) {
      name = dashSplit[0].trim();
      const rest = dashSplit.slice(1).join(' – ').replace(/\b(?:19|20)\d{2}\b.*$/, '').replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}.*$/i, '').replace(/\s*[-–—]\s*$/, '').replace(/\b(?:ongoing|present|current|completed|in\s+progress)\b.*$/i, '').trim();
      if (rest.length > 1) issuer = rest;
    } else name = cl;

    name = name.replace(/\s*\b((?:19|20)\d{2})\b/, '').trim();
    name = name.replace(/\s*[-–(]\s*(?:ongoing|present|current|completed|in\s+progress)\s*[)]?\s*$/gi, '').trim();
    if (name.length > 2) results.push({ name, issuer, year });
  }
  return results.slice(0, 15);
}

// ─── Languages extraction ────────────────────────────────────────────────────

const PROFICIENCY_RE = /\b((?:native|fluent|advanced|intermediate|beginner|elementary|basic|professional)\w*)\b/i;

function extractLanguages(sections: SectionBlock[]): ExtractedLanguage[] {
  const results: ExtractedLanguage[] = [];
  const langLines = getSectionLines(sections, 'languages');
  if (langLines.length === 0) return results;

  for (const line of langLines) {
    const cl = line.replace(/^[•·▪▸►→●\-\*]\s*/, '').trim();
    if (cl.length < 2) continue;
    const pm = cl.match(PROFICIENCY_RE);
    const proficiency = pm ? cap(pm[1]) : '';
    const name = cl.replace(/[-|–—(]\s*(?:native|fluent|advanced|intermediate|beginner|elementary|basic|professional)\w*\s*[)]?/gi, '').trim();
    if (name.length > 1) results.push({ name: cap(name), proficiency });
  }
  return results.slice(0, 10);
}

// ─── Referees extraction ─────────────────────────────────────────────────────

function extractReferees(sections: SectionBlock[]): ExtractedReferee[] {
  const results: ExtractedReferee[] = [];
  const refLines = getSectionLines(sections, 'references');
  if (refLines.length === 0) return results;
  const joined = refLines.join(' ').toLowerCase();
  if (/upon\s+request|available\s+upon|provided\s+on/i.test(joined)) return results;

  let current: Partial<ExtractedReferee> = {};
  for (const line of refLines) {
    const cl = line.replace(/^[•·▪▸►→●\-\*]\s*/, '').trim();
    if (cl.length < 2) continue;
    const phoneMatch = cl.match(PHONE_RE);
    const emailMatch = cl.match(EMAIL_RE);
    if (phoneMatch || emailMatch) {
      if (phoneMatch) current.phone = normalizePhone(phoneMatch[0]);
      if (emailMatch) current.email = emailMatch[1];
      if (current.name && (current.phone || current.email)) {
        results.push({ name: current.name || '', title: current.title || '', organization: current.organization || '', phone: current.phone || '', email: current.email || '' });
        current = {};
      }
    } else if (/^[A-Z][a-zA-Z.\' ]{1,50}$/.test(cl) && !/@|http|\d{4}/.test(cl)) {
      if (current.name) {
        results.push({ name: current.name || '', title: current.title || '', organization: current.organization || '', phone: current.phone || '', email: current.email || '' });
        current = {};
      }
      current.name = cl;
    } else if (current.name) {
      if (!current.title) current.title = cl;
      else if (!current.organization) current.organization = cl;
    }
  }
  if (current.name) {
    results.push({ name: current.name || '', title: current.title || '', organization: current.organization || '', phone: current.phone || '', email: current.email || '' });
  }
  return results.slice(0, 5);
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function extractCVFields(text: string): ExtractedCV {
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const linkedin = extractLinkedIn(text);
  const portfolio = extractPortfolio(text);
  const location = extractLocation(text);
  const cleanedText = preCleanText(text);
  const allLines = splitLines(cleanedText);
  const sections = splitIntoSections(allLines);
  const headerLines = getSectionLines(sections, 'header');
  const { name, title } = extractNameAndTitle(headerLines, email);

  return {
    name,
    professionalTitle: title,
    email,
    phone,
    location,
    linkedin,
    portfolio,
    summary: extractSummary(sections),
    skills: extractSkills(sections),
    careerStrengths: extractCareerStrengths(sections),
    experience: extractExperience(sections),
    education: extractEducation(sections),
    certifications: extractCertifications(sections),
    languages: extractLanguages(sections),
    referees: extractReferees(sections),
  };
}
