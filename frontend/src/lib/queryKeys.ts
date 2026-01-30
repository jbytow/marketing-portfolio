import { Category } from '@/types';

export const queryKeys = {
  // Public queries (language-dependent)
  settings: (lang: string) => ['settings', lang] as const,
  posts: (lang: string, category?: Category | 'featured') =>
    ['posts', lang, category] as const,
  post: (lang: string, slug: string) => ['post', lang, slug] as const,

  // Admin queries (language-independent, manages all languages)
  admin: {
    posts: (category?: Category) => ['admin', 'posts', category] as const,
    post: (id: string) => ['admin', 'post', id] as const,
    settings: () => ['admin', 'settings'] as const,
    media: () => ['admin', 'media'] as const,
  },
};
