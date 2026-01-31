/**
 * payment.js
 * Gift Card Integration Logic (Async)
 */

import { Storage } from './storage.js';

const AMAZON_GIFT_LINK = "https://amzn.in/d/4sKIc1Q";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const packId = urlParams.get('id');

    // Load Pack
    try {
        const pack = await Storage.getPackById(packId);
        if (!pack || !pack.active) {
            document.getElementById('error-screen').style.display = 'block';
            return;
        }

        // Render Summary
        document.getElementById('checkout-section').style.display = 'block';
        document.getElementById('item-name').textContent = pack.name;
        document.getElementById('total-amount').textContent = Storage.formatCurrency(pack.price);

        // Step 1: Buy Button
        document.getElementById('buy-gc-btn').onclick = () => {
            // Open small popup
            window.open(AMAZON_GIFT_LINK, 'AmazonGiftCard', 'width=500,height=700,status=yes,scrollbars=yes');
        };

        // Step 2: Submit Button
        document.getElementById('submit-payment-btn').onclick = () => {
            const dfUsername = document.getElementById('df-username').value.trim();
            const code = document.getElementById('gc-code').value.trim();
            validateAndSubmit(pack, dfUsername, code);
        };
    } catch (e) {
        console.error(e);
        document.getElementById('error-screen').style.display = 'block';
    }
});

async function validateAndSubmit(pack, dfUsername, code) {
    if (!dfUsername) {
        alert("Please enter your DF USERNAME. It is mandatory.");
        return;
    }

    if (!code || code.length < 5) { // Simple length check
        alert("Please paste a valid Gift Card Code.");
        return;
    }

    const orderId = 'ORD-' + Date.now();

    // Save Order with GC Code
    const order = {
        orderId: orderId,
        df_username: dfUsername,
        packId: pack.id,
        amount: pack.price,
        payment_method: 'AMAZON_GC',
        gift_card_code: code, // Saved for Admin
        status: "processing", // Admin must manually verify
        purchasedAt: Date.now()
    };

    // Show loading or disabling button could be good here
    document.getElementById('submit-payment-btn').innerText = "Processing...";

    await Storage.saveOrder(order);

    // Show Success UI
    document.getElementById('checkout-section').style.display = 'none';
    document.getElementById('success-section').style.display = 'block';
    document.getElementById('success-order-id').textContent = orderId;
}
