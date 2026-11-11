import { Category } from '@/types';

export const queryKeys = {
  // Public queries (language-dependent)
  settings: (lang: string) => ['settings', lang] as const,
  posts: (lang: string, category?: Category | 'featured') =>
    ['posts', lang, category] as const,
  postsByHashtag: (lang: string, hashtag: string) =>
    ['posts', lang, 'hashtag', hashtag] as const,
  post: (lang: string, slug: string) => ['post', lang, slug] as const,
  skillCategoriesWithSkills: (lang: string) => ['skillCategoriesWithSkills', lang] as const,
  experiences: (lang: string) => ['experiences', lang] as const,
  newsletters: (lang: string) => ['newsletters', lang] as const,
  newsletter: (lang: string, slug: string) => ['newsletter', lang, slug] as const,
  interests: (lang: string) => ['interests', lang] as const,

  // Language-agnostic prefixes, for invalidation only: public queries are keyed per language
  prefix: {
    settings: () => ['settings'] as const,
    posts: () => ['posts'] as const,
    post: () => ['post'] as const,
    experiences: () => ['experiences'] as const,
    skills: () => ['skillCategoriesWithSkills'] as const,
    interests: () => ['interests'] as const,
    newsletters: () => ['newsletters'] as const,
    newsletter: () => ['newsletter'] as const,
  },

  // Admin queries (language-independent, manages all languages)
  admin: {
    posts: (category?: Category) => ['admin', 'posts', category] as const,
    // A key with an undefined category would not prefix-match category-filtered lists
    postsAll: () => ['admin', 'posts'] as const,
    post: (id: string) => ['admin', 'post', id] as const,
    postAll: () => ['admin', 'post'] as const,
    settings: () => ['admin', 'settings'] as const,
    media: (page: number, size: number) => ['admin', 'media', page, size] as const,
    mediaAll: () => ['admin', 'media'] as const,
    softSkills: () => ['admin', 'softSkills'] as const,
    softSkill: (id: string) => ['admin', 'softSkill', id] as const,
    skillCategories: () => ['admin', 'skillCategories'] as const,
    skillCategory: (id: string) => ['admin', 'skillCategory', id] as const,
    experiences: () => ['admin', 'experiences'] as const,
    experience: (id: string) => ['admin', 'experience', id] as const,
    newsletters: () => ['admin', 'newsletters'] as const,
    newsletter: (id: string) => ['admin', 'newsletter', id] as const,
    newsletterAll: () => ['admin', 'newsletter'] as const,
    interests: () => ['admin', 'interests'] as const,
    interest: (id: string) => ['admin', 'interest', id] as const,
  },
};
