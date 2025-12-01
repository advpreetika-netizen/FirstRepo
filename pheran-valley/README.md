# Pheran Valley – Kashmiri Pheran Ordering Website

Pheran Valley is a small web app where customers can browse handcrafted Kashmiri pherans, place order requests, and where the owner can log in to upload or delete product photos.

> **Hosted by:** Preetika Thakur (as shown on the site UI)

## What’s included

- **Public website**
  - Home / hero section with branding
  - Featured pherans catalog (with sample photos)
  - Order form that collects:
    - Pheran selection
    - Size, quantity, preferences
    - Name, phone, email, full address
    - Payment method (COD / UPI / Card)
  - About and contact sections

- **Owner admin area**
  - Login page for the owner
  - Dashboard to:
    - Upload new pherans (image, name, description, price)
    - Option to use either a file upload or an external image URL
    - Delete existing pherans from the catalog

- **Backend**
  - Node.js + Express server
  - Products stored in `data/products.json`
  - Image uploads stored in `public/uploads/`
  - Simple (demo) login with hardcoded username/password
  - `/api/orders` endpoint that logs orders to the server console

## Requirements

- Node.js (v16+ recommended)
- npm (comes with Node)

## How to run locally (Windows)

1. Open a terminal / PowerShell.
2. Go to the project folder:

   ```bash
   cd "C:\Users\advpr\Desktop\pheran-valley"
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open your browser and go to:

   ```text
   http://localhost:3000
   ```

   You should see the **Pheran Valley** website.

## Admin login details

- Open the owner dashboard:

  ```text
  http://localhost:3000/admin
  ```

- **Default demo credentials:**
  - Username: `owner`
  - Password: `pheran123`

These are defined in `server.js`. For better security, you can change them or set environment variables:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Example in PowerShell (only for that terminal session):

```powershell
$env:ADMIN_USERNAME="myuser"
$env:ADMIN_PASSWORD="mypassword"
npm start
```

## How the flow works

- **Customers**
  - Visit `/` and browse the catalog (loaded from `/api/products`).
  - Fill the order form; data is sent to `/api/orders` (currently it is just logged on the server).
  - Payment methods are **UI only** for now – you can contact the customer via phone/WhatsApp to share UPI IDs or payment links.

- **Owner**
  - Logs in at `/admin` with the credentials above.
  - Can upload images (stored in `public/uploads/`) and create new products.
  - Can delete products; they are removed from `data/products.json` and from the public catalog.

## Notes & next steps

- **Production security**: This is a simple demo. For a real deployment you should:
  - Use a proper authentication system (sessions/JWT, HTTPS, etc.).
  - Store data in a database (e.g. MongoDB, Postgres) rather than a JSON file.
  - Use a payment gateway (Stripe, Razorpay, etc.) and handle actual payment callbacks.
- **Deployment**: You can deploy this to services like Render, Railway, or a VPS that supports Node.js.


