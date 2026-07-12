import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';

// Editor mínim (només admin) de config/concurs: dates d'inscripció, votació
// i gala que alimenten el comptador enrere de HomeView i el tancament
// automàtic del vot a GalleryView.
export const AdminConfigPanel = ({ contestConfig, configLoaded, onSave }) => {
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.target);
    await onSave({
      submissionEndsAt: fd.get('submissionEndsAt') || '',
      votingEndsAt: fd.get('votingEndsAt') || '',
      galaAt: fd.get('galaAt') || '',
    });
    setSaving(false);
  };

  return (
    // key: remunta el formulari (inputs no controlats) un sol cop, quan arriba
    // la primera càrrega de Firestore, per adoptar-ne els valors com a defaultValue.
    <form key={configLoaded ? 'loaded' : 'loading'} onSubmit={handleSave} className="space-y-2">
      <p className="text-gray-500 font-mono text-xs uppercase tracking-wider">{t('admin.datesTitle')}</p>
      <div className="grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          {t('admin.submissionUntil')}
          <input name="submissionEndsAt" type="date" defaultValue={contestConfig?.submissionEndsAt || ''} className="bg-gray-800 text-white rounded px-2 py-1 text-xs" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          {t('admin.votingUntil')}
          <input name="votingEndsAt" type="date" defaultValue={contestConfig?.votingEndsAt || ''} className="bg-gray-800 text-white rounded px-2 py-1 text-xs" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          {t('admin.gala')}
          <input name="galaAt" type="date" defaultValue={contestConfig?.galaAt || ''} className="bg-gray-800 text-white rounded px-2 py-1 text-xs" />
        </label>
      </div>
      <button type="submit" disabled={saving} className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-mono disabled:opacity-50">
        <Calendar size={12} /> {saving ? t('admin.saving') : t('admin.saveDates')}
      </button>
    </form>
  );
};
