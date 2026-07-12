// Extreu l'id d'un vídeo de YouTube de diversos formats d'URL.
// Cobreix watch?v=, youtu.be/, shorts/, live/, embed/ i /v/ (id d'11 caràcters).
// Nota: api/video/[id].js en manté una còpia pròpia (les funcions serverless de
// Vercel s'empaqueten a part i no comparteixen el codi de src/).
export const getYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/|v\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};
