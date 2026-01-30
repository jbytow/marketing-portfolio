import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { postsApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { queryKeys } from '@/lib/queryKeys';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CaseStudies() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.caseStudies(language),
    queryFn: () => postsApi.getCaseStudies(),
  });

  const caseStudies = data?.data || [];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>{t('caseStudies.title')} | Portfolio</title>
      </Helmet>

      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="section-heading">{t('caseStudies.title')}</h1>
            <p className="section-subheading mx-auto">{t('caseStudies.subtitle')}</p>
          </motion.div>

          <div className="space-y-8">
            {caseStudies.map((study, index) => (
              <motion.article
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-hover"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  {study.featuredImage && (
                    <div className="aspect-video rounded-xl overflow-hidden bg-dark-700">
                      <img
                        src={study.featuredImage}
                        alt={study.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-col justify-center">
                    <span className="badge-primary mb-3 w-fit">{study.categoryLabel}</span>

                    <h2 className="text-2xl md:text-3xl font-semibold text-dark-100 mb-4">
                      {study.title}
                    </h2>

                    <p className="text-dark-400 mb-6">{study.excerpt}</p>

                    {study.caseStudyDetails && (
                      <div className="space-y-3 mb-6">
                        <div className="flex">
                          <span className="text-primary-400 font-medium w-24">{t('caseStudies.problem')}:</span>
                          <span className="text-dark-400 flex-1 line-clamp-1">
                            {study.caseStudyDetails.problem}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-primary-400 font-medium w-24">{t('caseStudies.solution')}:</span>
                          <span className="text-dark-400 flex-1 line-clamp-1">
                            {study.caseStudyDetails.solution}
                          </span>
                        </div>
                      </div>
                    )}

                    <Link
                      to={`/case-studies/${study.slug}`}
                      className="inline-flex items-center text-primary-400 hover:text-primary-300 font-medium"
                    >
                      {t('common.readMore')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {caseStudies.length === 0 && (
            <div className="text-center text-dark-400 py-12">
              No case studies yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
