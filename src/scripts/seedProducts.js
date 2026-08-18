require("dotenv").config({ path: require("path").join(__dirname, "..", "..", ".env") });

const connectDB = require("../config/db");
const Product = require("../models/Product");

const products = [
  {
    name: "Jacob's Creek Cool Harvest Sauvignon Blanc",
    category: "White Wine · 750mL",
    categoryGroup: "wine",
    price: 10.13,
    image: "/assets/products/jacob-greek.png",
    abv: "12.0%",
    volume: "750mL",
    manufacturer: "Jacob's Creek (Pernod Ricard Winemakers)",
    origin: "South Eastern Australia",
    description:
      "A crisp, refreshing Sauvignon Blanc bursting with tropical and citrus notes.",
    stockQuantity: 120,
  },
  {
    name: "Campo Viejo Tempranillo",
    category: "Red Wine · 750mL",
    categoryGroup: "wine",
    price: 12.57,
    image: "/assets/products/campo.png",
    abv: "13.5%",
    volume: "750mL",
    manufacturer: "Campo Viejo (Pernod Ricard Winemakers)",
    origin: "Rioja, Spain",
    description:
      "A smooth, medium-bodied Tempranillo layered with red berry fruit and gentle vanilla notes.",
    stockQuantity: 85,
  },
  {
    name: "Absolut Vodka 6 Pack",
    category: "Vodka · 6 x 200mL",
    categoryGroup: "spirits",
    price: 17.98,
    image: "/assets/products/cooper.png",
    abv: "40.0%",
    volume: "6 x 200mL",
    manufacturer: "Absolut",
    origin: "Sweden",
    description: "Premium Swedish vodka, six 200mL bottles.",
    stockQuantity: 60,
  },
  {
    name: "Coopers Original Pale Ale Longneck",
    category: "Beer · 750mL",
    categoryGroup: "beer",
    price: 6.09,
    image: "/assets/products/cooper.png",
    abv: "4.5%",
    volume: "750mL",
    manufacturer: "Coopers Brewery",
    origin: "Australia",
    description: "A classic Australian pale ale with a distinct hop character.",
    stockQuantity: 200,
  },
  {
    name: "Jim Beam Double Serve 6.7%",
    category: "Bourbon · 375mL",
    categoryGroup: "spirits",
    price: 5.22,
    image: "/assets/products/cooper.png",
    abv: "6.7%",
    volume: "375mL",
    manufacturer: "Jim Beam",
    origin: "USA",
    description: "Ready-to-drink bourbon and cola, double serve.",
    stockQuantity: 150,
  },
  {
    name: "Chandon Garden Spritz",
    category: "Sparkling · 750mL",
    categoryGroup: "wine",
    price: 27.73,
    image: "/assets/products/jacob-greek.png",
    abv: "11.5%",
    volume: "750mL",
    manufacturer: "Domaine Chandon",
    origin: "Yarra Valley, Australia",
    description: "A refreshing sparkling wine with notes of orange and bitter herbs.",
    stockQuantity: 45,
  },
  {
    name: "Byron Bay Brewery Premium Lager",
    category: "Beer · 355mL",
    categoryGroup: "beer",
    price: 2.83,
    image: "/assets/products/cooper.png",
    abv: "4.2%",
    volume: "355mL",
    manufacturer: "Byron Bay Brewery",
    origin: "Australia",
    description: "A crisp, clean premium lager.",
    stockQuantity: 300,
  },
  {
    name: "Grant Burge Miamba Shiraz",
    category: "Red Wine · 750mL",
    categoryGroup: "wine",
    price: 15.51,
    image: "/assets/products/campo.png",
    abv: "14.0%",
    volume: "750mL",
    manufacturer: "Grant Burge",
    origin: "Barossa Valley, Australia",
    description: "A bold Shiraz with dark fruit and spice characters.",
    stockQuantity: 70,
  },
  {
    name: "19 Crimes Red Blend",
    category: "Red Wine · 750mL",
    categoryGroup: "wine",
    price: 31.99,
    image: "/assets/products/campo.png",
    abv: "13.5%",
    volume: "750mL",
    manufacturer: "19 Crimes",
    origin: "South Eastern Australia",
    description: "A rich red blend with bold fruit flavours.",
    stockQuantity: 55,
  },
  {
    name: "Pepperjack Shiraz",
    category: "Red Wine · 750mL",
    categoryGroup: "wine",
    price: 31.99,
    image: "/assets/products/campo.png",
    abv: "14.5%",
    volume: "750mL",
    manufacturer: "Pepperjack",
    origin: "Barossa Valley, Australia",
    description: "A full-bodied Shiraz with rich dark berry and pepper notes.",
    stockQuantity: 40,
  },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
