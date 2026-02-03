import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { newslettersApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { queryKeys } from '@/lib/queryKeys';
import { getMediaUrl } from '@/lib/mediaUrl';
import LoadingSpinner from '@/components/LoadingSpinner';
import ImageLightbox from '@/components/ImageLightbox';

export default function Newsletter() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.newsletters(language),
    queryFn: () => newslettersApi.getAll(),
  });

  const newsletters = data?.data || [];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const handleImageClick = (e: React.MouseEvent, src: string, alt: string) => {
    e.stopPropagation();
    setLightboxImage({ src, alt });
  };

  const handleTileClick = (slug: string) => {
    navigate(`/newsletter/${slug}`);
  };

  return (
    <>
      <Helmet>
        <title>{t('newsletter.title')} | Portfolio</title>
      </Helmet>

      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="section-heading">{t('newsletter.title')}</h1>
            <p className="section-subheading mx-auto">{t('newsletter.subtitle')}</p>
          </motion.div>

          <div className="space-y-12">
            {newsletters.map((newsletter, index) => {
              // Get the 3 images
              const images = [newsletter.image1, newsletter.image2, newsletter.image3].filter(Boolean) as string[];

              return (
                <motion.article
                  key={newsletter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-hover group cursor-pointer"
                  onClick={() => handleTileClick(newsletter.slug)}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left side - Images */}
                    <div className="md:w-2/5 flex gap-2">
                      {images.length > 0 ? (
                        images.map((img, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="flex-1 aspect-[4/5] rounded-lg overflow-hidden bg-dark-700 cursor-zoom-in"
                            onClick={(e) => handleImageClick(e, getMediaUrl(img), `${newsletter.title} - ${imgIndex + 1}`)}
                          >
                            <img
                              src={getMediaUrl(img)}
                              alt={`${newsletter.title} - ${imgIndex + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="flex-1 aspect-[4/5] rounded-lg bg-dark-700 flex items-center justify-center">
                          <span className="text-dark-500">No image</span>
                        </div>
                      )}
                      {/* Fill remaining slots with placeholders if less than 3 images */}
                      {images.length > 0 && images.length < 3 &&
                        Array.from({ length: 3 - images.length }).map((_, i) => (
                          <div
                            key={`placeholder-${i}`}
                            className="flex-1 aspect-[4/5] rounded-lg bg-dark-800/50"
                          />
                        ))
                      }
                    </div>

                    {/* Right side - Text content */}
                    <div className="md:w-3/5 flex flex-col justify-center">
                      <h2 className="text-2xl md:text-3xl font-semibold text-dark-100 mb-4 group-hover:text-primary-400 transition-colors">
                        {newsletter.title}
                      </h2>

                      {newsletter.content && (
                        <p className="text-dark-400 text-base mb-6 line-clamp-4">
                          {newsletter.content}
                        </p>
                      )}

                      <span className="inline-flex items-center text-primary-400 group-hover:text-primary-300 font-medium">
                        {t('newsletter.viewNewsletter')}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {newsletters.length === 0 && (
            <div className="text-center text-dark-400 py-12">
              No newsletters yet.
            </div>
          )}
        </div>
      </section>

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
