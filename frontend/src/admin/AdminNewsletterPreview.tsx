import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import type { AxiosError } from 'axios';
import { adminNewslettersApi } from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Newsletter } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { NewsletterDetailView } from '@/pages/NewsletterDetail';
import { PreviewToolbar, type PreviewLanguage } from './AdminPostPreview';

// The admin DTO carries both languages; the public page gets one language and no fallback to the other.
function resolveNewsletter(newsletter: Newsletter, language: PreviewLanguage): Newsletter {
  const isPolish = language === 'pl';
  return {
    ...newsletter,
    title: isPolish ? newsletter.titlePl : newsletter.titleEn,
    content: isPolish ? newsletter.contentPl : newsletter.contentEn,
  };
}

export default function AdminNewsletterPreview() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<PreviewLanguage>(i18n.language.startsWith('pl') ? 'pl' : 'en');

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.admin.newsletter(id!),
    queryFn: () => adminNewslettersApi.getById(id!),
    enabled: !!id,
  });

  const newsletter = data?.data;

  if (isPending) {
    return <LoadingSpinner />;
  }

  const isNotFound = (error as AxiosError | null)?.response?.status === 404 || (!isError && !newsletter);

  if (isError && !isNotFound) {
    return (
      <div className="card text-center py-12">
        <p className="text-dark-400 mb-4">{t('common.loadError')}</p>
        <button type="button" onClick={() => refetch()} className="btn-primary">
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (isNotFound || !newsletter) {
    return (
      <div className="card text-center py-12">
        <h1 className="text-2xl font-bold text-dark-100 mb-4">{t('newsletter.notFound')}</h1>
        <Link to="/admin/newsletters" className="btn-secondary">
          <ArrowLeft className="mr-2 w-5 h-5" />
          {t('admin.newsletters.title')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PreviewToolbar
        published={newsletter.published}
        language={language}
        onLanguageChange={setLanguage}
      />
      <NewsletterDetailView
        newsletter={resolveNewsletter(newsletter, language)}
        backPath={`/admin/newsletters/${newsletter.id}/edit`}
        backLabel={t('admin.preview.backToEditor')}
      />
    </div>
  );
}
