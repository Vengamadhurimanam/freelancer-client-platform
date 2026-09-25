import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';
import { getVerificationBadgeClass } from '../../utils/helpers';

const SkillBadge = ({ name, isVerified, score, level, showScore = true }) => {
  if (isVerified) {
    const badgeClass = getVerificationBadgeClass(level);
    return (
      <span className={badgeClass} title={`Verified via SkillBridge Assessment: ${score}%`}>
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold">{name}</span>
        {showScore && score > 0 && (
          <span className="opacity-80 text-[11px] font-normal">({score}%)</span>
        )}
      </span>
    );
  }

  return (
    <span className="badge-unverified">
      <span>{name}</span>
    </span>
  );
};

export default SkillBadge;
