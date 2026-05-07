/**
 * 1. VARIABLE DECLARATION & DOM SELECTING
 * Storing product data in an array and selecting HTML elements for manipulation.
 */
let allProducts = [];
const productGrid = document.getElementById('productGrid');
const loadingState = document.getElementById('loadingState');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const themeBtn = document.getElementById('themeBtn');
const cartStatus = document.getElementById('cartStatus');
const clearCartBtn = document.getElementById('clearCartBtn');

/**
 * 2. THEME TOGGLING (DOM MANIPULATION)
 * Uses a toggle method to switch between light and dark modes on the body element.
 */
themeBtn.onclick = () => {
    document.body.classList.toggle('dark-mode');
    themeBtn.innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
};

/**
 * 3. CART MANAGEMENT (LOCAL STORAGE & HOF)
 * Calculates total items using reduce and updates the UI based on saved LocalStorage data.
 */
const updateCartDisplay = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (cartStatus) cartStatus.innerText = `🛒 Items in Cart: ${count}`;
};

const clearCart = () => {
    localStorage.removeItem('cart');
    updateCartDisplay();
};

/**
 * 4. ASYNCHRONOUS DATA RETRIEVAL (PROMISES)
 * Fetches product data from the API and handles success or failure states.
 */
function fetchProducts() {
    loadingState.classList.remove('hidden');
    errorMessage.classList.add('hidden');

    fetch('https://fakestoreapi.com/products')
        .then(res => {
            if (!res.ok) throw new Error('API Fail');
            return res.json();
        })
        .then(data => {
            allProducts = data;
            loadingState.classList.add('hidden');
            populateCategories(data);
            displayProducts(data);
        })
        .catch(() => {
            loadingState.classList.add('hidden');
            errorMessage.textContent = "Failed to load data";
            errorMessage.classList.remove('hidden');
        });
}

/**
 * 5. DYNAMIC UI RENDERING (LOOPING & TEMPLATE STRINGS)
 * Iterates through the product array and generates HTML cards with truncated text.
 */
const displayProducts = (products) => {
    productGrid.innerHTML = '';
    
    if (!loadingState.classList.contains('hidden')) return;

    if (products.length === 0) {
        productGrid.innerHTML = `<p class="status-message">🔍 No products found.</p>`;
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="image-container"><img src="${p.image}" class="product-image"></div>
            <div class="product-title">${p.title.slice(0, 50)}...</div>
            <div class="product-price">$${p.price.toFixed(2)}</div>
            <div class="product-description">${p.description.slice(0, 60)}...</div>
            <div class="card-buttons">
                <button class="btn btn-view" id="view-${p.id}">View More</button>
                <button class="btn btn-add" id="add-${p.id}">Add to Cart</button>
            </div>
        `;
        productGrid.appendChild(card);
        
        document.getElementById(`view-${p.id}`).onclick = () => openModal(p.id);
        document.getElementById(`add-${p.id}`).onclick = (e) => addToCart(p.id, e);
    });
};

/**
 * 6. CART INTERACTION (SPREAD OPERATOR & DATA STRUCTURES)
 * Adds products to the cart array, handling duplicates by increasing quantity.
 */
const addToCart = (productId, event) => {
    const product = allProducts.find(p => p.id === productId);
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cart.findIndex(item => item.id === productId);

    if (index > -1) { 
        cart[index].quantity += 1; 
    } else { 
        cart.push({ ...product, quantity: 1 }); 
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();

    const btn = event.target;
    btn.innerText = '✅ Added!';
    setTimeout(() => btn.innerText = 'Add to Cart', 800);
};

/**
 * 7. FILTERING & SORTING (HOF ARRAY METHODS)
 * Uses filter for search and category selection, and sort for price ordering.
 */
const filterAndDisplay = () => {
    let filtered = allProducts.filter(p => 
        p.title.toLowerCase().includes(searchInput.value.toLowerCase())
    );
    
    if (categoryFilter.value !== 'all') {
        filtered = filtered.filter(p => p.category === categoryFilter.value);
    }
    
    if (sortSelect.value === 'low-high') filtered.sort((a,b) => a.price - b.price);
    if (sortSelect.value === 'high-low') filtered.sort((a,b) => b.price - a.price);

    displayProducts(filtered);
};

/**
 * 8. DYNAMIC DROPDOWN (SET & SPREAD)
 * Extracts unique categories from the data and populates the filter menu.
 */
const populateCategories = (data) => {
    const categories = ['all', ...new Set(data.map(p => p.category))];
    categoryFilter.innerHTML = categories.map(c => 
        `<option value="${c}">${c.toUpperCase()}</option>`
    ).join('');
};

/**
 * 9. MODAL INTERACTIVITY (DOM MANIPULATING)
 * Manages the modal visibility and injects detailed product information.
 */
const openModal = (id) => {
    const p = allProducts.find(item => item.id === id);
    document.getElementById('modalBody').innerHTML = `
        <div class="modal-details">
            <img src="${p.image}">
            <h2>${p.title}</h2>
            <p style="color:var(--success-green); font-size:20px; font-weight:bold">$${p.price}</p>
            <p style="margin-top:10px">${p.description}</p>
        </div>
    `;
    document.getElementById('productModal').classList.remove('hidden');
};

// Event Listeners for user interactions
searchInput.oninput = filterAndDisplay;
categoryFilter.onchange = filterAndDisplay;
sortSelect.onchange = filterAndDisplay;
clearCartBtn.onclick = clearCart;
document.querySelector('.close-button').onclick = () => document.getElementById('productModal').classList.add('hidden');
window.onclick = (e) => { if(e.target.classList.contains('modal')) e.target.classList.add('hidden'); };

// Initialization calls
updateCartDisplay();
fetchProducts();