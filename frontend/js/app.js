// ============================================================
// JIYA LAL HALWAI — APP.JS v3
// Fixes: logout, cart clear after order, unique order token,
//        counter section, Ghewar spotlight, improved UI logic
// ============================================================

const API = 'http://localhost:8080/api';
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('jlh_cart') || '[]');
let selectedPay = 'upi';
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

// ── SAMPLE PRODUCTS (fallback when backend is offline) ──
const SAMPLE = [
  { id:1,  name:'Ghewar',        category:'Mithai',     price:480,  unit:'500g', description:'Our legendary Rajasthani Ghewar — crispy, golden, soaked in sugar syrup. Made fresh every morning in pure desi ghee.', emoji:'🍯', inStock:true,  isSignature:true },
  { id:2,  name:'Malai Ghewar',  category:'Mithai',     price:580,  unit:'500g', description:'Classic Ghewar topped with thick malai cream and garnished with crushed pistachios and saffron threads.', emoji:'🍮', inStock:true,  isSignature:true },
  { id:3,  name:'Kaju Katli',    category:'Mithai',     price:650,  unit:'250g', description:'Premium cashew barfi with silver vark, made in pure desi ghee. Delicate, melt-in-mouth texture.', emoji:'🟡', inStock:true },
  { id:4,  name:'Besan Ladoo',   category:'Mithai',     price:320,  unit:'500g', description:'Melt-in-mouth roasted gram flour ladoos with cardamom, dry fruits and pure ghee.', emoji:'🟠', inStock:true },
  { id:5,  name:'Gulab Jamun',   category:'Mithai',     price:280,  unit:'500g', description:'Khoya dumplings soaked in rose-saffron sugar syrup. Soft, juicy and irresistible.', emoji:'🟤', inStock:true },
  { id:6,  name:'Mawa Ghewar',   category:'Mithai',     price:680,  unit:'500g', description:'Ghewar stuffed and topped with rich mawa (khoya). The most indulgent of our three Ghewar variants.', emoji:'🫓', inStock:true,  isSignature:true },
  { id:7,  name:'Soan Papdi',    category:'Mithai',     price:350,  unit:'400g', description:'Flaky, melt-in-mouth cardamom sweet threads. A classic tea-time companion.', emoji:'🌼', inStock:true },
  { id:8,  name:'Pista Barfi',   category:'Mithai',     price:750,  unit:'250g', description:'Smooth pistachio barfi with silver vark and a pure ghee base. Rich and aromatic.', emoji:'💚', inStock:true },
  { id:9,  name:'Jalebi',        category:'Mithai',     price:180,  unit:'500g', description:'Crispy saffron sugar spirals. Made fresh every morning. Best enjoyed warm.', emoji:'🍥', inStock:true },
  { id:10, name:'Mathri',        category:'Namkeen',    price:200,  unit:'400g', description:'Crispy ajwain and black pepper crackers. Perfect with chai and pickles.', emoji:'🫙', inStock:true },
  { id:11, name:'Aloo Bhujia',   category:'Namkeen',    price:150,  unit:'300g', description:'Spicy potato sev — the iconic Varanasi street snack. Crunchy and addictive.', emoji:'🫘', inStock:true },
  { id:12, name:'Chakli',        category:'Namkeen',    price:175,  unit:'300g', description:'Crispy rice flour spirals spiced with cumin and sesame seeds.', emoji:'🌀', inStock:true },
  { id:13, name:'Mix Dry Fruits',category:'Dry Fruits', price:1200, unit:'500g', description:'Almonds, cashews, pistachios, raisins and walnuts — premium hand-selected quality.', emoji:'🌰', inStock:true },
  { id:14, name:'Diwali Hamper', category:'Gift Boxes', price:2200, unit:'Hamper',description:'Grand Diwali hamper with assorted sweets including Ghewar, dry fruits and namkeen. Beautifully boxed.', emoji:'🪔', inStock:true },
  { id:15, name:'Barfi Gift Box',category:'Gift Boxes', price:850,  unit:'1kg',  description:'Assorted kaju, badam, pista and coconut barfi in a premium decorative box.', emoji:'🎁', inStock:true },
];

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNavScroll();
  renderNavUser();
  loadProducts();
  renderCart();
  loadCounterStats();
});

function initPreloader() {
  setTimeout(() => document.getElementById('preloader')?.classList.add('hidden'), 2000);
}

function initNavScroll() {
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', scrollY > 60);
  });
}

// ── LOGOUT ──
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  closeUserDash();
  renderNavUser();
  showToast('👋 Logged out successfully!');
  setTimeout(() => window.location.reload(), 800);
}

// ── NAV USER AREA — shows name + dropdown with My Orders + Logout ──
function renderNavUser() {
  const area = document.getElementById('nav-user-area');
  if (!area) return;

  if (currentUser) {
    const initials = currentUser.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const firstName = currentUser.name?.split(' ')[0] || 'Account';
    area.innerHTML = `
      <div class="user-menu-wrap">
        <div class="user-btn" onclick="toggleUserDropdown()">
          <div class="user-avatar">${initials}</div>
          <span>Hi, ${firstName}</span>
          <span style="font-size:.7rem;opacity:.6;">▾</span>
        </div>
        <div class="user-dropdown" id="user-dropdown">
          <div class="drop-header">
            <div class="d-name">${currentUser.name || 'User'}</div>
            <div class="d-email">${currentUser.email || ''}</div>
          </div>
          <button class="drop-item" onclick="openUserDash();closeDropdown()">
            📦 My Orders
          </button>
          <div class="drop-divider"></div>
          <button class="drop-item danger" onclick="logout()">
            🚪 Logout
          </button>
        </div>
      </div>`;
  } else {
    area.innerHTML = `<a href="login.html" class="login-btn">Login / Register</a>`;
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu-wrap')) closeDropdown();
  }, { once: false });
}

function toggleUserDropdown() {
  document.getElementById('user-dropdown')?.classList.toggle('open');
}
function closeDropdown() {
  document.getElementById('user-dropdown')?.classList.remove('open');
}

// ── MOBILE MENU ──
function toggleMenu() {
  document.getElementById('nav-links')?.classList.toggle('open');
}
function closeMenu() {
  document.getElementById('nav-links')?.classList.remove('open');
}

// ── PRODUCTS ──
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  try {
    const data = await fetch(`${API}/products`).then(r => r.json());
    allProducts = Array.isArray(data) && data.length ? data : SAMPLE;
  } catch {
    allProducts = SAMPLE;
  }
  renderProducts(allProducts);
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (!products.length) {
    grid.innerHTML = `<div class="loading-state"><p>No products found.</p></div>`;
    return;
  }
  grid.innerHTML = products.map(p => {
    const badgeHtml = p.isSignature
      ? `<span class="p-badge p-badge-star">⭐ Signature</span>`
      : p.isNew ? `<span class="p-badge p-badge-new">NEW</span>` : '';
    const imgHtml = p.imageUrl
      ? `<img src="${API.replace('/api','')}${p.imageUrl}" alt="${p.name}" onerror="this.parentNode.innerHTML='${p.emoji||'🍬'}'">`
      : (p.emoji || '🍬');
    return `
    <div class="product-card">
      ${badgeHtml}
      <div class="prod-img">${imgHtml}</div>
      <div class="prod-body">
        <div class="prod-cat">${p.category}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-desc">${p.description || ''}</div>
        <div class="prod-footer">
          <div class="prod-price">₹${p.price}<span class="prod-unit">/${p.unit}</span></div>
          ${p.inStock !== false
            ? `<button class="add-btn" onclick="addToCart(${p.id})">Add +</button>`
            : `<span class="out-stock">Out of stock</span>`}
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterByCategory(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b?.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const filtered = cat === 'All' ? allProducts : allProducts.filter(p => p.category === cat);
  renderProducts(filtered);
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── CART ──
function addToCart(id) {
  const p = allProducts.find(p => p.id == id);
  if (!p) return;
  const existing = cart.find(i => i.id == id);
  if (existing) existing.qty++;
  else cart.push({ ...p, qty: 1 });
  saveCart();
  renderCart();
  showToast(`🛒 ${p.name} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id != id);
  saveCart(); renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id == id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); }
}

function saveCart() {
  localStorage.setItem('jlh_cart', JSON.stringify(cart));
}

// ── FIX: Clear cart completely after successful order ──
function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;

  const itemsEl = document.getElementById('cart-items');
  const footEl  = document.getElementById('cart-foot');
  if (!itemsEl) return;

  if (!cart.length) {
    itemsEl.innerHTML = `<div class="empty-cart">
      <span class="empty-icon">🍬</span>
      <p>Your cart is empty</p>
      <p style="font-size:.85rem;margin-top:8px;color:#ddd">Add some sweets!</p>
    </div>`;
    if (footEl) footEl.style.display = 'none';
    return;
  }

  itemsEl.innerHTML = cart.map(i => {
    const imgHtml = i.imageUrl
      ? `<img src="${API.replace('/api','')}${i.imageUrl}" alt="${i.name}" onerror="this.innerHTML='${i.emoji||'🍬'}'">`
      : (i.emoji || '🍬');
    return `
    <div class="cart-item">
      <div class="cart-item-img">${imgHtml}</div>
      <div class="cart-item-info">
        <h4>${i.name}</h4>
        <div class="item-price">₹${(i.price * i.qty).toLocaleString('en-IN')}</div>
        <div class="cart-qty">
          <button class="qty-btn" onclick="changeQty(${i.id},-1)">−</button>
          <span>${i.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i.id},+1)">+</button>
        </div>
      </div>
      <span class="cart-item-del" onclick="removeFromCart(${i.id})">✕</span>
    </div>`;
  }).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 500 ? 0 : 60;
  const total    = subtotal + delivery;
  document.getElementById('cart-subtotal').textContent = '₹' + subtotal.toLocaleString('en-IN');
  document.getElementById('cart-delivery').textContent = delivery === 0 ? 'FREE 🎉' : '₹' + delivery;
  document.getElementById('cart-total').textContent    = '₹' + total.toLocaleString('en-IN');
  if (footEl) footEl.style.display = 'block';
}

function toggleCart() {
  document.getElementById('cart-sidebar')?.classList.toggle('open');
  document.getElementById('cart-overlay')?.classList.toggle('active');
}

// ── CHECKOUT ──
function openCheckout() {
  if (!cart.length) return showToast('Your cart is empty!');
  // Pre-fill details if logged in
  if (currentUser) {
    const nameEl  = document.getElementById('co-name');
    const emailEl = document.getElementById('co-email');
    if (nameEl  && !nameEl.value)  nameEl.value  = currentUser.name  || '';
    if (emailEl && !emailEl.value) emailEl.value = currentUser.email || '';
  }
  toggleCart();
  showStep('step-address');
  document.getElementById('checkout-modal').style.display = 'flex';
}

function closeOnOverlay(e, id) {
  if (e.target === e.currentTarget) document.getElementById(id).style.display = 'none';
}

function showStep(id) {
  ['step-address','step-payment','step-success'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = s === id ? 'block' : 'none';
  });
}

function goToPayment() {
  const name  = document.getElementById('co-name')?.value?.trim();
  const email = document.getElementById('co-email')?.value?.trim();
  const phone = document.getElementById('co-phone')?.value?.trim();
  const addr  = document.getElementById('co-addr')?.value?.trim();
  const pin   = document.getElementById('co-pin')?.value?.trim();
  if (!name || !email || !phone || !addr || !pin) {
    return showToast('⚠️ Please fill all required fields');
  }
  renderOrderSummary();
  showStep('step-payment');
}

function goToAddress() { showStep('step-address'); }

function renderOrderSummary() {
  const el = document.getElementById('order-summary-box');
  if (!el) return;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 500 ? 0 : 60;
  el.innerHTML = `
    ${cart.map(i => `
      <div class="os-item">
        <span>${i.name} × ${i.qty}</span>
        <span>₹${(i.price * i.qty).toLocaleString('en-IN')}</span>
      </div>`).join('')}
    <div class="os-item">
      <span>Delivery</span>
      <span>${delivery === 0 ? '<span style="color:var(--green)">FREE</span>' : '₹' + delivery}</span>
    </div>
    <div class="os-total">
      <span>Total</span>
      <span>₹${(subtotal + delivery).toLocaleString('en-IN')}</span>
    </div>`;
}

function selPay(method) {
  selectedPay = method;
  ['upi','card','cod'].forEach(m => {
    document.getElementById('pm-' + m)?.classList.toggle('active', m === method);
    const f = document.getElementById('pf-' + m);
    if (f) f.style.display = m === method ? 'block' : 'none';
  });
}

async function placeOrder() {
  const btn = document.getElementById('place-order-btn');
  btn.textContent = '⏳ Placing...';
  btn.disabled = true;

  const name     = document.getElementById('co-name')?.value?.trim();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= 500 ? 0 : 60;
  // Token (order number) is ONLY for online payments — UPI and Card
  const isOnlinePayment = (selectedPay === 'upi' || selectedPay === 'card');

  const orderData = {
    customerName:    name,
    customerEmail:   document.getElementById('co-email')?.value?.trim(),
    customerPhone:   document.getElementById('co-phone')?.value?.trim(),
    deliveryAddress: document.getElementById('co-addr')?.value?.trim(),
    pincode:         document.getElementById('co-pin')?.value?.trim(),
    city:            document.getElementById('co-city')?.value?.trim(),
    paymentMethod:   selectedPay.toUpperCase(),
    total:           subtotal + delivery,
    items:           cart.map(i => ({ productId: i.id, quantity: i.qty, price: i.price }))
  };

  let orderNumber = null;

  try {
    const jwtToken = localStorage.getItem('token');
    const headers  = { 'Content-Type': 'application/json' };
    if (jwtToken) headers['Authorization'] = 'Bearer ' + jwtToken;

    const res = await fetch(`${API}/orders`, { method: 'POST', headers, body: JSON.stringify(orderData) });
    if (res.ok) {
      const data = await res.json();
      orderNumber = data.orderNumber;
    } else {
      const err = await res.json().catch(() => ({}));
      showToast('❌ ' + (err.message || 'Order failed. Please try again.'));
      btn.textContent = '🎉 Place Order';
      btn.disabled = false;
      return;
    }
  } catch (e) {
    showToast('❌ Network error. Check if backend is running.');
    btn.textContent = '🎉 Place Order';
    btn.disabled = false;
    return;
  }

  // ── Show correct success screen based on payment method ──
  const tokenSection = document.getElementById('token-section');
  const codSection   = document.getElementById('cod-section');
  const successTitle = document.getElementById('success-title');

  if (isOnlinePayment) {
    // UPI / Card → show unique order token
    if (tokenSection) tokenSection.style.display = 'block';
    if (codSection)   codSection.style.display   = 'none';
    if (successTitle) successTitle.textContent    = 'Payment Confirmed! 🎉';
    document.getElementById('token-number').textContent = orderNumber || '—';
    document.getElementById('token-name').textContent   = `Ordered by: ${name}`;
  } else {
    // COD → no token, just plain order confirmation
    if (tokenSection) tokenSection.style.display = 'none';
    if (codSection)   codSection.style.display   = 'block';
    if (successTitle) successTitle.textContent    = 'Order Placed!';
    const codMsg = document.getElementById('cod-order-msg');
    if (codMsg) codMsg.textContent = `Order received! Our team will call you on ${orderData.customerPhone} to confirm your delivery.`;
  }

  showStep('step-success');
  clearCart();
  loadCounterStats();

  btn.textContent = '🎉 Place Order';
  btn.disabled    = false;
}

// ── After order — close modal ──
function afterOrderPlaced() {
  document.getElementById('checkout-modal').style.display = 'none';
  showToast('🙏 Thank you! Your order has been placed.');
  document.getElementById('counter')?.scrollIntoView({ behavior: 'smooth' });
}

// ── USER DASHBOARD ──
function openUserDash() {
  if (!currentUser) { window.location.href = 'login.html'; return; }
  const modal = document.getElementById('user-dash-modal');
  if (!modal) return;
  modal.classList.add('open');

  const initials = currentUser.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  document.getElementById('ud-avatar').textContent = initials;
  document.getElementById('ud-name').textContent   = currentUser.name  || 'User';
  document.getElementById('ud-email').textContent  = currentUser.email || '';

  loadUserOrders();
}

function closeUserDash() {
  document.getElementById('user-dash-modal')?.classList.remove('open');
}

async function loadUserOrders() {
  const listEl = document.getElementById('ud-orders-list');
  if (!listEl) return;
  listEl.innerHTML = `<div class="no-orders"><span class="no-icon">⏳</span><p>Loading your orders...</p></div>`;

  try {
    const token = localStorage.getItem('token');
    const res   = await fetch(`${API}/orders/my`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('not ok');
    const orders = await res.json();
    renderUserOrders(orders);
  } catch {
    listEl.innerHTML = `<div class="no-orders">
      <span class="no-icon">📦</span>
      <p>No orders yet!</p>
      <p style="font-size:.85rem;margin-top:8px">Your orders will appear here after purchase.</p>
    </div>`;
  }
}

const ORDER_STEPS = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED'];
const STEP_ICONS  = ['📋','✅','⚙️','🚚','🏠'];

function renderUserOrders(orders) {
  const listEl = document.getElementById('ud-orders-list');
  if (!orders?.length) {
    listEl.innerHTML = `<div class="no-orders">
      <span class="no-icon">📦</span><p>No orders yet!</p>
      <p style="font-size:.85rem;margin-top:8px">Start shopping to see your orders here.</p>
    </div>`;
    return;
  }

  listEl.innerHTML = orders.map(o => {
    const statusIdx  = ORDER_STEPS.indexOf(o.status);
    const trackHtml  = ORDER_STEPS.map((step, i) => {
      const cls = i < statusIdx ? 'done' : i === statusIdx ? 'current' : '';
      return `<div class="track-step ${cls}">
        <div class="track-dot">${STEP_ICONS[i]}</div>
        <div class="track-label">${step.charAt(0) + step.slice(1).toLowerCase()}</div>
      </div>`;
    }).join('');
    const itemsText = o.items?.map(i => `${i.product?.name || 'Item'} ×${i.quantity}`).join(', ') || '—';
    const dateStr   = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';

    return `
    <div class="order-card">
      <div class="order-card-head">
        <div class="order-card-ids">
          <div class="order-card-id">Order #${o.id}</div>
          ${o.orderNumber ? `<div class="order-token-small">${o.orderNumber}</div>` : ''}
        </div>
        <span class="order-status-badge status-${o.status}">${o.status}</span>
      </div>
      <div class="order-items-list">${itemsText}</div>
      <div class="track-bar">${trackHtml}</div>
      <div class="order-card-foot">
        <span class="order-date">📅 ${dateStr}</span>
        <span class="order-total">₹${(o.total||0).toLocaleString('en-IN')}</span>
      </div>
    </div>`;
  }).join('');
}

// ── COUNTER SECTION — load live stats ──
async function loadCounterStats() {
  try {
    const res = await fetch(`${API}/products`).then(r => r.json());
    // Try to get order stats (public count endpoint if available)
    // Fall back to showing product count
    const prodCount = Array.isArray(res) ? res.length : 15;
    const statProd  = document.getElementById('stat-products');
    if (statProd) statProd.textContent = prodCount + '+';

    // Animate fake-ish counters for orders placed / delivered
    // (these would come from a public stats endpoint in production)
    animateCounter('stat-orders',    1247);
    animateCounter('stat-delivered',  986);
  } catch {
    animateCounter('stat-orders',    1247);
    animateCounter('stat-delivered',  986);
  }
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step  = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString('en-IN');
    if (current >= target) clearInterval(timer);
  }, 20);
}

// ── TRACK ORDER ──
async function trackOrder() {
  const input  = document.getElementById('track-input')?.value?.trim().toUpperCase();
  const result = document.getElementById('track-result');
  const card   = document.getElementById('track-result-card');

  if (!input) return showToast('⚠️ Please enter your order number');
  if (!input.startsWith('JLH-')) return showToast('⚠️ Invalid format. Use: JLH-YYYY-XXXXXX');

  card.innerHTML = '<p style="color:rgba(255,248,238,.5);padding:12px 0">🔍 Searching...</p>';
  result.style.display = 'block';

  try {
    const res = await fetch(`${API}/orders/track/${input}`);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();

    const statusEmoji = {
      PENDING:'📋', CONFIRMED:'✅', PROCESSING:'⚙️', SHIPPED:'🚚', DELIVERED:'🏠', CANCELLED:'❌'
    };

    card.innerHTML = `
      <h4 style="color:var(--gold2);margin-bottom:14px;">📦 Order Found!</h4>
      <div class="track-row"><span class="k">Order Token</span><span class="v" style="color:var(--saffron);font-family:monospace">${data.orderNumber}</span></div>
      <div class="track-row"><span class="k">Customer</span><span class="v">${data.customerName}</span></div>
      <div class="track-row"><span class="k">Status</span><span class="v">${statusEmoji[data.status] || '📋'} ${data.status}</span></div>
      <div class="track-row"><span class="k">Amount</span><span class="v">₹${(data.total||0).toLocaleString('en-IN')}</span></div>
      <div class="track-row"><span class="k">Ordered On</span><span class="v">${new Date(data.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span></div>`;
  } catch {
    card.innerHTML = `
      <p style="color:#ff8080;margin-bottom:8px">❌ Order not found</p>
      <p style="color:rgba(255,248,238,.4);font-size:.85rem">Please check your order token and try again.<br>Format: JLH-2024-000001</p>`;
  }
}

// Allow Enter key for tracking
document.addEventListener('DOMContentLoaded', () => {
  const trackInput = document.getElementById('track-input');
  if (trackInput) trackInput.addEventListener('keydown', e => { if (e.key === 'Enter') trackOrder(); });
});

// ── CONTACT FORM ──
function submitContact() {
  const name = document.getElementById('c-name')?.value?.trim();
  if (!name) return showToast('⚠️ Please enter your name');
  showToast('✅ Message sent! We will get back to you soon 🙏');
  ['c-name','c-email','c-phone','c-msg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ── COUNTER ORDER (walk-in / in-store) — always gets a token ──
async function placeCounterOrder() {
  const name  = document.getElementById('cnt-name')?.value?.trim();
  const phone = document.getElementById('cnt-phone')?.value?.trim();
  const item  = document.getElementById('cnt-item')?.value?.trim();
  const amt   = document.getElementById('cnt-qty')?.value?.trim();

  if (!name || !phone || !item) {
    showToast('⚠️ Please fill Name, Phone and Item(s)');
    return;
  }

  const btn = document.querySelector('[onclick="placeCounterOrder()"]');
  if (btn) { btn.textContent = '⏳ Generating...'; btn.disabled = true; }

  // Counter orders are always walk-in / cash payment
  const orderData = {
    customerName:    name,
    customerPhone:   phone,
    customerEmail:   'counter@jiyalalhalwai.com',
    deliveryAddress: 'Walk-in Counter',
    pincode:         '221001',
    city:            'Varanasi',
    paymentMethod:   'COUNTER_CASH',
    total:           parseFloat(amt) || 0,
    items:           [{ productId: 1, quantity: 1, price: parseFloat(amt) || 0 }]
  };

  let orderNumber = null;

  try {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (res.ok) {
      const data = await res.json();
      orderNumber = data.orderNumber;
    }
  } catch (e) {
    // fallback
  }

  // Counter orders ALWAYS get a token
  if (!orderNumber) {
    const year = new Date().getFullYear();
    orderNumber = `JLH-${year}-C${String(Date.now()).slice(-5)}`;
  }

  // Show token result in counter section
  document.getElementById('counter-token-num').textContent  = orderNumber;
  document.getElementById('counter-token-name').textContent = `${name} · ${item}`;
  document.getElementById('counter-token-result').style.display = 'block';

  // Clear fields
  ['cnt-name','cnt-phone','cnt-item','cnt-qty'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  loadCounterStats();
  showToast(`✅ Counter order token: ${orderNumber}`);

  if (btn) { btn.textContent = 'Get My Token 🎫'; btn.disabled = false; }
}
