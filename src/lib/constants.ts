// ============================================================
// CENTRALIZED CONSTANTS — JobReady Kenya
// Single source of truth for all filterable values, counties, etc.
// ============================================================

// All 47 Kenyan Counties with their capital towns
export const KENYA_COUNTIES = [
  { name: 'Baringo', capital: 'Kabarnet', slug: 'baringo' },
  { name: 'Bomet', capital: 'Bomet', slug: 'bomet' },
  { name: 'Bungoma', capital: 'Bungoma', slug: 'bungoma' },
  { name: 'Busia', capital: 'Busia', slug: 'busia' },
  { name: 'Elgeyo Marakwet', capital: 'Iten', slug: 'elgeyo-marakwet' },
  { name: 'Embu', capital: 'Embu', slug: 'embu' },
  { name: 'Garissa', capital: 'Garissa', slug: 'garissa' },
  { name: 'Homa Bay', capital: 'Homa Bay', slug: 'homa-bay' },
  { name: 'Isiolo', capital: 'Isiolo', slug: 'isiolo' },
  { name: 'Kajiado', capital: 'Kajiado', slug: 'kajiado' },
  { name: 'Kakamega', capital: 'Kakamega', slug: 'kakamega' },
  { name: 'Kericho', capital: 'Kericho', slug: 'kericho' },
  { name: 'Kiambu', capital: 'Kiambu', slug: 'kiambu' },
  { name: 'Kilifi', capital: 'Kilifi', slug: 'kilifi' },
  { name: 'Kirinyaga', capital: 'Kerugoya', slug: 'kirinyaga' },
  { name: 'Kisii', capital: 'Kisii', slug: 'kisii' },
  { name: 'Kisumu', capital: 'Kisumu', slug: 'kisumu' },
  { name: 'Kitui', capital: 'Kitui', slug: 'kitui' },
  { name: 'Kwale', capital: 'Kwale', slug: 'kwale' },
  { name: 'Laikipia', capital: 'Nanyuki', slug: 'laikipia' },
  { name: 'Lamu', capital: 'Lamu', slug: 'lamu' },
  { name: 'Machakos', capital: 'Machakos', slug: 'machakos' },
  { name: 'Makueni', capital: 'Wote', slug: 'makueni' },
  { name: 'Mandera', capital: 'Mandera', slug: 'mandera' },
  { name: 'Marsabit', capital: 'Marsabit', slug: 'marsabit' },
  { name: 'Meru', capital: 'Meru', slug: 'meru' },
  { name: 'Migori', capital: 'Migori', slug: 'migori' },
  { name: 'Mombasa', capital: 'Mombasa', slug: 'mombasa' },
  { name: 'Murang\'a', capital: 'Murang\'a', slug: 'muranga' },
  { name: 'Nairobi', capital: 'Nairobi', slug: 'nairobi' },
  { name: 'Nakuru', capital: 'Nakuru', slug: 'nakuru' },
  { name: 'Nandi', capital: 'Kapsabet', slug: 'nandi' },
  { name: 'Narok', capital: 'Narok', slug: 'narok' },
  { name: 'Nyamira', capital: 'Nyamira', slug: 'nyamira' },
  { name: 'Nyandarua', capital: 'Ol Kalou', slug: 'nyandarua' },
  { name: 'Nyeri', capital: 'Nyeri', slug: 'nyeri' },
  { name: 'Samburu', capital: 'Maralal', slug: 'samburu' },
  { name: 'Siaya', capital: 'Siaya', slug: 'siaya' },
  { name: 'Taita Taveta', capital: 'Voi', slug: 'taita-taveta' },
  { name: 'Tana River', capital: 'Hola', slug: 'tana-river' },
  { name: 'Tharaka Nithi', capital: 'Chuka', slug: 'tharaka-nithi' },
  { name: 'Trans Nzoia', capital: 'Kitale', slug: 'trans-nzoia' },
  { name: 'Turkana', capital: 'Lodwar', slug: 'turkana' },
  { name: 'Uasin Gishu', capital: 'Eldoret', slug: 'uasin-gishu' },
  { name: 'Vihiga', capital: 'Vihiga', slug: 'vihiga' },
  { name: 'Wajir', capital: 'Wajir', slug: 'wajir' },
  { name: 'West Pokot', capital: 'Kapenguria', slug: 'west-pokot' },
] as const;

// Quick lookup maps
export const COUNTY_SLUG_MAP = Object.fromEntries(
  KENYA_COUNTIES.map(c => [c.slug, c.name])
) as Record<string, string>;

export const COUNTY_NAME_MAP = Object.fromEntries(
  KENYA_COUNTIES.map(c => [c.name, c.slug])
) as Record<string, string>;

export const COUNTY_SLUGS = KENYA_COUNTIES.map(c => c.slug) as readonly string[];
export const COUNTY_NAMES = KENYA_COUNTIES.map(c => c.name) as readonly string[];

// Major cities/towns for location filter
export const MAJOR_LOCATIONS = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Malindi',
  'Kitale',
  'Nanyuki',
  'Garissa',
  'Narok',
  'Voi',
  'Kericho',
  'Embu',
  'Meru',
  'Machakos',
  'Naivasha',
  'Isiolo',
  'Lodwar',
  'Kakamega',
  'Bungoma',
  'Kisii',
  'Homa Bay',
  'Lamu',
  'Mandera',
  'Wajir',
] as const;

// Job types
export const JOB_TYPES = [
  'Full-Time',
  'Part-Time',
  'Contract',
  'Internship',
  'Fixed-Term',
  'Remote',
] as const;

export const JOB_TYPE_SLUGS: Record<string, string> = {
  'Full-Time': 'full-time',
  'Part-Time': 'part-time',
  'Contract': 'contract',
  'Internship': 'internship',
  'Fixed-Term': 'fixed-term',
  'Remote': 'remote',
};

export const JOB_TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-Time Jobs',
  'part-time': 'Part-Time Jobs',
  'contract': 'Contract Jobs',
  'internship': 'Internship Jobs',
  'fixed-term': 'Fixed-Term Jobs',
  'remote': 'Remote & Work From Home Jobs',
};

// Experience levels
export const EXPERIENCE_LEVELS = ['entry', 'internship', 'casual', 'mid', 'senior'] as const;

// Sort options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'featured', label: 'Featured' },
  { value: 'salary-high', label: 'Salary: High to Low' },
  { value: 'salary-low', label: 'Salary: Low to High' },
] as const;

// Site metadata
export const SITE = {
  name: 'JobReady Kenya',
  url: 'https://www.jobready.co.ke',
  tagline: "Kenya's #1 Job Board",
  description: 'Find the latest jobs, internships, scholarships, and career opportunities across Kenya. Search by county, category, or job type.',
  ogImage: 'https://www.jobready.co.ke/og-default.png',
  twitterHandle: '@JobReadyKE',
} as const;
