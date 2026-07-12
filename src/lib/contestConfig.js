// Dates de fases del concurs (doc config/concurs a Firestore).
export const parseConfigDate = (isoDate) => {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  return isNaN(d.getTime()) ? null : d;
};

export const daysUntil = (date) => Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
