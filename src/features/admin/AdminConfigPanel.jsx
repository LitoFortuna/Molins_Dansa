import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useI18n } from '../../i18n/useI18n';

// Editor mínim (només admin) de config/concurs: dates d'inscripció, votació
// i gala que alimenten el comptador enrere de HomeView i el tancament
// automàtic del vot a GalleryView. Viu al peu (camp fosc).
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

  const dateField = (name, label) => (
    <label className="flex flex-col gap-1 text-small text-paper/80">
      {label}
      <input name={name} type="date" defaultValue={contestConfig?.[name] || ''} className="min-h-11 bg-paper px-2 py-1 text-body text-ink" />
    </label>
  );

  return (
    // key: remunta el formulari (inputs no controlats) un sol cop, quan arriba
    // la primera càrrega de Firestore, per adoptar-ne els valors com a defaultValue.
    <form key={configLoaded ? 'loaded' : 'loading'} onSubmit={handleSave} className="space-y-3">
      <p className="text-small font-semibold">{t('admin.datesTitle')}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {dateField('submissionEndsAt', t('admin.submissionUntil'))}
        {dateField('votingEndsAt', t('admin.votingUntil'))}
        {dateField('galaAt', t('admin.gala'))}
      </div>
      <button type="submit" disabled={saving} className="tap flex items-center gap-2 text-small font-semibold text-sun hover:underline disabled:opacity-50">
        <Calendar size={14} aria-hidden="true" /> {saving ? t('admin.saving') : t('admin.saveDates')}
      </button>
    </form>
  );
};
