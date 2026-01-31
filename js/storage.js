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
        const tokens = Storage.getTokens();
        return tokens.includes(tokenString);
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
        const packs = localStorage.getItem(STORAGE_KEYS.PACKS);
        return packs ? JSON.parse(packs) : [];
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
            const defaultPacks = [
                {
                    id: 'pack_default_1',
                    name: "Starter Access Pack",
                    description: "Get instant access to the beginner's vault. Includes basic tutorials and entry-level content. Perfect for new members.",
                    price: 499,
                    active: true,
                    createdAt: Date.now()
                },
                {
                    id: 'pack_default_2',
                    name: "VIP Premium Bundle",
                    description: "Unlock the full potential. Access all premium resources, hidden guides, and direct support channels. Our most popular choice.",
                    price: 1499,
                    active: true,
                    createdAt: Date.now()
                },
                {
                    id: 'pack_default_3',
                    name: "Elite Lifetime Access",
                    description: "One-time payment for lifetime access to everything. No recurring fees. Includes all future updates and exclusive elite-only drops.",
                    price: 4999,
                    active: true,
                    createdAt: Date.now()
                }
            ];
            localStorage.setItem(STORAGE_KEYS.PACKS, JSON.stringify(defaultPacks));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
        }
    }
};

Storage.init();
