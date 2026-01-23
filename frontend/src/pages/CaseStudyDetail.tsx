import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Quote } from 'lucide-react';
import { postsApi } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const post = data?.data;

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-dark-100 mb-4">Post not found</h1>
        <Link to="/case-studies" className="btn-secondary">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Case Studies
        </Link>
      </div>
    );
  }

  const caseStudy = post.caseStudyDetails;

  return (
    <>
      <Helmet>
        <title>{post.title} | Portfolio</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <article className="py-20">
        <div className="container max-w-4xl">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Link
              to="/case-studies"
              className="inline-flex items-center text-dark-400 hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back to Case Studies
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <span className="badge-primary mb-4">{post.categoryLabel}</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-100 mb-6">
              {post.title}
            </h1>
            <p className="text-xl text-dark-400">{post.excerpt}</p>
          </motion.header>

          {/* Featured Image */}
          {post.featuredImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="aspect-video rounded-2xl overflow-hidden bg-dark-700 mb-12"
            >
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Case Study Sections */}
          {caseStudy && (
            <div className="space-y-12">
              {/* The Challenge */}
              {caseStudy.problem && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-display font-bold text-dark-100 mb-4">
                    {t('caseStudies.problem')}
                  </h2>
                  <div className="card bg-dark-800/30">
                    <p className="text-dark-300 leading-relaxed">{caseStudy.problem}</p>
                  </div>
                </motion.section>
              )}

              {/* The Solution */}
              {caseStudy.solution && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-display font-bold text-dark-100 mb-4">
                    {t('caseStudies.solution')}
                  </h2>
                  <div className="card bg-dark-800/30">
                    <p className="text-dark-300 leading-relaxed">{caseStudy.solution}</p>
                  </div>
                </motion.section>
              )}

              {/* The Results */}
              {caseStudy.results && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-2xl font-display font-bold text-dark-100 mb-4">
                    {t('caseStudies.results')}
                  </h2>
                  <div className="card bg-gradient-to-br from-primary-500/10 to-accent-pink/10 border-primary-500/20">
                    <p className="text-dark-200 leading-relaxed">{caseStudy.results}</p>
                  </div>
                </motion.section>
              )}

              {/* Metrics */}
              {caseStudy.metrics && Object.keys(caseStudy.metrics).length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(caseStudy.metrics).map(([key, value]) => (
                      <div
                        key={key}
                        className="text-center p-6 bg-dark-800 rounded-xl"
                      >
                        <div className="text-3xl font-bold gradient-text mb-2">
                          {String(value)}
                        </div>
                        <div className="text-dark-400 text-sm capitalize">
                          {key.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Testimonial */}
              {caseStudy.testimonialText && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-2xl font-display font-bold text-dark-100 mb-4">
                    {t('caseStudies.testimonial')}
                  </h2>
                  <blockquote className="card bg-dark-800/30 relative">
                    <Quote className="absolute top-4 left-4 w-8 h-8 text-primary-500/30" />
                    <p className="text-lg text-dark-200 italic pl-12 mb-4">
                      "{caseStudy.testimonialText}"
                    </p>
                    {caseStudy.testimonialAuthor && (
                      <footer className="text-dark-400 pl-12">
                        — {caseStudy.testimonialAuthor}
                      </footer>
                    )}
                  </blockquote>
                </motion.section>
              )}
            </div>
          )}
        </div>
      </article>
    </>
  );
}
