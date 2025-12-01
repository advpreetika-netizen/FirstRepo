const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple hardcoded admin credentials (change in production!)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'owner';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pheran123';

// Data file for products
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize products file if missing
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(
    PRODUCTS_FILE,
    JSON.stringify(
      [
        {
          id: 1,
          name: 'Classic Kashmiri Pheran',
          description: 'Warm woolen pheran with traditional Kashmiri embroidery.',
          price: 3200,
          imageUrl: '/images/sample-pheran-1.jpg'
        },
        {
          id: 2,
          name: 'Modern Pashmina Pheran',
          description: 'Lightweight pashmina-style pheran for elegant winter evenings.',
          price: 4500,
          imageUrl: '/images/sample-pheran-2.jpg'
        },
        {
          id: 3,
          name: 'Heritage Handcrafted Pheran',
          description: 'Handcrafted pheran inspired by old Srinagar artisans.',
          price: 5200,
          imageUrl: '/images/sample-pheran-3.jpg'
        }
      ],
      null,
      2
    )
  );
}

function readProducts() {
  const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Very simple in-memory session for demo (NOT for production)
let loggedInTokens = new Set();

// Multer setup for image uploads
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'pheran-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// --- API ROUTES ---

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = Date.now().toString() + Math.random().toString(36).slice(2);
    loggedInTokens.add(token);
    return res.json({ success: true, token });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Simple auth middleware
function requireAuth(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (token && loggedInTokens.has(token)) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Unauthorized' });
}

// Get products (public)
app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

// Add product (admin)
app.post('/api/products', requireAuth, upload.single('image'), (req, res) => {
  try {
    const products = readProducts();
    const { name, description, price } = req.body;

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    }

    const newProduct = {
      id: products.length ? products[products.length - 1].id + 1 : 1,
      name: name || 'Untitled Pheran',
      description: description || '',
      price: Number(price) || 0,
      imageUrl: imageUrl || '/images/sample-pheran-1.jpg'
    };

    products.push(newProduct);
    writeProducts(products);
    res.json({ success: true, product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add product' });
  }
});

// Delete product (admin)
app.delete('/api/products/:id', requireAuth, (req, res) => {
  try {
    const id = Number(req.params.id);
    let products = readProducts();
    const product = products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    products = products.filter((p) => p.id !== id);
    writeProducts(products);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// Order route (just logs to server for now)
app.post('/api/orders', (req, res) => {
  const order = req.body;
  console.log('New order received:', order);
  // In a real app you would save to DB and integrate with payment gateway.
  res.json({ success: true, message: 'Order received. We will contact you shortly.' });
});

// Fallback routes for pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`Pheran Valley server running on http://localhost:${PORT}`);
});


