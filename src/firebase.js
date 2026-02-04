import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBFxxmDMWwE5w3EZ-akwPEQyjFloR3BFrc",
    authDomain: "concurs-molins-dansa.firebaseapp.com",
    projectId: "concurs-molins-dansa",
    storageBucket: "concurs-molins-dansa.firebasestorage.app",
    messagingSenderId: "208158108295",
    appId: "1:208158108295:web:1bb727affeefd72b876622"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'concurs-molins-dansa';
