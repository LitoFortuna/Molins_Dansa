/**
 * Open Graph dinàmic per a /video/:id
 * ------------------------------------
 * Quan algú comparteix https://<domini>/video/<id> a WhatsApp, Instagram,
 * Facebook o Twitter, el seu crawler demana l'HTML i llegeix les metaetiquetes
 * og:*. Aquesta funció serveix l'HTML de l'SPA amb les metaetiquetes
 * personalitzades del vídeo (títol, autor i miniatura de YouTube), de manera
 * que la targeta compartida mostri el vídeo concret en lloc de la portada.
 *
 * Els usuaris reals també reben aquest HTML: react-router s'encarrega de
 * mostrar la galeria amb el vídeo ressaltat; les metaetiquetes extra al <head>
 * són inofensives.
 *
 * Requisits: pla Blaze de Firebase (les Cloud Functions necessiten facturació).
 * Desplegar amb:  firebase deploy --only functions,hosting
 */

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

// Origen públic del web (per llegir l'index.html i construir URLs absolutes).
// Ajusta'l si fas servir un domini propi.
const SITE_ORIGIN = "https://concurs-molins-dansa.web.app";

// Mateixa lògica que el client: extreu l'id de YouTube de diversos formats.
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

// Reemplaça el contingut d'una metaetiqueta og:* existent a l'HTML.
function setMeta(html, property, value) {
  const re = new RegExp(`(<meta property="${property}" content=")[^"]*(")`);
  return re.test(html)
    ? html.replace(re, `$1${escapeHtml(value)}$2`)
    : html;
}

exports.ogVideo = onRequest({ region: "us-central1" }, async (req, res) => {
  const id = decodeURIComponent((req.path.split("/").pop() || "").trim());

  // 1) HTML base de l'SPA (servit per Hosting; /index.html no passa per aquí).
  let html;
  try {
    const resp = await fetch(`${SITE_ORIGIN}/index.html`);
    html = await resp.text();
  } catch (e) {
    console.error("No s'ha pogut carregar l'index.html base:", e);
    res.status(500).send("Error carregant la pàgina.");
    return;
  }

  // 2) Injecta les metaetiquetes del vídeo (si existeix).
  try {
    const snap = await admin.firestore().collection("videos").doc(id).get();
    if (snap.exists) {
      const v = snap.data() || {};
      const ytId = getYouTubeId(v.url);
      const image = ytId
        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        : `${SITE_ORIGIN}/og-image.png`;
      const title = `${v.title || "Vídeo"} · Molins Dansa 2026`;
      const desc = `Vota "${v.title || ""}"${v.author ? " de " + v.author : ""} al concurs de vídeos de dansa de Molins de Rei.`;
      const url = `${SITE_ORIGIN}/video/${id}`;

      html = setMeta(html, "og:title", title);
      html = setMeta(html, "og:description", desc);
      html = setMeta(html, "og:image", image);
      html = setMeta(html, "og:url", url);
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
    }
  } catch (e) {
    // Si Firestore falla, servim l'HTML base perquè l'SPA segueixi funcionant.
    console.error("Error consultant el vídeo per a OG:", e);
  }

  // Cache curt: prou perquè els crawlers no saturin, prou fresc si canvien dades.
  res.set("Cache-Control", "public, max-age=300, s-maxage=600");
  res.status(200).send(html);
});
