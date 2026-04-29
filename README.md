# Ayisha Jewelry Website

A full-stack jewelry e-commerce platform featuring a dynamic product gallery, shopping cart, and WhatsApp checkout integration.

## Features
- **Product Filtering:** Search and filter by category (Necklaces, Bracelets, etc.).
- **Shopping Cart:** Persistent cart using LocalStorage.
- **WhatsApp Integration:** Direct checkout via WhatsApp.
- **Backend API:** Node.js/Express server providing product data.

## Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the root and add your `EMAIL_USER` and `EMAIL_PASS` (for the contact form).
4. Start the server:
   ```bash
   node backend/server.js
   ```

## Tech Stack
Frontend: Vanilla JavaScript, CSS, HTML. Backend: Node.js, Express, Nodemailer.