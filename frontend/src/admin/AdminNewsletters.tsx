import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { adminNewslettersApi } from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';
import { getMediaUrl } from '@/lib/mediaUrl';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminNewsletters() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.newsletters(),
    queryFn: () => adminNewslettersApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminNewslettersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.newsletters() });
      setDeleteId(null);
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async (newsletter: { id: string; published: boolean }) => {
      return adminNewslettersApi.update(newsletter.id, { published: !newsletter.published });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.newsletters() });
    },
  });

  const newsletters = data?.data || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">
            {t('admin.newsletters.title')}
          </h1>
          <p className="text-dark-400 mt-1">{t('admin.newsletters.subtitle')}</p>
        </div>
        <Link to="/admin/newsletters/new" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          {t('admin.newsletters.newNewsletter')}
        </Link>
      </div>

      {newsletters.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-dark-400 mb-4">{t('admin.newsletters.noNewslettersYet')}</p>
          <Link to="/admin/newsletters/new" className="btn-primary">
            {t('admin.newsletters.createFirst')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {newsletters.map((newsletter, index) => (
            <motion.div
              key={newsletter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card flex items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-16 h-20 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0">
                {newsletter.image1 ? (
                  <img
                    src={getMediaUrl(newsletter.image1)}
                    alt={newsletter.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dark-500">
                    No img
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-dark-100 truncate">
                  {newsletter.titleEn}
                </h3>
                <p className="text-sm text-dark-400 truncate">
                  {newsletter.titlePl}
                </p>
              </div>

              {/* Status */}
              <div className="flex-shrink-0">
                <span
                  className={`badge ${
                    newsletter.published ? 'badge-success' : 'badge-warning'
                  }`}
                >
                  {newsletter.published ? t('common.published') : t('common.draft')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => togglePublishMutation.mutate({ id: newsletter.id, published: newsletter.published })}
                  className="p-2 text-dark-400 hover:text-dark-100 rounded-lg hover:bg-dark-700 transition-colors"
                  title={newsletter.published ? 'Unpublish' : 'Publish'}
                >
                  {newsletter.published ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <Link
                  to={`/admin/newsletters/${newsletter.id}/edit`}
                  className="p-2 text-dark-400 hover:text-dark-100 rounded-lg hover:bg-dark-700 transition-colors"
                >
                  <Pencil className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => setDeleteId(newsletter.id)}
                  className="p-2 text-dark-400 hover:text-red-400 rounded-lg hover:bg-dark-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-dark-900/80 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">
              Delete Newsletter?
            </h3>
            <p className="text-dark-400 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                className="btn-primary bg-red-500 hover:bg-red-600"
                disabled={deleteMutation.isPending}
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
