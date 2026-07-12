import { Trophy } from 'lucide-react';
import { Button, Card } from '../components/ui';

export const BasesView = ({ onBack, onNavigate }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">← Tornar</button>
    <Card className="p-8">
      <h2 className="text-3xl font-bold mb-6">Bases del Concurs</h2>
      <div className="prose prose-rose max-w-none text-gray-700 space-y-4">
        <p><strong>1. Participació:</strong> Obert a tothom sense límit d'edat. Si al vídeo hi surten persones menors d'edat, qui l'inscrigui ha de disposar prèviament de l'autorització dels seus pares o tutors legals per participar-hi i cedir-ne els drets d'imatge; l'organització podrà sol·licitar-ne còpia en qualsevol moment.</p>
        <p><strong>2. Temàtica:</strong> Dansa en espais públics de Molins de Rei.</p>
        <p><strong>3. Format:</strong> Vídeos horitzontals de màxim 2 minuts.</p>

        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl my-6">
          <h3 className="font-bold text-rose-800 mb-2">Premis i Categories</h3>
          <p className="mb-4 text-sm">Hi ha diferents categories i premis valorats en més de 300€,</p>
          <Button variant="primary" onClick={() => onNavigate('prizes')} className="text-sm w-full md:w-auto">
            <Trophy size={16} /> Consultar tots els Premis
          </Button>
        </div>

        <p><strong>4. Dates:</strong> Submissió de vídeos fins al 30 de Maig de 2026.</p>
        <p><strong>5. Drets d'imatge:</strong> En inscriure un vídeo, la persona participant declara disposar de l'autorització de totes les persones identificables que hi surten (inclosos vianants captats a l'espai públic) i cedeix els drets d'imatge del vídeo a l'Associació Dance Space i a l'Ajuntament de Molins de Rei per a la difusió del concurs a les seves xarxes socials i webs.</p>
      </div>
    </Card>
  </div>
);
