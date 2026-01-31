/**
 * pack.js
 * Logic for Pack Details (Async)
 */

import { Storage } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const packId = urlParams.get('id');

    if (!packId) {
        showError();
        return;
    }

    // Show loading? Or just wait.
    try {
        const pack = await Storage.getPackById(packId);

        if (!pack || !pack.active) {
            showError();
            return;
        }

        // Render Data
        document.getElementById('pack-content').style.display = 'block';
        document.getElementById('pack-name').textContent = pack.name;
        document.getElementById('pack-price').textContent = Storage.formatCurrency(pack.price);
        document.getElementById('pack-desc').textContent = pack.description;

        // Setup Buy Button
        document.getElementById('buy-btn').onclick = () => {
            // Redirect to Pay page with ID
            window.location.href = `pay.html?id=${pack.id}`;
        };
    } catch (error) {
        console.error(error);
        showError();
    }
});

function showError() {
    document.getElementById('error-screen').style.display = 'block';
    document.getElementById('pack-content').style.display = 'none';
}
