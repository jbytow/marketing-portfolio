import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { settingsApi } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function About() {
  const { t } = useTranslation();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
  });

  const settings = settingsData?.data;

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>{t('about.title')} | Portfolio</title>
      </Helmet>

      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="section-heading">{t('about.title')}</h1>
            <p className="section-subheading mx-auto">{t('about.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              {settings?.profileImage ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-pink rounded-2xl transform rotate-3" />
                  <img
                    src={settings.profileImage}
                    alt="Profile"
                    className="relative rounded-2xl w-full object-cover shadow-xl"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-pink/20 flex items-center justify-center">
                  <span className="text-6xl">👋</span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div
                className="prose prose-invert prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: settings?.aboutText || '<p>About content coming soon...</p>',
                }}
              />

              <div className="flex flex-wrap gap-3 pt-4">
                {['Marketing Strategy', 'Brand Development', 'Content Creation', 'Social Media', 'Analytics'].map(
                  (skill) => (
                    <span key={skill} className="badge-primary">
                      {skill}
                    </span>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
