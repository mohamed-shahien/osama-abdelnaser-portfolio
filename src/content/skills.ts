// Copy for the skills section after Selected Work. Every skill is listed in
// the master brief, section 03 (Core Specialties, UX, UI and Design Tools).

export type SkillTone = 'blue' | 'yellow' | 'warm' | 'rose' | 'white';
export type SkillShape = 'pill' | 'soft' | 'circle';
export type SkillSize = 'sm' | 'md';

export type Skill = {
  label: string;
  tone: SkillTone;
  shape: SkillShape;
  size: SkillSize;
};

export const skillsContent = {
  label: 'Skills — sixteen core skills of Osama Abdelnaser',
  kicker: 'Sixteen core',
  title: 'Skills',
  connector: 'of',
  name: 'Osama Abdelnaser',
  scene: 'Sc. 04 — Toolkit',
  meta: 'Product Designer',
  steps: ['Sketch', 'Wireframe', 'Visual', 'Final'],
  skills: [
    { label: 'Product Design', tone: 'yellow', shape: 'pill', size: 'md' },
    { label: 'UX Design', tone: 'blue', shape: 'circle', size: 'md' },
    { label: 'UI Design', tone: 'rose', shape: 'circle', size: 'md' },
    { label: 'Design Systems', tone: 'white', shape: 'pill', size: 'md' },
    { label: 'Research Methods', tone: 'blue', shape: 'soft', size: 'sm' },
    { label: 'Information Architecture', tone: 'warm', shape: 'pill', size: 'sm' },
    { label: 'User Flows', tone: 'yellow', shape: 'soft', size: 'sm' },
    { label: 'Wireframing', tone: 'white', shape: 'pill', size: 'sm' },
    { label: 'Prototyping', tone: 'rose', shape: 'pill', size: 'md' },
    { label: 'Interaction Design', tone: 'blue', shape: 'pill', size: 'md' },
    { label: 'Visual Design', tone: 'warm', shape: 'soft', size: 'sm' },
    { label: 'Responsive Design', tone: 'white', shape: 'soft', size: 'sm' },
    { label: 'Arabic / English UI', tone: 'blue', shape: 'pill', size: 'sm' },
    { label: 'Salla · Zid · Shopify', tone: 'yellow', shape: 'pill', size: 'sm' },
    { label: 'Landing Pages', tone: 'rose', shape: 'soft', size: 'sm' },
    { label: 'Figma', tone: 'warm', shape: 'circle', size: 'md' },
  ] satisfies Skill[],
} as const;
