import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/lib/apiError';
import { ArrowLeft, Save } from 'lucide-react';
import { adminSkillCategoriesApi } from '@/services/api';
import { SkillCategoryCreateRequest } from '@/types';
import { queryKeys } from '@/lib/queryKeys';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';

export default function AdminSkillCategoryForm() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState<SkillCategoryCreateRequest>({
    nameEn: '',
    namePl: '',
  });

  // Last loaded or saved state; the form is dirty while it differs from this
  const [baseline, setBaseline] = useState(() => JSON.stringify(formData));
  const { confirmLeave } = useUnsavedChanges(JSON.stringify(formData) !== baseline);

  const { data: categoryData, isLoading: categoryLoading, isError: loadFailed, refetch } = useQuery({
    queryKey: queryKeys.admin.skillCategory(id!),
    queryFn: () => adminSkillCategoriesApi.getById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (categoryData?.data) {
      const category = categoryData.data;
      const seeded: SkillCategoryCreateRequest = {
        nameEn: category.nameEn,
        namePl: category.namePl,
      };
      setFormData(seeded);
      setBaseline(JSON.stringify(seeded));
    }
  }, [categoryData]);

  const createMutation = useMutation({
    mutationFn: (data: SkillCategoryCreateRequest) => adminSkillCategoriesApi.create(data),
    onSuccess: () => {
      setBaseline(JSON.stringify(formData));
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.skillCategories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.prefix.skills() });
      toast.success(t('admin.skillCategories.createSuccess'));
      navigate('/admin/skill-categories');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('admin.skillCategories.createFailed')));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SkillCategoryCreateRequest) => adminSkillCategoriesApi.update(id!, data),
    onSuccess: () => {
      setBaseline(JSON.stringify(formData));
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.skillCategories() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.skillCategory(id!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.prefix.skills() });
      toast.success(t('admin.skillCategories.updateSuccess'));
      navigate('/admin/skill-categories');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('admin.skillCategories.updateFailed')));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (categoryLoading) {
    return <LoadingSpinner />;
  }

  // A failed load must not fall through to the form: saving it would overwrite stored data with blanks
  if (loadFailed && !categoryData) {
    return (
      <div className="card text-center py-12">
        <p className="text-dark-400 mb-4">{t('common.loadError', 'Failed to load data')}</p>
        <button type="button" onClick={() => refetch()} className="btn-primary">
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => confirmLeave() && navigate('/admin/skill-categories')}
          className="p-2 text-dark-400 hover:text-dark-100 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-display font-bold text-dark-100">
          {isEditing ? t('admin.skillCategories.editCategory') : t('admin.skillCategories.newCategory')}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Names */}
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-dark-100">{t('admin.skillCategories.names')}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('admin.skillCategories.nameEn')}</label>
              <input
                type="text"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">{t('admin.skillCategories.namePl')}</label>
              <input
                type="text"
                name="namePl"
                value={formData.namePl}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => confirmLeave() && navigate('/admin/skill-categories')}
            className="btn-secondary"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
