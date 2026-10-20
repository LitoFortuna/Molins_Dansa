import { useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../../firebase';
import { trackEvent } from '../../lib/analytics';
import { PageShell } from '../../components/PageShell';
import { Button } from '../../components/ui';
import { useI18n } from '../../i18n/useI18n';

export const UploadView = ({ onUploadSuccess, onCancel, onNavigate, user }) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({ title: '', author: user ? user.displayName : '', location: '', category: 'Individual', url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptImageRights, setAcceptImageRights] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // SIMPLIFIED PATH: Just 'videos' implies root collection
      const newVideo = { ...formData, userId: user.uid, votes: 0, thumbnail: 'bg-gray-300', createdAt: Date.now(), status: 'pendent' };
      const docRef = await addDoc(collection(db, 'videos'), newVideo);
      trackEvent('video_submit', { category: formData.category });

      // --- GOOGLE SHEETS INTEGRATION ---
      try {
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxoyDHdeL91KfFTamv6Kct4ZZXLRL4iIMFF_CNW_zez9i1dc0peX53DkTUwobpFoQ/exec';
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // Importante para evitar error CORS con Google Scripts
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            userEmail: user.email || 'Anònim',
            timestamp: new Date().toISOString()
          })
        });
      } catch (sheetErr) {
        console.error("Error enviant a Sheets:", sheetErr);
        // No bloquem l'èxit si falla el Sheet, només ho loguejem
      }

      onUploadSuccess({ ...newVideo, id: docRef.id });
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
      setIsSubmitting(false);
    }
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  return (
    <PageShell title={t('upload.title')} onBack={onCancel} backLabel={t('upload.back')} narrow>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <label className="block">
          <span className="mb-1 block text-small font-semibold">{t('upload.fieldTitle')}</span>
          <input required name="title" autoComplete="off" className="field" value={formData.title} onChange={set('title')} />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-small font-semibold">{t('upload.fieldArtistName')}</span>
            <input required name="author" autoComplete="nickname" className="field" value={formData.author} onChange={set('author')} />
          </label>
          <label className="block">
            <span className="mb-1 block text-small font-semibold">{t('upload.categoryLabel')}</span>
            <select name="category" className="field" value={formData.category} onChange={set('category')}>
              <option value="Individual">{t('upload.categoryIndividual')}</option>
              <option value="Grup">{t('upload.categoryGroup')}</option>
              <option value="Escola de Dansa">{t('upload.categorySchool')}</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-small font-semibold">{t('upload.locationLabel')}</span>
          <input required type="text" name="location" autoComplete="off" className="field" placeholder={t('upload.locationPlaceholder')} value={formData.location} onChange={set('location')} />
          <span className="mt-1 block text-small text-ink-soft">{t('upload.locationHint')}</span>
        </label>

        <label className="block">
          <span className="mb-1 block text-small font-semibold">{t('upload.linkLabel')}</span>
          <input required type="url" name="url" inputMode="url" autoComplete="off" spellCheck={false} className="field" placeholder={t('upload.linkPlaceholder')} value={formData.url} onChange={set('url')} />
        </label>

        <div className="flex items-start gap-3 pt-2">
          <input
            required
            type="checkbox"
            id="imageRights"
            checked={acceptImageRights}
            onChange={(e) => setAcceptImageRights(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brand-deep)]"
          />
          <label htmlFor="imageRights" className="text-body text-ink-soft">
            {t('upload.imageRightsPre')}{' '}
            <button type="button" onClick={() => onNavigate?.('bases')} className="link-text">{t('upload.imageRightsLink')}</button>.
          </label>
        </div>

        <Button className="w-full px-8 py-3 text-body sm:w-auto" type="submit" disabled={isSubmitting || !acceptImageRights}>
          {isSubmitting ? t('upload.submitting') : t('upload.submit')}
        </Button>
      </form>
    </PageShell>
  );
};
