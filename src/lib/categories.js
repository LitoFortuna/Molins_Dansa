// Els valors de categoria es guarden sempre en català a Firestore (dada,
// no text d'interfície): només la ETIQUETA que es mostra es tradueix.
export const CATEGORY_VALUES = ['Individual', 'Grup', 'Escola de Dansa'];

export const categoryLabelKey = (category) => {
  switch (category) {
    case 'Individual': return 'upload.categoryIndividual';
    case 'Grup': return 'upload.categoryGroup';
    case 'Escola de Dansa': return 'upload.categorySchool';
    default: return null;
  }
};
