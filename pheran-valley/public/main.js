const productGrid = document.getElementById('product-grid');
const orderProductSelect = document.getElementById('order-product');
const orderForm = document.getElementById('order-form');
const orderMessage = document.getElementById('order-message');

// Set year in footer
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();

    if (productGrid) {
      productGrid.innerHTML = '';
      products.forEach((p) => {
        const card = document.createElement('article');
        card.className = 'pv-card';
        card.innerHTML = `
          <div class="pv-product-card-img">
            <img src="${p.imageUrl}" alt="${p.name}" onerror="this.src='/images/sample-pheran-1.jpg'" />
          </div>
          <div class="pv-product-card-body">
            <h3>${p.name}</h3>
            <p>${p.description || ''}</p>
            <div class="pv-product-meta">
              <span class="pv-price">₹${p.price}</span>
              <span class="pv-tag-soft">Made in Kashmir</span>
            </div>
          </div>
        `;
        productGrid.appendChild(card);
      });
    }

    if (orderProductSelect) {
      orderProductSelect.innerHTML = '<option value="">Choose from catalog</option>';
      products.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (₹${p.price})`;
        orderProductSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Failed to load products', err);
  }
}

if (orderForm) {
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!orderMessage) return;

    const formData = new FormData(orderForm);
    const data = Object.fromEntries(formData.entries());
    data.quantity = Number(data.quantity) || 1;

    orderMessage.textContent = 'Sending your order request...';
    orderMessage.className = 'pv-form-message';

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        orderMessage.textContent = result.message || 'Order submitted successfully!';
        orderMessage.classList.add('pv-form-message--success');
        orderForm.reset();
      } else {
        orderMessage.textContent = result.message || 'Something went wrong.';
        orderMessage.classList.add('pv-form-message--error');
      }
    } catch (err) {
      console.error(err);
      orderMessage.textContent = 'Failed to send order. Please try again or contact us directly.';
      orderMessage.classList.add('pv-form-message--error');
    }
  });
}

loadProducts();


