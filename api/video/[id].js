/**
 * Open Graph dinàmic per a /video/:id (Vercel Serverless Function)
 * ------------------------------------------------------------------
 * Equivalent a functions/index.js (Cloud Function de Firebase Hosting), però
 * per al desplegament de Vercel. Vercel no ofereix un mecanisme integrat
 * amb Firebase Admin sense credencials addicionals, així que aquí es llegeix
 * el document del vídeo amb una simple petició a la REST API pública de
 * Firestore — funciona perquè firestore.rules permet `allow read: if true`
 * a la col·lecció /videos, el mateix accés que ja fa servir el client.
 *
 * Ruta: qualsevol petició a /video/:id es reescriu cap aquí (veure
 * vercel.json, rewrite abans del catch-all cap a index.html).
 */

const PROJECT_ID = "concurs-molins-dansa";

// Mateixa lògica que src/App.jsx: extreu l'id de YouTube de diversos formats.
function getYouTubeId(url) {
  if (!url || typeof url !== "string") return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/|v\/))([\w-]{11})/
  );
  return m ? m[1] : null;
}

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setMeta(html, property, value) {
  const re = new RegExp(`(<meta property="${property}" content=")[^"]*(")`);
  return re.test(html)
    ? html.replace(re, `$1${escapeHtml(value)}$2`)
    : html;
}

export default async function handler(req, res) {
  const id = decodeURIComponent(req.query.id || "");
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${req.headers.host}`;

  // 1) HTML base servit estàticament pel mateix desplegament.
  let html;
  try {
    const resp = await fetch(`${origin}/index.html`);
    html = await resp.text();
  } catch (e) {
    console.error("No s'ha pogut carregar l'index.html base:", e);
    res.status(500).send("Error carregant la pàgina.");
    return;
  }

  // 2) Injecta les metaetiquetes del vídeo (si existeix i és llegible).
  try {
    const docResp = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/videos/${encodeURIComponent(id)}`
    );
    if (docResp.ok) {
      const doc = await docResp.json();
      const f = doc.fields || {};
      const title = f.title?.stringValue || "Vídeo";
      const author = f.author?.stringValue || "";
      const videoUrl = f.url?.stringValue || "";

      const ytId = getYouTubeId(videoUrl);
      const image = ytId
        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        : `${origin}/og-image.png`;
      const ogTitle = `${title} · Molins Dansa 2026`;
      const desc = `Vota "${title}"${author ? " de " + author : ""} al concurs de vídeos de dansa de Molins de Rei.`;
      const shareUrl = `${origin}/video/${id}`;

      html = setMeta(html, "og:title", ogTitle);
      html = setMeta(html, "og:description", desc);
      html = setMeta(html, "og:image", image);
      html = setMeta(html, "og:url", shareUrl);
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(ogTitle)}</title>`);
    }
    // Si docResp no és ok (404, etc.), es serveix l'HTML base sense modificar.
  } catch (e) {
    console.error("Error consultant el vídeo per a OG:", e);
  }

  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
