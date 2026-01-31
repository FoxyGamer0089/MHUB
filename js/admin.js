/**
 * admin.js
 * Admin Panel Logic (Async / Firestore)
 */

import { Storage } from './storage.js';

// Simple client-side passcode. 
const ADMIN_PASSCODE = "admin";

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function checkAuth() {
    const isAuth = sessionStorage.getItem('mrd_admin_auth');
    if (isAuth === 'true') {
        showAdminContent();
        loadPacks();
        loadOrders();
    } else {
        document.getElementById('login-overlay').style.display = 'flex';
        document.getElementById('admin-content').style.display = 'none';
    }
}

function login() {
    const input = document.getElementById('admin-passcode').value;
    if (input === ADMIN_PASSCODE) {
        sessionStorage.setItem('mrd_admin_auth', 'true');
        showAdminContent();
        loadPacks();
        loadOrders();
        document.getElementById('login-error').style.display = 'none';
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function logout() {
    sessionStorage.removeItem('mrd_admin_auth');
    window.location.reload();
}

function showAdminContent() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block';
}

function setupEventListeners() {
    // Login
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('admin-passcode').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });

    // Form Submit
    document.getElementById('pack-form').addEventListener('submit', (e) => {
        e.preventDefault();
        savePack();
    });
}

// --- TABS ---
window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#tab-packs`).style.display = 'none';
    document.querySelector(`#tab-orders`).style.display = 'none';
    document.querySelector(`#tab-tokens`).style.display = 'none';

    if (tabName === 'packs') {
        document.querySelector(`#tab-packs`).style.display = 'block';
        document.querySelector(`.tab-btn:nth-child(1)`).classList.add('active');
        loadPacks();
    } else if (tabName === 'orders') {
        document.querySelector(`#tab-orders`).style.display = 'block';
        document.querySelector(`.tab-btn:nth-child(2)`).classList.add('active');
        loadOrders();
    } else {
        document.querySelector(`#tab-tokens`).style.display = 'block';
        document.querySelector(`.tab-btn:nth-child(3)`).classList.add('active');
        loadTokens();
    }
};

// --- TOKENS LOGIC ---
async function loadTokens() {
    const tbody = document.querySelector('#tokens-table tbody');
    tbody.innerHTML = '<tr><td colspan="2" class="text-center">Loading tokens...</td></tr>';

    const tokens = await Storage.getTokens();

    if (tokens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No active tokens. Generate one above.</td></tr>';
        return;
    }

    tbody.innerHTML = tokens.map(token => `
        <tr>
            <td style="font-family:monospace; font-size:1.1rem; color:var(--accent-color); font-weight:bold;">${token}</td>
            <td>
                <button class="action-btn" style="background:#cc0000" onclick="deleteToken('${token}')">Revoke</button>
            </td>
        </tr>
    `).join('');
}

window.generateToken = async () => {
    const token = 'RD-' + Math.random().toString(36).substr(2, 6).toUpperCase() + Math.random().toString(36).substr(2, 2).toUpperCase();
    await Storage.saveToken(token);
    loadTokens();
    alert(`Token Generated: ${token}\nCopy and send this to the user.`);
};

window.deleteToken = async (token) => {
    if (confirm("Revoke this token? User will lose access.")) {
        await Storage.deleteToken(token);
        loadTokens();
    }
};

// --- PACKS LOGIC ---
async function loadPacks() {
    const tbody = document.querySelector('#packs-table tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Loading packs...</td></tr>';

    const packs = await Storage.getPacks();

    if (packs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No packs found. Create one above.</td></tr>';
        return;
    }

    tbody.innerHTML = packs.map(pack => `
        <tr>
            <td><strong>${escapeHtml(pack.name)}</strong></td>
            <td>${Storage.formatCurrency(pack.price)}</td>
            <td>
                <span class="badge ${pack.active ? 'badge-active' : 'badge-inactive'}">
                    ${pack.active ? 'ACTIVE' : 'HIDDEN'}
                </span>
            </td>
            <td>
                <button class="action-btn" onclick="editPack('${pack.id}')">Edit</button>
                <button class="action-btn" style="background:#cc0000" onclick="deletePack('${pack.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function savePack() {
    const idInput = document.getElementById('pack-id').value; // Empty if new
    const name = document.getElementById('pack-name').value;
    const price = parseFloat(document.getElementById('pack-price').value);
    const description = document.getElementById('pack-desc').value;
    const active = document.getElementById('pack-active').checked;

    if (!name || isNaN(price)) {
        alert("Please fill all fields correctly.");
        return;
    }

    let createdAt = Date.now();
    if (idInput) {
        // Fetch existing to keep createdAt? Or just update. 
        // For simplicity let's assume update doesn't change createdAt unless we want to fetch first.
        const existing = await Storage.getPackById(idInput);
        if (existing) createdAt = existing.createdAt;
    }

    const pack = {
        id: idInput || Storage.generateId(),
        name,
        price,
        description,
        active,
        createdAt
    };

    await Storage.savePack(pack);
    resetForm();
    loadPacks();
    alert(idInput ? "Pack updated!" : "Pack created!");
}

window.editPack = async (id) => {
    const pack = await Storage.getPackById(id);
    if (!pack) return;

    document.getElementById('pack-id').value = pack.id;
    document.getElementById('pack-name').value = pack.name;
    document.getElementById('pack-price').value = pack.price;
    document.getElementById('pack-desc').value = pack.description;
    document.getElementById('pack-active').checked = pack.active;

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deletePack = async (id) => {
    if (confirm("Are you sure? This action cannot be undone.")) {
        await Storage.deletePack(id);
        loadPacks();
    }
}

window.resetForm = () => {
    document.getElementById('pack-form').reset();
    document.getElementById('pack-id').value = '';
};

// --- ORDERS LOGIC ---
async function loadOrders() {
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading orders...</td></tr>';

    const orders = (await Storage.getOrders()).reverse(); // Newest first

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No orders yet.</td></tr>';
        return;
    }

    // Need to resolve pack names async or just show IDs?
    // Let's load packs once to map names
    const packs = await Storage.getPacks();

    tbody.innerHTML = orders.map(order => {
        const pack = packs.find(p => p.id === order.packId);
        const packName = pack ? pack.name : 'Unknown Pack';

        return `
            <tr>
                <td style="font-family:monospace; font-size:0.8rem;">${order.orderId}</td>
                <td>${escapeHtml(packName)}</td>
                <td>${Storage.formatCurrency(order.amount)}</td>
                <td style="font-family:monospace; font-size:0.9rem; color: #00ff88; font-weight:bold;">
                    ${order.payment_method === 'AMAZON_GC' ? escapeHtml(order.gift_card_code) : (order.razorpay_payment_id || 'N/A')}
                </td>
                <td>${new Date(order.purchasedAt).toLocaleDateString()}</td>
            </tr>
        `;
    }).join('');
}

// Helper
function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
