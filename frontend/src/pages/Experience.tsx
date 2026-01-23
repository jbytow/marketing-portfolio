import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Calendar, Building2, CheckCircle } from 'lucide-react';
import { postsApi } from '@/services/api';
import { Category } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Experience() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['posts', Category.EXPERIENCE],
    queryFn: () => postsApi.getAll(Category.EXPERIENCE),
  });

  const experiences = data?.data || [];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>{t('experience.title')} | Portfolio</title>
      </Helmet>

      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="section-heading">{t('experience.title')}</h1>
            <p className="section-subheading mx-auto">{t('experience.subtitle')}</p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-accent-pink to-accent-cyan" />

              <div className="space-y-8">
                {experiences.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-20"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-primary-500 border-4 border-dark-900 z-10" />

                    <div className="card">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-dark-100">{exp.title}</h3>
                          <div className="flex items-center text-dark-400 mt-1">
                            <Building2 className="w-4 h-4 mr-2" />
                            <span>{exp.experienceDetails?.companyName}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-dark-400 text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {exp.experienceDetails?.startDate} -{' '}
                            {exp.experienceDetails?.endDate || t('experience.present')}
                          </span>
                        </div>
                      </div>

                      <p className="text-dark-300 mb-4">{exp.excerpt}</p>

                      {exp.experienceDetails?.achievements && exp.experienceDetails.achievements.length > 0 && (
                        <ul className="space-y-2">
                          {exp.experienceDetails.achievements.map((achievement, i) => (
                            <li key={i} className="flex items-start text-dark-400 text-sm">
                              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-primary-400 flex-shrink-0" />
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {experiences.length === 0 && (
              <div className="text-center text-dark-400 py-12">
                No experience entries yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
