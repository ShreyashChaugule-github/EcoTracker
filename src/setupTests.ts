import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { vi } from 'vitest';

// Ensure Node's TextEncoder/TextDecoder are available for esbuild and related tooling
(globalThis as any).TextEncoder = (globalThis as any).TextEncoder || TextEncoder;
(globalThis as any).TextDecoder = (globalThis as any).TextDecoder || TextDecoder;

// Stub scrollIntoView used by some components
if (typeof Element !== 'undefined' && !(Element.prototype as any).scrollIntoView) {
  (Element.prototype as any).scrollIntoView = function () {
    /* no-op for test environment */
  };
}

// Mock firebase/auth to avoid environment-specific auth initialization errors in tests
vi.mock('firebase/auth', () => {
  return {
    signInWithRedirect: async () => {},
    getRedirectResult: async () => null,
    getAuth: () => null,
    GoogleAuthProvider: class MockProvider {},
  };
});

// Mock Firestore to provide lightweight in-memory behavior for tests
vi.mock('firebase/firestore', () => {
  const inMemory: Record<string, Record<string, any>> = {};

  function doc(_db: any, collectionName: string, id?: string) {
    return { collectionName, id };
  }

  function collection(_db: any, collectionName: string) {
    return { collectionName };
  }

  async function getDoc(ref: any) {
    const c = inMemory[ref.collectionName] || {};
    const rec = ref.id ? c[ref.id] : undefined;
    return {
      exists: () => !!rec,
      data: () => rec,
    };
  }

  async function setDoc(ref: any, payload: any) {
    inMemory[ref.collectionName] = inMemory[ref.collectionName] || {};
    inMemory[ref.collectionName][ref.id] = payload;
    return true;
  }

  async function updateDoc(ref: any, payload: any) {
    inMemory[ref.collectionName] = inMemory[ref.collectionName] || {};
    inMemory[ref.collectionName][ref.id] = {
      ...(inMemory[ref.collectionName][ref.id] || {}),
      ...payload,
    };
    return true;
  }

  async function deleteDoc(ref: any) {
    if (inMemory[ref.collectionName]) delete inMemory[ref.collectionName][ref.id];
    return true;
  }

  async function getDocs(q: any) {
    // return all docs for collection
    const coll = inMemory[q.collectionName] || {};
    const list = Object.entries(coll).map(([id, val]) => ({ id, data: () => val }));
    return { docs: list };
  }

  async function addDoc(colRef: any, payload: any) {
    inMemory[colRef.collectionName] = inMemory[colRef.collectionName] || {};
    const id = `mock-${Date.now()}`;
    inMemory[colRef.collectionName][id] = payload;
    return { id };
  }

  async function getDocFromServer() {
    // Simulate no server connectivity so code falls back to local DB behaviour
    throw new Error('mock getDocFromServer - offline');
  }

  return {
    getFirestore: (_app: any, _id?: any) => ({ _app: _app || null, _id: _id || '(default)' }),
    doc,
    collection,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    addDoc,
    getDocFromServer,
    query: (...args: any[]) => ({ collectionName: args[0]?.collectionName || args[0] }),
    where: () => ({}),
    orderBy: () => ({}),
    limit: () => ({}),
  };
});

// Mock Google GenAI client to return deterministic responses
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      public models: any;
      constructor() {
        this.models = {
          generateContent: async (_opts: any) => ({ text: 'Mocked Gemini response' }),
        };
      }
    },
  };
});
