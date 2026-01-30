export enum Category {
  CAMPAIGNS = 'CAMPAIGNS',
  CONTENT_COPY = 'CONTENT_COPY',
  NEWSLETTER = 'NEWSLETTER',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  PDF = 'PDF',
}

export interface Post {
  id: string;
  category: Category;
  categoryLabel: string;
  title: string;
  titleEn: string;
  titlePl: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  excerptPl: string;
  content: Record<string, unknown>;
  contentEn: Record<string, unknown>;
  contentPl: Record<string, unknown>;
  featuredImage: string | null;
  published: boolean;
  displayOrder: number;
  isCaseStudy: boolean;
  createdAt: string;
  updatedAt: string;
  campaignDetails?: CampaignDetails;
  caseStudyDetails?: CaseStudyDetails;
  media?: Media[];
}

export interface SoftSkill {
  id: string;
  name: string;
  nameEn: string;
  namePl: string;
  description: string;
  descriptionEn: string;
  descriptionPl: string;
  professionalUsage: string;
  professionalUsageEn: string;
  professionalUsagePl: string;
  icon: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  title: string;
  titleEn: string;
  titlePl: string;
  company: string;
  role: string;
  roleEn: string;
  rolePl: string;
  startDate: string;
  endDate: string | null;
  description: string;
  descriptionEn: string;
  descriptionPl: string;
  achievements: string[];
  achievementsEn: string[];
  achievementsPl: string[];
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignDetails {
  clientName: string;
  projectType: string;
  projectTypeEn: string;
  projectTypePl: string;
  results: Record<string, unknown>;
  resultsEn: Record<string, unknown>;
  resultsPl: Record<string, unknown>;
  metrics: Record<string, unknown>;
}

export interface CaseStudyDetails {
  problem: string;
  problemEn: string;
  problemPl: string;
  solution: string;
  solutionEn: string;
  solutionPl: string;
  results: string;
  resultsEn: string;
  resultsPl: string;
  metrics: Record<string, unknown>;
  testimonialText: string;
  testimonialTextEn: string;
  testimonialTextPl: string;
  testimonialAuthor: string;
}

export interface Media {
  id: string;
  postId: string | null;
  type: MediaType;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  altText: string;
  altTextEn: string;
  altTextPl: string;
  createdAt: string;
}

export interface CategoryInfo {
  value: Category;
  label: string;
  labelEn: string;
  labelPl: string;
  postCount: number;
}

export interface SiteSettings {
  heroTitle: string;
  heroTitleEn: string;
  heroTitlePl: string;
  heroSubtitle: string;
  heroSubtitleEn: string;
  heroSubtitlePl: string;
  aboutText: string;
  aboutTextEn: string;
  aboutTextPl: string;
  profileImage: string | null;
  email: string;
  phone: string;
  socialLinks: Record<string, string>;
  metaDescription: string;
  metaDescriptionEn: string;
  metaDescriptionPl: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  provider: string;
  isAdmin: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PostCreateRequest {
  category: Category;
  titleEn: string;
  titlePl: string;
  slug?: string;
  excerptEn?: string;
  excerptPl?: string;
  contentEn?: Record<string, unknown>;
  contentPl?: Record<string, unknown>;
  featuredImage?: string;
  published?: boolean;
  displayOrder?: number;
  isCaseStudy?: boolean;
  campaignDetails?: Partial<CampaignDetails>;
  caseStudyDetails?: Partial<CaseStudyDetails>;
}

export type PostUpdateRequest = Partial<PostCreateRequest>;

export interface SoftSkillCreateRequest {
  nameEn: string;
  namePl: string;
  descriptionEn?: string;
  descriptionPl?: string;
  professionalUsageEn?: string;
  professionalUsagePl?: string;
  icon?: string;
  displayOrder?: number;
}

export type SoftSkillUpdateRequest = Partial<SoftSkillCreateRequest>;

export interface ExperienceCreateRequest {
  titleEn: string;
  titlePl: string;
  company: string;
  roleEn: string;
  rolePl: string;
  startDate: string;
  endDate?: string;
  descriptionEn?: string;
  descriptionPl?: string;
  achievementsEn?: string[];
  achievementsPl?: string[];
  displayOrder?: number;
}

export type ExperienceUpdateRequest = Partial<ExperienceCreateRequest>;

export interface ReorderItem {
  id: string;
  displayOrder: number;
}

export interface SiteSettingsUpdateRequest {
  heroTitleEn?: string;
  heroTitlePl?: string;
  heroSubtitleEn?: string;
  heroSubtitlePl?: string;
  aboutTextEn?: string;
  aboutTextPl?: string;
  profileImage?: string;
  email?: string;
  phone?: string;
  socialLinks?: Record<string, string>;
  metaDescriptionEn?: string;
  metaDescriptionPl?: string;
}
