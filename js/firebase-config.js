import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDo23qlmKp80YJt8siN3IOoVmRyX4aLYMk',
  authDomain: 'hotel-almendro.firebaseapp.com',
  projectId: 'hotel-almendro',
  messagingSenderId: '926518426490',
  appId: '1:926518426490:web:fe04b9f7b4e556be6d34c3',
  measurementId: 'G-1RSGN7DFPG'
};

let app;
let db;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);

  window.firebaseApp = app;
  window.db = db;
  window.firebaseApi = {
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    runTransaction,
    serverTimestamp,
    setDoc,
    updateDoc,
    writeBatch
  };
  window.dispatchEvent(new CustomEvent('firebase-ready'));
} catch (error) {
  console.error('No se pudo inicializar Firebase App o Firestore.', error);
  window.dispatchEvent(new CustomEvent('firebase-config-error', { detail: error }));
}

export { app, db };
