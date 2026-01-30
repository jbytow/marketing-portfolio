import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Users, TrendingUp, Share2 } from 'lucide-react';
import { postsApi } from '@/services/api';
import { Category } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { queryKeys } from '@/lib/queryKeys';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Influence() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.posts(language, Category.INFLUENCE_MARKETING),
    queryFn: () => postsApi.getAll(Category.INFLUENCE_MARKETING),
  });

  const influences = data?.data || [];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>{t('influence.title')} | Portfolio</title>
      </Helmet>

      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="section-heading">{t('influence.title')}</h1>
            <p className="section-subheading mx-auto">{t('influence.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {influences.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-hover"
              >
                {item.featuredImage && (
                  <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-dark-700">
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <span className="badge-accent mb-3">
                  {item.influenceMarketingDetails?.partnershipType}
                </span>

                <h3 className="text-2xl font-semibold text-dark-100 mb-3">{item.title}</h3>

                <p className="text-dark-400 mb-6">{item.excerpt}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-dark-800 rounded-xl">
                    <Users className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-dark-100">
                      {item.influenceMarketingDetails?.communitySize?.toLocaleString() || '-'}
                    </div>
                    <div className="text-xs text-dark-500">{t('influence.communitySize')}</div>
                  </div>

                  <div className="text-center p-4 bg-dark-800 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-accent-pink mx-auto mb-2" />
                    <div className="text-xl font-bold text-dark-100">
                      {item.influenceMarketingDetails?.engagementRate || '-'}%
                    </div>
                    <div className="text-xs text-dark-500">{t('influence.engagementRate')}</div>
                  </div>

                  <div className="text-center p-4 bg-dark-800 rounded-xl">
                    <Share2 className="w-6 h-6 text-accent-cyan mx-auto mb-2" />
                    <div className="text-xl font-bold text-dark-100">
                      {item.influenceMarketingDetails?.platforms?.length || 0}
                    </div>
                    <div className="text-xs text-dark-500">{t('influence.platforms')}</div>
                  </div>
                </div>

                {item.influenceMarketingDetails?.platforms && (
                  <div className="flex flex-wrap gap-2">
                    {item.influenceMarketingDetails.platforms.map((platform) => (
                      <span key={platform} className="badge-primary">
                        {platform}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {influences.length === 0 && (
            <div className="text-center text-dark-400 py-12">
              No influence marketing entries yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
