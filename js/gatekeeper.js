/**
 * gatekeeper.js
 * Protects pages from unauthorized access using Firestore validation.
 */

import { Storage } from './storage.js';

(async function () {
    const userToken = Storage.getUserToken();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // List of protected pages
    const protectedPages = ['index.html', 'pack.html', 'pay.html'];

    if (protectedPages.includes(currentPage)) {
        if (!userToken) {
            window.location.href = 'access.html';
            return;
        }

        const isValid = await Storage.validateToken(userToken);
        if (!isValid) {
            // Clear invalid token just in case
            localStorage.removeItem('mrd_user_token');
            // Redirect to Access Page if invalid
            window.location.href = 'access.html';
        }
    }
})();
