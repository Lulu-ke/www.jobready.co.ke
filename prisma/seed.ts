import { PrismaClient, OrgType, ExperienceLevel, OpportunityType, UpdateType } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: generate URL-friendly slug from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ============================================
// EMPLOYERS (30) — mapped to new schema fields
// ============================================
const employersData = [
  { companyName: "Safaricom PLC", logoUrl: "SFC", description: "Kenya's leading telecommunications company providing mobile, voice, data, and financial services.", email: "info@safaricom.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "Equity Bank Kenya", logoUrl: "EBK", description: "One of East Africa's largest banking groups with operations across the region.", email: "info@equitybank.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "KCB Group", logoUrl: "KCB", description: "The largest commercial bank in Kenya with a presence in six East African countries.", email: "info@kcbgroup.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "NCBA Group", logoUrl: "NCB", description: "A leading financial services group in East Africa.", email: "info@ncbagroup.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "Kenya Airways", logoUrl: "KQA", description: "The flag carrier airline of Kenya, operating flights across Africa and internationally.", email: "info@kenyaairways.co.ke", orgType: "STATE_CORPORATION" as OrgType },
  { companyName: "East Africa Breweries Limited", logoUrl: "EAB", description: "A leading beverage alcohol manufacturer in East Africa.", email: "info@eabl.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "Bidco Africa", logoUrl: "BID", description: "A leading consumer goods manufacturer specializing in edible oils, soaps, and detergents.", email: "info@bidcoafrica.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "Unilever Kenya", logoUrl: "UNL", description: "A global fast-moving consumer goods company with operations in Kenya.", email: "info@unilever.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "Safaricom Foundation", logoUrl: "SFF", description: "Safaricom's corporate social investment arm focused on community development.", email: "info@safaricomfoundation.org", orgType: "FOUNDATION" as OrgType },
  { companyName: "World Vision Kenya", logoUrl: "WVK", description: "An international humanitarian organization dedicated to children's welfare.", email: "info@wvikenya.org", orgType: "NGO" as OrgType },
  { companyName: "UNICEF Kenya", logoUrl: "UNI", description: "The United Nations agency responsible for providing humanitarian aid to children worldwide.", email: "info@unicefkenya.org", orgType: "INTERNATIONAL_ORG" as OrgType },
  { companyName: "Kenya Medical Research Institute", logoUrl: "KEM", description: "Kenya's leading medical research institution.", email: "info@kemri.org", orgType: "STATE_CORPORATION" as OrgType },
  { companyName: "Aga Khan University Hospital", logoUrl: "AKH", description: "A premier teaching and tertiary healthcare facility in East Africa.", email: "info@aku.ac.ke", orgType: "EDUCATION" as OrgType },
  { companyName: "Ministry of Education", logoUrl: "MOE", description: "Kenya's government ministry responsible for education policy and administration.", email: "info@education.go.ke", orgType: "NATIONAL_GOV" as OrgType },
  { companyName: "Kenya Revenue Authority", logoUrl: "KRA", description: "Kenya's tax collection authority responsible for revenue mobilization.", email: "info@kra.go.ke", orgType: "STATE_CORPORATION" as OrgType },
  { companyName: "Google Kenya", logoUrl: "GGK", description: "Google's East Africa hub focusing on technology innovation and digital skills.", email: "info@google.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "Microsoft East Africa", logoUrl: "MSF", description: "Microsoft's regional office serving East African markets.", email: "info@microsoftafrica.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "Andela Kenya", logoUrl: "AND", description: "A global talent network connecting skilled technologists with world-class companies.", email: "info@andela.co.ke", orgType: "STARTUP" as OrgType },
  { companyName: "Twiga Foods", logoUrl: "TWF", description: "A technology-enabled fresh produce supply chain platform in Kenya.", email: "info@twigafoods.co.ke", orgType: "STARTUP" as OrgType },
  { companyName: "M-PESA (Safaricom)", logoUrl: "MPS", description: "Africa's leading mobile money service transforming financial inclusion.", email: "info@mpesa.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "Lipa Later", logoUrl: "LPL", description: "A leading Buy Now Pay Later platform in East Africa.", email: "info@lipalater.co.ke", orgType: "STARTUP" as OrgType },
  { companyName: "Absa Bank Kenya", logoUrl: "ABS", description: "A major financial services provider in Kenya and across Africa.", email: "info@absa.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "Deloitte East Africa", logoUrl: "DEL", description: "A global professional services firm providing audit, consulting, and advisory services.", email: "info@deloitte.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "PwC Kenya", logoUrl: "PWC", description: "One of the Big Four professional services firms operating in Kenya.", email: "info@pwc.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "Tsavo National Park (KWS)", logoUrl: "KWS", description: "Kenya Wildlife Service managing national parks and conservation efforts.", email: "info@kws.go.ke", orgType: "STATE_CORPORATION" as OrgType },
  { companyName: "Sarova Hotels", logoUrl: "SRV", description: "A premier hospitality group with hotels, lodges, and resorts across Kenya.", email: "info@sarovahotels.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "Britam Holdings", logoUrl: "BRT", description: "A leading diversified financial services group in East Africa.", email: "info@britam.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "Jubilee Insurance", logoUrl: "JUB", description: "Kenya's first and largest insurance company with operations across East Africa.", email: "info@jubileeinsurance.co.ke", orgType: "PRIVATE" as OrgType },
  { companyName: "KenGen", logoUrl: "KGN", description: "Kenya's leading electric power generating company.", email: "info@kengen.co.ke", orgType: "STATE_CORPORATION" as OrgType },
  { companyName: "Kenya Power", logoUrl: "KPC", description: "Kenya's sole electricity transmission and distribution company.", email: "info@kplc.co.ke", orgType: "STATE_CORPORATION" as OrgType },
];

// ============================================
// CATEGORIES (26) — unchanged
// ============================================
const categoriesData = [
  { name: "Accounting & Finance", slug: "accounting-finance", icon: "Calculator", color: "#0D9488", description: "Jobs in accounting, auditing, banking, financial analysis, and taxation" },
  { name: "Administration & Office", slug: "admin-office", icon: "ClipboardList", color: "#6366F1", description: "Administrative, secretarial, and office management positions" },
  { name: "Agriculture & Agribusiness", slug: "agriculture", icon: "Sprout", color: "#16A34A", description: "Jobs in farming, agricultural research, food processing, and agribusiness" },
  { name: "Aviation & Travel", slug: "aviation", icon: "Plane", color: "#0891B2", description: "Pilot, cabin crew, travel agent, and aviation management roles" },
  { name: "Banking & Microfinance", slug: "banking", icon: "Landmark", color: "#7C3AED", description: "Banking operations, microfinance, credit management, and financial services" },
  { name: "Consulting & Professional Services", slug: "consulting", icon: "Briefcase", color: "#DC2626", description: "Management consulting, legal, audit, and professional advisory roles" },
  { name: "Customer Service & Support", slug: "customer-service", icon: "Headphones", color: "#2563EB", description: "Customer service, call center, helpdesk, and client support positions" },
  { name: "Education & Teaching", slug: "education", icon: "GraduationCap", color: "#CA8A04", description: "Teaching, lecturing, academic research, and education administration" },
  { name: "Energy & Utilities", slug: "energy", icon: "Zap", color: "#F59E0B", description: "Power generation, renewable energy, oil & gas, and utility management" },
  { name: "Engineering & Construction", slug: "engineering", icon: "HardHat", color: "#EA580C", description: "Civil, electrical, mechanical engineering and construction management" },
  { name: "Fintech & Digital Payments", slug: "fintech", icon: "Smartphone", color: "#8B5CF6", description: "Mobile money, digital banking, blockchain, and fintech innovation roles" },
  { name: "Government & Public Sector", slug: "government", icon: "Building", color: "#1D4ED8", description: "National and county government jobs, parastatals, and public service" },
  { name: "Healthcare & Medical", slug: "healthcare", icon: "Heart", color: "#EF4444", description: "Doctors, nurses, pharmacists, medical research, and healthcare administration" },
  { name: "HR & Recruitment", slug: "hr-recruitment", icon: "Users", color: "#D946EF", description: "Human resources management, talent acquisition, and organizational development" },
  { name: "Insurance", slug: "insurance", icon: "Shield", color: "#0284C7", description: "Underwriting, claims management, actuarial, and insurance sales roles" },
  { name: "Internships & Graduate Programs", slug: "internships", icon: "Rocket", color: "#059669", description: "Entry-level positions, internships, and management trainee programs" },
  { name: "IT & Software Development", slug: "it-software", icon: "Code", color: "#6D28D9", description: "Software engineering, data science, cloud computing, and IT support" },
  { name: "Legal & Compliance", slug: "legal", icon: "Scale", color: "#334155", description: "Legal counsel, compliance officers, company secretaries, and advocates" },
  { name: "Logistics & Supply Chain", slug: "logistics", icon: "Truck", color: "#78350F", description: "Procurement, warehousing, fleet management, and supply chain operations" },
  { name: "Marketing & Communications", slug: "marketing", icon: "Megaphone", color: "#E11D48", description: "Digital marketing, PR, content creation, brand management, and social media" },
  { name: "NGO & Development", slug: "ngo", icon: "Globe", color: "#15803D", description: "Non-governmental organizations, UN agencies, and development sector jobs" },
  { name: "Project Management", slug: "project-management", icon: "GanttChart", color: "#0F766E", description: "Project planning, coordination, monitoring and evaluation roles" },
  { name: "Remote & Work From Home", slug: "remote", icon: "Wifi", color: "#4F46E5", description: "Fully remote and hybrid work opportunities across all industries" },
  { name: "Sales & Business Development", slug: "sales", icon: "TrendingUp", color: "#B91C1C", description: "Sales executives, account managers, business development, and partnerships" },
  { name: "Scholarships & Grants", slug: "scholarships", icon: "Award", color: "#9333EA", description: "Funding opportunities, fellowships, and educational grants" },
  { name: "Tourism & Hospitality", slug: "tourism", icon: "MapPin", color: "#0891B2", description: "Hotel management, tour operations, event planning, and restaurant management" },
];

// Category name → slug mapping for job categoryId lookup
const categorySlugMap: Record<string, string> = {
  "Accounting & Finance": "accounting-finance",
  "Administration & Office": "admin-office",
  "Agriculture & Agribusiness": "agriculture",
  "Aviation & Travel": "aviation",
  "Banking & Microfinance": "banking",
  "Consulting & Professional Services": "consulting",
  "Customer Service & Support": "customer-service",
  "Education & Teaching": "education",
  "Energy & Utilities": "energy",
  "Engineering & Construction": "engineering",
  "Fintech & Digital Payments": "fintech",
  "Government & Public Sector": "government",
  "Healthcare & Medical": "healthcare",
  "HR & Recruitment": "hr-recruitment",
  "Insurance": "insurance",
  "Internships & Graduate Programs": "internships",
  "IT & Software Development": "it-software",
  "Legal & Compliance": "legal",
  "Logistics & Supply Chain": "logistics",
  "Marketing & Communications": "marketing",
  "NGO & Development": "ngo",
  "Project Management": "project-management",
  "Remote & Work From Home": "remote",
  "Sales & Business Development": "sales",
  "Scholarships & Grants": "scholarships",
  "Tourism & Hospitality": "tourism",
};

// ============================================
// JOBS (51) — transformed to new schema
// ============================================
const jobsData = [
  { title: "Senior Software Engineer", employerIdx: 0, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "IT & Software Development", salaryMin: 250000, salaryMax: 400000, isFeatured: true, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "safaricom", description: "Join Safaricom's digital transformation team to build next-generation mobile and web applications serving over 40 million customers. You will lead the design and development of scalable microservices architectures and mentor junior developers.", requirements: "Bachelor's degree in Computer Science or related field. 5+ years experience in Java, Python, or Node.js. Experience with cloud platforms (AWS/Azure/GCP). Strong understanding of microservices architecture and RESTful APIs.", howToApply: "Apply online through the Safaricom careers portal. Include your CV, cover letter, and portfolio of projects.", closingDate: "2026-05-15", isRemote: false },
  { title: "Data Scientist", employerIdx: 1, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "IT & Software Development", salaryMin: 200000, salaryMax: 350000, isFeatured: true, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "equity", description: "Leverage advanced analytics and machine learning to drive data-informed decision making across the bank's operations, risk management, and customer experience teams. Work with petabytes of financial data.", requirements: "Master's degree in Statistics, Data Science, or related field. 3+ years experience in data science. Proficiency in Python, R, SQL, and ML frameworks. Experience with financial data analytics preferred.", howToApply: "Submit your application through the Equity Bank careers portal. Include a portfolio of data science projects.", closingDate: "2026-05-20", isRemote: false },
  { title: "Marketing Manager", employerIdx: 5, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Marketing & Communications", salaryMin: 180000, salaryMax: 300000, isFeatured: true, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "eabl", description: "Lead marketing strategy and brand activation campaigns for EABL's premium product portfolio. Manage a team of 15 marketing professionals and oversee a KSh 500M annual marketing budget.", requirements: "MBA with marketing specialization. 7+ years in brand marketing, FMCG preferred. Proven track record of successful marketing campaigns. Strong leadership and team management skills.", howToApply: "Apply through the EABL careers page on Diageo's website. Submit CV, cover letter, and portfolio of marketing campaigns.", closingDate: "2026-05-10", isRemote: false },
  { title: "Registered Nurse - ICU", employerIdx: 12, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Healthcare & Medical", salaryMin: 80000, salaryMax: 150000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "aku", description: "Provide specialized critical care nursing in the hospital's Intensive Care Unit. Monitor patients, administer medications, and collaborate with the multidisciplinary healthcare team.", requirements: "Bachelor of Science in Nursing. Valid NCK license. 3+ years ICU nursing experience. BLS/ACLS certification required.", howToApply: "Submit applications through the Aga Khan University Hospital careers portal. Include copies of your nursing license and certifications.", closingDate: "2026-05-25", isRemote: false },
  { title: "Financial Analyst", employerIdx: 22, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Accounting & Finance", salaryMin: 120000, salaryMax: 200000, experienceLevel: "entry" as ExperienceLevel, slugSuffix: "deloitte", description: "Provide financial advisory services to clients across East Africa. Conduct financial modeling, due diligence, and market analysis for mergers, acquisitions, and capital raising transactions.", requirements: "CPA(K) or ACCA qualification. Bachelor's degree in Finance or Accounting. 2-4 years experience in financial analysis. Strong Excel and financial modeling skills.", howToApply: "Apply through Deloitte's global careers portal. Select East Africa region and Financial Advisory practice.", closingDate: "2026-06-01", isRemote: false },
  { title: "Civil Engineer - Roads", employerIdx: 13, location: "Nakuru", county: "Nakuru", type: "Full-Time", category: "Engineering & Construction", salaryMin: 100000, salaryMax: 180000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "nakuru", description: "Oversee the design, construction, and maintenance of national highways in the Rift Valley region. Manage contractor relationships and ensure quality standards compliance.", requirements: "Bachelor's degree in Civil Engineering. Registered with EBK. 5+ years experience in road construction projects. Knowledge of Kenyan road design standards.", howToApply: "Submit applications through the Public Service Commission portal. Include copies of professional registration and academic certificates.", closingDate: "2026-05-30", isRemote: false },
  { title: "Product Manager - M-PESA", employerIdx: 19, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Fintech & Digital Payments", salaryMin: 250000, salaryMax: 400000, isFeatured: true, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "mpesa", description: "Lead product strategy for new M-PESA features and services. Own the product roadmap from conception to launch, working with engineering, design, and business teams.", requirements: "MBA or Bachelor's degree in Computer Science/Business. 5+ years product management experience. Mobile fintech experience highly preferred. Data-driven decision making skills.", howToApply: "Apply through the Safaricom careers portal. Include a product portfolio demonstrating your impact on user growth and engagement.", closingDate: "2026-05-18", isRemote: true },
  { title: "Secondary School Teacher - Mathematics", employerIdx: 13, location: "Mombasa", county: "Mombasa", type: "Full-Time", category: "Education & Teaching", salaryMin: 40000, salaryMax: 70000, experienceLevel: "entry" as ExperienceLevel, slugSuffix: "mombasa", description: "Teach mathematics to secondary school students (Form 1-4) in a national school. Develop lesson plans, assess student progress, and participate in co-curricular activities.", requirements: "Bachelor of Education (Mathematics). Registered with TSC. 2+ years teaching experience. Knowledge of CBC curriculum.", howToApply: "Apply through the Teachers Service Commission (TSC) online portal. Submit academic and professional certificates.", closingDate: "2026-06-15", isRemote: false },
  { title: "Human Resources Business Partner", employerIdx: 2, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "HR & Recruitment", salaryMin: 150000, salaryMax: 250000, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "kcb", description: "Partner with business leaders to develop and implement HR strategies that support organizational objectives. Manage talent acquisition, performance management, and employee engagement initiatives.", requirements: "Bachelor's degree in HR Management or related field. CHRP certification. 5+ years HRBP experience. Knowledge of Kenyan labor laws.", howToApply: "Apply through the KCB Group careers page. Submit your CV and cover letter addressed to the HR Director.", closingDate: "2026-05-22", isRemote: false },
  { title: "NGO Program Manager - Health", employerIdx: 9, location: "Kisumu", county: "Kisumu", type: "Contract", category: "NGO & Development", salaryMin: 180000, salaryMax: 280000, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "kisumu", description: "Manage health and nutrition programs in the Lake Victoria region. Oversee program implementation, budget management, stakeholder engagement, and impact reporting.", requirements: "Master's degree in Public Health or related field. 7+ years NGO program management experience. Experience with USAID-funded programs. Strong proposal writing skills.", howToApply: "Apply through the World Vision International career portal. Select Kenya location and Program Management category.", closingDate: "2026-05-28", isRemote: false },
  { title: "UX/UI Designer", employerIdx: 17, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "IT & Software Development", salaryMin: 150000, salaryMax: 280000, isFeatured: true, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "andela", description: "Design intuitive and beautiful user interfaces for Andela's platform and client products. Conduct user research, create wireframes and prototypes, and collaborate with engineering teams.", requirements: "Portfolio demonstrating UX/UI design skills. 3+ years experience. Proficiency in Figma and design systems. Understanding of accessibility standards.", howToApply: "Apply through Andela's careers page. Submit your portfolio along with your application.", closingDate: "2026-05-12", isRemote: true },
  { title: "Supply Chain Manager", employerIdx: 6, location: "Thika", county: "Kiambu", type: "Full-Time", category: "Logistics & Supply Chain", salaryMin: 150000, salaryMax: 250000, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "thika", description: "Manage end-to-end supply chain operations for Bidco's edible oils division. Oversee procurement, warehousing, distribution, and logistics across East Africa.", requirements: "Bachelor's degree in Supply Chain Management. CIPS or KISM certification. 5+ years supply chain experience in FMCG. ERP system proficiency (SAP preferred).", howToApply: "Apply through the Bidco Africa careers portal or send your CV to careers@bidcoafrica.com.", closingDate: "2026-06-05", isRemote: false },
  { title: "Pilot - First Officer", employerIdx: 4, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Aviation & Travel", salaryMin: 300000, salaryMax: 500000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "kenya-airways", description: "Fly as First Officer on Kenya Airways' domestic and regional routes. Ensure safe and efficient flight operations while delivering exceptional passenger experience.", requirements: "Valid Commercial Pilot License (CPL) with multi-engine rating. 500+ total flight hours. Class 1 Medical Certificate. ICAO English Level 4 or above.", howToApply: "Apply through the Kenya Airways careers portal. Submit copies of all licenses and medical certificates.", closingDate: "2026-06-10", isRemote: false },
  { title: "Sales Executive - Corporate Banking", employerIdx: 3, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Sales & Business Development", salaryMin: 100000, salaryMax: 250000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "ncba", description: "Drive corporate banking revenue by acquiring and managing relationships with medium and large enterprises. Meet and exceed quarterly sales targets.", requirements: "Bachelor's degree in Business or Finance. 3+ years corporate banking sales experience. Strong networking and relationship management skills. Knowledge of corporate banking products.", howToApply: "Apply through the NCBA Group careers page. Include your CV and a cover letter.", closingDate: "2026-05-20", isRemote: false },
  { title: "Legal Counsel - Corporate", employerIdx: 23, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Legal & Compliance", salaryMin: 180000, salaryMax: 350000, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "pwc", description: "Provide legal advisory services on corporate transactions, mergers and acquisitions, regulatory compliance, and governance matters for PwC's clients across East Africa.", requirements: "LLB degree, Advocate of the High Court of Kenya. 5+ years corporate law experience. Strong knowledge of Kenyan company law and regulatory frameworks.", howToApply: "Apply through the PwC global careers portal. Select Kenya and Legal/Tax practice area.", closingDate: "2026-05-30", isRemote: false },
  { title: "Mechanical Engineer - Maintenance", employerIdx: 28, location: "Nakuru", county: "Nakuru", type: "Full-Time", category: "Engineering & Construction", salaryMin: 120000, salaryMax: 200000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "kengen", description: "Lead maintenance planning and execution for geothermal power generation equipment. Ensure optimal plant availability and reliability.", requirements: "Bachelor's degree in Mechanical Engineering. Registered with EBK. 4+ years experience in power plant maintenance. Knowledge of condition monitoring and predictive maintenance.", howToApply: "Submit applications through the KenGen careers portal. Include copies of professional registration.", closingDate: "2026-06-08", isRemote: false },
  { title: "Digital Marketing Specialist", employerIdx: 25, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Marketing & Communications", salaryMin: 80000, salaryMax: 150000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "sarova", description: "Develop and execute digital marketing strategies across social media, email, SEO, and paid advertising channels to drive hotel bookings and brand awareness.", requirements: "Bachelor's degree in Marketing or Communications. 3+ years digital marketing experience. Google Analytics and Ads certifications. Experience in hospitality marketing preferred.", howToApply: "Send your CV and portfolio to careers@sarovahotels.com with subject line 'Digital Marketing Specialist Application'.", closingDate: "2026-05-15", isRemote: true },
  { title: "Research Scientist - Epidemiology", employerIdx: 11, location: "Kisumu", county: "Kisumu", type: "Contract", category: "Healthcare & Medical", salaryMin: 150000, salaryMax: 250000, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "kemri", description: "Lead epidemiological research studies on infectious diseases in Western Kenya. Design research protocols, conduct field studies, and publish findings in peer-reviewed journals.", requirements: "PhD in Epidemiology or related field. 3+ years post-doctoral research experience. Strong publication record. Experience with infectious disease research.", howToApply: "Apply through the KEMRI careers portal. Submit your CV, research statement, and list of publications.", closingDate: "2026-06-20", isRemote: false },
  { title: "Accountant - Tax", employerIdx: 14, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Government & Public Sector", salaryMin: 60000, salaryMax: 120000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "kra", description: "Handle tax assessment, collection, and compliance for corporate taxpayers. Conduct tax audits and ensure adherence to Kenya's tax laws and regulations.", requirements: "Bachelor's degree in Accounting or Finance. CPA(K) qualification. 2+ years experience in tax accounting. Knowledge of Kenyan tax laws and iTax system.", howToApply: "Apply through the KRA careers portal or Public Service Commission website.", closingDate: "2026-05-25", isRemote: false },
  { title: "Procurement Officer", employerIdx: 10, location: "Nairobi", county: "Nairobi", type: "Fixed-Term", category: "NGO & Development", salaryMin: 200000, salaryMax: 320000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "unicef", description: "Manage procurement processes for UNICEF Kenya's program supplies and services. Ensure compliance with UN procurement policies and achieve best value for money.", requirements: "Master's degree in Procurement, Supply Chain, or Business. CIPS certification preferred. 5+ years procurement experience. UN or international organization experience preferred.", howToApply: "Apply through the UNICEF careers portal (careers.unicef.org). Select Kenya duty station.", closingDate: "2026-06-01", isRemote: false },
  { title: "Frontend Developer (React)", employerIdx: 18, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "IT & Software Development", salaryMin: 120000, salaryMax: 220000, isFeatured: true, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "twiga", description: "Build modern, responsive web interfaces for Twiga's supply chain platform serving thousands of farmers and vendors across Kenya. Work with React, TypeScript, and modern web technologies.", requirements: "3+ years experience with React/TypeScript. Proficiency in modern CSS (Tailwind). Experience with state management (Redux/Zustand). Understanding of REST APIs and GraphQL.", howToApply: "Apply through Twiga Foods careers page or send your CV and GitHub portfolio to jobs@twigafoods.com.", closingDate: "2026-05-16", isRemote: true },
  { title: "Insurance Claims Manager", employerIdx: 27, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Insurance", salaryMin: 150000, salaryMax: 250000, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "jubilee", description: "Manage the claims department, oversee claims processing, and ensure timely settlement of insurance claims. Lead a team of claims assessors and investigators.", requirements: "Bachelor's degree in Insurance or related field. ACII or AIIK qualification. 7+ years claims management experience. Strong analytical and decision-making skills.", howToApply: "Apply through the Jubilee Insurance careers portal. Submit CV and cover letter.", closingDate: "2026-05-30", isRemote: false },
  { title: "Agricultural Extension Officer", employerIdx: 13, location: "Eldoret", county: "Uasin Gishu", type: "Full-Time", category: "Agriculture & Agribusiness", salaryMin: 45000, salaryMax: 75000, experienceLevel: "entry" as ExperienceLevel, slugSuffix: "eldoret", description: "Provide agricultural extension services to farmers in the North Rift region. Train farmers on modern farming techniques, market access, and value addition.", requirements: "Bachelor's degree in Agricultural Extension or Agronomy. 2+ years experience in agricultural extension. Knowledge of agricultural value chains.", howToApply: "Apply through the Public Service Commission portal. Submit academic and professional certificates.", closingDate: "2026-06-15", isRemote: false },
  { title: "Customer Experience Lead", employerIdx: 20, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Customer Service & Support", salaryMin: 100000, salaryMax: 180000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "lipa-later", description: "Lead the customer experience team to deliver exceptional service to Lipa Later's growing customer base. Develop CX strategies, manage the support team, and drive customer satisfaction.", requirements: "Bachelor's degree in Business or related field. 4+ years customer experience management experience. Knowledge of CRM systems. Strong leadership skills.", howToApply: "Apply through the Lipa Later careers page. Submit your CV and a brief cover letter.", closingDate: "2026-05-22", isRemote: true },
  { title: "Project Manager - Renewable Energy", employerIdx: 29, location: "Nairobi", county: "Nairobi", type: "Contract", category: "Project Management", salaryMin: 200000, salaryMax: 350000, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "kenya-power", description: "Manage renewable energy integration projects including solar and wind power connections to the national grid. Oversee project timelines, budgets, and stakeholder management.", requirements: "Bachelor's degree in Electrical Engineering. PMP certification. 7+ years project management experience. Experience in renewable energy projects.", howToApply: "Apply through the Kenya Power careers portal. Submit CV, PMP certification, and project portfolio.", closingDate: "2026-06-12", isRemote: false },
  { title: "Tour Guide - National Parks", employerIdx: 24, location: "Voi", county: "Taita Taveta", type: "Full-Time", category: "Tourism & Hospitality", salaryMin: 35000, salaryMax: 60000, experienceLevel: "entry" as ExperienceLevel, slugSuffix: "voi", description: "Lead guided tours and educational programs in Tsavo East and West National Parks. Share knowledge about wildlife, conservation, and ecosystem management with visitors.", requirements: "Diploma in Tourism or Wildlife Management. Silver or Gold level guiding certification from KATO. 2+ years experience as a tour guide. First aid certification.", howToApply: "Submit applications to the KWS regional office in Voi or through the KWS careers portal.", closingDate: "2026-06-01", isRemote: false },
  { title: "Graduate Management Trainee", employerIdx: 21, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Internships & Graduate Programs", salaryMin: 70000, salaryMax: 100000, experienceLevel: "entry" as ExperienceLevel, slugSuffix: "absa", description: "Join Absa's prestigious 18-month management trainee program. Rotate through various departments including Retail Banking, Corporate Banking, Risk, and Operations.", requirements: "Bachelor's degree with Second Class Upper or GPA 3.0+. Graduated in 2024 or 2025. Strong leadership and communication skills. No prior work experience required.", howToApply: "Apply through the Absa Group careers portal. Select 'Graduate Programme' and Kenya location. Application deadline is strict.", closingDate: "2026-05-08", isRemote: false },
  { title: "Backend Developer (Python)", employerIdx: 16, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "IT & Software Development", salaryMin: 280000, salaryMax: 450000, isFeatured: true, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "microsoft", description: "Build scalable backend services and APIs for Microsoft's Africa-focused products. Work with Python, Azure cloud services, and cutting-edge AI technologies.", requirements: "Bachelor's in Computer Science or equivalent. 5+ years Python development experience. Experience with Azure/AWS cloud services. Knowledge of microservices and containerization (Docker/K8s).", howToApply: "Apply through the Microsoft careers portal. Select Africa region and Backend Engineering roles.", closingDate: "2026-05-30", isRemote: true },
  { title: "Monitoring & Evaluation Specialist", employerIdx: 8, location: "Nairobi", county: "Nairobi", type: "Contract", category: "NGO & Development", salaryMin: 120000, salaryMax: 200000, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "safaricom-foundation", description: "Design and implement M&E frameworks for Safaricom Foundation's education, health, and environmental programs. Conduct impact assessments and data-driven reporting.", requirements: "Master's degree in Monitoring & Evaluation, Statistics, or related field. 5+ years M&E experience in development sector. Strong quantitative and qualitative research skills.", howToApply: "Apply through the Safaricom Foundation website. Submit CV, cover letter, and sample M&E framework.", closingDate: "2026-05-28", isRemote: false },
  { title: "Internal Auditor", employerIdx: 26, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Accounting & Finance", salaryMin: 120000, salaryMax: 200000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "britam", description: "Conduct internal audits across Britam's insurance, asset management, and banking operations. Identify risks, assess controls, and recommend improvements.", requirements: "Bachelor's degree in Accounting or Finance. CPA(K) and CIA certification. 3+ years internal audit experience. Knowledge of insurance industry regulations.", howToApply: "Apply through the Britam careers portal. Submit CV and cover letter.", closingDate: "2026-06-05", isRemote: false },
  { title: "Electrical Engineer - Solar", employerIdx: 28, location: "Garissa", county: "Garissa", type: "Contract", category: "Engineering & Construction", salaryMin: 130000, salaryMax: 220000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "garissa", description: "Lead the design and implementation of solar power projects in Kenya's arid and semi-arid regions. Manage project execution from feasibility studies to commissioning.", requirements: "Bachelor's degree in Electrical Engineering. EBK registration. 4+ years experience in solar/renewable energy projects. Knowledge of grid connection standards.", howToApply: "Apply through the KenGen careers portal.", closingDate: "2026-06-15", isRemote: false },
  { title: "Brand Manager", employerIdx: 7, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Marketing & Communications", salaryMin: 180000, salaryMax: 300000, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "unilever", description: "Manage brand strategy and P&L for one of Unilever's key brands in the Kenyan market. Drive brand equity, market share growth, and innovation pipeline.", requirements: "MBA with marketing specialization. 5+ years brand management experience in FMCG. Strong analytical and strategic thinking skills. Experience with consumer insights research.", howToApply: "Apply through the Unilever careers portal. Select Kenya and Marketing function.", closingDate: "2026-05-20", isRemote: false },
  { title: "Business Intelligence Analyst", employerIdx: 15, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "IT & Software Development", salaryMin: 200000, salaryMax: 350000, isFeatured: true, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "google", description: "Transform data into actionable business insights for Google's East Africa operations. Build dashboards, conduct ad-hoc analysis, and support strategic decision making.", requirements: "Bachelor's degree in Statistics, Mathematics, or Computer Science. 3+ years BI experience. Advanced SQL and Python skills. Experience with data visualization tools (Looker/Tableau).", howToApply: "Apply through the Google careers portal. Select Kenya location and Data/Analytics roles.", closingDate: "2026-06-01", isRemote: true },
  { title: "Network Administrator", employerIdx: 4, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "IT & Software Development", salaryMin: 100000, salaryMax: 180000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "ka-network", description: "Manage and maintain Kenya Airways' enterprise network infrastructure including LAN, WAN, WiFi, and security systems across all airport locations.", requirements: "Bachelor's degree in IT or related field. CCNA/CCNP certification. 3+ years network administration experience. Knowledge of aviation IT systems preferred.", howToApply: "Apply through the Kenya Airways careers portal.", closingDate: "2026-06-10", isRemote: false },
  { title: "Restaurant Manager", employerIdx: 25, location: "Mombasa", county: "Mombasa", type: "Full-Time", category: "Tourism & Hospitality", salaryMin: 60000, salaryMax: 100000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "mombasa", description: "Manage daily restaurant operations at a beach resort property. Oversee food quality, customer service, staff scheduling, and inventory management.", requirements: "Diploma or degree in Hospitality Management. 4+ years restaurant management experience. Food safety certification. Strong customer service orientation.", howToApply: "Send your CV to careers@sarovahotels.com with subject line 'Restaurant Manager - Mombasa'.", closingDate: "2026-05-25", isRemote: false },
  { title: "Underwriting Manager", employerIdx: 26, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Insurance", salaryMin: 180000, salaryMax: 300000, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "britam-uw", description: "Lead the underwriting team for life and general insurance products. Develop underwriting policies, assess risk, and ensure portfolio profitability.", requirements: "Bachelor's degree in Insurance, Actuarial Science, or related field. AIIK or ACII qualification. 7+ years underwriting experience. Strong analytical and leadership skills.", howToApply: "Apply through the Britam careers portal.", closingDate: "2026-06-08", isRemote: false },
  { title: "Content Writer", employerIdx: 0, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Marketing & Communications", salaryMin: 70000, salaryMax: 120000, experienceLevel: "entry" as ExperienceLevel, slugSuffix: "safaricom-cw", description: "Create engaging content for Safaricom's digital channels including website, social media, blog, and customer communications. Develop content strategy aligned with brand guidelines.", requirements: "Bachelor's degree in Communications, Journalism, or related field. 2+ years professional content writing experience. Strong portfolio of published work. SEO knowledge preferred.", howToApply: "Apply through the Safaricom careers portal. Include a portfolio of writing samples.", closingDate: "2026-05-20", isRemote: true },
  { title: "Environmental Scientist", employerIdx: 24, location: "Voi", county: "Taita Taveta", type: "Contract", category: "Agriculture & Agribusiness", salaryMin: 80000, salaryMax: 140000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "tsavo", description: "Conduct environmental impact assessments and biodiversity monitoring in Tsavo ecosystem. Develop conservation strategies and manage environmental research programs.", requirements: "Master's degree in Environmental Science or related field. 3+ years experience in environmental research. Knowledge of Kenyan environmental regulations.", howToApply: "Submit applications to the KWS careers portal or regional office.", closingDate: "2026-06-10", isRemote: false },
  { title: "Admin Assistant", employerIdx: 22, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Administration & Office", salaryMin: 40000, salaryMax: 65000, experienceLevel: "entry" as ExperienceLevel, slugSuffix: "deloitte-admin", description: "Provide comprehensive administrative support to the consulting team. Manage schedules, correspondence, travel arrangements, and office operations.", requirements: "Diploma in Business Administration or related field. 2+ years administrative experience. Proficiency in MS Office suite. Strong organizational skills.", howToApply: "Apply through the Deloitte careers portal. Select East Africa region.", closingDate: "2026-05-30", isRemote: false },
  { title: "DevOps Engineer", employerIdx: 17, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "IT & Software Development", salaryMin: 200000, salaryMax: 350000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "andela-devops", description: "Build and maintain CI/CD pipelines, cloud infrastructure, and monitoring systems. Ensure high availability and performance of production systems.", requirements: "3+ years DevOps experience. Proficiency with AWS/Azure/GCP. Experience with Docker, Kubernetes, Terraform. Strong scripting skills (Python/Bash).", howToApply: "Apply through Andela's careers page.", closingDate: "2026-05-25", isRemote: true },
  { title: "Compliance Officer - Banking", employerIdx: 3, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Legal & Compliance", salaryMin: 120000, salaryMax: 200000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "ncba-compliance", description: "Ensure compliance with CBK regulations, AML/CFT requirements, and internal policies. Conduct compliance reviews, risk assessments, and staff training.", requirements: "Bachelor's degree in Law, Finance, or related field. 4+ years compliance experience in banking. Knowledge of CBK guidelines and AML regulations.", howToApply: "Apply through the NCBA Group careers page.", closingDate: "2026-06-01", isRemote: false },
  { title: "Quantity Surveyor", employerIdx: 13, location: "Mombasa", county: "Mombasa", type: "Contract", category: "Engineering & Construction", salaryMin: 100000, salaryMax: 180000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "mombasa-qs", description: "Manage cost estimation, measurement, and contract administration for road construction projects in the Coast region.", requirements: "Bachelor's degree in Quantity Surveying. Registered with IQSK/EBK. 4+ years experience in infrastructure projects. Knowledge of FIDIC contracts.", howToApply: "Apply through the Public Service Commission portal.", closingDate: "2026-06-15", isRemote: false },
  { title: "Graphic Designer", employerIdx: 6, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Marketing & Communications", salaryMin: 50000, salaryMax: 90000, experienceLevel: "entry" as ExperienceLevel, slugSuffix: "bidco-design", description: "Create visual designs for product packaging, advertising campaigns, and digital marketing materials. Maintain brand consistency across all touchpoints.", requirements: "Diploma or degree in Graphic Design. 2+ years professional design experience. Proficiency in Adobe Creative Suite. Strong portfolio.", howToApply: "Apply through the Bidco Africa careers portal or send your portfolio to careers@bidcoafrica.com.", closingDate: "2026-05-22", isRemote: true },
  { title: "Clinical Pharmacist", employerIdx: 12, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Healthcare & Medical", salaryMin: 100000, salaryMax: 180000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "aku-pharmacy", description: "Provide clinical pharmacy services including drug therapy management, patient counseling, and medication safety oversight. Collaborate with medical teams.", requirements: "Bachelor of Pharmacy degree. Registered with PPB. 3+ years clinical pharmacy experience. Knowledge of drug information systems.", howToApply: "Apply through the Aga Khan University Hospital careers portal.", closingDate: "2026-06-05", isRemote: false },
  { title: "Data Engineer", employerIdx: 1, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "IT & Software Development", salaryMin: 180000, salaryMax: 300000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "equity-data", description: "Build and optimize data pipelines and infrastructure for Equity Bank's data platform. Design data models, implement ETL processes, and support analytics teams.", requirements: "Bachelor's in Computer Science or related field. 3+ years data engineering experience. Proficiency in SQL, Python, Spark, and cloud data services. Experience with financial data preferred.", howToApply: "Apply through the Equity Bank careers portal.", closingDate: "2026-06-10", isRemote: false },
  { title: "Program Officer - Education", employerIdx: 9, location: "Narok", county: "Narok", type: "Contract", category: "NGO & Development", salaryMin: 90000, salaryMax: 150000, experienceLevel: "entry" as ExperienceLevel, slugSuffix: "narok", description: "Implement education programs in Narok County focusing on improving access to quality education for children in pastoral communities.", requirements: "Bachelor's degree in Education or Social Sciences. 3+ years experience in education programming. Experience working with pastoral communities preferred.", howToApply: "Apply through the World Vision International career portal.", closingDate: "2026-06-08", isRemote: false },
  { title: "Credit Analyst", employerIdx: 2, location: "Kisumu", county: "Kisumu", type: "Full-Time", category: "Banking & Microfinance", salaryMin: 80000, salaryMax: 150000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "kcb-kisumu", description: "Evaluate creditworthiness of loan applicants, conduct financial analysis, and make credit recommendations. Manage credit risk within the bank's portfolio.", requirements: "Bachelor's degree in Finance or Accounting. CPA(K) or ACCA qualification. 2+ years credit analysis experience. Strong financial modeling skills.", howToApply: "Apply through the KCB Group careers page.", closingDate: "2026-05-30", isRemote: false },
  { title: "Security Operations Center Analyst", employerIdx: 0, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "IT & Software Development", salaryMin: 120000, salaryMax: 200000, experienceLevel: "mid" as ExperienceLevel, slugSuffix: "safaricom-soc", description: "Monitor and respond to cybersecurity threats targeting Safaricom's infrastructure. Conduct incident analysis and implement security measures.", requirements: "Bachelor's in IT/Computer Science. CISSP, CEH, or equivalent certification. 3+ years SOC experience. Knowledge of SIEM tools and threat intelligence.", howToApply: "Apply through the Safaricom careers portal.", closingDate: "2026-06-15", isRemote: false },
  { title: "Hotel General Manager", employerIdx: 25, location: "Nairobi", county: "Nairobi", type: "Full-Time", category: "Tourism & Hospitality", salaryMin: 200000, salaryMax: 400000, experienceLevel: "senior" as ExperienceLevel, slugSuffix: "sarova-gm", description: "Oversee all hotel operations including rooms, F&B, events, and maintenance. Drive revenue growth, guest satisfaction, and team development.", requirements: "Degree in Hospitality Management. 10+ years hotel operations experience with 5+ years in GM role. Strong financial acumen and leadership skills.", howToApply: "Send your CV to the Group HR Director at careers@sarovahotels.com.", closingDate: "2026-06-20", isRemote: false },
  { title: "Quantity Surveyor Intern", employerIdx: 13, location: "Nairobi", county: "Nairobi", type: "Internship", category: "Internships & Graduate Programs", salaryMin: 25000, salaryMax: 35000, experienceLevel: "internship" as ExperienceLevel, slugSuffix: "nairobi-intern", description: "Gain hands-on experience in quantity surveying for government infrastructure projects. Assist senior surveyors with cost estimation and contract management.", requirements: "Diploma or Degree in Quantity Surveying. Currently enrolled or recent graduate. Basic knowledge of construction measurement. Proficiency in MS Excel.", howToApply: "Apply through the Public Service Commission internship portal.", closingDate: "2026-06-30", isRemote: false },
];

// ============================================
// OPPORTUNITIES (12) — replaces Scholarships
// ============================================
const opportunitiesData = [
  // Converted from original 8 scholarships
  { title: "MasterCard Foundation Scholars Program at University of Nairobi", slug: "mastercard-foundation-scholars-university-of-nairobi", type: "scholarship" as OpportunityType, providerIdx: null, description: "Full scholarship for economically disadvantaged but academically talented students from Kenya pursuing undergraduate or master's degrees at the University of Nairobi.", amount: null, deadline: "2026-07-15", link: "https://mastercardfdn.org" },
  { title: "DAAD Kenya Scholarships for Postgraduate Studies", slug: "daad-kenya-scholarships-postgraduate", type: "scholarship" as OpportunityType, providerIdx: null, description: "Funding for Kenyan students to pursue Master's or PhD degrees at German universities. Covers tuition, travel, health insurance, and monthly stipend.", amount: null, deadline: "2026-06-30", link: "https://daad.de" },
  { title: "Kenya Education Fund (KEF) Scholarships", slug: "kenya-education-fund-kef-scholarships", type: "scholarship" as OpportunityType, providerIdx: null, description: "Provides scholarships for bright and needy Kenyan students to attend secondary school and university. Focus on students from marginalized communities.", amount: 100000, deadline: "2026-08-01", link: null },
  { title: "Google Africa Developer Scholarship", slug: "google-africa-developer-scholarship", type: "certification" as OpportunityType, providerIdx: 15, description: "Free access to Google Career Certificates and Pluralsight courses in Android development, cloud computing, and data analytics for African developers.", amount: 0, deadline: "2026-05-30", link: "https://developers.google.com" },
  { title: "Aga Khan Foundation International Scholarship", slug: "aga-khan-foundation-international-scholarship", type: "scholarship" as OpportunityType, providerIdx: null, description: "50% grant and 50% loan for outstanding students from developing countries pursuing postgraduate studies at top universities worldwide.", amount: null, deadline: "2026-09-01", link: "https://akdn.org" },
  { title: "Equity Group Foundation Wings to Fly Scholarship", slug: "equity-wings-to-fly-scholarship", type: "scholarship" as OpportunityType, providerIdx: 1, description: "Comprehensive scholarship for academically gifted but financially disadvantaged students to attend leading high schools and universities in Kenya.", amount: null, deadline: "2026-07-15", link: "https://equitygroupfoundation.com" },
  { title: "Fulbright Foreign Student Program - Kenya", slug: "fulbright-foreign-student-program-kenya", type: "scholarship" as OpportunityType, providerIdx: null, description: "Full scholarships for Kenyan graduate students, young professionals, and artists to study, research, or teach in the United States for one academic year.", amount: null, deadline: "2026-10-15", link: "https://fulbright.state.gov" },
  { title: "Microsoft AI School Africa Scholarship", slug: "microsoft-ai-school-africa", type: "certification" as OpportunityType, providerIdx: 16, description: "Free AI and machine learning training for African tech professionals. Includes access to Azure AI services and certification exam vouchers.", amount: 0, deadline: "2026-06-15", link: "https://microsoft.com/africa" },
  // Additional opportunities for variety
  { title: "Safaricom Technology Academy Internship", slug: "safaricom-technology-academy-internship", type: "internship" as OpportunityType, providerIdx: 0, description: "A 6-month intensive internship program at Safaricom's Technology Academy. Gain hands-on experience in telecommunications, software development, and network engineering.", amount: 50000, deadline: "2026-06-01", link: "https://safaricom.co.ke/about/careers" },
  { title: "County Government Bursary - Nakuru County", slug: "nakuru-county-bursary", type: "bursary" as OpportunityType, providerIdx: null, description: "Financial assistance for students from Nakuru County enrolled in secondary schools, colleges, and universities. Priority given to orphaned and vulnerable students.", amount: 30000, deadline: "2026-07-30", link: null },
  { title: "KCB SME Leadership Program Sponsorship", slug: "kcb-sme-leadership-program", type: "sponsorship" as OpportunityType, providerIdx: 2, description: "KCB Group sponsors aspiring entrepreneurs to attend a 12-week leadership and business development program. Includes mentorship, networking, and seed funding opportunities.", amount: 100000, deadline: "2026-08-15", link: "https://kcbgroup.com" },
  { title: "World Vision Kenya Community Health Volunteer Training", slug: "world-vision-kenya-chv-training", type: "certification" as OpportunityType, providerIdx: 9, description: "Free certified training for community health volunteers in partnership with the Ministry of Health. Covers maternal health, nutrition, and disease prevention.", amount: 0, deadline: "2026-07-01", link: "https://wvi.org/kenya" },
];

// ============================================
// ARTICLES (6) — unchanged
// ============================================
const articlesData = [
  { title: "How to Write a Winning CV in Kenya: The Complete 2026 Guide", slug: "winning-cv-kenya-guide", excerpt: "Stand out from thousands of applicants with a professionally crafted CV tailored for the Kenyan job market. Learn the essential sections, formatting tips, and common mistakes to avoid.", content: "Your CV is your first impression with a potential employer. In Kenya's competitive job market, where a single position can attract hundreds of applications, your CV needs to be exceptional to get noticed. This comprehensive guide covers everything from choosing the right format to highlighting your achievements effectively.", category: "CV & Interview Tips" },
  { title: "Top 15 Highest Paying Jobs in Kenya for 2026", slug: "highest-paying-jobs-kenya-2026", excerpt: "Discover which careers command the highest salaries in Kenya, from tech roles to specialized medical positions. Updated salary data and industry trends for job seekers.", content: "Kenya's job market is evolving rapidly with technology driving salary growth across multiple sectors. Based on industry surveys and recruitment data, we've compiled the most comprehensive list of the highest-paying careers in Kenya for 2026.", category: "Salary & Career Growth" },
  { title: "How to Prepare for Safaricom Job Interviews", slug: "safaricom-interview-prep", excerpt: "Insider tips for acing interviews at Kenya's most sought-after employer. Learn about their interview process, common questions, and what they look for in candidates.", content: "Safaricom is consistently ranked as one of Kenya's best employers, but their hiring process is rigorous. With over 50,000 applications monthly for various positions, understanding their interview methodology can give you a significant advantage.", category: "Company Guides" },
  { title: "Government Job Application Guide: TSC, KRA & County Jobs", slug: "government-job-application-guide", excerpt: "Navigate the Kenyan government job application process with ease. Step-by-step instructions for TSC, KRA, county government, and public service commission applications.", content: "Government jobs in Kenya offer job security, good benefits, and career progression. However, the application process can be complex and competitive. This guide breaks down the process for various government bodies.", category: "Government Jobs" },
  { title: "The Rise of Remote Work in Kenya: Opportunities & Challenges", slug: "remote-work-kenya", excerpt: "Kenya's remote work sector is booming. Learn about available opportunities, required skills, and how to position yourself for location-independent careers.", content: "The COVID-19 pandemic accelerated remote work adoption globally, and Kenya has emerged as one of Africa's leading destinations for remote talent. With improving internet infrastructure and a growing tech ecosystem, opportunities continue to expand.", category: "Remote Work" },
  { title: "Scholarship Application Tips: How to Win Funding for Your Studies", slug: "scholarship-application-tips", excerpt: "Competition for scholarships in Kenya is intense. Learn proven strategies to strengthen your applications and increase your chances of securing educational funding.", content: "Thousands of scholarships are available to Kenyan students every year, but many go unclaimed because applicants don't know how to present themselves effectively. This article provides practical tips from successful scholarship recipients.", category: "Scholarships" },
];

// ============================================
// JOB UPDATES (8)
// ============================================
const jobUpdatesData = [
  {
    title: "Shortlisted Candidates At Office of the Director of Public Prosecutions (ODPP)",
    slug: generateSlug("Shortlisted Candidates At Office of the Director of Public Prosecutions (ODPP)"),
    sourceName: "ODPP",
    sourceUrl: "https://odpp.go.ke",
    type: "SHORTLISTED" as UpdateType,
    content: "The Office of the Director of Public Prosecutions (ODPP) has released the list of shortlisted candidates for various positions advertised in the 2025/2026 financial year recruitment cycle. All shortlisted applicants are required to present themselves for verification of documents on the dates indicated in their respective invitation letters.\n\nCandidates must carry original academic and professional certificates, national identity card, and two passport-size photographs. Additionally, shortlisted applicants are required to present clearance certificates from the following bodies: Law Society of Kenya (LSK) for advocates, Higher Education Loans Board (HELB), Kenya Revenue Authority (KRA), Directorate of Criminal Investigations (CID), and the Ethics and Anti-Corruption Commission (EACC).\n\nThe verification exercise will be conducted at the ODPP headquarters along Harambee Avenue, Nairobi. Candidates who fail to appear on the scheduled date will automatically be disqualified from the recruitment process. The ODPP has emphasized that all communication regarding the recruitment will be done officially through the provided contact channels and candidates should beware of fraudulent individuals purporting to offer assistance.\n\nFor any inquiries, candidates may contact the ODPP Human Resource Department through the official email address or visit the ODPP website for more details on the recruitment timeline and requirements."
  },
  {
    title: "Shortlisted Candidates of the National Research Fund",
    slug: generateSlug("Shortlisted Candidates of the National Research Fund"),
    sourceName: "National Research Fund",
    sourceUrl: "https://researchfund.go.ke",
    type: "SHORTLISTED" as UpdateType,
    content: "The National Research Fund (NRF) has published the names of shortlisted candidates for the positions of Senior Research Officers, Research Assistants, and Administrative staff. The shortlisting follows a rigorous evaluation process that considered academic qualifications, research experience, and relevant skills.\n\nAll shortlisted candidates are invited for interviews scheduled to take place at the NRF headquarters in Nairobi. Candidates are required to carry their original certificates, transcripts, CV, and a copy of the application letter. Those with foreign qualifications must present recognition letters from the Commission for University Education (CUE).\n\nThe NRF is a state corporation established under the Science, Technology and Innovation Act, 2013, mandated to fund and facilitate research, innovation, and technology development in Kenya. Successful candidates will join a dynamic team dedicated to advancing research across various disciplines including health, agriculture, energy, and environmental sciences.\n\nCandidates are advised to regularly check the NRF website and their email for any updates regarding the interview schedule and venue. The Fund wishes all candidates the best in the upcoming interviews."
  },
  {
    title: "Interview Schedule: Kenya School of Government - Senior Lecturers",
    slug: generateSlug("Interview Schedule: Kenya School of Government - Senior Lecturers"),
    sourceName: "Kenya School of Government",
    sourceUrl: null,
    type: "INTERVIEW_SCHEDULE" as UpdateType,
    content: "The Kenya School of Government (KSG) has announced the interview schedule for the position of Senior Lecturers in various disciplines. Interviews will commence on the dates specified below and will be held at the KSG Lower Kabete Campus in Nairobi.\n\nCandidates shortlisted for the Senior Lecturer positions in Public Policy, Governance, and Leadership will be interviewed from 9:00 AM daily in the order of the published list. Each candidate is expected to arrive at least thirty minutes before their scheduled interview time and report to the reception desk with their national identity card for verification.\n\nThe interview panel will assess candidates on their academic credentials, teaching experience, research publications, and understanding of the Kenyan public sector landscape. Candidates may also be required to make a brief presentation on a topic related to their area of specialization.\n\nThe KSG encourages all candidates to prepare adequately and to familiarize themselves with the school's mandate of building capacity in the public service. Results will be communicated to successful candidates through official channels within two weeks after the completion of all interviews."
  },
  {
    title: "Extended Deadline: Public Service Commission Graduate Trainee Programme 2026",
    slug: generateSlug("Extended Deadline: Public Service Commission Graduate Trainee Programme 2026"),
    sourceName: "Public Service Commission",
    sourceUrl: null,
    type: "CLOSING_EXTENDED" as UpdateType,
    content: "The Public Service Commission (PSC) has extended the application deadline for the 2026 Graduate Trainee Programme. The new closing date is now two weeks from the original deadline, giving additional time for eligible graduates to submit their applications through the PSC online portal.\n\nThe Graduate Trainee Programme is designed to recruit and develop fresh graduates for leadership roles in the public service. Successful candidates will undergo a comprehensive two-year rotational training programme across various government ministries, departments, and agencies. The programme targets graduates from accredited universities with a minimum of a second-class upper division or equivalent qualification.\n\nApplicants must have completed their degree within the last three years and should not be above thirty-five years of age. The programme is open to graduates from all disciplines, though priority will be given to fields with identified skills gaps in the public service including information technology, data science, public health, and environmental management.\n\nInterested candidates are encouraged to apply early and ensure all required documents are uploaded correctly. The PSC has clarified that no extensions will be granted beyond the new deadline and late applications will not be considered."
  },
  {
    title: "Corrigendum: Ministry of Education Teacher Recruitment - Additional Positions",
    slug: generateSlug("Corrigendum: Ministry of Education Teacher Recruitment - Additional Positions"),
    sourceName: "Ministry of Education",
    sourceUrl: null,
    type: "CORRIGENDUM" as UpdateType,
    content: "The Ministry of Education wishes to issue a corrigendum to the earlier advertisement for teacher recruitment that was published in the local dailies. The following amendments and additions have been made to the original advertisement.\n\nFirst, the Ministry has added 1,500 additional teaching positions across various counties, bringing the total number of advertised positions to 6,500. The new positions are primarily in the subjects of Mathematics, Physics, Chemistry, Biology, and English for secondary schools, as well as Early Childhood Development Education (ECDE) teachers for primary schools.\n\nSecondly, the minimum qualifications for some positions have been revised. Applicants for secondary school positions now require a Bachelor of Education degree with a minimum of two teaching subjects. Applicants for ECDE positions must hold at least a Diploma in Early Childhood Education from a recognized institution.\n\nThe application process remains unchanged and all applications should be submitted through the Teachers Service Commission (TSC) online portal. The Ministry apologizes for any inconvenience caused by the changes and encourages all eligible candidates to take advantage of the additional positions. The closing date for all applications remains as originally advertised."
  },
  {
    title: "New Requirement: All Government Job Applicants Must Submit Tax Compliance Certificate",
    slug: generateSlug("New Requirement: All Government Job Applicants Must Submit Tax Compliance Certificate"),
    sourceName: "Kenya Revenue Authority",
    sourceUrl: null,
    type: "GENERAL" as UpdateType,
    content: "The Kenya Revenue Authority (KRA), in consultation with the Public Service Commission, has announced a new requirement for all individuals applying for government jobs. Effective immediately, all applicants must include a valid Tax Compliance Certificate (TCC) as part of their application documents.\n\nThe Tax Compliance Certificate is issued by KRA and serves as proof that an individual or entity has fulfilled their tax obligations as required by law. Applicants can apply for the TCC through the iTax platform (itra.kra.go.ke) and the certificate is typically processed within five working days. The certificate must be valid at the time of application and throughout the recruitment process.\n\nThis new requirement is part of the government's broader initiative to promote a culture of tax compliance among citizens and to ensure that public servants meet their tax obligations. The measure is also aimed at curbing tax evasion and widening the tax base to support government service delivery.\n\nApplicants who are unable to obtain a TCC are advised to visit their nearest KRA office for assistance with their tax records. The KRA has set up dedicated help desks at all its offices to assist job seekers with TCC applications. All employers in the public sector are expected to enforce this requirement during their recruitment processes."
  },
  {
    title: "Shortlisted Candidates: Kenya Medical Research Institute (KEMRI)",
    slug: generateSlug("Shortlisted Candidates: Kenya Medical Research Institute (KEMRI)"),
    sourceName: "KEMRI",
    sourceUrl: null,
    type: "SHORTLISTED" as UpdateType,
    content: "The Kenya Medical Research Institute (KEMRI) has released the list of shortlisted candidates for research scientist positions, laboratory technologists, and field coordinators. The shortlisting exercise considered academic qualifications, relevant research experience, and publications in peer-reviewed journals.\n\nShortlisted candidates are required to attend a practical assessment at their respective KEMRI centres before the formal interview. The practical assessment will evaluate candidates' technical competencies in their areas of specialization. Candidates must bring original certificates, professional registration documents where applicable, and a detailed curriculum vitae.\n\nKEMRI is Kenya's leading medical research institution, conducting research in infectious diseases, non-communicable diseases, and health systems strengthening. Successful candidates will be posted to various KEMRI research centres across the country including Nairobi, Kisumu, Kilifi, and Busia.\n\nAll candidates are advised to plan their travel accordingly and to contact the KEMRI Human Resource Department for any clarifications regarding the assessment schedule and requirements. KEMRI is an equal opportunity employer and encourages applications from all qualified individuals including persons with disabilities."
  },
  {
    title: "Interview Dates: Commission on Revenue Allocation - Research Officers",
    slug: generateSlug("Interview Dates: Commission on Revenue Allocation - Research Officers"),
    sourceName: "Commission on Revenue Allocation",
    sourceUrl: null,
    type: "INTERVIEW_SCHEDULE" as UpdateType,
    content: "The Commission on Revenue Allocation (CRA) has announced interview dates for the positions of Research Officers and Senior Research Officers. Interviews are scheduled to take place at the CRA headquarters in Nairobi starting from the dates specified in the individual invitation letters sent to shortlisted candidates.\n\nThe interview process will consist of two stages: a written assessment and an oral interview. The written assessment will test candidates' knowledge of public finance, fiscal decentralization, and research methodology. Candidates who pass the written assessment will proceed to the oral interview, which will focus on their academic background, research experience, and understanding of Kenya's revenue allocation framework.\n\nCandidates are required to bring original academic certificates, national identity card, curriculum vitae, and copies of published research papers or reports. Those with experience in public finance analysis, data analytics, or policy research will have an added advantage during the evaluation.\n\nThe CRA is established under Article 215 of the Constitution of Kenya and plays a critical role in recommending the basis for equitable sharing of revenue raised nationally between the national and county governments. Successful candidates will contribute to the Commission's mandate of promoting equitable development across all forty-seven counties."
  },
];

// ============================================
// SEED FUNCTION
// ============================================
async function seed() {
  console.log("Seeding database...");

  // Clear existing data in reverse dependency order
  await prisma.jobApplication.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.sponsoredAd.deleteMany();
  await prisma.job.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employer.deleteMany();

  // 1. Create categories first
  console.log("Creating categories...");
  const createdCategories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    createdCategories[cat.slug] = created.id;
  }
  console.log(`  Created ${categoriesData.length} categories`);

  // 2. Create employers
  console.log("Creating employers...");
  const createdEmployers: { id: string; companyName: string }[] = [];
  for (const emp of employersData) {
    const created = await prisma.employer.create({
      data: {
        companyName: emp.companyName,
        slug: generateSlug(emp.companyName),
        email: emp.email,
        logoUrl: emp.logoUrl,
        description: emp.description,
        orgType: emp.orgType,
      },
    });
    createdEmployers.push(created);
  }
  console.log(`  Created ${createdEmployers.length} employers`);

  // 3. Create jobs with categoryId and employerId lookups
  console.log("Creating jobs...");
  const usedSlugs = new Set<string>();
  let jobCount = 0;
  for (const job of jobsData) {
    const employer = createdEmployers[job.employerIdx];
    if (!employer) continue;

    // Generate unique slug
    let baseSlug = generateSlug(job.title);
    const suffix = job.slugSuffix ? `-${job.slugSuffix}` : `-${job.county.toLowerCase()}`;
    let slug = `${baseSlug}${suffix}`;
    // Ensure uniqueness
    let counter = 1;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}${suffix}-${counter}`;
      counter++;
    }
    usedSlugs.add(slug);

    // Look up categoryId from category name
    const categorySlug = categorySlugMap[job.category];
    const categoryId = categorySlug ? createdCategories[categorySlug] : null;

    await prisma.job.create({
      data: {
        title: job.title,
        slug,
        description: job.requirements
          ? `${job.description}\n\nRequirements:\n${job.requirements}`
          : job.description,
        howToApply: job.howToApply,
        location: job.location,
        county: job.county,
        type: job.type,
        experienceLevel: job.experienceLevel,
        categoryId,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: "KSh",
        isRemote: job.isRemote || false,
        isFeatured: job.isFeatured || false,
        isActive: true,
        closingDate: job.closingDate ? new Date(job.closingDate) : null,
        postedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        views: 0,
        employerId: employer.id,
      },
    });
    jobCount++;
  }
  console.log(`  Created ${jobCount} jobs`);

  // 4. Create opportunities
  console.log("Creating opportunities...");
  let oppCount = 0;
  const usedOppSlugs = new Set<string>();
  for (const opp of opportunitiesData) {
    // Ensure slug uniqueness
    let slug = opp.slug;
    let counter = 1;
    while (usedOppSlugs.has(slug)) {
      slug = `${opp.slug}-${counter}`;
      counter++;
    }
    usedOppSlugs.add(slug);

    const providerId = opp.providerIdx !== null ? createdEmployers[opp.providerIdx]?.id : null;

    await prisma.opportunity.create({
      data: {
        title: opp.title,
        slug,
        type: opp.type,
        description: opp.description,
        providerId: providerId ?? null,
        amount: opp.amount,
        deadline: opp.deadline ? new Date(opp.deadline) : null,
        link: opp.link,
        isActive: true,
        views: 0,
      },
    });
    oppCount++;
  }
  console.log(`  Created ${oppCount} opportunities`);

  // 5. Create articles
  console.log("Creating articles...");
  for (const art of articlesData) {
    await prisma.article.create({ data: art });
  }
  console.log(`  Created ${articlesData.length} articles`);

  // 6. Update category job counts
  console.log("Updating category job counts...");
  const jobCountsByCategory = await prisma.job.groupBy({
    by: ['categoryId'],
    _count: { categoryId: true },
  });
  for (const jc of jobCountsByCategory) {
    if (jc.categoryId) {
      await prisma.category.update({
        where: { id: jc.categoryId },
        data: { jobCount: jc._count.categoryId },
      });
    }
  }

  // 7. Create job updates
  console.log("Creating job updates...");
  try {
    for (const upd of jobUpdatesData) {
      await prisma.jobUpdate.create({ data: upd });
    }
    console.log(`  Created ${jobUpdatesData.length} job updates`);
  } catch (err) {
    console.error("  Failed to seed job updates:", err);
  }

  console.log("\nDatabase seeded successfully!");
  console.log(`  - ${createdEmployers.length} employers`);
  console.log(`  - ${categoriesData.length} categories`);
  console.log(`  - ${jobCount} jobs`);
  console.log(`  - ${oppCount} opportunities`);
  console.log(`  - ${articlesData.length} articles`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
