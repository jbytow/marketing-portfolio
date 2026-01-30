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
  Zap,
  Brain,
  Handshake,
  Rocket,
  Sparkles,
  Award,
} from 'lucide-react';
import { softSkillsApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { queryKeys } from '@/lib/queryKeys';
import LoadingSpinner from '@/components/LoadingSpinner';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  lightbulb: Lightbulb,
  users: Users,
  message: MessageSquare,
  target: Target,
  clock: Clock,
  heart: Heart,
  zap: Zap,
  brain: Brain,
  handshake: Handshake,
  rocket: Rocket,
  sparkles: Sparkles,
  award: Award,
};

const defaultIcons = [Lightbulb, Users, MessageSquare, Target, Clock, Heart];

export default function Skills() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.softSkills(language),
    queryFn: () => softSkillsApi.getAll(),
  });

  const skills = data?.data || [];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const getIcon = (iconName: string | null, index: number) => {
    if (iconName && iconMap[iconName.toLowerCase()]) {
      return iconMap[iconName.toLowerCase()];
    }
    return defaultIcons[index % defaultIcons.length];
  };

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
              const IconComponent = getIcon(skill.icon, index);
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

                  <h3 className="text-xl font-semibold text-dark-100 mb-3">{skill.name}</h3>

                  <p className="text-dark-400 mb-4">{skill.description}</p>

                  {skill.professionalUsage && (
                    <p className="text-dark-500 text-sm italic">{skill.professionalUsage}</p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {skills.length === 0 && (
            <div className="text-center">
              {/* Default skills when no skills exist */}
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
