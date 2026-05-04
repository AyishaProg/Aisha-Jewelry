document.addEventListener("DOMContentLoaded", async () => {
    console.log("Cart Script Loaded: v1.0.5");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");
    const cartCountElement = document.getElementById("cart-count");
    const clearCartBtn = document.getElementById("clear-cart");
    const checkoutBtn = document.getElementById("checkout-btn");

    // Load the array of IDs from localStorage
    let cartIds = JSON.parse(localStorage.getItem("ayisha_cart")) || [];
    const currencyFormatter = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });

    // Centralized API Base URL 
    // If testing with Live Server, use http://localhost:3000. 
    // If running via server.js, "" is correct.
    const API_BASE = window.location.port === "5500" ? "http://localhost:3000" : "";

    const getImagePath = (path) => {
        if (!path) return 'https://via.placeholder.com/80?text=No+Image'; // Default placeholder
        if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) return path; // Already a full URL, absolute path, or base64
        return `/images/${path}`; // Assume it's a filename and prepend /images/
    };

    const updateCartDisplay = (allProducts) => {
        // Update the navigation count
        if (cartCountElement) cartCountElement.innerText = cartIds.length;
        localStorage.setItem("ayisha_cart", JSON.stringify(cartIds));

        if (cartIds.length === 0) {
            cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
            cartTotalElement.innerText = currencyFormatter.format(0);
            return;
        }

        // Group IDs to show quantities (e.g., { "1": 2, "5": 1 })
        const quantities = cartIds.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});

        let grandTotal = 0;

        cartItemsContainer.innerHTML = Object.keys(quantities).map(id => {
            const product = allProducts.find(p => p.id == id);
            if (!product) return "";

            const itemTotal = product.price * quantities[id];
            grandTotal += itemTotal;

            return `
                <div class="cart-item">
                    <img src="${getImagePath(product.image)}" alt="${product.name}" width="80" style="border-radius:5px;" onerror="this.src='https://via.placeholder.com/80?text=Image+Missing'">
                    <div class="cart-item-info">
                        <h4>${product.name}</h4>
                        <div class="qty-controls">
                            <button class="qty-btn" data-action="decrease" data-id="${id}">-</button>
                            <span>${quantities[id]}</span>
                            <button class="qty-btn" data-action="increase" data-id="${id}">+</button>
                        </div>
                    </div>
                    <div class="cart-item-subtotal">
                        ${currencyFormatter.format(itemTotal)}
                    </div>
                    <button class="remove-btn" data-id="${id}">×</button>
                </div>
            `;
        }).join("");

        cartTotalElement.innerText = currencyFormatter.format(grandTotal);
    };

    try {
        const response = await fetch(`${API_BASE}/products`);
        const allProducts = await response.json();
        updateCartDisplay(allProducts);

        // Handle individual item removal using event delegation
        cartItemsContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("remove-btn")) {
                const idToRemove = e.target.getAttribute("data-id");
                // Remove all instances of this ID
                cartIds = cartIds.filter(id => id !== idToRemove);
                updateCartDisplay(allProducts);
            }
        });

        // Handle Quantity adjustments
        cartItemsContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("qty-btn")) {
                const id = e.target.getAttribute("data-id");
                const action = e.target.getAttribute("data-action");
                if (action === "increase") {
                    cartIds.push(id);
                } else if (action === "decrease") {
                    const index = cartIds.indexOf(id);
                    if (index > -1) cartIds.splice(index, 1);
                }
                updateCartDisplay(allProducts);
            }
        });

        clearCartBtn.addEventListener("click", () => {
            cartIds = [];
            updateCartDisplay(allProducts);
        });

        // ✅ WhatsApp Checkout Logic
        checkoutBtn.addEventListener("click", () => {
            if (cartIds.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            const quantities = cartIds.reduce((acc, id) => {
                acc[id] = (acc[id] || 0) + 1;
                return acc;
            }, {});

            let message = "Hello Ayisha Jewelry! I would like to place an order for the following:\n\n";
            Object.keys(quantities).forEach(id => {
                const product = allProducts.find(p => p.id == id);
                if (product) {
                    const lineTotal = product.price * quantities[id];
                    message += `- ${product.name} (x${quantities[id]}): GHS ${lineTotal}\n`;
                }
            });

            message += `\nTotal Amount: ${cartTotalElement.innerText}`;
            const whatsappUrl = `https://wa.me/233241398821?text=${encodeURIComponent(message)}`;
            
            // Use location.href for better app deep-linking support
            window.location.href = whatsappUrl;
        });
    } catch (err) {
        cartItemsContainer.innerHTML = "<p>Unable to load cart items at this time.</p>";
    }
});