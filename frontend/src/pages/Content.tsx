import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { postsApi } from '@/services/api';
import { Category } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { queryKeys } from '@/lib/queryKeys';
import { getMediaUrl } from '@/lib/mediaUrl';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Content() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.posts(language, Category.CONTENT_COPY),
    queryFn: () => postsApi.getAll(Category.CONTENT_COPY),
  });

  const contents = data?.data || [];

  const handleTileClick = (slug: string) => {
    navigate(`/projects/${slug}`);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>{t('content.title')} | Portfolio</title>
      </Helmet>

      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="section-heading">{t('content.title')}</h1>
            <p className="section-subheading mx-auto">{t('content.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-hover group cursor-pointer"
                onClick={() => handleTileClick(item.slug)}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-pink/20 mb-4">
                  <FileText className="w-6 h-6 text-primary-400" />
                </div>

                <h3 className="text-xl font-semibold text-dark-100 mb-2 group-hover:text-primary-400 transition-colors">
                  {item.title}
                </h3>

                <p className="text-dark-400 text-sm mb-4 line-clamp-3">{item.excerpt}</p>

                {item.featuredImage && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-dark-700 mb-4">
                    <img
                      src={getMediaUrl(item.featuredImage)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <span className="inline-flex items-center text-primary-400 group-hover:text-primary-300 text-sm font-medium">
                  {t('common.viewMore')}
                  <ArrowRight className="ml-1 w-4 h-4" />
                </span>
              </motion.article>
            ))}
          </div>

          {contents.length === 0 && (
            <div className="text-center text-dark-400 py-12">
              No content samples yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
