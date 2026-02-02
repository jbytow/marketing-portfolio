import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { adminSettingsApi } from '@/services/api';
import { SiteSettingsUpdateRequest } from '@/types';
import { queryKeys } from '@/lib/queryKeys';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<SiteSettingsUpdateRequest>({
    heroTitleEn: '',
    heroTitlePl: '',
    heroSubtitleEn: '',
    heroSubtitlePl: '',
    aboutTextEn: '',
    aboutTextPl: '',
    profileImage: '',
    email: '',
    phone: '',
    socialLinks: {},
    metaDescriptionEn: '',
    metaDescriptionPl: '',
    footerTitleEn: '',
    footerTitlePl: '',
    footerTaglineEn: '',
    footerTaglinePl: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.settings(),
    queryFn: () => adminSettingsApi.get(),
  });

  useEffect(() => {
    if (data?.data) {
      const settings = data.data;
      setFormData({
        heroTitleEn: settings.heroTitleEn || '',
        heroTitlePl: settings.heroTitlePl || '',
        heroSubtitleEn: settings.heroSubtitleEn || '',
        heroSubtitlePl: settings.heroSubtitlePl || '',
        aboutTextEn: settings.aboutTextEn || '',
        aboutTextPl: settings.aboutTextPl || '',
        profileImage: settings.profileImage || '',
        email: settings.email || '',
        phone: settings.phone || '',
        socialLinks: settings.socialLinks || {},
        metaDescriptionEn: settings.metaDescriptionEn || '',
        metaDescriptionPl: settings.metaDescriptionPl || '',
        footerTitleEn: settings.footerTitleEn || '',
        footerTitlePl: settings.footerTitlePl || '',
        footerTaglineEn: settings.footerTaglineEn || '',
        footerTaglinePl: settings.footerTaglinePl || '',
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (data: SiteSettingsUpdateRequest) => adminSettingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings() });
      // Invalidate all public settings queries (matches all languages)
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success(t('admin.settings.title') + ' updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: url,
      },
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-display font-bold text-dark-100">
        {t('admin.settings.title')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Section */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-dark-100">
            {t('admin.settings.hero')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Hero Title (English)</label>
              <input
                type="text"
                name="heroTitleEn"
                value={formData.heroTitleEn}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Hero Title (Polish)</label>
              <input
                type="text"
                name="heroTitlePl"
                value={formData.heroTitlePl}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Hero Subtitle (English)</label>
              <textarea
                name="heroSubtitleEn"
                value={formData.heroSubtitleEn}
                onChange={handleChange}
                className="input"
                rows={2}
              />
            </div>
            <div>
              <label className="label">Hero Subtitle (Polish)</label>
              <textarea
                name="heroSubtitlePl"
                value={formData.heroSubtitlePl}
                onChange={handleChange}
                className="input"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-dark-100">
            {t('admin.settings.about')}
          </h2>
          <div>
            <label className="label">Profile Image URL</label>
            <input
              type="text"
              name="profileImage"
              value={formData.profileImage}
              onChange={handleChange}
              className="input"
              placeholder="https://..."
            />
            {formData.profileImage && (
              <img
                src={formData.profileImage}
                alt="Profile preview"
                className="mt-4 w-32 h-32 rounded-full object-cover"
              />
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">About Text (English)</label>
              <textarea
                name="aboutTextEn"
                value={formData.aboutTextEn}
                onChange={handleChange}
                className="input"
                rows={6}
              />
            </div>
            <div>
              <label className="label">About Text (Polish)</label>
              <textarea
                name="aboutTextPl"
                value={formData.aboutTextPl}
                onChange={handleChange}
                className="input"
                rows={6}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-dark-100">
            {t('admin.settings.contact')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-dark-100">
            {t('admin.settings.social')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {['linkedin', 'instagram', 'facebook'].map((platform) => (
              <div key={platform}>
                <label className="label capitalize">{platform}</label>
                <input
                  type="url"
                  value={formData.socialLinks?.[platform] || ''}
                  onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                  className="input"
                  placeholder={`https://${platform}.com/...`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-dark-100">
            {t('admin.settings.footer')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Footer Title (English)</label>
              <input
                type="text"
                name="footerTitleEn"
                value={formData.footerTitleEn}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Footer Title (Polish)</label>
              <input
                type="text"
                name="footerTitlePl"
                value={formData.footerTitlePl}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Footer Tagline (English)</label>
              <textarea
                name="footerTaglineEn"
                value={formData.footerTaglineEn}
                onChange={handleChange}
                className="input"
                rows={2}
              />
            </div>
            <div>
              <label className="label">Footer Tagline (Polish)</label>
              <textarea
                name="footerTaglinePl"
                value={formData.footerTaglinePl}
                onChange={handleChange}
                className="input"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-dark-100">
            {t('admin.settings.seo')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Meta Description (English)</label>
              <textarea
                name="metaDescriptionEn"
                value={formData.metaDescriptionEn}
                onChange={handleChange}
                className="input"
                rows={3}
              />
            </div>
            <div>
              <label className="label">Meta Description (Polish)</label>
              <textarea
                name="metaDescriptionPl"
                value={formData.metaDescriptionPl}
                onChange={handleChange}
                className="input"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
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
