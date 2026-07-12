// Estableix el custom claim `admin: true` a un usuari de Firebase Auth.
//
// Cal executar-lo UNA SOLA VEGADA (o cada cop que calgui afegir un nou admin).
// Requereix una clau de compte de servei amb permisos d'aquest projecte:
//   1. Consola de Firebase → Configuració del projecte → Comptes de servei
//      → "Generar una clau privada nova" (descarrega un .json).
//   2. NO el desis dins d'aquest repositori. Guarda'l en un lloc fora del
//      projecte (p.ex. la teva carpeta d'usuari).
//   3. Executa:
//        GOOGLE_APPLICATION_CREDENTIALS="/ruta/al/fitxer.json" node scripts/set-admin-claim.mjs <uid>
//
// Un cop fet, l'usuari ha de tancar sessió i tornar a entrar (o esperar fins
// a 1h, que és quan Firebase refresca el token en segon pla) perquè el nou
// claim aparegui a les regles de Firestore i al client.
import admin from 'firebase-admin';

const uid = process.argv[2];
if (!uid) {
  console.error('Ús: GOOGLE_APPLICATION_CREDENTIALS="/ruta/clau.json" node scripts/set-admin-claim.mjs <uid>');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });

const user = await admin.auth().getUser(uid);
await admin.auth().setCustomUserClaims(uid, { ...(user.customClaims || {}), admin: true });

console.log(`Claim admin=true establert per a ${uid} (${user.email || 'sense email'}).`);
console.log("Cal tancar sessió i tornar a entrar perquè el canvi tingui efecte.");
