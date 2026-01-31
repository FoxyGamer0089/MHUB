/**
 * storage.js
 * Handles all LocalStorage interactions for MR DADDY HUB.
 * Schemas:
 * Packs: { id, name, description, price, active, createdAt }
 * Orders: { orderId, packId, amount, razorpay_payment_id, razorpay_order_id, status, purchasedAt }
 */

const STORAGE_KEYS = {
    PACKS: 'mrd_packs',
    ORDERS: 'mrd_orders',
    ADMIN_SESSION: 'mrd_admin_session',
    TOKENS: 'mrd_tokens',
    USER_TOKEN: 'mrd_user_token' // Stores the token entered by the user
};

const Storage = {
    // --- TOKENS (Access Control) ---
    getTokens: () => {
        const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
        return tokens ? JSON.parse(tokens) : [];
    },

    saveToken: (tokenString) => {
        const tokens = Storage.getTokens();
        if (!tokens.includes(tokenString)) {
            tokens.push(tokenString);
            localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
        }
    },

    deleteToken: (tokenString) => {
        let tokens = Storage.getTokens();
        tokens = tokens.filter(t => t !== tokenString);
        localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    },

    validateToken: (tokenString) => {
        // 1. Check LocalStorage (works on same device)
        const tokens = Storage.getTokens();
        if (tokens.includes(tokenString)) return true;

        // 2. Check Global Static Tokens (from database.js)
        const globalTokens = (typeof GLOBAL_TOKENS !== 'undefined') ? GLOBAL_TOKENS : [];
        if (globalTokens.includes(tokenString)) return true;

        // 3. Keep Universal Master for emergency testing if needed (Removed for strict admin control request)
        return false;
    },

    // User Session
    setUserToken: (tokenString) => {
        localStorage.setItem(STORAGE_KEYS.USER_TOKEN, tokenString);
    },

    getUserToken: () => {
        return localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    },

    // --- PACKS ---
    getPacks: () => {
        // 1. Get Local Admin Packs (Private/Preview)
        const local = localStorage.getItem(STORAGE_KEYS.PACKS);
        const localPacks = local ? JSON.parse(local) : [];

        // 2. Get Global Live Packs (from database.js)
        // GLOBAL_PACKS is defined in js/database.js
        const globalPacks = (typeof GLOBAL_PACKS !== 'undefined') ? GLOBAL_PACKS : [];

        // 3. Merge? Or prefer Global? 
        // Strategy: Show ALL unique packs.
        const allPacks = [...localPacks];

        // Add global packs that aren't already in local (by ID)
        globalPacks.forEach(gp => {
            if (!allPacks.find(lp => lp.id === gp.id)) {
                allPacks.push(gp);
            }
        });

        return allPacks;
    },

    getActivePacks: () => {
        return Storage.getPacks().filter(p => p.active);
    },

    getPackById: (id) => {
        return Storage.getPacks().find(p => p.id === id);
    },

    savePack: (pack) => {
        const packs = Storage.getPacks();
        const existingIndex = packs.findIndex(p => p.id === pack.id);

        if (existingIndex >= 0) {
            packs[existingIndex] = pack;
        } else {
            packs.push(pack);
        }

        localStorage.setItem(STORAGE_KEYS.PACKS, JSON.stringify(packs));
    },

    deletePack: (id) => { // Soft delete or hard delete? User said "Edit / Disable", implying soft delete via 'active' flag mostly. But let's add hard delete just in case or for cleanup.
        let packs = Storage.getPacks();
        packs = packs.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PACKS, JSON.stringify(packs));
    },

    // --- ORDERS ---
    getOrders: () => {
        const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        return orders ? JSON.parse(orders) : [];
    },

    saveOrder: (order) => {
        const orders = Storage.getOrders();
        orders.push(order);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
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
    },

    // Initialize with default data if empty
    init: () => {
        if (!localStorage.getItem(STORAGE_KEYS.PACKS)) {
            localStorage.setItem(STORAGE_KEYS.PACKS, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
        }
    }
};

Storage.init();
