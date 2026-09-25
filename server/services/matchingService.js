/**
 * SkillBridge Smart Skill Matching Algorithm
 * Transparent, deterministic, rule-based matching engine
 */

const calculateSkillMatch = (project, freelancerProfile) => {
  if (!project || !freelancerProfile) {
    return { matchPercentage: 0, matchedSkills: [], missingSkills: [] };
  }

  const projectSkills = project.requiredSkills || [];
  const freelancerSkills = freelancerProfile.skills || [];

  if (projectSkills.length === 0) {
    return {
      matchPercentage: 90,
      matchedSkills: [],
      missingSkills: [],
      details: 'No specific skills mandated by project',
    };
  }

  let totalWeight = 0;
  let earnedScore = 0;
  const matchedSkills = [];
  const missingSkills = [];

  projectSkills.forEach((reqSkill) => {
    let weight = 1.0;
    if (reqSkill.importance === 'Required') weight = 1.5;
    if (reqSkill.importance === 'Bonus') weight = 0.5;

    totalWeight += weight;

    // Find in freelancer profile (case-insensitive name comparison)
    const reqNameLower = reqSkill.name.toLowerCase().trim();
    const found = freelancerSkills.find(
      (fs) => fs.name.toLowerCase().trim() === reqNameLower
    );

    if (found) {
      if (found.isVerified) {
        // High confidence match based on verified assessment score
        const normalizedScore = Math.max(found.score, 70) / 100;
        earnedScore += weight * normalizedScore;
        matchedSkills.push({
          name: reqSkill.name,
          isVerified: true,
          score: found.score,
          level: found.verificationLevel,
        });
      } else {
        // Unverified self-claim gets reduced match weight
        earnedScore += weight * 0.4;
        matchedSkills.push({
          name: reqSkill.name,
          isVerified: false,
          score: 0,
          level: 'Unverified',
        });
      }
    } else {
      missingSkills.push({
        name: reqSkill.name,
        importance: reqSkill.importance || 'Required',
      });
    }
  });

  // Base skill match percentage (max 85% of total score)
  let skillMatchRatio = totalWeight > 0 ? earnedScore / totalWeight : 0;
  let baseScore = skillMatchRatio * 85;

  // Rating contribution (up to 8 points)
  const rating = freelancerProfile.averageRating || 5.0;
  const ratingBonus = (rating / 5.0) * 8;

  // Completed projects experience contribution (up to 7 points)
  const completedProjects = freelancerProfile.completedProjects || 0;
  const projectBonus = Math.min(completedProjects * 1.5, 7);

  let finalPercentage = Math.round(baseScore + ratingBonus + projectBonus);
  finalPercentage = Math.max(0, Math.min(100, finalPercentage));

  return {
    matchPercentage: finalPercentage,
    matchedSkills,
    missingSkills,
    ratingBonus: Math.round(ratingBonus),
    projectBonus: Math.round(projectBonus),
  };
};

module.exports = {
  calculateSkillMatch,
};
