export const updateDate = '2026-03-07';
export const availableWeeks = ['This Week', 'Last Week', 'This Month'];
export const categories = ['All', 'Tech', 'Business', 'Design', 'Data'];
export const trendStatuses = ['rising', 'stable', 'falling'];

export const roleGuides = [
  {
    id: 1,
    slug: 'ai-product-manager',
    title: 'AI Product Manager',
    category: 'Tech',
    status: 'rising',
    summary:
      'Bridge product strategy and machine learning delivery while translating technical complexity into business outcomes.',
    growthPercent: 34,
    growthLabel: '+34%',
    sparkline: [40, 45, 52, 58, 65, 72, 80],
    snapshot: {
      salary: '$125K - $185K',
      experience: '3-5 years',
      growth: 'High',
      remote: '75% remote',
    },
    skills: [
      { name: 'Product Strategy', level: 'core', required: true },
      { name: 'Machine Learning Basics', level: 'core', required: true },
      { name: 'Data Analysis', level: 'rising', required: true },
      { name: 'API Integration', level: 'optional', required: false },
      { name: 'Ethics in AI', level: 'rising', required: false },
    ],
    tools: ['Jira', 'Figma', 'Python', 'Tableau', 'Amplitude', 'OpenAI API'],
    learningPath: [
      { stage: 'Foundation', duration: '2-3 weeks', topics: ['PM fundamentals', 'AI concepts'] },
      { stage: 'Technical', duration: '4-6 weeks', topics: ['ML workflows', 'Data pipelines'] },
      { stage: 'Applied', duration: '3-4 weeks', topics: ['Case studies', 'Portfolio projects'] },
    ],
    projects: [
      'Build an AI feature roadmap for a SaaS product',
      'Design an ML model evaluation framework',
      'Create a go-to-market plan for an AI tool',
    ],
    keywords: ['AI Strategy', 'Model Deployment', 'Product Analytics', 'Cross-functional Leadership'],
    interviewTopics: ['AI product metrics', 'Ethical considerations', 'Technical constraints', 'Stakeholder communication'],
    resources: [
      { title: 'AI Product Strategy Foundations', source: 'Coursera', difficulty: 'Intermediate', estimatedTime: '6h' },
      { title: 'Shipping ML Features', source: 'YouTube', difficulty: 'Intermediate', estimatedTime: '2h' },
      { title: 'Responsible AI for PMs', source: 'DeepLearning.AI', difficulty: 'Beginner', estimatedTime: '4h' },
    ],
    marketSignals: {
      hiringVelocity: '+23% increase in job postings',
      competition: 'Moderate - 45 applicants/role',
      timeToFill: 'Average 42 days',
      similarRoles: ['Product Manager - AI', 'Technical Program Manager', 'AI Strategist'],
    },
    regions: [
      { region: 'San Francisco', rank: 1, score: 94 },
      { region: 'New York', rank: 2, score: 89 },
      { region: 'Seattle', rank: 3, score: 86 },
    ],
  },
  {
    id: 2,
    slug: 'climate-data-analyst',
    title: 'Climate Data Analyst',
    category: 'Data',
    status: 'rising',
    summary: 'Turn environmental data into policy, sustainability, and forecasting decisions.',
    growthPercent: 28,
    growthLabel: '+28%',
    sparkline: [30, 35, 42, 48, 55, 60, 68],
    snapshot: {
      salary: '$88K - $128K',
      experience: '2-4 years',
      growth: 'Strong',
      remote: '58% remote',
    },
    skills: [
      { name: 'Python', level: 'core', required: true },
      { name: 'Geospatial Analysis', level: 'rising', required: true },
      { name: 'Climate Modeling', level: 'core', required: true },
      { name: 'Dashboarding', level: 'optional', required: false },
    ],
    tools: ['Python', 'R', 'QGIS', 'Tableau', 'NetCDF'],
    learningPath: [
      { stage: 'Science Basics', duration: '2 weeks', topics: ['Climate systems', 'Data collection'] },
      { stage: 'Analytics', duration: '4 weeks', topics: ['Forecasting', 'Model validation'] },
      { stage: 'Communication', duration: '2 weeks', topics: ['Policy briefs', 'Narrative charts'] },
    ],
    projects: ['Create a climate-risk dashboard', 'Analyze emissions trend data', 'Build a city heat-map report'],
    keywords: ['Climate Risk', 'Time Series', 'Geospatial', 'Scenario Modeling'],
    interviewTopics: ['Climate datasets', 'Uncertainty', 'Data storytelling'],
    resources: [
      { title: 'Climate Data with Python', source: 'edX', difficulty: 'Intermediate', estimatedTime: '8h' },
      { title: 'Geospatial Analysis Starter', source: 'ArcGIS', difficulty: 'Beginner', estimatedTime: '3h' },
    ],
    marketSignals: {
      hiringVelocity: '+18% increase in green-tech postings',
      competition: 'Low - 22 applicants/role',
      timeToFill: 'Average 36 days',
      similarRoles: ['Sustainability Analyst', 'Environmental Data Scientist', 'ESG Analyst'],
    },
    regions: [
      { region: 'Boston', rank: 1, score: 88 },
      { region: 'Austin', rank: 2, score: 84 },
      { region: 'Denver', rank: 3, score: 80 },
    ],
  },
  {
    id: 3,
    slug: 'ux-research-lead',
    title: 'UX Research Lead',
    category: 'Design',
    status: 'rising',
    summary: 'Guide product direction with structured research programs and evidence-based insight synthesis.',
    growthPercent: 22,
    growthLabel: '+22%',
    sparkline: [50, 52, 55, 58, 62, 65, 70],
    snapshot: {
      salary: '$110K - $155K',
      experience: '4-6 years',
      growth: 'High',
      remote: '71% remote',
    },
    skills: [
      { name: 'User Interviews', level: 'core', required: true },
      { name: 'Research Ops', level: 'rising', required: true },
      { name: 'Quant + Qual Synthesis', level: 'core', required: true },
      { name: 'Survey Design', level: 'optional', required: false },
    ],
    tools: ['Dovetail', 'Figma', 'Maze', 'Lookback', 'Notion'],
    learningPath: [
      { stage: 'Research Design', duration: '2 weeks', topics: ['Methods', 'Bias reduction'] },
      { stage: 'Insight Synthesis', duration: '3 weeks', topics: ['Patterns', 'Storytelling'] },
      { stage: 'Leadership', duration: '2 weeks', topics: ['Roadmap influence', 'Stakeholders'] },
    ],
    projects: ['Build a research repository', 'Run a mixed-method sprint', 'Present a redesign recommendation'],
    keywords: ['Discovery Research', 'Insight Synthesis', 'Research Strategy'],
    interviewTopics: ['Method selection', 'Influence without authority', 'Evidence quality'],
    resources: [
      { title: 'Advanced Research Facilitation', source: 'NN/g', difficulty: 'Advanced', estimatedTime: '5h' },
    ],
    marketSignals: {
      hiringVelocity: '+14% in product organizations',
      competition: 'Moderate - 37 applicants/role',
      timeToFill: 'Average 39 days',
      similarRoles: ['Research Manager', 'Design Strategist', 'Product Researcher'],
    },
    regions: [
      { region: 'New York', rank: 1, score: 90 },
      { region: 'San Francisco', rank: 2, score: 85 },
      { region: 'Remote', rank: 3, score: 82 },
    ],
  },
  {
    id: 4,
    slug: 'sustainability-consultant',
    title: 'Sustainability Consultant',
    category: 'Business',
    status: 'rising',
    summary: 'Help organizations translate ESG strategy into measurable operational changes.',
    growthPercent: 19,
    growthLabel: '+19%',
    sparkline: [35, 38, 42, 45, 48, 52, 56],
    snapshot: {
      salary: '$95K - $138K',
      experience: '3-5 years',
      growth: 'Strong',
      remote: '49% remote',
    },
    skills: [
      { name: 'ESG Reporting', level: 'core', required: true },
      { name: 'Stakeholder Management', level: 'rising', required: true },
      { name: 'Operational Analysis', level: 'core', required: true },
      { name: 'Carbon Accounting', level: 'rising', required: false },
    ],
    tools: ['Excel', 'Power BI', 'Workiva', 'Salesforce Net Zero Cloud'],
    learningPath: [
      { stage: 'Reporting Basics', duration: '2 weeks', topics: ['Frameworks', 'Compliance'] },
      { stage: 'Business Impact', duration: '3 weeks', topics: ['Operating model', 'Change management'] },
      { stage: 'Consulting Delivery', duration: '2 weeks', topics: ['Client communication', 'Recommendations'] },
    ],
    projects: ['Create an ESG scorecard', 'Audit sustainability metrics', 'Draft an action roadmap'],
    keywords: ['ESG', 'Reporting', 'Sustainability Strategy'],
    interviewTopics: ['Materiality', 'Compliance tradeoffs', 'Executive communication'],
    resources: [
      { title: 'ESG Reporting Primer', source: 'CFA Institute', difficulty: 'Beginner', estimatedTime: '4h' },
    ],
    marketSignals: {
      hiringVelocity: '+11% in enterprise roles',
      competition: 'Moderate - 31 applicants/role',
      timeToFill: 'Average 44 days',
      similarRoles: ['ESG Analyst', 'Sustainability Program Manager', 'Climate Strategy Associate'],
    },
    regions: [
      { region: 'Chicago', rank: 1, score: 84 },
      { region: 'Boston', rank: 2, score: 82 },
      { region: 'London', rank: 3, score: 80 },
    ],
  },
  {
    id: 5,
    slug: 'cloud-security-engineer',
    title: 'Cloud Security Engineer',
    category: 'Tech',
    status: 'rising',
    summary: 'Secure modern cloud infrastructure with policy, automation, and incident readiness.',
    growthPercent: 31,
    growthLabel: '+31%',
    sparkline: [45, 48, 55, 62, 68, 75, 82],
    snapshot: {
      salary: '$130K - $190K',
      experience: '4-6 years',
      growth: 'Very High',
      remote: '78% remote',
    },
    skills: [
      { name: 'AWS Security', level: 'core', required: true },
      { name: 'Threat Modeling', level: 'rising', required: true },
      { name: 'Infrastructure as Code', level: 'core', required: true },
      { name: 'SIEM Tuning', level: 'optional', required: false },
    ],
    tools: ['AWS', 'Terraform', 'Wiz', 'Okta', 'Splunk'],
    learningPath: [
      { stage: 'Cloud Foundations', duration: '2 weeks', topics: ['IAM', 'Networking'] },
      { stage: 'Security Automation', duration: '4 weeks', topics: ['Policies', 'IaC scanning'] },
      { stage: 'Readiness', duration: '2 weeks', topics: ['Detection', 'Incident response'] },
    ],
    projects: ['Secure a Terraform stack', 'Run a cloud misconfig audit', 'Design IAM guardrails'],
    keywords: ['Cloud Security', 'IAM', 'Threat Detection', 'Policy as Code'],
    interviewTopics: ['Least privilege', 'Shared responsibility', 'Incident tradeoffs'],
    resources: [
      { title: 'Cloud Security Roadmap', source: 'A Cloud Guru', difficulty: 'Intermediate', estimatedTime: '10h' },
    ],
    marketSignals: {
      hiringVelocity: '+26% increase in security reqs',
      competition: 'Low - 19 applicants/role',
      timeToFill: 'Average 48 days',
      similarRoles: ['Security Engineer', 'Platform Security Engineer', 'Cloud Compliance Engineer'],
    },
    regions: [
      { region: 'Seattle', rank: 1, score: 93 },
      { region: 'Austin', rank: 2, score: 89 },
      { region: 'Remote', rank: 3, score: 87 },
    ],
  },
  {
    id: 6,
    slug: 'health-tech-strategist',
    title: 'Health Tech Strategist',
    category: 'Business',
    status: 'rising',
    summary: 'Shape digital care, patient experience, and operational innovation in health organizations.',
    growthPercent: 25,
    growthLabel: '+25%',
    sparkline: [25, 30, 35, 42, 48, 55, 62],
    snapshot: {
      salary: '$105K - $148K',
      experience: '3-5 years',
      growth: 'High',
      remote: '46% remote',
    },
    skills: [
      { name: 'Healthcare Operations', level: 'core', required: true },
      { name: 'Digital Product Strategy', level: 'rising', required: true },
      { name: 'Stakeholder Alignment', level: 'core', required: true },
      { name: 'Analytics', level: 'optional', required: false },
    ],
    tools: ['Excel', 'Miro', 'Tableau', 'Epic', 'Airtable'],
    learningPath: [
      { stage: 'Healthcare Context', duration: '2 weeks', topics: ['Care journeys', 'Regulation'] },
      { stage: 'Strategy', duration: '3 weeks', topics: ['Opportunity mapping', 'Prioritization'] },
      { stage: 'Execution', duration: '2 weeks', topics: ['Roadmaps', 'Measurement'] },
    ],
    projects: ['Map a patient onboarding flow', 'Build a digital-care KPI scorecard', 'Write a telehealth strategy brief'],
    keywords: ['Health Tech', 'Patient Experience', 'Care Delivery'],
    interviewTopics: ['Regulatory constraints', 'Care operations', 'Digital transformation'],
    resources: [
      { title: 'Digital Health Strategy Basics', source: 'Harvard Online', difficulty: 'Intermediate', estimatedTime: '5h' },
    ],
    marketSignals: {
      hiringVelocity: '+17% increase in care-tech strategy roles',
      competition: 'Moderate - 29 applicants/role',
      timeToFill: 'Average 41 days',
      similarRoles: ['Healthcare Product Strategist', 'Digital Transformation Lead', 'Care Innovation Manager'],
    },
    regions: [
      { region: 'Boston', rank: 1, score: 91 },
      { region: 'Nashville', rank: 2, score: 84 },
      { region: 'Minneapolis', rank: 3, score: 79 },
    ],
  },
];

export const trendingSkills = [
  { name: 'Python', trend: 'rising', category: 'Tech' },
  { name: 'Machine Learning', trend: 'rising', category: 'Data' },
  { name: 'Strategic Planning', trend: 'stable', category: 'Business' },
  { name: 'Figma', trend: 'stable', category: 'Design' },
  { name: 'SQL', trend: 'rising', category: 'Data' },
  { name: 'React', trend: 'stable', category: 'Tech' },
  { name: 'Data Visualization', trend: 'rising', category: 'Data' },
  { name: 'Stakeholder Management', trend: 'rising', category: 'Business' },
  { name: 'User Research', trend: 'rising', category: 'Design' },
  { name: 'AWS', trend: 'rising', category: 'Tech' },
  { name: 'Threat Modeling', trend: 'rising', category: 'Tech' },
  { name: 'Research Ops', trend: 'rising', category: 'Design' },
];

export const adminOverview = {
  resumesAnalyzed: 342,
  commonMissingSkill: 'Python',
  weakProjects: '42%',
  mostTargetedRole: 'Data Scientist',
  statCards: [
    { label: 'Resumes Analyzed', value: 342, change: '+12 this week' },
    { label: 'Most Common Missing Skill', value: 'Python', subtext: '34% of students' },
    { label: 'Students Weak in Projects', value: '42%', change: '-3% vs last week', negative: true },
    { label: 'Most Targeted Role', value: 'Data Scientist', subtext: '23% of resumes' },
  ],
  highRiskStudents: 23,
  trendComparison: {
    title: 'Market Trend vs Student Readiness',
    subtitle: 'Critical insight: High market demand with low student preparedness',
    marketDemand: [12, 22, 48, 66, 82, 90, 94],
    studentReadiness: [18, 15, 20, 17, 18, 19, 21],
  },
};

export const weeklyReport = {
  reportWeek: 'Week of March 1-7, 2026',
  snapshot: {
    newResumes: 47,
    avgReadiness: 68,
    criticalGaps: 12,
    trendStatus: 'Rising',
  },
  topWeakAreas: [
    { skill: 'Machine Learning', affected: '34%', trend: 'rising' },
    { skill: 'Cloud Platforms', affected: '28%', trend: 'stable' },
    { skill: 'Data Visualization', affected: '25%', trend: 'rising' },
    { skill: 'Product Metrics', affected: '22%', trend: 'rising' },
    { skill: 'API Development', affected: '19%', trend: 'stable' },
  ],
  roleGaps: [
    { role: 'Data Scientist', readiness: 58, trend: -3 },
    { role: 'Product Manager', readiness: 72, trend: 5 },
    { role: 'UX Designer', readiness: 81, trend: 2 },
    { role: 'Software Engineer', readiness: 76, trend: 4 },
  ],
  highRiskStudentCount: 23,
  recommendedActions: [
    'Launch Python workshop series - 34% of students need improvement',
    'Schedule 1:1 sessions with 23 high-risk students',
    'Update AI Product Manager guide with new ML requirements',
    'Partner with local tech companies for project-based learning',
  ],
};

export const students = [
  { id: 'S-1001', name: 'Sarah Mitchell', targetRole: 'AI Product Manager', readiness: 72, risk: 'moderate', missingSkills: ['MLOps', 'TensorFlow'] },
  { id: 'S-1002', name: 'David Chen', targetRole: 'Data Scientist', readiness: 49, risk: 'high', missingSkills: ['Python', 'SQL', 'ML Ops'] },
  { id: 'S-1003', name: 'Nina Alvarez', targetRole: 'UX Research Lead', readiness: 81, risk: 'low', missingSkills: ['Research Ops'] },
  { id: 'S-1004', name: 'Aarav Menon', targetRole: 'Cloud Security Engineer', readiness: 54, risk: 'high', missingSkills: ['Threat Modeling', 'Terraform'] },
  { id: 'S-1005', name: 'Lena Brooks', targetRole: 'Health Tech Strategist', readiness: 67, risk: 'moderate', missingSkills: ['Analytics'] },
];

export const guideCollections = [
  {
    id: 'tech-engineering',
    title: 'Tech & Engineering',
    description: 'From AI Product Managers to Cloud Architects, explore the fastest-growing technical roles',
    accent: 'tech',
    countLabel: 'Explore 24 roles',
  },
  {
    id: 'data-analytics',
    title: 'Data & Analytics',
    description: 'Data Scientists, Analysts, and ML Engineers shaping the future of business intelligence',
    accent: 'data',
    countLabel: 'Explore 18 roles',
  },
];

export function buildSkillsByCategory() {
  return [
    { category: 'Tech', skills: 45, growth: '+23%' },
    { category: 'Data', skills: 32, growth: '+31%' },
    { category: 'Design', skills: 28, growth: '+18%' },
    { category: 'Business', skills: 36, growth: '+15%' },
  ];
}

export function buildRegions() {
  return [
    { region: 'San Francisco', rank: 1, score: 94 },
    { region: 'New York', rank: 2, score: 89 },
    { region: 'Seattle', rank: 3, score: 86 },
    { region: 'Austin', rank: 4, score: 82 },
    { region: 'Boston', rank: 5, score: 79 },
  ];
}

export function buildResumeResult(targetRoleSlug = 'ai-product-manager') {
  const role = roleGuides.find((item) => item.slug === targetRoleSlug) ?? roleGuides[0];
  const missingByRole = {
    'ai-product-manager': ['TensorFlow', 'MLOps'],
    'climate-data-analyst': ['Geospatial Analysis', 'NetCDF'],
    'ux-research-lead': ['Research Ops', 'Quantitative Synthesis'],
    'sustainability-consultant': ['Carbon Accounting', 'Workiva'],
    'cloud-security-engineer': ['Threat Modeling', 'Terraform'],
    'health-tech-strategist': ['Healthcare Analytics', 'Roadmap Metrics'],
  };

  return {
    role: { slug: role.slug, title: role.title },
    overallScore: role.slug === 'cloud-security-engineer' ? 64 : role.slug === 'ux-research-lead' ? 78 : 72,
    skillsMatch: {
      score: role.slug === 'cloud-security-engineer' ? 70 : 85,
      status: role.slug === 'cloud-security-engineer' ? 'moderate' : 'strong',
      missing: missingByRole[role.slug] ?? ['Communication'],
    },
    projectStrength: {
      score: role.slug === 'ux-research-lead' ? 74 : 68,
      status: role.slug === 'ux-research-lead' ? 'strong' : 'moderate',
      feedback: 'Add quantified impact and clearer ownership in project bullets',
    },
    atsStructure: { score: 90, status: 'strong', feedback: 'Well-structured for screening systems' },
    roleFit: {
      score: role.slug === 'climate-data-analyst' ? 69 : 65,
      status: 'needs-work',
      feedback: `Highlight more ${role.title.toLowerCase()} evidence in the summary and experience sections`,
    },
    suggestions: [
      'Add specific metrics to your strongest project bullets',
      `Include at least two of the missing trending skills for ${role.title}`,
      'Strengthen the skills section with tool names recruiters search for',
    ],
    atsReport: {
      score: 74,
      status: 'moderate',
      checks: [
        { label: 'Readable structure', status: 'pass', detail: 'Section flow is ATS-friendly.' },
        { label: 'Role keywords', status: 'warning', detail: 'Add more target-role keywords from current postings.' },
        { label: 'Tool coverage', status: 'warning', detail: 'Include more recruiter-searchable tool names.' },
        { label: 'Impact bullets', status: 'pass', detail: 'Experience bullets can be parsed, but add more quantified outcomes.' },
      ],
    },
  };
}

export function buildHomePayload() {
  return {
    hero: {
      headline: 'See which careers are rising, what to learn, and where students are falling behind',
      subheadline: 'Data-driven career insights to help you make informed decisions about your professional future',
      primaryCta: 'Explore Trends',
      secondaryCta: 'Upload Resume',
    },
    trendingRoles: roleGuides.slice(0, 3).map(({ id, slug, title, growthLabel, category, sparkline, status }) => ({
      id,
      slug,
      title,
      growth: growthLabel,
      category,
      sparkline,
      status,
    })),
    guideCollections,
    adminPreview: adminOverview.statCards,
    updateDate,
  };
}

export function buildTrendsPayload({ week = 'This Week', category = 'All', search = '', status = 'rising' } = {}) {
  const normalizedSearch = search.trim().toLowerCase();
  const filteredRoles = roleGuides.filter((role) => {
    const matchesCategory = category === 'All' || role.category === category;
    const matchesStatus = !status || role.status === status;
    const matchesSearch = !normalizedSearch || role.title.toLowerCase().includes(normalizedSearch) || role.skills.some((skill) => skill.name.toLowerCase().includes(normalizedSearch));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const filteredSkills = trendingSkills.filter((skill) => {
    const matchesCategory = category === 'All' || skill.category === category;
    const matchesSearch = !normalizedSearch || skill.name.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  return {
    selectedWeek: week,
    updateDate,
    filters: {
      weeks: availableWeeks,
      categories,
      statuses: trendStatuses,
    },
    heroStats: [
      { label: 'Top Rising Role', value: 'AI Product Manager', change: '+34%' },
      { label: 'Top Rising Skill', value: 'Machine Learning', change: '+28%' },
      { label: 'Fastest Growing', value: 'Data Science', change: '+22%' },
      { label: 'Updated', value: updateDate, change: 'Weekly' },
    ],
    roles: filteredRoles.map((role) => ({
      id: role.id,
      slug: role.slug,
      title: role.title,
      category: role.category,
      status: role.status,
      growth: role.growthLabel,
      sparkline: role.sparkline,
    })),
    skills: filteredSkills,
    skillsByCategory: buildSkillsByCategory(),
    regions: buildRegions(),
  };
}

export function buildBootstrapPayload() {
  return {
    home: buildHomePayload(),
    trends: buildTrendsPayload(),
    roleGuides: {
      list: roleGuides.map(({ id, slug, title, category, growthLabel, status, summary }) => ({ id, slug, title, category, growth: growthLabel, status, summary })),
      current: roleGuides[0],
    },
    resume: {
      targetRoles: roleGuides.map(({ slug, title }) => ({ slug, title })),
      sampleResult: buildResumeResult(),
    },
    admin: {
      overview: adminOverview,
      weeklyReport,
      students,
    },
  };
}
