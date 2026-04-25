/**
 * cv-local-extractor.ts
 *
 * Pure regex/rule-based CV field extraction.
 * No AI, no network calls — runs entirely in the browser.
 *
 * Designed for the CV Builder import flow:
 *   Upload PDF/DOCX → parse to text → extractCVFields(text) → populate form
 *
 * Handles Kenyan CV formats specifically:
 *   - Kenyan phone numbers (07xx, +254, 254)
 *   - Kenyan locations (cities, towns, neighbourhoods)
 *   - Kenyan education (KCSE, KCPE, KNEC, CPA, university)
 *   - "Key Contributions" bullet-style experience entries
 *   - "Career Strengths" / "Core Competencies" skill sections
 *   - Mixed experience sections with sub-headers
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
  experience: ExtractedExperience[];
  education: ExtractedEducation[];
  certifications: ExtractedCertification[];
  languages: ExtractedLanguage[];
  referees: ExtractedReferee[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Split text into lines, trimming whitespace, preserving empty-line boundaries */
function splitLines(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

/** Test if a line looks like an ALL-CAPS section header */
function isSectionHeader(line: string): boolean {
  const upper = line.replace(/[^a-zA-Z]/g, '');
  return upper.length >= 3 && upper === upper.toUpperCase() && /[A-Z]/.test(line);
}

/** Extract first capture group from a regex match */
const grab = (text: string, pattern: RegExp): string | null => {
  const m = text.match(pattern);
  return m ? (m[1]?.trim() || null) : null;
};

const cap = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// ─── Section detection ───────────────────────────────────────────────────────

/**
 * Known section header patterns. Each returns true if the line is the start
 * of a known section. Used to split the CV into logical blocks.
 *
 * Order matters — first match wins.
 */
const SECTION_PATTERNS: { re: RegExp; section: string }[] = [
  { re: /^(?:professional\s+)?qualifications?\s*[:\-–]?\s*$/i, section: 'qualifications' },
  { re: /^(?:training\s*[&\s]\s*certifications?|certifications?\s*(?:&\s*training)?|certificates?|professional\s+(?:certifications?|licenses?|qualifications?))\s*[:\-–]?\s*$/i, section: 'certifications' },
  { re: /^(?:professional\s+summary|summary|profile|about\s+me|career\s+(?:summary|objective|overview)|personal\s+statement|objective)\s*[:\-–]?\s*$/i, section: 'summary' },
  { re: /^(?:career\s+strengths|core\s+competencies|key\s+competencies|areas?\s+of\s+(?:expertise|strength)|competencies|key\s+strengths)\s*[:\-–]?\s*$/i, section: 'strengths' },
  { re: /^(?:technical\s+)?skills?\s*(?:summary)?\s*[:\-–]?\s*$/i, section: 'skills' },
  { re: /^(?:work\s+experience|professional\s+experience|employment\s+(?:history|record)|career\s+history|work\s+history|experience)\s*[:\-–]?\s*$/i, section: 'experience' },
  { re: /^(?:education(?:al)?\s*(?:background|qualifications)?|academic(?:\s+background)?|qualifications?\s*(?:&\s*education)?)\s*[:\-–]?\s*$/i, section: 'education' },
  { re: /^(?:languages?|language\s+skills?)\s*[:\-–]?\s*$/i, section: 'languages' },
  { re: /^(?:referees?|references?)\s*[:\-–]?\s*$/i, section: 'referees' },
  { re: /^(?:interests?|hobbies|interests?\s*[&\s]\s*hobbies)\s*[:\-–]?\s*$/i, section: 'interests' },
  { re: /^(?:projects?|project\s+experience)\s*[:\-–]?\s*$/i, section: 'projects' },
  { re: /^(?:achievements?|awards?\s*[&\s]\s*honors?|honors?\s*[&\s]\s*awards?)\s*[:\-–]?\s*$/i, section: 'awards' },
  { re: /^(?:volunteer|volunteering|community)\s*[:\-–]?\s*$/i, section: 'volunteer' },
];

/**
 * Split the CV text into labelled sections.
 * Returns an array of { section, lines[] } blocks.
 * Lines that don't belong to any section go into 'header' (top of CV).
 */
function splitIntoSections(allLines: string[]): { section: string; lines: string[] }[] {
  const sections: { section: string; lines: string[] }[] = [];
  let currentSection = 'header';
  let currentLines: string[] = [];

  for (const line of allLines) {
    let matched = false;
    for (const { re, section } of SECTION_PATTERNS) {
      if (re.test(line)) {
        // Flush previous section
        if (currentLines.length > 0) {
          sections.push({ section: currentSection, lines: currentLines });
        }
        currentSection = section;
        currentLines = [];
        matched = true;
        break;
      }
    }
    if (!matched) {
      currentLines.push(line);
    }
  }

  // Flush last section
  if (currentLines.length > 0) {
    sections.push({ section: currentSection, lines: currentLines });
  }

  return sections;
}

/**
 * Get the lines for a specific section, merging multiple matches.
 */
function getSectionLines(sections: { section: string; lines: string[] }[], target: string): string[] {
  const matching = sections.filter((s) => s.section === target);
  return matching.flatMap((s) => s.lines);
}

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
  // First try to find a phone with explicit label
  const labeledPhone = grab(text, /(?:phone|tel|mobile|cell)\s*[:\-–]?\s*(\+?\d[\d\s\-+]{7,})/i);
  if (labeledPhone) {
    return normalizePhone(labeledPhone);
  }

  // Fallback: any Kenyan phone in the text
  const m = text.match(PHONE_RE);
  return m ? normalizePhone(m[0]) : '';
}

function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-()]/g, '');
  if (/^07/.test(p) && p.length >= 10) {
    p = '+254' + p.slice(1);
  } else if (/^7/.test(p) && p.length === 9) {
    p = '+254' + p;
  } else if (/^254/.test(p) && !p.startsWith('+')) {
    p = '+' + p;
  }
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
  // Check for explicit label first
  const labeled = grab(text, /(?:location|address|city|residence|county)\s*[:\-–]\s*(.+)/i);
  if (labeled) return labeled.replace(/[.,;]$/, '').trim();

  // Known Kenyan locations — expanded list
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
      'Baringo', 'Laikipia', 'Nyandarua', 'Kirinyaga', 'Murang\u0027a',
      'Kiambu', 'Machakos', 'Makueni', 'Kitui', 'Machakos', 'Kajiado',
      'Kericho', 'Bomet', 'Nakuru', 'Narok', 'Kisumu', 'Siaya',
      'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Upper Hill',
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

  // Strategy 1: First line is name (usually ALL CAPS or Title Case, 2-5 words)
  if (headerLines.length > 0) {
    const first = headerLines[0];
    // ALL CAPS name: "BEATRICE W. MUNENE"
    if (/^[A-Z][A-Z.\'\-\s]{1,50}$/.test(first) && !/@|http/i.test(first)) {
      name = first.trim();
    }
    // Title Case name: "Beatrice Munene"
    else if (/^[A-Z][a-zA-Z.\'\- ]{1,50}$/.test(first) && !/@|http/i.test(first)) {
      name = first.trim();
    }
  }

  // Strategy 2: Second line is professional title (shorter, descriptive)
  if (headerLines.length > 1 && name) {
    const second = headerLines[1];
    // Looks like a title, not a section header
    if (second.length < 60 && !isSectionHeader(second) && !/@|\d{4}|http/i.test(second)) {
      title = second.trim();
    }
  }

  // Strategy 3: Extract from email if no name found
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

function extractSummary(sections: { section: string; lines: string[] }[]): string {
  const summaryLines = getSectionLines(sections, 'summary');
  if (summaryLines.length === 0) {
    // Fallback: if no explicit summary section, check if first paragraph
    // after name/contact looks like a summary (long prose before bullets)
    return '';
  }
  return summaryLines.join(' ').replace(/\s{2,}/g, ' ').trim();
}

// ─── Skills extraction ───────────────────────────────────────────────────────

const SKILL_SEPARATORS = /[;,|•·▪▸►→●)\]}>\/+]/;

const COMMON_SKILLS = new Set([
  // Programming & tech
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go',
  'rust', 'swift', 'kotlin', 'scala', 'matlab', 'sql', 'nosql', 'mongodb',
  'postgresql', 'mysql', 'redis', 'elasticsearch', 'docker', 'kubernetes', 'aws',
  'azure', 'gcp', 'linux', 'git', 'github', 'gitlab', 'bitbucket', 'jenkins',
  'ci/cd', 'terraform', 'ansible', 'nginx', 'apache', 'rest api', 'graphql',
  'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask',
  'spring', 'laravel', '.net', 'html', 'css', 'sass', 'tailwind', 'bootstrap',
  'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'indesign',
  // Office & tools
  'excel', 'power bi', 'tableau', 'powerpoint', 'word', 'outlook', 'access',
  'google sheets', 'google docs', 'google slides',
  // Accounting & finance
  'accounting', 'bookkeeping', 'audit', 'tax', 'budgeting', 'financial analysis',
  'financial reporting', 'risk management', 'payroll', 'quickbooks', 'sage', 'tally',
  'cpa', 'bank reconciliation', 'imprest management', 'payment vouchers',
  'warrant management', 'data entry',
  // Project & product
  'project management', 'product management', 'agile', 'scrum', 'jira', 'confluence',
  'slack', 'trello', 'asana', 'notion', 'monday.com',
  // Marketing
  'marketing', 'digital marketing', 'social media', 'content writing',
  'seo', 'sem', 'email marketing', 'copywriting',
  'graphic design', 'ui/ux', 'user research', 'wireframing', 'prototyping',
  // Supply chain
  'supply chain', 'procurement', 'logistics', 'inventory management',
  // HR & admin
  'human resources', 'recruitment', 'training', 'mentoring', 'coaching',
  'computer literacy', 'computer packages',
  // Soft skills
  'team leadership', 'leadership', 'communication', 'problem solving',
  'critical thinking', 'attention to detail', 'time management',
  'customer service', 'negotiation', 'presentation', 'public speaking',
  'report writing', 'research', 'analytics', 'organizational skills',
  // Engineering
  'civil engineering', 'electrical engineering', 'mechanical engineering',
  'construction', 'architecture', 'autocad', 'revit',
  // Mobile
  'mobile development', 'ios', 'android', 'flutter', 'react native',
  // Dev & cloud
  'devops', 'microservices', 'api design', 'cloud computing', 'networking',
  'cybersecurity', 'firebase', 'supabase', 'vercel', 'netlify', 'heroku',
  'shopify', 'wordpress', 'magento', 'stripe', 'paypal',
  'sap', 'salesforce', 'hubspot', 'zoho',
  // Data
  'machine learning', 'deep learning', 'artificial intelligence', 'nlp',
  'data analysis', 'data science', 'data engineering', 'data visualization',
  // Other common
  'teaching', 'curriculum development', 'classroom management',
  'nursing', 'patient care', 'clinical',
  'legal', 'compliance', 'regulatory', 'contract management',
  'driving', 'photography', 'videography', 'event planning',
  'graphics design', 'web design', 'web development',
  'erp systems', 'inventory management', 'records management',
  'public relations', 'stakeholder management',
]);

function extractSkills(
  allLines: string[],
  sections: { section: string; lines: string[] }[],
): string[] {
  const skills = new Set<string>();
  const seen = new Set<string>();

  // Collect lines from skills, strengths, and header sections
  const skillSectionLines = getSectionLines(sections, 'skills');
  const strengthsLines = getSectionLines(sections, 'strengths');
  const headerLines = getSectionLines(sections, 'header');

  // Also grab any "Skills Summary:" line from the header
  const allSkillLines = [...headerLines, ...skillSectionLines, ...strengthsLines];

  for (const rawLine of allSkillLines) {
    const line = rawLine.toLowerCase();

    // Match skills as substrings
    for (const skill of COMMON_SKILLS) {
      if (line.includes(skill) && !seen.has(skill)) {
        seen.add(skill);
        skills.add(cap(skill));
      }
    }

    // Split by separators for comma/pipe-separated lists
    const parts = rawLine.split(SKILL_SEPARATORS);
    for (const part of parts) {
      const trimmed = part.trim().toLowerCase().replace(/^[-–—:]\s*/, '');
      if (trimmed.length >= 2 && trimmed.length <= 50 && !seen.has(trimmed)) {
        for (const skill of COMMON_SKILLS) {
          if (trimmed.includes(skill) || skill.includes(trimmed)) {
            seen.add(trimmed);
            // Use the canonical form from COMMON_SKILLS
            skills.add(cap(skill));
            break;
          }
        }
      }
    }
  }

  // Also scan ALL experience descriptions for skill keywords
  const expLines = getSectionLines(sections, 'experience');
  for (const rawLine of expLines) {
    const line = rawLine.toLowerCase();
    for (const skill of COMMON_SKILLS) {
      if (line.includes(skill) && !seen.has(skill)) {
        seen.add(skill);
        skills.add(cap(skill));
      }
    }
  }

  return [...skills].slice(0, 30);
}

// ─── Date parsing utilities ──────────────────────────────────────────────────

const MONTH_RE = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;
const CURRENT_RE = /\b(?:present|current|now|to\s+date|ongoing)\b/i;

/** Parse a single date string into a normalized form */
function parseDate(raw: string): string {
  if (!raw) return '';
  const s = raw.trim().replace(/[,.\s]+$/, '');
  if (CURRENT_RE.test(s)) return 'Present';
  // "Jan 2022", "January 2022", "Feb 2022"
  const m = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (m) return `${cap(m[1])} ${m[2]}`;
  // Just a year
  if (/^\d{4}$/.test(s)) return s;
  // "2022-01", "2022/01"
  const ym = s.match(/^(\d{4})[-\/](\d{1,2})$/);
  if (ym) return `${cap(monthNumToName(+ym[2]))} ${ym[1]}`;
  return s;
}

function monthNumToName(n: number): string {
  const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names[n] || '';
}

/**
 * Extract a date range from a line like:
 *   "Feb 2022 – To Date"
 *   "Jan 2021 – Mar 2021"
 *   "Aug 2022"
 *   "2019 – Data collection"  (year only)
 *   "Apr 2017 – Jul 2017"
 *   "| Aug 2017 – Oct 2021"
 * Returns { start, end, isCurrent } or null.
 */
function extractDateRange(line: string): { start: string; end: string; isCurrent: boolean } | null {
  // Full range: "Month Year – Month Year" or "Month Year – Present"
  const fullRange = line.match(
    /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4})\s*[-–—to]+\s*((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4})|\b(?:Present|Current|To\s+Date|Ongoing)\b)/i,
  );
  if (fullRange) {
    return {
      start: parseDate(fullRange[1]),
      end: parseDate(fullRange[2]),
      isCurrent: CURRENT_RE.test(fullRange[2]),
    };
  }

  // Year range: "2017 – 2021" or "2013 – 2016"
  const yearRange = line.match(/\b((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2})\b/);
  if (yearRange) {
    return {
      start: yearRange[1],
      end: yearRange[2],
      isCurrent: false,
    };
  }

  // Single date: "Aug 2022" or "2019"
  const singleMonth = line.match(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4})\b/i);
  if (singleMonth) {
    return { start: parseDate(singleMonth[1]), end: '', isCurrent: false };
  }

  const singleYear = line.match(/\b((?:19|20)\d{2})\b/);
  if (singleYear) {
    return { start: singleYear[1], end: '', isCurrent: false };
  }

  return null;
}

// ─── Experience extraction ───────────────────────────────────────────────────

/**
 * Parse experience entries from the experience section.
 *
 * Handles these common patterns:
 * 1. "Role | Date Range"  (company on next line)
 * 2. "Role at Company"    (date on next line)
 * 3. "Company | Role"     (date on same or next line)
 * 4. "Role – Company – Location | Date Range"
 * 5. Sub-sections like "Other Work Experience (Brief Roles)"
 * 6. Bullet-point mini-entries within a sub-section
 */
function extractExperience(sections: { section: string; lines: string[] }[]): ExtractedExperience[] {
  const results: ExtractedExperience[] = [];
  const expLines = getSectionLines(sections, 'experience');
  if (expLines.length === 0) return results;

  let i = 0;

  while (i < expLines.length) {
    const line = expLines[i];

    // Skip "Key Contributions:" and similar sub-headers
    if (/^key\s+contributions?\s*[:\-–]?\s*$/i.test(line)) {
      i++;
      continue;
    }

    // Skip empty/whitespace-only lines
    if (line.length < 2) {
      i++;
      continue;
    }

    // Skip pure bullet lines (they are descriptions of the current job)
    // BUT only if we're not in a "brief roles" sub-section
    const isInBriefSection = i > 0 &&
      /(?:other\s+work|additional|brief|part[- ]time)\s/i.test(expLines[i - 1]);

    if (/^[•·▪▸►→●\-\*]\s/.test(line) && results.length > 0 && !isInBriefSection) {
      // Append to last experience's description
      const desc = line.replace(/^[•·▪▸►→●\-\*]\s*/, '').trim();
      if (desc) {
        results[results.length - 1].description =
          (results[results.length - 1].description + ' ' + desc).replace(/\s{2,}/g, ' ').trim();
      }
      i++;
      continue;
    }

    // Check if this line introduces a new experience entry
    // Pattern: contains a date range OR has role/company structure

    // IMPORTANT: Check for sub-section headers FIRST (before date checking)
    // "Other Work Experience (Brief Roles)" should not be treated as a role
    if (/^(?:other\s+work|additional|brief|internships?|volunteer|part[- ]time)\s/i.test(line) && !extractDateRange(line)) {
      // This is a sub-section header. Parse subsequent bullets as individual entries.
      i++;
      while (i < expLines.length) {
        const bl = expLines[i];
        if (!/^[•·▪▸►→●\-\*]\s/.test(bl) && bl.length > 2 && isSectionHeader(bl)) break;
        if (!/^[•·▪▸►→●\-\*]\s/.test(bl) && extractDateRange(bl)) break;

        if (/^[•·▪▸►→●\-\*]\s/.test(bl)) {
          const content = bl.replace(/^[•·▪▸►→●\-\*]\s*/, '');
          const bulletDate = extractDateRange(content);
          let bulletRole = '';
          let bulletCompany = '';
          let bulletDesc = '';

          if (bulletDate) {
            const contentWithoutDate = content
              .replace(/\|\s*.*$/, '')
              .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}|Present|Current|To\s+Date|Ongoing)/gi, '')
              .replace(/\b((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2})\b/g, '')
              .replace(/\s*[-–—]\s*$/, '')
              .trim();

            if (contentWithoutDate.includes(' – ') || contentWithoutDate.includes(' - ')) {
              const parts = contentWithoutDate.split(/\s*[-–—]\s*/);
              bulletRole = parts[0].trim();
              bulletCompany = parts.slice(1).join(', ').trim();
            } else {
              bulletRole = contentWithoutDate;
            }

            const afterPipe = content.match(/\|\s*(?:.*?\d{4}\s*[-–—to]+\s*(?:\d{4}|Present|Current|To Date|Ongoing))\s*[-–—]?\s*(.+)/i);
            if (afterPipe) bulletDesc = afterPipe[1].trim();
          } else {
            if (content.includes(' – ') || content.includes(' - ')) {
              const parts = content.split(/\s*[-–—]\s*/);
              bulletRole = parts[0].trim();
              bulletCompany = parts.slice(1).join(', ').trim();
            } else {
              bulletRole = content.trim();
            }
          }

          if (bulletRole || bulletCompany) {
            results.push({
              role: bulletRole,
              company: bulletCompany,
              startDate: bulletDate?.start || '',
              endDate: bulletDate?.isCurrent ? '' : bulletDate?.end || '',
              current: bulletDate?.isCurrent || false,
              description: bulletDesc,
            });
          }
        }
        i++;
      }
      continue;
    }

    // Try to extract date range from this line
    const dateOnThisLine = extractDateRange(line);
    // Also check next line for dates
    const nextLine = i + 1 < expLines.length ? expLines[i + 1] : '';
    const dateOnNextLine = extractDateRange(nextLine);

    let dates: { start: string; end: string; isCurrent: boolean } | null = null;
    let role = '';
    let company = '';
    let remaining = '';

    if (dateOnThisLine) {
      dates = dateOnThisLine;
      // Line format: "Role | Date Range" or "Role – Company | Date Range"
      // Remove the date portion from the line to get role/company
      const lineWithoutDate = line
        .replace(/\|\s*.*$/, '') // Remove everything after |
        .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}|Present|Current|To\s+Date|Ongoing)/gi, '')
        .replace(/\b((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2})\b/g, '')
        .replace(/\s*[-–—]\s*$/, '') // Trailing dash
        .trim();

      // Now parse role and company from lineWithoutDate
      // "Sales & Marketing Executive"  (role only, company on next line)
      // "Role – Company – Location"    (pipe separator)
      if (lineWithoutDate.includes(' – ') || lineWithoutDate.includes(' - ') || lineWithoutDate.includes(' — ')) {
        const parts = lineWithoutDate.split(/\s*[-–—]\s*/);
        if (parts.length >= 2) {
          role = parts[0].trim();
          // parts[1..n] could be company and location
          // Company is usually the second part
          company = parts[1].trim();
          // If there's a third part, it's likely location — append to company
          if (parts.length > 2 && !/\d{4}/.test(parts[2])) {
            company = company + ', ' + parts[2].trim();
          }
        } else {
          role = lineWithoutDate;
        }
      } else if (lineWithoutDate.includes(' at ')) {
        const atParts = lineWithoutDate.split(/\s+at\s+/i);
        role = atParts[0].trim();
        company = atParts[1]?.trim() || '';
      } else if (lineWithoutDate.includes(' | ')) {
        const pipeParts = lineWithoutDate.split(/\s*\|\s*/);
        role = pipeParts[0].trim();
        company = pipeParts[1]?.trim() || '';
      } else {
        role = lineWithoutDate;
      }

      // Next line might be the company name (if we only got role)
      if (!company && i + 1 < expLines.length) {
        const nxt = expLines[i + 1].trim();
        if (
          nxt.length > 2 &&
          nxt.length < 80 &&
          !/^[•·▪▸►→●\-\*]/.test(nxt) &&
          !/^key\s+contributions/i.test(nxt) &&
          !extractDateRange(nxt)
        ) {
          company = nxt.replace(/\s*[-–—]\s*$/, '').trim();
          i++; // consume the company line
        }
      }

      // Now collect description lines (bullets, "Key Contributions:", etc.)
      const descLines: string[] = [];
      i++;
      while (i < expLines.length) {
        const dl = expLines[i];
        // Stop if we hit a new entry (has a date range and is not a bullet)
        if (!/^[•·▪▸►→●\-\*]\s/.test(dl) && extractDateRange(dl)) break;
        // Stop at sub-section headers
        if (/^(?:other\s+work|additional|brief|internships?|volunteer|part[- ]time)\s/i.test(dl) && !extractDateRange(dl)) break;
        // Skip "Key Contributions:" markers but continue collecting bullets
        if (/^key\s+contributions?\s*[:\-–]?\s*$/i.test(dl)) {
          i++;
          continue;
        }
        descLines.push(dl.replace(/^[•·▪▸►→●\-\*]\s*/, '').trim());
        i++;
      }

      remaining = descLines.join(' ').replace(/\s{2,}/g, ' ').trim();

    } else if (dateOnNextLine) {
      // This line has role/company, next line has dates
      dates = dateOnNextLine;

      // Parse role/company from this line
      if (line.includes(' – ') || line.includes(' - ') || line.includes(' — ')) {
        const parts = line.split(/\s*[-–—]\s*/);
        role = parts[0].trim();
        company = parts.length > 1 ? parts[1].trim() : '';
      } else if (line.includes(' at ')) {
        const atParts = line.split(/\s+at\s+/i);
        role = atParts[0].trim();
        company = atParts[1]?.trim() || '';
      } else if (line.includes(' | ')) {
        const pipeParts = line.split(/\s*\|\s*/);
        role = pipeParts[0].trim();
        company = pipeParts[1]?.trim() || '';
      } else {
        role = line;
      }

      i += 2; // skip role/company line and date line

      // Collect description
      const descLines: string[] = [];
      while (i < expLines.length) {
        const dl = expLines[i];
        if (!/^[•·▪▸►→●\-\*]\s/.test(dl) && extractDateRange(dl)) break;
        if (/^(?:other\s+work|additional|brief|internships?|volunteer|part[- ]time)\s/i.test(dl) && !extractDateRange(dl)) break;
        if (/^key\s+contributions?\s*[:\-–]?\s*$/i.test(dl)) {
          i++;
          continue;
        }
        descLines.push(dl.replace(/^[•·▪▸►→●\-\*]\s*/, '').trim());
        i++;
      }
      remaining = descLines.join(' ').replace(/\s{2,}/g, ' ').trim();

    } else {
      // No date found — could be an orphaned bullet entry
      // Try parsing bullet mini-entries:
      // Try parsing bullet mini-entries:
      // "• Enumerator – Kenya National Bureau of Statistics | 2019 – Data collection"
      if (/^[•·▪▸►→●\-\*]\s/.test(line)) {
        const content = line.replace(/^[•·▪▸►→●\-\*]\s*/, '');
        const bulletDate = extractDateRange(content);
        let bulletRole = '';
        let bulletCompany = '';
        let bulletDesc = '';

        if (bulletDate) {
          // Remove date from content
          const contentWithoutDate = content
            .replace(/\|\s*.*$/, '')
            .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}|Present|Current|To\s+Date|Ongoing)/gi, '')
            .replace(/\b((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2})\b/g, '')
            .replace(/\s*[-–—]\s*$/, '')
            .trim();

          if (contentWithoutDate.includes(' – ') || contentWithoutDate.includes(' - ')) {
            const parts = contentWithoutDate.split(/\s*[-–—]\s*/);
            bulletRole = parts[0].trim();
            bulletCompany = parts.slice(1).join(', ').trim();
          } else {
            bulletRole = contentWithoutDate;
          }

          const afterPipe = content.match(/\|\s*(?:.*?\d{4}\s*[-–—to]+\s*(?:\d{4}|Present|Current|To Date|Ongoing)\s*[-–—]?\s*)(.+)/i);
          if (afterPipe) {
            bulletDesc = afterPipe[1].trim();
          }
        } else {
          if (content.includes(' – ') || content.includes(' - ')) {
            const parts = content.split(/\s*[-–—]\s*/);
            bulletRole = parts[0].trim();
            bulletCompany = parts.slice(1).join(', ').trim();
          } else {
            bulletRole = content.trim();
          }
        }

        if (bulletRole || bulletCompany) {
          results.push({
            role: bulletRole,
            company: bulletCompany,
            startDate: bulletDate?.start || '',
            endDate: bulletDate?.isCurrent ? '' : bulletDate?.end || '',
            current: bulletDate?.isCurrent || false,
            description: bulletDesc,
          });
        }
      }

      i++;
      continue;
    }

    // Push the parsed experience entry
    if (role || company) {
      results.push({
        role,
        company,
        startDate: dates?.start || '',
        endDate: dates?.isCurrent ? '' : dates?.end || '',
        current: dates?.isCurrent || false,
        description: remaining,
      });
    }
  }

  return results;
}

// ─── Education extraction ────────────────────────────────────────────────────

/**
 * Kenyan education patterns:
 *   "Bachelor of Commerce (Accounting Option) – Second Class Honours (Upper Division)"
 *   "Maasai Mara University – Narok, Kenya | Aug 2017 – Oct 2021"
 *   "Kenya Certificate of Secondary Education (B - )"
 *   "Githunguri Girls High School | 2013 – 2016"
 *   "Kenya Certificate of Primary Education"
 *   "Gituamba Primary School | 2004 – 2012"
 */
function extractEducation(sections: { section: string; lines: string[] }[]): ExtractedEducation[] {
  const results: ExtractedEducation[] = [];
  const eduLines = getSectionLines(sections, 'education');
  if (eduLines.length === 0) return results;

  let i = 0;

  while (i < eduLines.length) {
    const line = eduLines[i];

    // Skip bullets
    if (/^[•·▪▸►→●\-\*]\s/.test(line)) {
      i++;
      continue;
    }

    // Try to detect if this line + next line form an education entry
    let degree = '';
    let field = '';
    let institution = '';
    let startYear = '';
    let endYear = '';

    // Degree keywords
    const DEGREE_RE = /\b(?:bachelor|master|phd|doctor|diploma|certificate|associate|undergraduate|postgraduate|honours?|degree|b\.?\s*sc|m\.?\s*sc|m\.?\s*ba|b\.?\s*a|b\.?\s*com|m\.?\s*com|b\.?\s*tech|m\.?\s*tech|b\.?\s*eng|m\.?\s*eng|bcs|mcs)\b/i;

    // Kenyan-specific education patterns
    const KCSE_RE = /\bkenya\s+certificate\s+of\s+secondary\s+education\b/i;
    const KCPE_RE = /\bkenya\s+certificate\s+of\s+primary\s+education\b/i;
    const CPA_RE = /\bcpa\s*\(?/i;

    // Check if this line has a degree or qualification
    const hasDegree = DEGREE_RE.test(line) || KCSE_RE.test(line) || KCPE_RE.test(line);

    // Also check next line for institution
    const nextLine = i + 1 < eduLines.length ? eduLines[i + 1] : '';

    // Look for institution keywords
    const INST_RE = /\b(?:university|college|institute|polytechnic|academy|school|boys\s+high|girls\s+high|high\s+school|primary\s+school|secondary)\b/i;

    if (hasDegree) {
      // Extract degree name
      // "Bachelor of Commerce (Accounting Option) – Second Class Honours (Upper Division)"
      const degreeMatch = line.match(DEGREE_RE);
      if (degreeMatch) {
        // Get the full degree phrase
        const idx = line.toLowerCase().indexOf(degreeMatch[0].toLowerCase());
        // Capture from the degree keyword forward, up to a dash or end
        const degreeEnd = line.indexOf('–', idx);
        const degreeEnd2 = line.indexOf('-', idx);
        let endIdx = -1;
        if (degreeEnd > -1 && degreeEnd2 > -1) endIdx = Math.min(degreeEnd, degreeEnd2);
        else if (degreeEnd > -1) endIdx = degreeEnd;
        else if (degreeEnd2 > -1) endIdx = degreeEnd2;

        const rawDegree = endIdx > -1
          ? line.slice(idx, endIdx).trim()
          : line.slice(idx).trim();

        // Clean up: remove classification info like "Second Class Honours"
        degree = rawDegree
          .replace(/\s*[-–(]\s*(?:second|first|third)\s+class\s+honours?\s*(?:\(upper\s+division\)|\(lower\s+division\))?\s*\)?\s*/gi, '')
          .replace(/\s*[-–(]\s*(?:pass|credit|distinction)\s*\)?\s*/gi, '')
          .trim();

        // Try to extract field from parenthetical: "Bachelor of Commerce (Accounting Option)"
        const fieldMatch = line.match(/\(([^)]+)\)/);
        if (fieldMatch) {
          const f = fieldMatch[1].trim();
          if (/\b(?:option|major|concentration|specialisation|specialization)\b/i.test(f)) {
            field = f.replace(/\boption\b/i, '').replace(/^\s*(?:in|of)\s+/i, '').trim();
          } else if (!/honours?|class|division|pass|credit|distinction|grade/i.test(f)) {
            field = f;
          }
        }

        // Also try "Bachelor of Science in Computer Science"
        if (!field) {
          const inMatch = line.match(/\b(?:bachelor|master|diploma)\s+(?:of\s+)?(?:science|arts|commerce|technology|engineering|business|education|law|medicine)\s+in\s+([a-zA-Z\s&+]+)/i);
          if (inMatch) field = inMatch[1].trim();
        }
      }

      // Kenyan certificates
      if (KCSE_RE.test(line)) {
        degree = 'Kenya Certificate of Secondary Education';
        // Extract grade: "(B - )"
        const gradeMatch = line.match(/\(([A-F]\s*(?:[-+])?)\)/);
        if (gradeMatch) field = `Grade: ${gradeMatch[1].trim()}`;
      }
      if (KCPE_RE.test(line)) {
        degree = 'Kenya Certificate of Primary Education';
      }

      // Look for institution on next line
      if (INST_RE.test(nextLine)) {
        institution = nextLine
          .split(/\s*[-|–—]\s*/)[0] // Take first part before separator
          .replace(/\|.*$/, '')
          .trim();

        // Extract dates from the institution line
        const instDates = extractDateRange(nextLine);
        if (instDates) {
          startYear = instDates.start;
          endYear = instDates.isCurrent ? '' : instDates.end;
        }

        i += 2;
      } else {
        // Check for dates on same line
        const lineDates = extractDateRange(line);
        if (lineDates) {
          startYear = lineDates.start;
          endYear = lineDates.isCurrent ? '' : lineDates.end;
        }
        i++;
      }

      if (degree || institution) {
        results.push({ institution, degree, field, startYear, endYear });
      }
    } else if (INST_RE.test(line) && !hasDegree) {
      // Line is an institution without explicit degree
      institution = line.split(/\s*[-|–—]\s*/)[0].replace(/\|.*$/, '').trim();
      const lineDates = extractDateRange(line);
      if (lineDates) {
        startYear = lineDates.start;
        endYear = lineDates.isCurrent ? '' : lineDates.end;
      }

      // Check next line for degree info
      if (DEGREE_RE.test(nextLine)) {
        const degreeMatch = nextLine.match(DEGREE_RE);
        degree = degreeMatch ? degreeMatch[0].trim() : '';
        i += 2;
      } else {
        i++;
      }

      if (institution) {
        results.push({ institution, degree, field, startYear, endYear });
      }
    } else {
      i++;
    }
  }

  return results;
}

// ─── Certifications & Professional Qualifications ────────────────────────────

function extractCertifications(
  sections: { section: string; lines: string[] }[],
  allLines: string[],
): ExtractedCertification[] {
  const results: ExtractedCertification[] = [];

  // Collect from both 'certifications' and 'qualifications' sections
  const certLines = [
    ...getSectionLines(sections, 'certifications'),
    ...getSectionLines(sections, 'qualifications'),
  ];

  if (certLines.length === 0) return results;

  for (const line of certLines) {
    // Skip bullets that are just markers
    if (line.length < 3) continue;

    const cleanLine = line.replace(/^[•·▪▸►→●\-\*]\s*/, '').trim();

    // "CPA (Certified Public Accountant) Intermediate Level – Ongoing | 2025 – Present"
    // "Computer Packages – Gatanga Pasha Center | Jan 2017 – Mar 2017"
    // "AWS Solutions Architect - Amazon, 2023"

    // Extract year
    const yearMatch = cleanLine.match(/\b((?:19|20)\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : '';

    // Try to split into name and issuer
    // Pattern 1: "Name – Issuer | Date" or "Name - Issuer, Year"
    const dashSplit = cleanLine.split(/\s*[-–—]\s*/).filter((p) => p.trim());
    // Pattern 2: "Name | Issuer"
    const pipeSplit = cleanLine.split(/\s*\|\s*/).filter((p) => p.trim());

    let name = '';
    let issuer = '';

    if (pipeSplit.length >= 2) {
      // "CPA Intermediate Level – Ongoing" | "2025 – Present"
      // "Computer Packages – Gatanga Pasha Center | Jan 2017 – Mar 2017"
      const firstPart = pipeSplit[0].trim();

      // Check if first part has a dash split (name – issuer)
      const firstDashSplit = firstPart.split(/\s*[-–—]\s*/).filter((p) => p.trim());
      if (firstDashSplit.length >= 2) {
        name = firstDashSplit[0].trim();
        // The rest before "ongoing/present" etc is the issuer
        const restOfFirst = firstDashSplit.slice(1).join(' – ')
          .replace(/\b(?:ongoing|present|current|completed|in\s+progress)\b.*$/i, '')
          .trim();
        if (restOfFirst.length > 1) issuer = restOfFirst;
      } else {
        name = firstPart;
      }

      // Issuer could also be in the second pipe segment (if not already found)
      if (!issuer && pipeSplit.length >= 2) {
        const issuerPart = pipeSplit[1]
          .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}.*$/i, '')
          .replace(/\b(?:19|20)\d{2}\b.*$/, '')
          .replace(/\s*[-–—]\s*$/, '')
          .trim();
        if (issuerPart.length > 1 && !/^\d+$/.test(issuerPart)) {
          issuer = issuerPart;
        }
      }
    } else if (dashSplit.length >= 2) {
      name = dashSplit[0].trim();
      // Everything after the first dash minus date is the issuer
      const rest = dashSplit.slice(1).join(' – ')
        .replace(/\b(?:19|20)\d{2}\b.*$/, '')
        .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s*\d{4}.*$/i, '')
        .replace(/\s*[-–—]\s*$/, '')
        .replace(/\b(?:ongoing|present|current)\b.*$/i, '')
        .trim();
      if (rest.length > 1) issuer = rest;
    } else {
      name = cleanLine;
    }

    // Remove year from name if it got captured
    name = name.replace(/\s*\b((?:19|20)\d{2})\b/, '').trim();

    // Clean up status words from name
    name = name.replace(/\s*[-–(]\s*(?:ongoing|present|current|completed|in\s+progress)\s*[)]?\s*$/gi, '').trim();

    if (name.length > 2) {
      results.push({ name, issuer, year });
    }
  }

  return results.slice(0, 15);
}

// ─── Languages extraction ────────────────────────────────────────────────────

const PROFICIENCY_RE = /\b((?:native|fluent|advanced|intermediate|beginner|elementary|basic|professional)\w*)\b/i;

function extractLanguages(sections: { section: string; lines: string[] }[]): ExtractedLanguage[] {
  const results: ExtractedLanguage[] = [];
  const langLines = getSectionLines(sections, 'languages');
  if (langLines.length === 0) return results;

  for (const line of langLines) {
    const cleanLine = line.replace(/^[•·▪▸►→●\-\*]\s*/, '').trim();
    if (cleanLine.length < 2) continue;

    const profMatch = cleanLine.match(PROFICIENCY_RE);
    const proficiency = profMatch ? cap(profMatch[1]) : '';
    const name = cleanLine
      .replace(/[-|–—(]\s*(?:native|fluent|advanced|intermediate|beginner|elementary|basic|professional)\w*\s*[)]?/gi, '')
      .trim();

    if (name.length > 1) {
      results.push({ name: cap(name), proficiency: proficiency || 'Intermediate' });
    }
  }

  return results.slice(0, 10);
}

// ─── Referees extraction ─────────────────────────────────────────────────────

function extractReferees(sections: { section: string; lines: string[] }[], allText: string): ExtractedReferee[] {
  const results: ExtractedReferee[] = [];
  const refLines = getSectionLines(sections, 'referees');
  if (refLines.length === 0) return results;

  // If it just says "To be provided upon request" or similar, skip
  const joined = refLines.join(' ').toLowerCase();
  if (/upon\s+request|available\s+upon|provided\s+on/i.test(joined)) return results;

  let current: Partial<ExtractedReferee> = {};

  for (const line of refLines) {
    const cleanLine = line.replace(/^[•·▪▸►→●\-\*]\s*/, '').trim();
    if (cleanLine.length < 2) continue;

    // Try to detect if this is a new referee (starts with a name)
    const looksLikeName = /^[A-Z][a-zA-Z.\' ]{1,50}$/.test(cleanLine) && !/@|http|\d{4}/.test(cleanLine);

    // Try to extract phone or email from this line
    const phoneMatch = cleanLine.match(PHONE_RE);
    const emailMatch = cleanLine.match(EMAIL_RE);

    if (phoneMatch || emailMatch) {
      if (phoneMatch) current.phone = normalizePhone(phoneMatch[0]);
      if (emailMatch) current.email = emailMatch[1];
      // If we have enough data, push
      if (current.name && (current.phone || current.email)) {
        results.push({
          name: current.name || '',
          title: current.title || '',
          organization: current.organization || '',
          phone: current.phone || '',
          email: current.email || '',
        });
        current = {};
      }
    } else if (looksLikeName && current.name) {
      // We already have a name and found another — push current and start new
      results.push({
        name: current.name || '',
        title: current.title || '',
        organization: current.organization || '',
        phone: current.phone || '',
        email: current.email || '',
      });
      current = { name: cleanLine };
    } else if (looksLikeName) {
      current.name = cleanLine;
    } else if (current.name) {
      // Additional info — could be title, organization, or combined
      if (!current.title) {
        current.title = cleanLine;
      } else if (!current.organization) {
        current.organization = cleanLine;
      }
    }
  }

  // Push last referee
  if (current.name) {
    results.push({
      name: current.name || '',
      title: current.title || '',
      organization: current.organization || '',
      phone: current.phone || '',
      email: current.email || '',
    });
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

  const allLines = splitLines(text);

  // Split into sections first — this is the foundation of all extraction
  const sections = splitIntoSections(allLines);

  // Header section = everything before the first section header
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
    skills: extractSkills(allLines, sections),
    experience: extractExperience(sections),
    education: extractEducation(sections),
    certifications: extractCertifications(sections, allLines),
    languages: extractLanguages(sections),
    referees: extractReferees(sections, text),
  };
}
