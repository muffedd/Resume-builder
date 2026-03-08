function normalize(value) {
  return String(value || '').toLowerCase();
}

function countMatches(text, terms) {
  return terms.filter((term) => normalize(text).includes(normalize(term)));
}

function scoreToStatus(score) {
  if (score >= 80) return 'strong';
  if (score >= 60) return 'moderate';
  return 'needs-work';
}

function scoreToCheckStatus(score) {
  if (score >= 80) return 'pass';
  if (score >= 60) return 'warning';
  return 'fail';
}

function clampScore(score) {
  return Math.max(25, Math.min(96, Math.round(score)));
}

export function buildDynamicResumeResult(guide, resumeText = '') {
  const text = normalize(resumeText);
  const skillNames = (guide.skills || []).map((skill) => skill.name);
  const toolNames = guide.tools || [];
  const keywordNames = guide.keywords || [];

  const matchedSkills = countMatches(text, skillNames);
  const matchedTools = countMatches(text, toolNames);
  const matchedKeywords = countMatches(text, keywordNames);
  const missingSkills = skillNames.filter((skill) => !matchedSkills.includes(skill)).slice(0, 4);

  const skillsMatchScore = clampScore(skillNames.length ? (matchedSkills.length / skillNames.length) * 100 : 55);
  const projectStrengthScore = clampScore(45 + matchedTools.length * 10 + matchedKeywords.length * 4);
  const atsStructureScore = clampScore(55 + (resumeText.length > 300 ? 18 : 0) + (resumeText.length > 900 ? 8 : 0));
  const roleFitScore = clampScore((skillsMatchScore * 0.55) + (projectStrengthScore * 0.25) + (atsStructureScore * 0.2));
  const overallScore = clampScore((skillsMatchScore * 0.45) + (projectStrengthScore * 0.2) + (atsStructureScore * 0.15) + (roleFitScore * 0.2));
  const atsScore = clampScore((atsStructureScore * 0.4) + (skillsMatchScore * 0.35) + (projectStrengthScore * 0.25));

  return {
    role: {
      slug: guide.slug,
      title: guide.title,
      category: guide.category,
    },
    overallScore,
    skillsMatch: {
      score: skillsMatchScore,
      status: scoreToStatus(skillsMatchScore),
      missing: missingSkills,
    },
    projectStrength: {
      score: projectStrengthScore,
      status: scoreToStatus(projectStrengthScore),
      feedback: matchedTools.length
        ? `Your resume already signals ${matchedTools.slice(0, 3).join(', ')}. Add 1-2 stronger project bullets tied to ${guide.title.toLowerCase()} outcomes.`
        : `Add projects or experience bullets that explicitly show ${guide.tools.slice(0, 3).join(', ') || guide.title} in action.`,
    },
    atsStructure: {
      score: atsStructureScore,
      status: scoreToStatus(atsStructureScore),
      feedback: resumeText.length > 300
        ? 'Resume length is enough for screening, but keyword coverage can still improve.'
        : 'Add more role-specific detail so ATS systems can detect stronger alignment.',
    },
    roleFit: {
      score: roleFitScore,
      status: scoreToStatus(roleFitScore),
      feedback: matchedKeywords.length
        ? `Good overlap with live posting language: ${matchedKeywords.slice(0, 4).join(', ')}.`
        : `Mirror more live posting language for ${guide.title}, especially around ${skillNames.slice(0, 3).join(', ')}.`,
    },
    suggestions: [
      missingSkills.length ? `Add evidence for ${missingSkills.slice(0, 2).join(' and ')} in projects, coursework, or experience.` : `Keep reinforcing your strongest ${guide.title.toLowerCase()} skills with measurable impact.`,
      `Use resume keywords taken from current ${guide.title.toLowerCase()} postings: ${keywordNames.slice(0, 4).join(', ') || guide.title}.`,
      `Tailor one project bullet to tools employers mention most often: ${toolNames.slice(0, 3).join(', ') || 'role-specific tools'}.`,
    ],
    atsReport: {
      score: atsScore,
      status: scoreToStatus(atsScore),
      checks: [
        {
          label: 'Readable structure',
          status: scoreToCheckStatus(atsStructureScore),
          detail: resumeText.length > 300 ? 'Enough text for ATS parsing and section extraction.' : 'Resume is short; add clearer section content for parsers.',
        },
        {
          label: 'Role keywords',
          status: scoreToCheckStatus(skillsMatchScore),
          detail: matchedKeywords.length
            ? `Matched keywords: ${matchedKeywords.slice(0, 4).join(', ')}.`
            : `Add target keywords like ${keywordNames.slice(0, 4).join(', ') || guide.title}.`,
        },
        {
          label: 'Tool coverage',
          status: scoreToCheckStatus(projectStrengthScore),
          detail: matchedTools.length
            ? `Detected tools: ${matchedTools.slice(0, 4).join(', ')}.`
            : `Mention recruiter-facing tools such as ${toolNames.slice(0, 3).join(', ') || 'role-specific tools'}.`,
        },
        {
          label: 'Missing critical skills',
          status: missingSkills.length <= 1 ? 'pass' : missingSkills.length <= 3 ? 'warning' : 'fail',
          detail: missingSkills.length
            ? `Still missing: ${missingSkills.join(', ')}.`
            : 'Core skills from current postings are present in the resume text.',
        },
      ],
    },
    guideSignals: {
      generatedFromTrend: Boolean(guide.generatedFromTrend),
      source: guide.source ?? null,
    },
  };
}
