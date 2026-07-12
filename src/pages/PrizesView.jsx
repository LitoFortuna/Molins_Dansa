import { Trophy, Star, Heart } from 'lucide-react';
import { Card } from '../components/ui';

export const PrizesView = ({ onBack }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">← Tornar</button>
    <Card className="p-8 md:p-12">
      <div className="flex items-center gap-3 mb-8 border-b pb-6">
        <Trophy className="text-rose-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-900">Premis i Reconeixements</h2>
      </div>

      <div className="space-y-8">
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="text-amber-500" size={24} />
            <h3 className="text-xl font-bold text-amber-900">1r Premi del Jurat</h3>
          </div>
          <p className="text-amber-800 mb-4">Atorgat pel jurat professional format per membres de l'Associació Dance Space i directors/es d'escoles de dansa.</p>
          <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
            <li>Trofeu exclusiu Molins Dansa 2026.</li>
            <li>Val de compra de 150€ en comerç local.</li>
            <li>Masterclass gratuïta a una de les escoles col·laboradores.</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Star className="text-gray-500" size={24} />
            <h3 className="text-xl font-bold text-gray-800">2n Premi del Jurat</h3>
          </div>
          <p className="text-gray-700 mb-4">Reconeixement a la segona millor proposta artística segons el criteri tècnic.</p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Trofeu commemoratiu.</li>
            <li>Val de compra de 75€ en comerç local.</li>
          </ul>
        </div>

        <div className="bg-rose-50 p-6 rounded-xl border border-rose-200">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="text-rose-500" size={24} />
            <h3 className="text-xl font-bold text-rose-900">Premi del Públic</h3>
          </div>
          <p className="text-rose-800 mb-4">Atorgat al vídeo amb més vots registrats a través d'aquesta plataforma web.</p>
          <ul className="list-disc pl-5 text-sm text-rose-700 space-y-1">
            <li>Trofeu especial "Favorit del Públic".</li>
            <li>Sopar per a dues persones (o equivalent per grup) en restaurant local.</li>
            <li>Difusió especial a les xarxes socials de l'Ajuntament.</li>
          </ul>
        </div>

        <div className="text-center pt-6 text-sm text-gray-500 italic">
          * L'entrega de premis es realitzarà durant l'acte de clausura al Juny de 2026.
        </div>
      </div>
    </Card>
  </div>
);
