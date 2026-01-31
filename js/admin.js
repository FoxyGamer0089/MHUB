/**
 * admin.js
 * Admin Panel Logic
 */

// Simple client-side passcode. 
// INSTRUCTIONS: Change this to your desired secret.
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

    if (tabName === 'packs') {
        document.querySelector(`#tab-packs`).style.display = 'block';
        document.querySelector(`.tab-btn:nth-child(1)`).classList.add('active');
        loadPacks();
    } else {
        document.querySelector(`#tab-orders`).style.display = 'block';
        document.querySelector(`.tab-btn:nth-child(2)`).classList.add('active');
        loadOrders();
    }
};

// --- PACKS LOGIC ---
function loadPacks() {
    const packs = Storage.getPacks();
    const tbody = document.querySelector('#packs-table tbody');

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

function savePack() {
    const idInput = document.getElementById('pack-id').value; // Empty if new
    const name = document.getElementById('pack-name').value;
    const price = parseFloat(document.getElementById('pack-price').value);
    const description = document.getElementById('pack-desc').value;
    const active = document.getElementById('pack-active').checked;

    if (!name || isNaN(price)) {
        alert("Please fill all fields correctly.");
        return;
    }

    const pack = {
        id: idInput || Storage.generateId(),
        name,
        price,
        description,
        active,
        createdAt: idInput ? Storage.getPackById(idInput)?.createdAt : Date.now()
    };

    Storage.savePack(pack);
    resetForm();
    loadPacks();
    alert(idInput ? "Pack updated!" : "Pack created!");
}

window.editPack = (id) => {
    const pack = Storage.getPackById(id);
    if (!pack) return;

    document.getElementById('pack-id').value = pack.id;
    document.getElementById('pack-name').value = pack.name;
    document.getElementById('pack-price').value = pack.price;
    document.getElementById('pack-desc').value = pack.description;
    document.getElementById('pack-active').checked = pack.active;

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deletePack = (id) => {
    if (confirm("Are you sure? This action cannot be undone.")) {
        Storage.deletePack(id);
        loadPacks();
    }
}

window.resetForm = () => {
    document.getElementById('pack-form').reset();
    document.getElementById('pack-id').value = '';
};

// --- ORDERS LOGIC ---
function loadOrders() {
    const orders = Storage.getOrders().reverse(); // Newest first
    const tbody = document.querySelector('#orders-table tbody');

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No orders yet.</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const packName = Storage.getPackById(order.packId)?.name || 'Unknown Pack';
        return `
            <tr>
                <td style="font-family:monospace; font-size:0.8rem;">${order.orderId}</td>
                <td>${escapeHtml(packName)}</td>
                <td>${Storage.formatCurrency(order.amount)}</td>
                <td style="font-family:monospace; font-size:0.8rem;">${order.razorpay_payment_id}</td>
                <td>${new Date(order.purchasedAt).toLocaleDateString()} ${new Date(order.purchasedAt).toLocaleTimeString()}</td>
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
