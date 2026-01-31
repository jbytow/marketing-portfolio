export enum Category {
  CAMPAIGNS = 'CAMPAIGNS',
  CONTENT_COPY = 'CONTENT_COPY',
  NEWSLETTER = 'NEWSLETTER',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  YOUTUBE = 'YOUTUBE',
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
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
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
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  nameEn: string;
  namePl: string;
  displayOrder: number;
  skillCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SkillCategoryWithSkills extends Omit<SkillCategory, 'skillCount'> {
  skills: SoftSkill[];
}

export interface Experience {
  id: string;
  title: string;
  titleEn: string;
  titlePl: string;
  company: string;
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


export interface Media {
  id: string;
  postId: string | null;
  type: MediaType;
  filename: string | null;
  originalName: string | null;
  mimeType: string | null;
  size: number | null;
  url: string;
  altText: string;
  altTextEn: string;
  altTextPl: string;
  displayOrder: number;
  videoUrl: string | null;
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
  hashtags?: string[];
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
  categoryId?: string;
}

export type SoftSkillUpdateRequest = Partial<SoftSkillCreateRequest>;

export interface SkillCategoryCreateRequest {
  nameEn: string;
  namePl: string;
  displayOrder?: number;
}

export type SkillCategoryUpdateRequest = Partial<SkillCategoryCreateRequest>;

export interface ExperienceCreateRequest {
  titleEn: string;
  titlePl: string;
  company: string;
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
