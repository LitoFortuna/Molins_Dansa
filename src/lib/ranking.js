// Ordena els vídeos pel rànquing de vots (més vots primer); a igualtat de
// vots, el més recent primer. No modifica l'array original.
export function rankVideos(videos) {
  return [...videos].sort(
    (a, b) => (b.votes || 0) - (a.votes || 0) || (b.createdAt || 0) - (a.createdAt || 0)
  );
}
