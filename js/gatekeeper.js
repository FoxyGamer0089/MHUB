/**
 * gatekeeper.js
 * Protects pages from unauthorized access.
 */

(function () {
    const userToken = Storage.getUserToken();

    // If no token, or token is invalid
    if (!userToken || !Storage.validateToken(userToken)) {
        // Clear invalid token just in case
        if (userToken) localStorage.removeItem('mrd_user_token');

        // Redirect to Access Page
        window.location.href = 'access.html';
    }
})();
