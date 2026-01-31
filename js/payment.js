/**
 * payment.js
 * Razorpay Integration Logic
 */

// ⚠️ IMPORTANT: REPLACE THIS WITH YOUR REAL RAZORPAY KEY ID
const RAZORPAY_KEY_ID = "rzp_test_S8X93NUrtx5Pm3";

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const packId = urlParams.get('id');

    // Load Pack
    const pack = Storage.getPackById(packId);
    if (!pack || !pack.active) {
        document.getElementById('error-screen').style.display = 'block';
        return;
    }

    // Render Summary
    document.getElementById('checkout-section').style.display = 'block';
    document.getElementById('item-name').textContent = pack.name;
    document.getElementById('total-amount').textContent = Storage.formatCurrency(pack.price);

    // Initialize Razorpay
    document.getElementById('rzp-button').onclick = function (e) {
        e.preventDefault();
        startPayment(pack);
    };
});

function startPayment(pack) {
    if (RAZORPAY_KEY_ID === "rzp_test_YOUR_KEY_HERE") {
        alert("SETUP REQUIRED: Please open js/payment.js and add your Razorpay Key ID.");
        // For testing purposes so the user can see the flow even without a key, 
        // I'll allow it to fail gracefully or mock it ONLY IF the user expressly asked for NO MOCK.
        // The user said: "NO simulated payment" and "Use LIVE Razorpay". 
        // So I must rely on the script. If Key is invalid, Razorpay script will show an error, which is correct behavior.
    }

    const options = {
        "key": RAZORPAY_KEY_ID,
        "amount": pack.price * 100, // Amount in paise
        "currency": "INR",
        "name": "MR DADDY HUB",
        "description": pack.name,
        "image": "", // Optional logo
        "handler": function (response) {
            // SUCCESS HANDLER
            handleSuccess(pack, response);
        },
        "prefill": {
            "name": "Anonymous Guest", // Default anonymous name
            "email": "guest@mrdaddy.hub",
            "contact": ""
        },
        "notes": {
            "pack_id": pack.id
        },
        "theme": {
            "color": "#ff0055"
        },
        "modal": {
            "ondismiss": function () {
                console.log('Checkout form closed');
            }
        }
    };

    const rzp1 = new Razorpay(options);

    rzp1.on('payment.failed', function (response) {
        alert("Payment Failed: " + response.error.description);
    });

    rzp1.open();
}

function handleSuccess(pack, response) {
    const orderId = 'ORD-' + Date.now();

    const order = {
        orderId: orderId,
        packId: pack.id,
        amount: pack.price,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id || 'N/A', // might be empty in standard checkout if not pre-created
        status: "success",
        purchasedAt: Date.now()
    };

    // Save to LocalStorage
    Storage.saveOrder(order);

    // Show Success UI
    document.getElementById('checkout-section').style.display = 'none';
    document.getElementById('success-section').style.display = 'block';

    document.getElementById('success-order-id').textContent = orderId;
    document.getElementById('success-amount').textContent = Storage.formatCurrency(pack.price);
}
