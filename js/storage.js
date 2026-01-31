/**
 * storage.js
 * Firebase Firestore Implementation
 */

import { db } from './firebase.js';
import {
    collection,
    getDocs,
    addDoc,
    setDoc,
    doc,
    deleteDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const COLLECTIONS = {
    PACKS: 'packs',
    ORDERS: 'orders',
    TOKENS: 'tokens'
};

export const Storage = {

    // --- TOKENS ---
    // Returns ARRAY of token strings
    getTokens: async () => {
        const querySnapshot = await getDocs(collection(db, COLLECTIONS.TOKENS));
        const tokens = [];
        querySnapshot.forEach((doc) => {
            tokens.push(doc.data().code);
        });
        return tokens;
    },

    saveToken: async (tokenString) => {
        // Use tokenString as Doc ID to ensure uniqueness easily
        await setDoc(doc(db, COLLECTIONS.TOKENS, tokenString), {
            code: tokenString,
            createdAt: Date.now()
        });
    },

    deleteToken: async (tokenString) => {
        await deleteDoc(doc(db, COLLECTIONS.TOKENS, tokenString));
    },

    validateToken: async (tokenString) => {
        const docRef = doc(db, COLLECTIONS.TOKENS, tokenString);
        // We can just query existence or check local array
        // For speed, let's fetch all (caching behavior) or check specific doc
        // Firestore 'getDoc' is better for specific check but let's stick to list usage for Admin consistency
        // Actually, checking specific doc is cheaper and faster.
        // But for "Entry", checking if it exists in the collection is robust.

        // Let's optimize: Check if a document with ID = tokenString exists
        // Wait, user provided tokens might be random. 
        // Admin generated tokens are saved as DocID = tokenString in saveToken() above.
        // So checking doc existence is perfect.
        // HOWEVER, to support Legacy/Other formats, let's query.

        try {
            // Check specific doc (FASTEST)
            // Note: need 'getDoc' import
            // Let's use getDocs for now to match the pattern, minimal imports
            const q = query(collection(db, COLLECTIONS.TOKENS), where("code", "==", tokenString));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (e) {
            console.error("Token validate error", e);
            return false;
        }
    },

    // --- USER SESSION (Still LocalStorage for keeping you logged in) ---
    setUserToken: (tokenString) => {
        localStorage.setItem('mrd_user_token', tokenString);
    },

    getUserToken: () => {
        return localStorage.getItem('mrd_user_token');
    },

    // --- PACKS ---
    getPacks: async () => {
        const querySnapshot = await getDocs(collection(db, COLLECTIONS.PACKS));
        const packs = [];
        querySnapshot.forEach((doc) => {
            // Combine Doc ID with data, though we usually save ID inside data too
            packs.push(doc.data());
        });
        return packs;
    },

    getActivePacks: async () => {
        const all = await Storage.getPacks();
        return all.filter(p => p.active);
    },

    getPackById: async (id) => {
        // Fetch specific doc or filter list
        // List filter is easier for now to avoid multiple reads on single page if we preload
        const all = await Storage.getPacks();
        return all.find(p => p.id === id);
    },

    savePack: async (pack) => {
        // Use pack.id as Document ID so we can update it easily
        await setDoc(doc(db, COLLECTIONS.PACKS, pack.id), pack);
    },

    deletePack: async (id) => {
        await deleteDoc(doc(db, COLLECTIONS.PACKS, id));
    },

    // --- ORDERS ---
    getOrders: async () => {
        const querySnapshot = await getDocs(collection(db, COLLECTIONS.ORDERS));
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push(doc.data());
        });
        return orders;
    },

    saveOrder: async (order) => {
        await addDoc(collection(db, COLLECTIONS.ORDERS), order);
    },

    // --- UTILS ---
    generateId: () => {
        return 'pack_' + Date.now() + Math.random().toString(36).substr(2, 9);
    },

    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }
};
