document.addEventListener("DOMContentLoaded", () => {
    console.log("Main Script Loaded: v1.0.13");
    const container = document.querySelector(".products");
    const cartCountElement = document.getElementById("cart-count");
    const searchInput = document.getElementById("search-input");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const modal = document.getElementById("product-modal");
    const modalBody = document.getElementById("modal-body");

    // Centralized API Base URL 
    // If testing with Live Server, use http://localhost:3000. 
    // If running via server.js, "" is correct.
    const API_BASE = window.location.port === "5500" ? "http://localhost:3000" : ""; 

    // Helper function to ensure image paths are correct
    // If path is just a filename (e.g., "jew3.webp"), it prepends "/images/"
    // Otherwise, it assumes the path is already a full URL, absolute path, or base64 string.
    const getImagePath = (path) => {
        if (!path) return 'https://via.placeholder.com/200?text=No+Image'; // Default placeholder
        if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) return path; // Already a full URL, absolute path, or base64
        return `/images/${path}`; // Assume it's a filename and prepend /images/
    };

    let allProducts = [];
    let cart = [];
    try {
        const storedCart = localStorage.getItem("ayisha_cart");
        cart = storedCart ? JSON.parse(storedCart) : [];
        if (!Array.isArray(cart)) cart = [];
    } catch (e) {
        console.error("Cart initialization error:", e);
        cart = [];
    }
    
    const updateCartUI = () => {
        if (cartCountElement) cartCountElement.innerText = cart.length;
        localStorage.setItem("ayisha_cart", JSON.stringify(cart));
    };

    updateCartUI();

    const renderProducts = (productsToDisplay) => {
        if (!container) return;
        
        if (productsToDisplay.length === 0) {
            container.innerHTML = "<p>No products found matching your search.</p>";
            return;
        }

        // Generate the HTML string first
        const productsHTML = productsToDisplay.map(product => `
                <div class="product">
                    <img src="${getImagePath(product.image)}" alt="${product.name}" class="view-details" data-id="${product.id}" 
                         style="cursor:pointer; width: 100%; height: auto; aspect-ratio: 1/1; object-fit: cover;" 
                         width="250" height="250"
                         onerror="this.src='https://via.placeholder.com/250?text=Image+Missing'">
                    <h3>${product.name}</h3>
                    <p class="material">${product.material || 'Handcrafted'}</p>
                    <p class="price">${new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(product.price)}</p>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            `).join("");
        
        // Only update the DOM if the content has actually changed
        if (container.innerHTML !== productsHTML) {
            container.innerHTML = productsHTML;
        }
    };
    const openModal = (product) => {
        modalBody.innerHTML = `
            <div style="display:flex; gap:20px; flex-wrap:wrap;">
                <img src="${getImagePath(product.image)}" style="max-width:300px; border-radius:10px;" onerror="this.src='https://via.placeholder.com/300?text=Image+Missing'">
                <div style="flex:1; min-width:250px;">
                    <h2>${product.name}</h2>
                    <p><strong>Material:</strong> ${product.material || 'Handcrafted'}</p>
                    <p>${product.description}</p>
                    <h3>${new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(product.price)}</h3>
                </div>
            </div>
        `;
        modal.style.display = "block";
    };

    document.querySelector('.close-modal')?.addEventListener('click', () => {
        modal.style.display = "none";
    });

    // Use event delegation for product card actions (add to cart, view details)
    // This listener is attached ONCE and handles events for dynamically added elements.
    container.addEventListener('click', (e) => {
        // Handle "Add to Cart" button clicks
        const addBtn = e.target.closest('.add-to-cart');
        if (addBtn) {
            const productId = addBtn.getAttribute('data-id');
                if (productId) {
                    cart.push(productId);
                    updateCartUI();
                    const originalText = addBtn.innerText;
                    addBtn.innerText = "Added!";
                    setTimeout(() => addBtn.innerText = originalText, 1000);
                }
        }
        // Handle "View Details" image clicks
        else if (e.target.classList.contains('view-details')) {
            const productId = e.target.dataset.id;
            const product = allProducts.find(p => p.id == productId);
            if (product) openModal(product);
        }
    });

    // Initial fetch of products
    const loadProducts = () => {
        if (!container) return;
        
        fetch(`${API_BASE}/products`)
            .then(res => res.json())
            .then(data => {
            console.log(`✅ Success! Data received: ${data.length} products found.`);
            
            if (data.length > 0) {
                console.log("🔗 Click this to test your first image:");
                console.log(data[0].image);
            }

            console.table(data); // Helpful table to see the exact image paths
            allProducts = data;
                renderProducts(allProducts);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                if (container) container.innerHTML = `<p>Error connecting to server.</p>`;
            });
    };
    loadProducts(); // Call the function to load products initially

    // Filter and Search logic
    const handleFilter = () => {
        const searchTerm = searchInput?.value.toLowerCase() || "";
        const activeCategory = document.querySelector(".filter-btn.active")?.getAttribute("data-category") || "all";

        const filtered = allProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm) || p.description?.toLowerCase().includes(searchTerm);
            const matchesCategory = activeCategory === "all" || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
        renderProducts(filtered);
    };

    // Debounce logic: Wait 300ms after typing stops to prevent "blinking"
    let debounceTimer;
    searchInput?.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(handleFilter, 300);
    });

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            handleFilter();
        });
    });

    // Handle Contact Form Submission
    const contactForm = document.querySelector(".contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const name = contactForm.querySelector('input[type="text"]').value.trim();
            const email = contactForm.querySelector('input[type="email"]').value.trim();
            const message = contactForm.querySelector('textarea').value.trim();

            if (!name || !email || !message) {
                return alert("Please fill in all fields.");
            }

            try {
                const response = await fetch(`${API_BASE}/contact`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, message })
                });

                const result = await response.json();

                if (result.success) {
                    alert("Message sent successfully!");
                    contactForm.reset();
                } else {
                    alert("Failed to send message: " + result.message);
                }
            } catch (error) {
                console.error("Error sending message:", error);
                alert("There was an error connecting to the server.");
            }
        });
    }

    // ✅ Logic for specific "Report a Problem" links/buttons
    document.querySelectorAll('.report-problem, .email-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const recipient = "samaduayisha305@gmail.com";
            window.location.href = `mailto:${recipient}?subject=Problem%20Report&body=I%20would%20like%20to%20report%20a%20problem%20with...`;
        });
    });
}); // Corrected closing for DOMContentLoaded