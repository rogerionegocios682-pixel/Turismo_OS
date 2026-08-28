import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Inicializa o app do Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Conecta ao Firestore usando a configuração e o databaseId dedicado
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Função de sanitização que remove qualquer campo 'undefined' que o Firestore rejeita
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) return null as any;
  try {
    return JSON.parse(JSON.stringify(data, (_key, value) => {
      if (value === undefined) return null;
      return value;
    }));
  } catch {
    return data;
  }
}

// Testa a conectividade com o Firestore em nuvem
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'turismo_os', 'health_check'));
    return true;
  } catch (error) {
    console.warn('[FIRESTORE] Health check notice (offline or first run):', error);
    return false;
  }
}

export default app;

