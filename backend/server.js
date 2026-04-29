require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ SERVE FRONTEND FILES
// Points to the 'frontend' directory at the root of the project
const STATIC_PATH = path.resolve(__dirname, "..", "frontend");

if (!fs.existsSync(STATIC_PATH)) {
  console.error(`\x1b[31mError: Frontend directory not found at ${STATIC_PATH}\x1b[0m`);
}

app.use(express.static(STATIC_PATH));

// ✅ SERVE IMAGES FOLDER (with validation)
const IMAGES_PATH = path.resolve(__dirname, "images");
if (!fs.existsSync(IMAGES_PATH)) {
  console.error(`\x1b[31mError: Images directory not found at ${IMAGES_PATH}\x1b[0m`);
}

// Custom logger for images to help us see what's happening
app.use("/images", (req, res, next) => {
  const filePath = path.join(IMAGES_PATH, req.url);
  console.log(fs.existsSync(filePath) ? `✅ Found: ${req.url}` : `❌ MISSING: ${req.url}`);
  next();
}, express.static(IMAGES_PATH));

// ✅ PRODUCTS DATA (Updated with Web URLs)
const products = [
  {
    id: 1,
    name: "14k Gold Plated Necklace",
    price: 450,
    image: "/images/jew3.webp",
    material: "Gold Plated",
    category: "necklaces",
    description: "Elegant 14k gold plated necklace, perfect for special occasions.",
    images: ["/images/jew3.webp"] // Using main image for alt for simplicity
  },
  {
    id: 2,
    name: "Sterling Silver Bracelet",
    price: 320,
    image: "/images/jew4.webp",
    material: "Silver",
    category: "bracelets",
    description: "High-quality sterling silver bracelet with a modern finish.",
    images: ["/images/jew4.webp"]
  },
  {
    id: 3,
    name: "Handcrafted Bead Anklet",
    price: 150,
    image: "/images/jew5.webp",
    material: "Beads",
    category: "anklets",
    description: "Authentic Ghanaian beads, handcrafted with care.",
    images: ["/images/jew5.webp"]
  },
  {
    id: 4,
    name: "Ghana Map Pendant",
    price: 550,
    image: "/images/jew6.webp",
    material: "Gold Plated",
    category: "necklaces",
    description: "Show your pride with this beautiful Ghana map pendant.",
    images: ["/images/jew6.webp"]
  },
  {
    id: 5,
    name: "Elegant Pearl Necklace",
    price: 600, 
    image: "/images/jew8.jpg",
    material: "Pearls, Silver",
    category: "necklaces",
    description: "A timeless pearl necklace for classic elegance.",
    images: ["/images/jew8.jpg"]
  },
  {
    id: 6,
    name: "Delicate Gold Chain Bracelet",
    price: 280,
    image: "/images/jew9.webp", // Mapped to jew9.webp
    material: "Gold Plated",
    category: "bracelets",
    description: "A delicate gold chain bracelet, perfect for everyday wear.",
    images: ["/images/jew9.webp"]
  },
  {
    id: 7,
    name: "Geometric Stud Earrings",
    price: 180,
    image: "/images/jew7.jpg", // This remains jew7.jpg as per your specific instruction
    material: "Sterling Silver",
    category: "earrings",
    description: "Modern geometric stud earrings for a minimalist look.",
    images: ["/images/jew7.jpg"]
  },
  {
    id: 8,
    name: "Emerald Cut Ring",
    price: 750,
    image: "/images/jew10.webp", // Mapped to jew10.webp
    material: "Gold Plated, Zircon",
    category: "rings",
    description: "Stunning emerald cut ring with a brilliant zircon stone.",
    images: ["/images/jew10.webp"]
  }
];

// Routes
app.get("/products", (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const getFullUrl = (path) => path.startsWith('http') ? path : `${baseUrl}${path}`;
    
    const productsWithUrls = products.map(product => ({
      ...product,
      image: getFullUrl(product.image),
      images: (product.images || []).map(img => getFullUrl(img))
    }));

    res.json(productsWithUrls);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to load products" });
  }
});

// ✅ CONTACT FORM ROUTE
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  
  // 1. Create a transporter (Example using Gmail)
  // Note: For Gmail, you may need to use an "App Password"
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS
    }
  });

  // 2. Setup email data
  const mailOptions = {
    from: `"Ayisha Jewelry Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, 
    replyTo: email, // Allows you to reply directly to the customer
    subject: `✨ New Inquiry from ${name}`,
    text: `You have a new message from ${name} (${email}):\n\n${message}`
  };

  try {
    console.log(`📩 Sending inquiry from: ${name}...`);
    
    // 3. Send the email
    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: "Thank you! Your message has been sent to Ayisha Jewelry." });
  } catch (error) {
    console.error("Mailer Error:", error);
    res.status(500).json({ success: false, message: "Server error: Could not send email." });
  }
});

// Explicit route for the homepage
app.get("/", (req, res) => {
  const indexPath = path.join(STATIC_PATH, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`\x1b[31mError: index.html not found at ${indexPath}\x1b[0m`);
    res.status(404).send("Frontend index.html not found. Please check your project structure.");
  }
});

app.listen(PORT, () => {
  console.log(`
✨ AYISHA JEWELRY Server Active!
🔗 View Website: http://localhost:${PORT}
📂 API Data: http://localhost:${PORT}/products
  `);
});