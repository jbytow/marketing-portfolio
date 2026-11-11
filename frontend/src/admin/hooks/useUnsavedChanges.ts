import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useUnsavedChanges(isDirty: boolean) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Chrome only shows its leave prompt when returnValue is set
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const confirmLeave = useCallback(
    () => !isDirty || window.confirm(t('admin.unsaved.confirmLeave')),
    [isDirty, t]
  );

  return { confirmLeave };
}
