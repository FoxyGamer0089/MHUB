/**
 * home.js
 * Logic for the Home Page (Async)
 */

import { Storage } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
    const packsGrid = document.getElementById('packs-grid');

    // Show Loading State
    packsGrid.innerHTML = '<p class="text-center text-muted" style="grid-column: 1/-1; padding: 50px;">Loading exclusive packs from cloud...</p>';

    try {
        const activePacks = await Storage.getActivePacks();

        if (activePacks.length === 0) {
            packsGrid.innerHTML = `
                <div class="text-center" style="grid-column: 1/-1; padding: 50px;">
                    <p class="text-muted">No active packs available right now.</p>
                </div>
            `;
            return;
        }

        packsGrid.innerHTML = activePacks.map(pack => `
            <div class="card" onclick="window.location.href='pack.html?id=${pack.id}'" style="cursor: pointer;">
                <h3>${escapeHtml(pack.name)}</h3>
                <div class="description">${escapeHtml(truncate(pack.description, 80))}</div>
                <div class="price">${Storage.formatCurrency(pack.price)}</div>
                <button class="btn btn-block">View Details</button>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error loading packs:", error);
        packsGrid.innerHTML = '<p class="text-center" style="color: red; grid-column: 1/-1;">Error loading data.</p>';
    }
});

// Helper to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function truncate(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}
