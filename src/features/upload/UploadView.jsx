import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../../firebase';
import { Button, Card } from '../../components/ui';

export const UploadView = ({ onUploadSuccess, onCancel, onNavigate, user }) => {
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

  return (
    <div className="max-w-2xl mx-auto py-8">
      <button onClick={onCancel} className="mb-4">← Tornar</button>
      <Card className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Inscriu el teu Ball</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required className="w-full px-4 py-2 border rounded" placeholder="Títol" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <input required className="w-full px-4 py-2 border rounded" placeholder="Nom Artístic" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
            <select className="w-full px-4 py-2 border rounded" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option>Individual</option><option>Grup</option><option>Escola de Dansa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicació / Adreça</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                required
                type="text"
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                placeholder="Ex: Plaça de la Vila, 1"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Indica l'adreça exacta o coordenades per al mapa interactiu.</p>
          </div>
          <input required type="url" className="w-full px-4 py-2 border rounded" placeholder="Enllaç (YouTube/Instagram)..." value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} />

          <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
            <input
              required
              type="checkbox"
              id="imageRights"
              checked={acceptImageRights}
              onChange={(e) => setAcceptImageRights(e.target.checked)}
              className="mt-1 rounded text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="imageRights" className="text-sm text-gray-500">
              Confirmo que tinc l'autorització de totes les persones que surten al vídeo per participar i cedir-ne els drets d'imatge —
              si hi ha menors d'edat, dels seus pares o tutors legals— segons les{' '}
              <button type="button" onClick={() => onNavigate?.('bases')} className="text-rose-600 underline">bases del concurs</button>.
            </label>
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting || !acceptImageRights}>{isSubmitting ? 'Enviant...' : 'Enviar'}</Button>
        </form>
      </Card>
    </div>
  );
};
