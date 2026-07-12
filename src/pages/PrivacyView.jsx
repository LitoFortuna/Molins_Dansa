import { Lock } from 'lucide-react';
import { Card } from '../components/ui';

export const PrivacyView = ({ onBack }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">← Tornar</button>
    <Card className="p-8">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><Lock className="text-rose-600" /> Política de Privacitat</h2>

      <div className="prose prose-rose max-w-none text-gray-700 space-y-4 text-sm">
        <p><strong>1. Responsable del tractament</strong><br />
          Associació Dance Space, amb NIF G55376776 i domicili a C/ Menéndez Pelayo 12, 08750 Molins de Rei
          (Barcelona), Espanya. Contacte: info@dancespace.cat</p>

        <p><strong>2. Finalitats i base jurídica</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Gestió del compte d'usuari (registre, autenticació) — execució d'una relació amb l'interessat.</li>
          <li>Participació al concurs: publicació del títol, nom artístic, ubicació i enllaç del vídeo a la galeria i al mapa públics — consentiment exprés atorgat en inscriure el vídeo.</li>
          <li>Recompte de vots del "Premi del Públic".</li>
          <li>Contacte amb la persona guanyadora per a l'entrega de premis.</li>
        </ul>

        <p><strong>3. Destinataris i encarregats del tractament</strong><br />
          Les dades es tracten amb els següents proveïdors, com a encarregats del tractament:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Google LLC / Firebase</strong> (autenticació, base de dades i allotjament web).</li>
          <li><strong>Google Sheets</strong>, a través d'un formulari automatitzat (Apps Script), on es desa una còpia de les dades d'inscripció.</li>
          <li><strong>OpenStreetMap Foundation (Nominatim)</strong>, per geolocalitzar l'adreça indicada al mapa interactiu.</li>
          <li><strong>YouTube (Google) / Instagram (Meta)</strong>, en reproduir-se el vídeo inscrit mitjançant el seu reproductor incrustat.</li>
        </ul>
        <p>No es cedeixen dades a tercers amb finalitats comercials.</p>

        <p><strong>4. Dades tractades</strong><br />
          Del compte: nom, email i contrasenya (xifrada per Firebase). Del vídeo inscrit: títol, nom artístic,
          categoria, ubicació i enllaç, associats al compte de qui l'ha inscrit.</p>

        <p><strong>5. Termini de conservació</strong><br />
          Les dades es conserven mentre duri el concurs i fins a 24 mesos després de l'acte de
          clausura (juny de 2026), moment en què es suprimeixen o s'anonimitzen, tret dels vídeos guanyadors si
          la persona participant en consent la conservació per a la difusió del concurs.</p>

        <p><strong>6. Drets de la persona interessada</strong><br />
          Podeu exercir els drets d'accés, rectificació, supressió, oposició, limitació del tractament i
          portabilitat enviant un email a info@dancespace.cat. També teniu dret a presentar una reclamació
          davant l'Autoritat Catalana de Protecció de Dades (APDCAT) si considereu que el tractament no s'ajusta
          a la normativa.</p>
      </div>
    </Card>
  </div>
);
