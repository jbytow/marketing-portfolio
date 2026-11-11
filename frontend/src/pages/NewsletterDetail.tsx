import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AxiosError } from 'axios';
import type { Newsletter } from '@/types';
import { newslettersApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { queryKeys } from '@/lib/queryKeys';
import { getMediaUrl } from '@/lib/mediaUrl';
import LoadingSpinner from '@/components/LoadingSpinner';
import ImageLightbox from '@/components/ImageLightbox';

interface NewsletterDetailViewProps {
  newsletter: Newsletter;
  backPath: string;
  backLabel: string;
}

// Presentation only, so the admin draft preview renders exactly what the public page renders.
export function NewsletterDetailView({ newsletter, backPath, backLabel }: NewsletterDetailViewProps) {
  const { t } = useTranslation();
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  // Get the 3 images
  const images = [newsletter.image1, newsletter.image2, newsletter.image3].filter(Boolean) as string[];

  return (
    <>
      <Helmet>
        <title>{newsletter.title} | Portfolio</title>
      </Helmet>

      <article className="py-20">
        <div className="container max-w-4xl">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Link
              to={backPath}
              className="inline-flex items-center text-dark-400 hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              {backLabel}
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-100">
              {newsletter.title}
            </h1>
          </motion.header>

          {/* Images */}
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 flex gap-4 justify-center"
            >
              {images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={t('newsletter.enlargeImage')}
                  className="flex-1 max-w-xs aspect-[4/5] rounded-xl overflow-hidden bg-dark-700 cursor-zoom-in"
                  onClick={() => setLightboxImage({ src: getMediaUrl(img), alt: `${newsletter.title} - ${index + 1}` })}
                >
                  <img
                    src={getMediaUrl(img)}
                    alt={`${newsletter.title} - ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))}
            </motion.div>
          )}

          {/* Content */}
          {newsletter.content && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="prose prose-invert prose-lg max-w-none"
            >
              <p className="text-xl text-dark-300 leading-relaxed whitespace-pre-line">
                {newsletter.content}
              </p>
            </motion.div>
          )}
        </div>
      </article>

      {/* Image Lightbox */}
      <ImageLightbox
        src={lightboxImage?.src || ''}
        alt={lightboxImage?.alt || ''}
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
}

export default function NewsletterDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { t } = useTranslation();

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: queryKeys.newsletter(language, slug!),
    queryFn: () => newslettersApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const newsletter = data?.data;

  if (isPending) {
    return <LoadingSpinner fullScreen />;
  }

  // Only a 404 (or an empty body) is a missing page; 5xx and network errors are retryable.
  const isNotFound = (error as AxiosError | null)?.response?.status === 404 || (!isError && !newsletter);

  if (isError && !isNotFound) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-dark-400 mb-4">{t('common.loadError')}</p>
        <button type="button" onClick={() => refetch()} className="btn-secondary">
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (isNotFound || !newsletter) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-dark-100 mb-4">{t('newsletter.notFound')}</h1>
        <Link to="/newsletter" className="btn-secondary">
          <ArrowLeft className="mr-2 w-5 h-5" />
          {t('newsletter.backToArchive')}
        </Link>
      </div>
    );
  }

  return (
    <NewsletterDetailView
      newsletter={newsletter}
      backPath="/newsletter"
      backLabel={t('newsletter.backToArchive')}
    />
  );
}
