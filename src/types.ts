export type Language = 'en' | 'fr';

export interface TeamMember {
  id: string;
  name: string;
  role: {
    en: string;
    fr: string;
  };
  photo: string;
  link: string;
  institution?: string;
  isHead?: boolean;
}

export interface TeamData {
  permanentResearchers: TeamMember[];
  temporaryResearchers: TeamMember[];
  visitingResearchers: TeamMember[];
  associateResearchers: TeamMember[];
  postDocs: TeamMember[];
  phdStudents: TeamMember[];
  interns: TeamMember[];
}

export interface ProjectItem {
  id: string;
  title: {
    en: string;
    fr: string;
  };
  desc: {
    en: string;
    fr: string;
  };
  partners: {
    en: string;
    fr: string;
  };
  image?: string;
  active?: boolean;
  link?: string;
}

export interface VisionData {
  title: {
    en: string;
    fr: string;
  };
  content: {
    en: string;
    fr: string;
  };
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: string;
  url: string;
}
