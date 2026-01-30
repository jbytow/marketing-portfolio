import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Lightbulb,
  Users,
  MessageSquare,
  Target,
  Clock,
  Heart,
} from 'lucide-react';
import { postsApi } from '@/services/api';
import { Category } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { queryKeys } from '@/lib/queryKeys';
import LoadingSpinner from '@/components/LoadingSpinner';

const skillIcons = [Lightbulb, Users, MessageSquare, Target, Clock, Heart];

export default function Skills() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.posts(language, Category.SOFT_SKILLS),
    queryFn: () => postsApi.getAll(Category.SOFT_SKILLS),
  });

  const skills = data?.data || [];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>{t('skills.title')} | Portfolio</title>
      </Helmet>

      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="section-heading">{t('skills.title')}</h1>
            <p className="section-subheading mx-auto">{t('skills.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => {
              const IconComponent = skillIcons[index % skillIcons.length];
              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-hover text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-pink/20 mb-6">
                    <IconComponent className="w-8 h-8 text-primary-400" />
                  </div>

                  <h3 className="text-xl font-semibold text-dark-100 mb-3">{skill.title}</h3>

                  <p className="text-dark-400">{skill.excerpt}</p>
                </motion.div>
              );
            })}
          </div>

          {skills.length === 0 && (
            <div className="text-center">
              {/* Default skills when no posts exist */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: Lightbulb, title: 'Creative Thinking', desc: 'Innovative solutions to marketing challenges' },
                  { icon: Users, title: 'Team Collaboration', desc: 'Working effectively with cross-functional teams' },
                  { icon: MessageSquare, title: 'Communication', desc: 'Clear and compelling messaging' },
                  { icon: Target, title: 'Strategic Planning', desc: 'Data-driven decision making' },
                  { icon: Clock, title: 'Time Management', desc: 'Delivering projects on schedule' },
                  { icon: Heart, title: 'Passion', desc: 'Genuine enthusiasm for marketing excellence' },
                ].map((skill, index) => (
                  <motion.div
                    key={skill.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-hover text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-pink/20 mb-6">
                      <skill.icon className="w-8 h-8 text-primary-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-dark-100 mb-3">{skill.title}</h3>
                    <p className="text-dark-400">{skill.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
