const ADMIN_TOKEN_KEY = 'pv_admin_token';

const adminRoot = document.getElementById('admin-root');

function getToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function renderLogin() {
  if (!adminRoot) return;
  adminRoot.innerHTML = `
    <section class="pv-card pv-admin-login-form">
      <h2 class="pv-text-center" style="margin: 0 0 8px;">Owner Login</h2>
      <p class="pv-text-center" style="margin: 0 0 12px; font-size: 12px; color: #a3a6c0">
        Enter your admin credentials to manage photos.
      </p>
      <form id="login-form" class="pv-form">
        <label>
          Username
          <input type="text" name="username" required />
        </label>
        <label>
          Password
          <input type="password" name="password" required />
        </label>
        <button type="submit" class="pv-btn pv-btn-primary pv-btn-full">Login</button>
        <p id="login-message" class="pv-form-message"></p>
        <p style="margin: 6px 0 0; font-size: 11px; color: #a3a6c0">
          Default (demo) credentials: <strong>owner</strong> / <strong>pheran123</strong><br />
          You can change these later in the server configuration.
        </p>
      </form>
    </section>
  `;

  const loginForm = document.getElementById('login-form');
  const loginMessage = document.getElementById('login-message');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());
    loginMessage.textContent = 'Checking...';
    loginMessage.className = 'pv-form-message';
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success && result.token) {
        setToken(result.token);
        renderDashboard();
      } else {
        loginMessage.textContent = result.message || 'Invalid credentials';
        loginMessage.classList.add('pv-form-message--error');
      }
    } catch (err) {
      console.error(err);
      loginMessage.textContent = 'Login failed. Please try again.';
      loginMessage.classList.add('pv-form-message--error');
    }
  });
}

async function fetchProducts() {
  const res = await fetch('/api/products');
  return res.json();
}

async function renderDashboard() {
  if (!adminRoot) return;
  const token = getToken();
  if (!token) {
    renderLogin();
    return;
  }

  const products = await fetchProducts();

  adminRoot.innerHTML = `
    <section class="pv-admin-layout">
      <section class="pv-card">
        <div class="pv-section-header" style="margin-bottom: 12px;">
          <h2 style="font-size: 1rem;">Upload New Pheran</h2>
          <p style="font-size: 12px;">Add a title, price, and upload a photo. You can also link to an existing image URL.</p>
        </div>
        <form id="upload-form" class="pv-form" enctype="multipart/form-data">
          <label>
            Name / Title
            <input type="text" name="name" placeholder="E.g. Classic Kashmiri Wool Pheran" required />
          </label>
          <label>
            Short Description
            <textarea name="description" rows="2" placeholder="Embroidery, fabric, or story behind this pheran"></textarea>
          </label>
          <label>
            Price (₹)
            <input type="number" name="price" min="0" required />
          </label>
          <label>
            Photo (upload)
            <input type="file" name="image" accept="image/*" />
          </label>
          <label>
            Or Image URL (optional)
            <input type="url" name="imageUrl" placeholder="https://example.com/pheran.jpg" />
          </label>
          <button type="submit" class="pv-btn pv-btn-primary pv-btn-full">Add Pheran</button>
          <p id="upload-message" class="pv-form-message"></p>
        </form>
      </section>

      <section class="pv-card">
        <div class="pv-section-header" style="margin-bottom: 12px;">
          <h2 style="font-size: 1rem;">Current Pherans</h2>
          <p style="font-size: 12px;">Remove items that are sold out or not available.</p>
        </div>
        <div class="pv-admin-products-list" id="admin-products-list">
          ${products
            .map(
              (p) => `
              <article class="pv-admin-product" data-id="${p.id}">
                <div>
                  <img src="${p.imageUrl}" alt="${p.name}" onerror="this.src='/images/sample-pheran-1.jpg'" />
                </div>
                <div class="pv-admin-product-body">
                  <h4>${p.name}</h4>
                  <p>₹${p.price}</p>
                  <p style="margin-top: 2px;">${p.description || ''}</p>
                </div>
                <button type="button" class="pv-delete-btn">Delete</button>
              </article>
            `
            )
            .join('')}
        </div>
        <div class="pv-mt-8 pv-text-center">
          <button id="logout-btn" class="pv-btn pv-btn-ghost" style="font-size: 11px; padding-inline: 14px;">
            Logout
          </button>
        </div>
        <p id="admin-message" class="pv-form-message pv-mt-8"></p>
      </section>
    </section>
  `;

  const adminMessage = document.getElementById('admin-message');
  const uploadForm = document.getElementById('upload-form');
  const uploadMessage = document.getElementById('upload-message');
  const productsList = document.getElementById('admin-products-list');
  const logoutBtn = document.getElementById('logout-btn');

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    uploadMessage.textContent = 'Uploading...';
    uploadMessage.className = 'pv-form-message';
    const formData = new FormData(uploadForm);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        uploadMessage.textContent = 'Pheran added successfully!';
        uploadMessage.classList.add('pv-form-message--success');
        renderDashboard();
      } else {
        uploadMessage.textContent = result.message || 'Upload failed.';
        uploadMessage.classList.add('pv-form-message--error');
      }
    } catch (err) {
      console.error(err);
      uploadMessage.textContent = 'Upload failed. Please try again.';
      uploadMessage.classList.add('pv-form-message--error');
    }
  });

  productsList.addEventListener('click', async (e) => {
    const btn = e.target.closest('.pv-delete-btn');
    if (!btn) return;
    const article = btn.closest('.pv-admin-product');
    const id = article.getAttribute('data-id');
    if (!id) return;

    if (!confirm('Delete this pheran from the catalog?')) return;

    adminMessage.textContent = 'Deleting...';
    adminMessage.className = 'pv-form-message';
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      const result = await res.json();
      if (result.success) {
        adminMessage.textContent = 'Pheran deleted.';
        adminMessage.classList.add('pv-form-message--success');
        article.remove();
      } else {
        adminMessage.textContent = result.message || 'Delete failed.';
        adminMessage.classList.add('pv-form-message--error');
      }
    } catch (err) {
      console.error(err);
      adminMessage.textContent = 'Delete failed. Please try again.';
      adminMessage.classList.add('pv-form-message--error');
    }
  });

  logoutBtn.addEventListener('click', () => {
    clearToken();
    renderLogin();
  });
}

if (getToken()) {
  renderDashboard();
} else {
  renderLogin();
}


