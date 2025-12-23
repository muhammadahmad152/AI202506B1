// app.js
const products = [
  { id: 1, title: 'Oxford Shirt', category: 'tops', price: 4500, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop', desc: 'Classic fit, breathable cotton.', stock: true },
  { id: 2, title: 'Chino Pants', category: 'bottoms', price: 6500, image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3c08?q=80&w=800&auto=format&fit=crop', desc: 'Tapered, 2-way stretch.', stock: true },
  { id: 3, title: 'Lightweight Jacket', category: 'outerwear', price: 11500, image: 'https://images.unsplash.com/photo-1520972915495-5b74a5e985c1?q=80&w=800&auto=format&fit=crop', desc: 'Water-resistant shell.', stock: false },
  { id: 4, title: 'Crewneck Tee', category: 'tops', price: 1990, image: 'https://images.unsplash.com/photo-1520975536408-6a6fa9b14910?q=80&w=800&auto=format&fit=crop', desc: 'Supima cotton, soft touch.', stock: true },
];

let cart = JSON.parse(localStorage.getItem('cart') || '[]');

const grid = document.getElementById('product-grid');
const modal = document.getElementById('product-modal');
const cartDrawer = document.getElementById('cart-drawer');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');

const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');
const modalDesc = document.getElementById('modal-desc');
const modalSize = document.getElementById('modal-size');
const addToCartBtn = document.getElementById('add-to-cart');

let currentProduct = null;

function formatPrice(n) { return `Rs ${n.toLocaleString('en-PK')}`; }
function updateYear() { document.getElementById('year').textContent = new Date().getFullYear(); }
function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }
function updateCartBadge() { cartCount.textContent = cart.reduce((sum, i) => sum + i.qty, 0); }

function renderProducts(list) {
  grid.innerHTML = '';
  list.forEach(p => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <div class="card-body">
        <div class="card-title">${p.title}</div>
        <div class="card-price">${formatPrice(p.price)}</div>
        <div class="card-actions">
          <button class="view">View</button>
          <button class="primary" ${!p.stock ? 'disabled' : ''}>Add</button>
        </div>
      </div>
    `;
    el.querySelector('.view').addEventListener('click', () => openModal(p));
    el.querySelector('.primary').addEventListener('click', () => addToCart(p, 'M'));
    grid.appendChild(el);
  });
}

function openModal(p) {
  currentProduct = p;
  modalImage.src = p.image;
  modalImage.alt = p.title;
  modalTitle.textContent = p.title;
  modalPrice.textContent = formatPrice(p.price);
  modalDesc.textContent = p.desc;
  addToCartBtn.disabled = !p.stock;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  currentProduct = null;
}

function openCart() {
  cartDrawer.classList.remove('hidden');
  cartDrawer.setAttribute('aria-hidden', 'false');
  renderCart();
}

function closeCart() {
  cartDrawer.classList.add('hidden');
  cartDrawer.setAttribute('aria-hidden', 'true');
}

function addToCart(p, size) {
  const existing = cart.find(i => i.id === p.id && i.size === size);
  if (existing) existing.qty += 1;
  else cart.push({ id: p.id, title: p.title, price: p.price, size, image: p.image, qty: 1 });
  saveCart();
  updateCartBadge();
  renderCart();
  openCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;">
        <img src="${item.image}" alt="${item.title}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;" />
        <div>
          <div style="font-weight:600">${item.title}</div>
          <div style="color:#6b7280">Size ${item.size} · ${formatPrice(item.price)}</div>
          <div style="display:flex;gap:8px;align-items:center;margin-top:6px;">
            <button class="qty-minus">-</button>
            <span>${item.qty}</span>
            <button class="qty-plus">+</button>
            <button class="remove" style="margin-left:auto;">Remove</button>
          </div>
        </div>
      </div>
    `;
    row.querySelector('.qty-minus').addEventListener('click', () => {
      item.qty = Math.max(1, item.qty - 1);
      saveCart(); updateCartBadge(); renderCart();
    });
    row.querySelector('.qty-plus').addEventListener('click', () => {
      item.qty += 1;
      saveCart(); updateCartBadge(); renderCart();
    });
    row.querySelector('.remove').addEventListener('click', () => removeFromCart(idx));
    cartItems.appendChild(row);
  });
  cartTotal.textContent = `Total: ${formatPrice(total)}`;
}

function applyFilters() {
  const cat = document.getElementById('filter-category').value;
  const price = document.getElementById('filter-price').value;
  let list = [...products];
  if (cat !== 'all') list = list.filter(p => p.category === cat);
  if (price !== 'all') {
    list = list.filter(p => {
      if (price === 'under-5k') return p.price < 5000;
      if (price === '5k-10k') return p.price >= 5000 && p.price <= 10000;
      return p.price > 10000;
    });
  }
  renderProducts(list);
}

document.addEventListener('DOMContentLoaded', () => {
  updateYear();
  renderProducts(products);
  updateCartBadge();

  document.querySelector('.cart-btn').addEventListener('click', openCart);
  document.querySelector('.drawer-close').addEventListener('click', closeCart);
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  addToCartBtn.addEventListener('click', () => {
    if (!currentProduct) return;
    addToCart(currentProduct, modalSize.value);
    closeModal();
  });

  document.getElementById('filter-category').addEventListener('change', applyFilters);
  document.getElementById('filter-price').addEventListener('change', applyFilters);

  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks! We will get back to you soon.');
    e.target.reset();
  });

  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
});
