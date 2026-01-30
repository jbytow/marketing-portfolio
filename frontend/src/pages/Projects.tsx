import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { postsApi } from '@/services/api';
import { Category } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { queryKeys } from '@/lib/queryKeys';
import LoadingSpinner from '@/components/LoadingSpinner';
import HashtagList from '@/components/HashtagList';

export default function Projects() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeHashtag = searchParams.get('hashtag');

  const { data, isLoading } = useQuery({
    queryKey: activeHashtag
      ? queryKeys.postsByHashtag(language, activeHashtag)
      : queryKeys.posts(language, Category.CAMPAIGNS),
    queryFn: () =>
      activeHashtag
        ? postsApi.getAll(undefined, activeHashtag)
        : postsApi.getAll(Category.CAMPAIGNS),
  });

  const projects = data?.data || [];

  const clearHashtagFilter = () => {
    setSearchParams({});
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>{t('projects.title')} | Portfolio</title>
      </Helmet>

      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="section-heading">{t('projects.title')}</h1>
            <p className="section-subheading mx-auto">{t('projects.subtitle')}</p>
          </motion.div>

          {/* Active hashtag filter */}
          {activeHashtag && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex items-center justify-center gap-2"
            >
              <span className="text-dark-400">Filtered by:</span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400">
                #{activeHashtag}
                <button
                  onClick={clearHashtagFilter}
                  className="hover:text-primary-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-hover group"
              >
                {project.featuredImage && (
                  <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-dark-700">
                    <img
                      src={project.featuredImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <h3 className="text-xl font-semibold text-dark-100 mb-2 group-hover:text-primary-400 transition-colors">
                  {project.title}
                </h3>

                <p className="text-dark-400 text-sm line-clamp-2 mb-4">{project.excerpt}</p>

                {/* Hashtags - non-clickable, limited to 3 */}
                {project.hashtags && project.hashtags.length > 0 && (
                  <div className="mb-4">
                    <HashtagList
                      hashtags={project.hashtags}
                      clickable={false}
                      limit={3}
                    />
                  </div>
                )}

                <Link
                  to={`/case-studies/${project.slug}`}
                  className="inline-flex items-center text-primary-400 hover:text-primary-300 text-sm font-medium"
                >
                  {t('projects.viewProject')}
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </motion.article>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center text-dark-400 py-12">
              {activeHashtag
                ? `No projects found with hashtag #${activeHashtag}`
                : 'No projects yet.'}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
