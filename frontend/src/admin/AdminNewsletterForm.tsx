import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/lib/apiError';
import { Save, ArrowLeft, ExternalLink, Upload, X } from 'lucide-react';
import { adminNewslettersApi, adminMediaApi } from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';
import { getMediaUrl } from '@/lib/mediaUrl';
import { NewsletterCreateRequest } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';

export default function AdminNewsletterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<NewsletterCreateRequest>({
    titleEn: '',
    titlePl: '',
    contentEn: '',
    contentPl: '',
    image1: '',
    image2: '',
    image3: '',
    published: false,
  });

  // Last loaded or saved state; the form is dirty while it differs from this
  const [baseline, setBaseline] = useState(() => JSON.stringify(formData));
  const { confirmLeave } = useUnsavedChanges(JSON.stringify(formData) !== baseline);

  const [uploading, setUploading] = useState<1 | 2 | 3 | null>(null);

  const { data: newsletterData, isLoading, isError: loadFailed, refetch } = useQuery({
    queryKey: queryKeys.admin.newsletter(id!),
    queryFn: () => adminNewslettersApi.getById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (newsletterData?.data) {
      const n = newsletterData.data;
      const seeded: NewsletterCreateRequest = {
        titleEn: n.titleEn,
        titlePl: n.titlePl,
        contentEn: n.contentEn || '',
        contentPl: n.contentPl || '',
        image1: n.image1 || '',
        image2: n.image2 || '',
        image3: n.image3 || '',
        published: n.published,
      };
      setFormData(seeded);
      setBaseline(JSON.stringify(seeded));
    }
  }, [newsletterData]);

  const createMutation = useMutation({
    mutationFn: (data: NewsletterCreateRequest) => adminNewslettersApi.create(data),
    onSuccess: () => {
      setBaseline(JSON.stringify(formData));
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.newsletters() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prefix.newsletters() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prefix.newsletter() });
      toast.success(t('admin.newsletters.createSuccess'));
      navigate('/admin/newsletters');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('admin.newsletters.createFailed')));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: NewsletterCreateRequest) => adminNewslettersApi.update(id!, data),
    onSuccess: () => {
      setBaseline(JSON.stringify(formData));
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.newsletters() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.newsletter(id!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.prefix.newsletters() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prefix.newsletter() });
      toast.success(t('admin.newsletters.updateSuccess'));
      navigate('/admin/newsletters');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('admin.newsletters.updateFailed')));
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2 | 3) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(slot);
    try {
      const response = await adminMediaApi.upload(file);
      const imageUrl = response.data.url;
      setFormData(prev => ({
        ...prev,
        [`image${slot}`]: imageUrl,
      }));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('admin.common.uploadImageFailed')));
    } finally {
      setUploading(null);
    }
  };

  const clearImage = (slot: 1 | 2 | 3) => {
    setFormData(prev => ({
      ...prev,
      [`image${slot}`]: '',
    }));
  };

  if (isEditing && isLoading) {
    return <LoadingSpinner />;
  }

  // A failed load must not fall through to the form: saving it would overwrite stored data with blanks
  if (loadFailed && !newsletterData) {
    return (
      <div className="card text-center py-12">
        <p className="text-dark-400 mb-4">{t('common.loadError', 'Failed to load data')}</p>
        <button type="button" onClick={() => refetch()} className="btn-primary">
          {t('common.retry')}
        </button>
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => confirmLeave() && navigate('/admin/newsletters')}
          className="p-2 text-dark-400 hover:text-dark-100 rounded-lg hover:bg-dark-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-dark-100">
          {isEditing ? t('admin.newsletters.editNewsletter') : t('admin.newsletters.newNewsletter')}
        </h1>
        {isEditing && (
          // A new tab keeps this form and its unsaved edits; the preview shows the last saved state
          <Link
            to={`/admin/newsletters/${id}/preview`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary ml-auto"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            {t('admin.preview.button')}
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Fields */}
        <div className="card">
          <h2 className="text-lg font-semibold text-dark-100 mb-4">{t('admin.common.title')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                {t('admin.common.titleEn')} *
              </label>
              <input
                type="text"
                value={formData.titleEn}
                onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                {t('admin.common.titlePl')} *
              </label>
              <input
                type="text"
                value={formData.titlePl}
                onChange={(e) => setFormData(prev => ({ ...prev, titlePl: e.target.value }))}
                className="input w-full"
                required
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <h2 className="text-lg font-semibold text-dark-100 mb-4">{t('admin.common.images')}</h2>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((slot) => {
              const imageKey = `image${slot}` as 'image1' | 'image2' | 'image3';
              const imageUrl = formData[imageKey];

              return (
                <div key={slot} className="relative">
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    {t('admin.common.image', { number: slot })}
                  </label>
                  {imageUrl ? (
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-dark-700">
                      <img
                        src={getMediaUrl(imageUrl)}
                        alt={t('admin.common.image', { number: slot })}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => clearImage(slot as 1 | 2 | 3)}
                        className="absolute top-2 right-2 p-1 bg-dark-900/80 rounded-full text-dark-300 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-[4/5] rounded-lg border-2 border-dashed border-dark-600 hover:border-dark-500 cursor-pointer transition-colors">
                      {uploading === slot ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-dark-500 mb-2" />
                          <span className="text-sm text-dark-500">{t('admin.common.upload')}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, slot as 1 | 2 | 3)}
                        className="hidden"
                        disabled={uploading !== null}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Fields */}
        <div className="card">
          <h2 className="text-lg font-semibold text-dark-100 mb-4">{t('admin.common.content')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                {t('admin.common.contentEn')}
              </label>
              <textarea
                value={formData.contentEn}
                onChange={(e) => setFormData(prev => ({ ...prev, contentEn: e.target.value }))}
                className="input w-full h-40"
                rows={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                {t('admin.common.contentPl')}
              </label>
              <textarea
                value={formData.contentPl}
                onChange={(e) => setFormData(prev => ({ ...prev, contentPl: e.target.value }))}
                className="input w-full h-40"
                rows={6}
              />
            </div>
          </div>
        </div>

        {/* Publish Toggle */}
        <div className="card">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-dark-200">{t('admin.newsletters.publishLabel')}</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => confirmLeave() && navigate('/admin/newsletters')}
            className="btn-secondary"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary"
          >
            <Save className="w-5 h-5 mr-2" />
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
