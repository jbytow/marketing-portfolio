import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { postsApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { queryKeys } from '@/lib/queryKeys';
import { getMediaUrl } from '@/lib/mediaUrl';
import LoadingSpinner from '@/components/LoadingSpinner';
import HashtagList from '@/components/HashtagList';
import MediaCarousel from '@/components/MediaCarousel';

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.post(language, slug!),
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

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <HashtagList hashtags={post.hashtags} />
            </motion.div>
          )}

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <span className="badge-primary mb-4">{post.categoryLabel}</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-100 mb-6">
              {post.title}
            </h1>
          </motion.header>

          {/* Media Carousel */}
          {post.media && post.media.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <MediaCarousel media={post.media} />
            </motion.div>
          ) : post.featuredImage ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="aspect-video rounded-2xl overflow-hidden bg-dark-700 mb-12"
            >
              <img
                src={getMediaUrl(post.featuredImage)}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : null}

          {/* Excerpt */}
          {post.excerpt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <p className="text-xl text-dark-300 leading-relaxed">{post.excerpt}</p>
            </motion.div>
          )}

          {/* Rich Content */}
          {post.content && Object.keys(post.content).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="prose prose-invert prose-lg max-w-none"
            >
              {/* TipTap content renderer would go here */}
              {/* For now, showing raw content as placeholder */}
              <div className="card bg-dark-800/30">
                <pre className="text-sm text-dark-300 overflow-auto">
                  {JSON.stringify(post.content, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </div>
      </article>
    </>
  );
}
