/**
 * cv-local-extractor.ts
 *
 * Pure regex/rule-based CV field extraction.
 * No AI, no network calls — runs entirely in the browser.
 *
 * Designed for the CV Builder import flow:
 *   Upload PDF/DOCX → parse to text → extractCVFields(text) → populate form
 *
 * This handles 80-90% of CVs well. AI is offered separately as an
 * optional "Improve with AI" button for cleanup / rewriting.
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

export interface ExtractedCV {
  name: string;
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
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Split text into lines, trimming whitespace */
function lines(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

/** Case-insensitive regex test against a single line */
const test = (line: string, pattern: RegExp): boolean => pattern.test(line);

/** Extract first match from a string */
const firstMatch = (text: string, pattern: RegExp): string | null => {
  const m = text.match(pattern);
  return m ? m[1]?.trim() || null : null;
};

// ─── Contact extraction ──────────────────────────────────────────────────────

const EMAIL_RE = /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/;
const PHONE_RE = /(?:(?:\+254|254|0)(?:7\d|1\d)\d{7})|(?:\+?\d[\d\s\-]{8,})/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/i;
const PORTFOLIO_RE = /(?:https?:\/\/)(?!.*linkedin\.com)[^\s"<>]+\.[a-zA-Z]{2,}/gi;

function extractEmail(text: string): string {
  const m = text.match(EMAIL_RE);
  return m ? m[1] : '';
}

function extractPhone(text: string): string {
  // Prefer Kenyan formats first
  const m = text.match(PHONE_RE);
  if (!m) return '';
  let phone = m[0].trim();
  // Normalize: strip spaces, dashes
  phone = phone.replace(/[\s\-]/g, '');
  // If starts with 0, convert to +254
  if (/^07/.test(phone) && phone.length === 10) {
    phone = '+254' + phone.slice(1);
  } else if (/^7/.test(phone) && phone.length === 9) {
    phone = '+254' + phone;
  }
  return phone;
}

function extractLinkedIn(text: string): string {
  const m = text.match(LINKEDIN_RE);
  return m ? `https://linkedin.com/in/${m[1]}` : '';
}

function extractPortfolio(text: string): string {
  // Find URLs that aren't LinkedIn or email
  const urlRe = /(?:https?:\/\/)(?!.*linkedin\.com)(?!.*google\.com)(?!.*facebook\.com)[^\s"<>]+\.[a-zA-Z]{2,}/gi;
  const matches = text.match(urlRe);
  // Return the first non-linkedin URL that looks like a portfolio/personal site
  if (!matches) return '';
  for (const url of matches) {
    const lower = url.toLowerCase();
    if (lower.includes('github.com') || lower.includes('behance.net') ||
        lower.includes('dribbble.com') || lower.includes('portfolio') ||
        lower.includes('personal') || lower.includes('.me') ||
        lower.includes('.dev') || lower.includes('.io')) {
      return url;
    }
  }
  // Fallback: return first non-linkedin URL if any
  return matches[0] || '';
}

function extractLocation(text: string): string {
  // Look for common Kenyan locations
  const kenyaRe = /(?:Nairobi|Mombasa|Kisumu|Nakuru|Eldoret|Thika|Malindi|Kitale|Garissa|Machakos|Meru|Nyeri|Embu|Lamu|Naivasha|Ngong|Ruiru|Kikuyu|Westlands|Kilimani|Karen|Rongai|Athi River|Juja|Karuri|Kasarani|Kamakis|Utawala|Mlolongo|Syokimau|Kitengela|Ongata Rongai)(?:\s*,?\s*Kenya)?/i;
  const m = text.match(kenyaRe);
  if (m) return m[0].replace(/,\s*Kenya$/i, '').trim();

  // Fallback: look for "Location:" or "Address:" patterns
  const locRe = /(?:location|address|city|residence)\s*[:\-–]\s*(.+)/i;
  const locMatch = text.match(locRe);
  if (locMatch) return locMatch[1].trim().replace(/[.,;]$/, '');

  return '';
}

// ─── Name extraction ─────────────────────────────────────────────────────────

function extractName(text: string, email: string): string {
  const allLines = lines(text);

  // Strategy 1: First non-empty line that looks like a name
  // Names are typically 1-5 words, all starting with uppercase, no special chars
  const nameRe = /^[A-Z][a-zA-Z'.\- ]{1,50}$/;
  for (const line of allLines.slice(0, 10)) {
    if (nameRe.test(line) && !test(line, /@|http|summary|objective|experience|education|skill|certif|language|project|refer/i)) {
      return line.trim();
    }
  }

  // Strategy 2: Extract from email
  if (email) {
    const local = email.split('@')[0];
    const parts = local.replace(/[._\-]/g, ' ').split(' ');
    const capitalized = parts
      .filter((p) => p.length > 1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
    if (capitalized.length >= 3) return capitalized;
  }

  return '';
}

// ─── Summary extraction ──────────────────────────────────────────────────────

const SUMMARY_HEADERS = /^(?:professional\s+summary|summary|profile|about\s+me|career\s+(?:summary|objective|overview)|personal\s+statement|objective)\s*[:\-–]?\s*$/i;

function extractSummary(allLines: string[]): string {
  let started = false;
  const summaryLines: string[] = [];

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];

    if (SUMMARY_HEADERS.test(line)) {
      started = true;
      continue;
    }

    if (started) {
      // Stop at next section header
      if (/^(?:experience|education|skills?|certif|language|project|work\s+history|employment|qualification|technical|references|interest|hobb)/i.test(line) && line.length < 60) {
        break;
      }
      summaryLines.push(line);
    }
  }

  return summaryLines.join(' ').replace(/\s{2,}/g, ' ').trim();
}

// ─── Skills extraction ───────────────────────────────────────────────────────

const SKILL_SEPARATORS = /[;,|•·▪▸►→●)\]}>\/+]/;
const COMMON_SKILLS = new Set([
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go',
  'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'nosql', 'mongodb',
  'postgresql', 'mysql', 'redis', 'elasticsearch', 'docker', 'kubernetes', 'aws',
  'azure', 'gcp', 'linux', 'git', 'github', 'gitlab', 'bitbucket', 'jenkins',
  'ci/cd', 'terraform', 'ansible', 'nginx', 'apache', 'rest api', 'graphql',
  'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask',
  'spring', 'laravel', '.net', 'html', 'css', 'sass', 'tailwind', 'bootstrap',
  'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'excel', 'power bi',
  'tableau', 'powerpoint', 'word', 'agile', 'scrum', 'jira', 'confluence',
  'slack', 'trello', 'asana', 'notion', 'firebase', 'supabase', 'vercel',
  'netlify', 'heroku', 'shopify', 'wordpress', 'magento', 'stripe', 'paypal',
  'sap', 'salesforce', 'hubspot', 'zoho', 'quickbooks', 'sage', 'tally',
  'machine learning', 'deep learning', 'artificial intelligence', 'nlp',
  'data analysis', 'data science', 'data engineering', 'data visualization',
  'project management', 'product management', 'team leadership', 'communication',
  'problem solving', 'critical thinking', 'attention to detail', 'time management',
  'customer service', 'negotiation', 'presentation', 'public speaking',
  'report writing', 'research', 'analytics', 'accounting', 'bookkeeping',
  'audit', 'tax', 'budgeting', 'financial analysis', 'risk management',
  'supply chain', 'procurement', 'logistics', 'inventory management',
  'human resources', 'recruitment', 'training', 'mentoring', 'coaching',
  'marketing', 'digital marketing', 'social media', 'content writing',
  'seo', 'sem', 'email marketing', 'copywriting', 'branding',
  'graphic design', 'ui/ux', 'user research', 'wireframing', 'prototyping',
  'mobile development', 'ios', 'android', 'flutter', 'react native',
  'devops', 'sre', 'site reliability', 'microservices', 'api design',
  'system design', 'cloud computing', 'networking', 'cybersecurity',
  'penetration testing', 'ethical hacking', 'blockchain', 'web3',
  'teaching', 'curriculum development', 'classroom management',
  'nursing', 'patient care', 'clinical', 'pharmaceutical', 'medical',
  'legal', 'compliance', 'regulatory', 'contract management',
  'civil engineering', 'electrical engineering', 'mechanical engineering',
  'construction', 'architecture', 'autocad', 'revit',
  'driving', 'photography', 'videography', 'event planning',
]);

function extractSkills(allLines: string[]): string[] {
  const skills = new Set<string>();
  const seenText = new Set<string>();

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i].toLowerCase();

    // Skip if we're not in a skills section (rough heuristic)
    const isSkillsSection = /^(?:skills|technical\s+skills|core\s+competencies|technologies|tools|proficiencies|competencies|key\s+skills|areas?\s+of\s+expertise)/i.test(line);
    const isNextSection = /^(?:experience|education|certif|language|project|work\s+history|employment|refer|interest|hobb|achievement|award|volunteer|publication)/i.test(line);

    if (isNextSection && !isSkillsSection) {
      // Only skip if we haven't found any skills yet and we're past the skills section
      if (skills.size > 0 && i > 20) break;
    }

    // Match common skills as substrings
    for (const skill of COMMON_SKILLS) {
      if (line.includes(skill) && !seenText.has(skill)) {
        seenText.add(skill);
        skills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    }

    // Also try splitting by separators (for comma-separated skill lists)
    if (isSkillsSection || skills.size > 0) {
      const parts = allLines[i].split(SKILL_SEPARATORS);
      for (const part of parts) {
        const trimmed = part.trim().toLowerCase();
        if (trimmed.length >= 2 && trimmed.length <= 50 && !seenText.has(trimmed)) {
          // Check against common skills
          for (const skill of COMMON_SKILLS) {
            if (trimmed.includes(skill) || skill.includes(trimmed)) {
              seenText.add(trimmed);
              skills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
              break;
            }
          }
        }
      }
    }
  }

  return [...skills].slice(0, 30);
}

// ─── Experience extraction ───────────────────────────────────────────────────

const EXP_HEADERS = /^(?:work\s+experience|professional\s+experience|employment\s+(?:history|record)|career\s+history|work\s+history|experience)\s*[:\-–]?\s*$/i;
const EXP_END_HEADERS = /^(?:education|academic|qualification|skills?|certif|language|project|refer|interest|hobb|achievement|award|volunteer|publication)/i;
const DATE_RE = /(?:((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*[\s,]*\s*\d{4})|(\d{4}))\s*(?:[-–—to]+\s*)?((?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*[\s,]*\s*\d{4})|(?:(?:present|current|now)\b)|(?:\d{4}))/i;
const CURRENT_RE = /\b(present|current|now)\b/i;

function extractExperience(allLines: string[]): ExtractedExperience[] {
  const results: ExtractedExperience[] = [];
  let started = false;
  let buffer: string[] = [];

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];

    if (EXP_HEADERS.test(line)) {
      started = true;
      continue;
    }

    if (!started) continue;

    if (EXP_END_HEADERS.test(line) && buffer.length >= 2) {
      // Flush current buffer
      flushExpBuffer(buffer, results);
      buffer = [];
      started = false;
      continue;
    }

    buffer.push(line);
  }

  // Flush remaining
  if (buffer.length >= 2) {
    flushExpBuffer(buffer, results);
  }

  return results;
}

function flushExpBuffer(buffer: string[], results: ExtractedExperience[]) {
  // Join buffer and try to extract structured data
  const block = buffer.join('\n');

  // Look for date ranges
  const dateMatches = block.match(DATE_RE);
  const startDate = dateMatches ? cleanDate(dateMatches[1] || dateMatches[2] || '') : '';
  const endDate = dateMatches ? cleanDate(dateMatches[3] || '') : '';
  const isCurrent = dateMatches ? CURRENT_RE.test(dateMatches[0]) : false;

  // First line is usually role or company
  const firstLine = buffer[0] || '';
  const secondLine = buffer.length > 1 ? buffer[1] : '';

  let role = '';
  let company = '';
  let description = '';

  // Try to separate role and company from first two lines
  // Common patterns: "Software Engineer at Google" or "Google | Software Engineer"
  const atMatch = firstLine.match(/^(.+?)\s+at\s+(.+)$/i);
  const pipeMatch = firstLine.match(/^(.+?)\s*[-|–—]\s*(.+)$/);
  const dashMatch = firstLine.match(/^(.+?)\s*,\s*(.+)$/);

  if (atMatch) {
    role = atMatch[1].trim();
    company = atMatch[2].trim();
  } else if (pipeMatch) {
    role = pipeMatch[2].trim();
    company = pipeMatch[1].trim();
  } else if (dashMatch) {
    // "Google, Nairobi" — first part is company, but might be role
    role = firstLine;
  } else {
    role = firstLine;
  }

  // Second line often has the other piece (company or more dates)
  if (company && !secondLine.match(DATE_RE)) {
    // Already have both
  } else if (!company && secondLine && !secondLine.match(DATE_RE)) {
    company = secondLine;
  }

  // Rest is description
  const descStart = Math.max(1, dateMatches ? 2 : 1);
  description = buffer.slice(descStart).join(' ').replace(/\s{2,}/g, ' ').trim();

  // Clean company name — remove date fragments
  company = company.replace(/\b\d{4}\b/, '').replace(/present|current/i, '').replace(/[-|–—]/g, '').trim();

  if (role || company) {
    results.push({
      role: role.replace(/[-|–—]\s*\d.*/g, '').trim(),
      company: company.trim(),
      startDate,
      endDate: isCurrent ? '' : endDate,
      current: isCurrent,
      description,
    });
  }
}

function cleanDate(raw: string): string {
  if (!raw) return '';
  const s = raw.trim().replace(/[,.\s]+$/, '');
  // "Present" or "Current" → empty string (handled by isCurrent)
  if (CURRENT_RE.test(s)) return '';
  return s;
}

// ─── Education extraction ────────────────────────────────────────────────────

const EDU_HEADERS = /^(?:education|academic|qualification|academic\s+background)\s*[:\-–]?\s*$/i;
const EDU_END_HEADERS = /^(?:experience|employment|work|skills?|certif|language|project|refer|interest|hobb|achievement|award|volunteer|publication)/i;
const DEGREE_RE = /(?:bachelor|master|phd|doctor|diploma|certificate|associate|undergraduate|postgraduate|honours?|degree|b\.?sc|m\.?sc|m\.?ba|b\.?a|b\.?com|m\.?com|b\.?tech|m\.?tech|b\.?eng|m\.?eng|bcs|mcs)\b/i;
const INSTITUTION_RE = /(?:university|college|institute|polytechnic|academy|school\s+of|technical\s+(?:university|college))\b/i;
const YEAR_RANGE_RE = /(\d{4})\s*[-–—]\s*(\d{4})|(\d{4})\s*[-–—]\s*(present|current)|(\d{4})\b/g;

function extractEducation(allLines: string[]): ExtractedEducation[] {
  const results: ExtractedEducation[] = [];
  let started = false;
  let buffer: string[] = [];

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];

    if (EDU_HEADERS.test(line)) {
      started = true;
      continue;
    }

    if (!started) continue;

    if (EDU_END_HEADERS.test(line) && buffer.length >= 1) {
      flushEduBuffer(buffer, results);
      buffer = [];
      started = false;
      continue;
    }

    buffer.push(line);
  }

  if (buffer.length >= 1) {
    flushEduBuffer(buffer, results);
  }

  return results;
}

function flushEduBuffer(buffer: string[], results: ExtractedEducation[]) {
  const block = buffer.join(' ');

  // Find degree
  const degreeMatch = block.match(DEGREE_RE);
  const degree = degreeMatch ? degreeMatch[0].charAt(0).toUpperCase() + degreeMatch[0].slice(1) : '';

  // Find institution (look for university/college/institute keywords)
  const instMatch = block.match(INSTITUTION_RE);
  let institution = '';
  if (instMatch) {
    // Grab the surrounding context as the institution name
    const idx = block.toLowerCase().indexOf(instMatch[0].toLowerCase());
    // Get 40 chars before and 20 chars after
    const start = Math.max(0, idx - 40);
    const end = Math.min(block.length, idx + instMatch[0].length + 20);
    const context = block.slice(start, end).replace(/^[\s,;|\-–—:]+/, '').replace(/[\s,;|\-–—:]+$/, '').trim();
    institution = context;
  }

  // If no institution found, try the first line
  if (!institution && buffer[0]) {
    institution = buffer[0].replace(/\d{4}.*$/, '').trim();
  }

  // Extract year range
  let startYear = '';
  let endYear = '';
  const yearMatches = [...block.matchAll(YEAR_RANGE_RE)];
  if (yearMatches.length > 0) {
    startYear = yearMatches[0][1] || yearMatches[0][3] || yearMatches[0][5] || '';
    endYear = yearMatches[0][2] || yearMatches[0][4] || '';
  } else if (yearMatches.length === 0) {
    const singleYear = block.match(/\b((?:19|20)\d{2})\b/);
    if (singleYear) {
      endYear = singleYear[1];
    }
  }

  // Try to extract field of study (text after degree, before year)
  let field = '';
  if (degreeMatch && block.length > degreeMatch[0].length) {
    const afterDegree = block.slice(degreeMatch.index! + degreeMatch[0].length);
    // Take up to the next comma, year, or end
    const fieldMatch = afterDegree.match(/^\s*(?:in\s+|of\s+)?([a-zA-Z\s&\-+]{3,60}?)(?:\s*[,(;]|\s*\d{4}|\s*$)/);
    if (fieldMatch) {
      field = fieldMatch[1].trim();
    }
  }

  if (institution || degree) {
    results.push({
      institution,
      degree,
      field,
      startYear,
      endYear,
    });
  }
}

// ─── Certifications & Languages extraction ───────────────────────────────────

const CERT_HEADERS = /^(?:certifications?|certificates?|professional\s+(?:certifications?|licenses?|qualifications?))\s*[:\-–]?\s*$/i;

function extractCertifications(allLines: string[]): ExtractedCertification[] {
  const results: ExtractedCertification[] = [];
  let started = false;

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];

    if (CERT_HEADERS.test(line)) {
      started = true;
      continue;
    }

    if (!started) continue;

    // Stop at next major section
    if (/^(?:experience|education|skills?|language|project|refer|interest|hobb|achievement|award|volunteer|publication)/i.test(line)) break;

    // Skip empty separator lines
    if (line.length < 3) continue;

    // Try to extract: "AWS Solutions Architect - Amazon, 2023"
    const yearMatch = line.match(/\b((?:19|20)\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : '';
    const withoutYear = line.replace(/[-|–—]?\s*\b(?:19|20)\d{2}\b/, '').trim();

    const issuerMatch = withoutYear.match(/[-|–—,]\s*(.+)$/);
    const name = issuerMatch ? issuerMatch[0].replace(/^[-|–—,]\s*/, '').trim() : withoutYear;
    const issuer = issuerMatch ? issuerMatch[1].trim() : '';

    if (name.length > 2) {
      results.push({ name, issuer, year });
    }
  }

  return results.slice(0, 10);
}

const LANG_HEADERS = /^(?:languages?|language\s+skills?)\s*[:\-–]?\s*$/i;
const PROFICIENCY_RE = /\b((?:native|fluent|advanced|intermediate|beginner|elementary|basic|professional)\w*)\b/i;

function extractLanguages(allLines: string[]): ExtractedLanguage[] {
  const results: ExtractedLanguage[] = [];
  let started = false;

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];

    if (LANG_HEADERS.test(line)) {
      started = true;
      continue;
    }

    if (!started) continue;

    if (/^(?:experience|education|skills?|certif|project|refer|interest|hobb|achievement|award|volunteer|publication)/i.test(line)) break;
    if (line.length < 3) continue;

    // "English - Fluent" or "Kiswahili (Native)"
    const profMatch = line.match(PROFICIENCY_RE);
    const proficiency = profMatch ? capitalize(profMatch[1]) : 'Intermediate';
    const name = line.replace(/[-|–—(]\s*(?:native|fluent|advanced|intermediate|beginner|elementary|basic|professional)\w*\s*[)]?/gi, '').trim();

    if (name.length > 1) {
      results.push({ name: capitalize(name), proficiency });
    }
  }

  return results.slice(0, 10);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function extractCVFields(text: string): ExtractedCV {
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const linkedin = extractLinkedIn(text);
  const portfolio = extractPortfolio(text);
  const location = extractLocation(text);
  const name = extractName(text, email);
  const allLines = lines(text);

  return {
    name,
    email,
    phone,
    location,
    linkedin,
    portfolio,
    summary: extractSummary(allLines),
    skills: extractSkills(allLines),
    experience: extractExperience(allLines),
    education: extractEducation(allLines),
    certifications: extractCertifications(allLines),
    languages: extractLanguages(allLines),
  };
}
