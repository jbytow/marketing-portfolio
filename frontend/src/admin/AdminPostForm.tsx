import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Eye, EyeOff, BookOpen, X, Plus } from 'lucide-react';
import { adminPostsApi } from '@/services/api';
import { Category, PostCreateRequest, PostUpdateRequest, Media } from '@/types';
import { queryKeys } from '@/lib/queryKeys';
import LoadingSpinner from '@/components/LoadingSpinner';
import MediaManager from '@/admin/components/MediaManager';

export default function AdminPostForm() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState<PostCreateRequest>({
    category: Category.CAMPAIGNS,
    titleEn: '',
    titlePl: '',
    slug: '',
    excerptEn: '',
    excerptPl: '',
    contentEn: {},
    contentPl: {},
    featuredImage: '',
    published: false,
    isCaseStudy: false,
    hashtags: [],
  });

  const [media, setMedia] = useState<Media[]>([]);
  const [newHashtag, setNewHashtag] = useState('');

  const { data: postData, isLoading: postLoading } = useQuery({
    queryKey: queryKeys.admin.post(id!),
    queryFn: () => adminPostsApi.getById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (postData?.data) {
      const post = postData.data;
      setFormData({
        category: post.category,
        titleEn: post.titleEn,
        titlePl: post.titlePl,
        slug: post.slug,
        excerptEn: post.excerptEn || '',
        excerptPl: post.excerptPl || '',
        contentEn: post.contentEn || {},
        contentPl: post.contentPl || {},
        featuredImage: post.featuredImage || '',
        published: post.published,
        isCaseStudy: post.isCaseStudy || false,
        hashtags: post.hashtags || [],
      });
      setMedia(post.media || []);
    }
  }, [postData]);

  const createMutation = useMutation({
    mutationFn: (data: PostCreateRequest) => adminPostsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['caseStudies'] });
      queryClient.invalidateQueries({ queryKey: ['hashtags'] });
      toast.success('Post created successfully');
      navigate('/admin/posts');
    },
    onError: () => {
      toast.error('Failed to create post');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PostUpdateRequest) => adminPostsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.post(id!) });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      queryClient.invalidateQueries({ queryKey: ['caseStudies'] });
      queryClient.invalidateQueries({ queryKey: ['hashtags'] });
      toast.success('Post updated successfully');
      navigate('/admin/posts');
    },
    onError: () => {
      toast.error('Failed to update post');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addHashtag = () => {
    const tag = newHashtag.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (tag && !formData.hashtags?.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        hashtags: [...(prev.hashtags || []), tag],
      }));
    }
    setNewHashtag('');
  };

  const removeHashtag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      hashtags: (prev.hashtags || []).filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    }
  };

  if (postLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/posts')}
            className="p-2 text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-display font-bold text-dark-100">
            {isEditing ? t('admin.posts.editPost') : t('admin.posts.newPost')}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, published: !prev.published }))}
            className={`btn-secondary ${formData.published ? 'bg-green-500/20 text-green-400' : ''}`}
          >
            {formData.published ? (
              <>
                <Eye className="w-5 h-5 mr-2" />
                {t('common.published')}
              </>
            ) : (
              <>
                <EyeOff className="w-5 h-5 mr-2" />
                {t('common.draft')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category & Case Study Flag */}
        <div className="card space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                required
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`categories.${cat}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-3 p-3 rounded-lg bg-dark-700 cursor-pointer hover:bg-dark-600 transition-colors">
                <input
                  type="checkbox"
                  name="isCaseStudy"
                  checked={formData.isCaseStudy}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-dark-500 bg-dark-600 text-primary-500 focus:ring-primary-500"
                />
                <BookOpen className={`w-5 h-5 ${formData.isCaseStudy ? 'text-primary-400' : 'text-dark-400'}`} />
                <span className={formData.isCaseStudy ? 'text-primary-400' : 'text-dark-300'}>
                  {t('admin.posts.markAsCaseStudy')}
                </span>
              </label>
            </div>
          </div>
          {formData.isCaseStudy && (
            <p className="text-sm text-dark-400">
              This post will appear on the Case Studies page.
            </p>
          )}
        </div>

        {/* Titles */}
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-dark-100">Titles</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Title (English)</label>
              <input
                type="text"
                name="titleEn"
                value={formData.titleEn}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Title (Polish)</label>
              <input
                type="text"
                name="titlePl"
                value={formData.titlePl}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Slug (URL)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="input"
              placeholder="auto-generated-from-title"
            />
          </div>
        </div>

        {/* Hashtags */}
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-dark-100">Hashtags</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              onKeyDown={handleHashtagKeyDown}
              placeholder="Add hashtag..."
              className="input flex-1"
            />
            <button
              type="button"
              onClick={addHashtag}
              className="btn-secondary"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {formData.hashtags && formData.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-500/20 text-primary-400"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeHashtag(tag)}
                    className="hover:text-primary-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Excerpts */}
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-dark-100">Excerpts</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Excerpt (English)</label>
              <textarea
                name="excerptEn"
                value={formData.excerptEn}
                onChange={handleChange}
                className="input"
                rows={3}
              />
            </div>
            <div>
              <label className="label">Excerpt (Polish)</label>
              <textarea
                name="excerptPl"
                value={formData.excerptPl}
                onChange={handleChange}
                className="input"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="card">
          <label className="label">Featured Image URL</label>
          <input
            type="text"
            name="featuredImage"
            value={formData.featuredImage}
            onChange={handleChange}
            className="input"
            placeholder="https://..."
          />
          {formData.featuredImage && (
            <img
              src={formData.featuredImage}
              alt="Preview"
              className="mt-4 max-h-48 rounded-lg object-cover"
            />
          )}
        </div>

        {/* Media Manager */}
        {isEditing && id ? (
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold text-dark-100">Media Gallery</h3>
            <p className="text-sm text-dark-400">
              Upload images, videos, or add YouTube videos. Drag to reorder.
            </p>
            <MediaManager
              postId={id}
              media={media}
              onMediaChange={setMedia}
            />
          </div>
        ) : (
          <div className="card">
            <h3 className="text-lg font-semibold text-dark-100">Media Gallery</h3>
            <p className="text-sm text-dark-400 mt-2">
              Save the post first to add images, videos, or YouTube links.
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/posts')}
            className="btn-secondary"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
