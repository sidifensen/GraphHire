export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  salary: string;
  location: string;
  experience: string;
  education: string;
  tags: string[];
  hrName: string;
  hrAvatar: string;
  postDate: string;
  matchScore: number;
  description?: string;
  requirements?: string[];
  status?: 'pending' | 'viewed' | 'interview' | 'unsuitable';
  applyDate?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  stage: string;
  size: string;
  founded: string;
  headquarters: string;
  intro: string;
  openPositions: number;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  type: 'feedback' | 'system';
  isRead: boolean;
  icon: string;
}

export interface Resume {
  id: string;
  name: string;
  date: string;
  size: string;
  status: 'parsed' | 'parsing';
  isDefault: boolean;
}
