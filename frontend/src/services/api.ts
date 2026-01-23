import axios, { AxiosInstance } from 'axios';
import {
  ApiResponse,
  Post,
  CategoryInfo,
  SiteSettings,
  User,
  Media,
  PostCreateRequest,
  PostUpdateRequest,
  SiteSettingsUpdateRequest,
  ReorderItem,
  PaginatedResponse,
  Category,
  MediaType,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const language = localStorage.getItem('language') || 'en';
    config.headers['Accept-Language'] = language;

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/admin/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const api = createApiClient();

// Public API
export const postsApi = {
  getAll: async (category?: Category): Promise<ApiResponse<Post[]>> => {
    const params = category ? { category } : {};
    const { data } = await api.get('/posts', { params });
    return data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Post>> => {
    const { data } = await api.get(`/posts/${slug}`);
    return data;
  },

  getPaged: async (
    page: number,
    size: number,
    category?: Category
  ): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const params = { page, size, ...(category && { category }) };
    const { data } = await api.get('/posts/paged', { params });
    return data;
  },
};

export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<CategoryInfo[]>> => {
    const { data } = await api.get('/categories');
    return data;
  },

  getOne: async (category: Category): Promise<ApiResponse<CategoryInfo>> => {
    const { data } = await api.get(`/categories/${category}`);
    return data;
  },
};

export const settingsApi = {
  get: async (): Promise<ApiResponse<SiteSettings>> => {
    const { data } = await api.get('/settings');
    return data;
  },
};

// Admin API
export const adminPostsApi = {
  getAll: async (category?: Category): Promise<ApiResponse<Post[]>> => {
    const params = category ? { category } : {};
    const { data } = await api.get('/admin/posts', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Post>> => {
    const { data } = await api.get(`/admin/posts/${id}`);
    return data;
  },

  create: async (post: PostCreateRequest): Promise<ApiResponse<Post>> => {
    const { data } = await api.post('/admin/posts', post);
    return data;
  },

  update: async (id: string, post: PostUpdateRequest): Promise<ApiResponse<Post>> => {
    const { data } = await api.put(`/admin/posts/${id}`, post);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/admin/posts/${id}`);
    return data;
  },

  togglePublish: async (id: string): Promise<ApiResponse<Post>> => {
    const { data } = await api.patch(`/admin/posts/${id}/publish`);
    return data;
  },

  reorder: async (items: ReorderItem[]): Promise<ApiResponse<void>> => {
    const { data } = await api.patch('/admin/posts/reorder', { items });
    return data;
  },
};

export const adminMediaApi = {
  getAll: async (
    page: number,
    size: number,
    type?: MediaType
  ): Promise<ApiResponse<PaginatedResponse<Media>>> => {
    const params = { page, size, ...(type && { type }) };
    const { data } = await api.get('/admin/media', { params });
    return data;
  },

  upload: async (
    file: File,
    postId?: string,
    altTextEn?: string,
    altTextPl?: string
  ): Promise<ApiResponse<Media>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (postId) formData.append('postId', postId);
    if (altTextEn) formData.append('altTextEn', altTextEn);
    if (altTextPl) formData.append('altTextPl', altTextPl);

    const { data } = await api.post('/admin/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (
    id: string,
    altTextEn?: string,
    altTextPl?: string,
    postId?: string
  ): Promise<ApiResponse<Media>> => {
    const params = { altTextEn, altTextPl, postId };
    const { data } = await api.put(`/admin/media/${id}`, null, { params });
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/admin/media/${id}`);
    return data;
  },
};

export const adminSettingsApi = {
  get: async (): Promise<ApiResponse<SiteSettings>> => {
    const { data } = await api.get('/admin/settings');
    return data;
  },

  update: async (settings: SiteSettingsUpdateRequest): Promise<ApiResponse<SiteSettings>> => {
    const { data } = await api.put('/admin/settings', settings);
    return data;
  },
};

export const authApi = {
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const { data } = await api.get('/admin/auth/me');
    return data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const { data } = await api.post('/admin/auth/logout');
    return data;
  },
};

export default api;
