import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { postsApi } from '@/services/api';
import { Category } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Projects() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['posts', Category.CAMPAIGNS],
    queryFn: () => postsApi.getAll(Category.CAMPAIGNS),
  });

  const projects = data?.data || [];

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

                <div className="flex items-center justify-between mb-3">
                  <span className="badge-primary">{project.campaignDetails?.projectType}</span>
                  {project.campaignDetails?.clientName && (
                    <span className="text-dark-500 text-sm">{project.campaignDetails.clientName}</span>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-dark-100 mb-2 group-hover:text-primary-400 transition-colors">
                  {project.title}
                </h3>

                <p className="text-dark-400 text-sm line-clamp-2 mb-4">{project.excerpt}</p>

                {project.campaignDetails?.metrics && (
                  <div className="flex items-center gap-4 text-sm text-dark-400 mb-4">
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-1 text-primary-400" />
                      <span>View Metrics</span>
                    </div>
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
              No projects yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
