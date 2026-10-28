// Based on the brief's proposed content model. No project claims are pre-approved here.
export type VerificationStatus = 'source' | 'needs-confirmation' | 'approved';
export type ProjectLinkType = 'live' | 'demo' | 'behance' | 'figma' | 'prototype';

export type PortfolioProject = {
  id: string;
  name: string;
  description: string;
  category: 'platform' | 'mobile' | 'commerce' | 'website' | 'other';
  date: string | null;
  dateStatus: VerificationStatus;
  role: string | null;
  industry: string;
  links: Array<{ type: ProjectLinkType; url: string }>;
  coverImage: string | null;
  caseStudyReady: boolean;
  verificationNotes: string[];
};
