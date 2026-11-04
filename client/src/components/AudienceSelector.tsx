import React from 'react';
import { Select } from './arc/Select';
import { AudienceType } from '../types';
import { GraduationCap, Briefcase, Cpu, PiggyBank, Sparkles, Users } from 'lucide-react';

export interface AudienceOptionItem {
  value: AudienceType;
  label: string;
  icon: React.ReactNode;
  tagline: string;
}

export const AUDIENCE_CONFIG: AudienceOptionItem[] = [
  {
    value: 'Students',
    label: 'Students',
    icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />,
    tagline: 'Focus on campus lifestyle, study routines & portability',
  },
  {
    value: 'Working professionals',
    label: 'Working professionals',
    icon: <Briefcase className="w-3.5 h-3.5 text-blue-600" />,
    tagline: 'Focus on workplace productivity, meeting voice clarity & workflow',
  },
  {
    value: 'Tech enthusiasts',
    label: 'Tech enthusiasts',
    icon: <Cpu className="w-3.5 h-3.5 text-cyan-600" />,
    tagline: 'Focus on hardware architecture, connectivity & specs',
  },
  {
    value: 'Budget-conscious buyers',
    label: 'Budget-conscious buyers',
    icon: <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />,
    tagline: 'Focus on essential functionality, practicality & durability',
  },
  {
    value: 'Luxury buyers',
    label: 'Luxury buyers',
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />,
    tagline: 'Focus on refined aesthetics, premium comfort & materials',
  },
  {
    value: 'Everyday consumers',
    label: 'Everyday consumers',
    icon: <Users className="w-3.5 h-3.5 text-neutral-600" />,
    tagline: 'Focus on straightforward daily convenience & reliable ease of use',
  },
];

export interface AudienceSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabledValue?: string;
  error?: string;
  required?: boolean;
}

export const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  label,
  value,
  onChange,
  disabledValue,
  error,
  required = true,
}) => {
  const options = [
    { value: '', label: 'Select target audience...', disabled: true },
    ...AUDIENCE_CONFIG.map((opt) => ({
      value: opt.value,
      label: opt.value === disabledValue ? `${opt.label} (Selected for other)` : opt.label,
      disabled: opt.value === disabledValue,
    })),
  ];

  const currentOpt = AUDIENCE_CONFIG.find((o) => o.value === value);

  return (
    <div className="space-y-1.5">
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
        error={error}
        required={required}
      />
      {currentOpt && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-50 border border-border/80 text-[11px] text-text-secondary">
          <span className="shrink-0">{currentOpt.icon}</span>
          <span className="truncate">{currentOpt.tagline}</span>
        </div>
      )}
    </div>
  );
};
