require("dotenv").config({ path: require("path").join(__dirname, "..", "..", ".env") });

const connectDB = require("../config/db");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Promotion = require("../models/Promotion");
const Offer = require("../models/Offer");
const HeroSlide = require("../models/HeroSlide");
const Quiz = require("../models/Quiz");

const WINE_FEATURED_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC088VleZnC5n9ymB8EfMx2mZsCuij7vJQoCBDSrP9nqCNq-a--DAFOc1REaefOJsPneORPheQ8z7EPCuwxb8Lz9hykvFrgw8yYTcObhmVzLYTwNowthQwnqVMN1wuZeqWPDdYxJYGOCNGH6wpUs-7vkWqGO1hB8dWCn_Uiv1nB6O_syyoYeY8WMIRuhJsRvUWMJqPysyf-SUeFU_bUrumt_GfGmGdDaMDM9_9BBW7-lTfX4A-vNGLDdlc_Pagge_okayzaDkgtzro";
const SPIRITS_FEATURED_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDhvgfMna-JG7lXUhGilp-9yIvdIG9L7sIDtmagNkmAlL8H1jD4p01B8MKrsoq2wTTJPfc3ktZJWDYPLydSeci15xrg3BWCd1aoXhdBI-W5YaOlra2M7nCEs-kfNabwhM0I4qjeJ44eC79CKpaUNxfrceQfvG8nb86hVC_-KN8b2v_FA3_dXPg9JvJN2qGE3BF-OhKmt9FK3npGWnEWByOZ_4u-rype5mDDvHxmbmcEu8ITEGBfQZgwnkmbvokQhH2sVfua1p3K4qk";
const BEER_FEATURED_URL =
  "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=1000&auto=format&fit=crop";
const ZERO_PROOF_URL =
  "https://lh3.googleusercontent.com/aida/AP1WRLvP_l-H35B2XMPGRe7rcFDxV-ucpt9A-IcSEQadx9mZSqUt7p19lsXt8xtrgY6bHSwpdNRL7j1l5TRb_-m02AQo3DcBu1J3ybhFCT3EYfRxVJ4dKOY6dcHAYLRXuzpQw4Wvd9GpXiKK-7yi2ql1qtyQnAycMJ69zIGweZks6n-viY3NfgOrHxpaVA51AKAg5WxV8zJbKSw3jFEU4xtjbeH3AwGSRmsE8VADCvrk5BN3xKOL9LB9E3ccHrw";
const CELLAR_HIGHLIGHT_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBjg2JYE5swzAmBLfew8lgcYh6ckVc36zj78xi9DJj4su-OyRZ3vxul2owL82NSh82LJJBvLJne4vtuNIGQq_7RFcnO7LQZjBLA0C6Kkhlhu0W02fDXTm4VJLmyq8AyVIXLsIbmcObQyrHvEFj9tR1Jfhq7iEe2gR4BltMNdfv2y2XbD-2YGwn6SdW4mBuakAQLTX8DtUXx4Aw-YWEmREZO78MaWrYvAJMB_4FcgqInUcsjOaJYqkWjPIiL18yDw6Icn4xnAjtnYaQ";
const PENFOLDS_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCmZThYcvGfX5gfiqiMSTPE1PHqBM4xWdCH5x-_BxzCd_FbiWoenUboNIT63ADkPkjCGciU5ZOtb7idVQotov-gO45l5cp0nHplzPD-RfITaIlARPuwJqEjol-T2lP6y1Z8pEnsO2jjZHGaMYRSgAR63FFwA18vScucDmg_NhQsce6RGW_FIm9Zda_u20dO7xptB5hS_uUKUWKtoNvlFavOEQTkioWy1UItby_1dPV7Q4oRcW8XGg0c_Q3J5erk6hhssj5H-C5ULho";
const SITE_WIDE_OFFERS_URL =
  "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=1000&auto=format&fit=crop";
const SIPNOW_HERO_BANNER_URL = "/assets/sipnow-hero-banner.png";

const categories = [
  { name: "Beer", description: "Artisanal & Craft", image: BEER_FEATURED_URL },
  { name: "Wine", description: "Old World Classics", image: WINE_FEATURED_URL },
  { name: "Spirits", description: "Global Selection", image: SPIRITS_FEATURED_URL },
  { name: "Zero Proof", description: "Mindful Excellence", image: ZERO_PROOF_URL },
  { name: "Premix", description: "Ready to Pour", image: "/assets/products/cooper.png" },
];

const currentOffers = [
  {
    title: "Summer Wine Sale",
    description: "Up to 30% Off Selected Vintages",
    type: "seasonal",
    image: WINE_FEATURED_URL,
    link: "/wine",
    ctaText: "Shop Wine Offers",
    validityLabel: "Offer Ends Sunday",
    discountType: "percentage",
    discountValue: 30,
    priority: 30,
  },
  {
    title: "Member Privileges",
    description: "Extra 15% Savings for Members",
    type: "member",
    image: SPIRITS_FEATURED_URL,
    link: "/offers/members",
    ctaText: "Explore Member Deals",
    validityLabel: "Limited Time Only",
    discountType: "percentage",
    discountValue: 15,
    priority: 20,
  },
  {
    title: "Site Wide Offers",
    description: "Save Big Across All Categories",
    type: "general",
    image: SITE_WIDE_OFFERS_URL,
    link: "/shop-all",
    ctaText: "View All Offers",
    validityLabel: "In-Store & Online",
    discountType: "none",
    discountValue: 0,
    priority: 10,
  },
];

/*
 * In-store promotions: one Offer per featured product, discount value
 * chosen so the resulting price matches the original storefront copy.
 */
const inStorePromotions = [
  { productName: "Coopers Original Pale Ale Longneck", discountType: "percentage", discountValue: 20 },
  { productName: "Jacob's Creek Cool Harvest Sauvignon Blanc", discountType: "percentage", discountValue: 15 },
  { productName: "Campo Viejo Tempranillo", discountType: "percentage", discountValue: 10 },
  { productName: "Absolut Vodka 6 Pack", discountType: "fixed", discountValue: 2.99 },
  { productName: "Jim Beam Double Serve 6.7%", discountType: "percentage", discountValue: 25 },
  { productName: "Grant Burge Miamba Shiraz", discountType: "percentage", discountValue: 10 },
];

const heroSlides = [
  {
    bgImage: SIPNOW_HERO_BANNER_URL,
    bgAlt: "SipNow brand banner",
    imageOnly: true,
    card: { image: SIPNOW_HERO_BANNER_URL, tag: "", title: "SipNow Brand Banner" },
    order: 0,
  },
  {
    bgImage: CELLAR_HIGHLIGHT_URL,
    bgAlt: "Rare vintage wine cellar",
    badge: "Rare Vintage Selection",
    titleLines: ["Elevate Your", "Midnight Hour."],
    description:
      "Curated excellence from the world's most prestigious cellars, delivered with artisanal precision to your doorstep.",
    primaryCta: "Explore Collections",
    secondaryCta: "Rare Finds",
    card: { image: CELLAR_HIGHLIGHT_URL, tag: "Cellar Highlight", title: "Vintage Krug Selection" },
    showPromotions: true,
    order: 1,
  },
  {
    bgImage: WINE_FEATURED_URL,
    bgAlt: "Old world red wine",
    badge: "Old World Classics",
    titleLines: ["Uncork The", "Finest Reserve."],
    description:
      "Benchmark wines from a legacy that began in 1844 — handpicked vintages with a spirit of innovation and quality.",
    primaryCta: "Shop Wine Collection",
    secondaryCta: "View Cellar",
    card: { image: PENFOLDS_URL, tag: "Best Seller · $135.00", title: "Penfolds St Henri Shiraz" },
    quiz: true,
    order: 2,
  },
  {
    bgImage: SPIRITS_FEATURED_URL,
    bgAlt: "SipNow Membership Privileges",
    membership: true,
    tag: "MEMBERSHIP PRIVILEGES",
    titleLines: ["Unlock Exclusive", "Member Rewards"],
    description:
      "Join the SipNow Club to enjoy member-only prices, earning double points on every order, and early access to rare vintages.",
    primaryCta: "Join / Login to Membership",
    targetPage: "/offers/members",
    card: { image: SPIRITS_FEATURED_URL, tag: "SipNow Club", title: "Membership Privileges" },
    order: 3,
  },
];

const quizQuestions = [
  {
    question: "What's the occasion?",
    options: [
      { label: "Casual Night In", icon: "home", scores: { beer: 2, zeroproof: 1 } },
      { label: "Celebration", icon: "celebration", scores: { wine: 2, spirits: 1 } },
      { label: "Dinner Party", icon: "restaurant", scores: { wine: 2, premix: 1 } },
      { label: "Just Because", icon: "sunny", scores: { premix: 2, beer: 1 } },
    ],
  },
  {
    question: "Pick your flavour profile.",
    options: [
      { label: "Crisp & Refreshing", icon: "water_drop", scores: { beer: 2, zeroproof: 1 } },
      { label: "Bold & Intense", icon: "local_fire_department", scores: { spirits: 2, wine: 1 } },
      { label: "Smooth & Mellow", icon: "nightlight", scores: { wine: 2, spirits: 1 } },
      { label: "Sweet & Fruity", icon: "eco", scores: { premix: 2, zeroproof: 1 } },
    ],
  },
  {
    question: "How adventurous are you feeling?",
    options: [
      { label: "Classic & Familiar", icon: "workspace_premium", scores: { beer: 1, wine: 1 } },
      { label: "Something New", icon: "explore", scores: { premix: 2, spirits: 1 } },
      { label: "Rare & Prestigious", icon: "diamond", scores: { spirits: 2, wine: 2 } },
      {
        label: "Surprise Me",
        icon: "shuffle",
        scores: { zeroproof: 1, beer: 1, wine: 1, spirits: 1, premix: 1 },
      },
    ],
  },
  {
    question: "Any preference on strength?",
    options: [
      { label: "Light", icon: "filter_1", scores: { beer: 1, zeroproof: 2 } },
      { label: "Medium", icon: "filter_2", scores: { wine: 2, premix: 1 } },
      { label: "Strong", icon: "filter_3", scores: { spirits: 2 } },
      { label: "No Preference", icon: "all_inclusive", scores: {} },
    ],
  },
];

const quizResults = [
  {
    key: "beer",
    title: "Beer & Cider",
    desc: "Independent brewers, bold flavours, small batches — you're a craft beer and cider person through and through.",
  },
  {
    key: "wine",
    title: "Wine",
    desc: "From bold reds to crisp whites, a curated cellar selection of old-world classics awaits your palate.",
  },
  {
    key: "spirits",
    title: "Spirits",
    desc: "Rare single malts and global spirits — you appreciate craftsmanship in every pour.",
  },
  {
    key: "premix",
    title: "Premix",
    desc: "Ready-to-drink classics for every occasion — vibrant, easy, and always a good time.",
  },
  {
    key: "zeroproof",
    title: "Zero Proof",
    desc: "Mindful excellence without compromise — refreshing options for every moment.",
  },
];

async function seed() {
  await connectDB();

  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.log(`Seeded ${categories.length} categories.`);

  await Promotion.deleteMany({});
  for (const promo of currentOffers) {
    await Promotion.create(promo);
  }
  console.log(`Seeded ${currentOffers.length} promotions.`);

  const offerDocs = [];
  for (const promo of inStorePromotions) {
    const product = await Product.findOne({ name: promo.productName });
    if (!product) {
      console.warn(`Skipping in-store promotion — product not found: ${promo.productName}`);
      continue;
    }
    offerDocs.push({
      title: `${promo.productName} Promotion`,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      applicableProducts: [product._id],
    });
  }
  await Offer.deleteMany({});
  for (const offer of offerDocs) {
    await Offer.create(offer);
  }
  console.log(`Seeded ${offerDocs.length} in-store promotion offers.`);

  await HeroSlide.deleteMany({});
  await HeroSlide.insertMany(heroSlides);
  console.log(`Seeded ${heroSlides.length} hero slides.`);

  await Quiz.deleteMany({});
  await Quiz.create({ questions: quizQuestions, results: quizResults });
  console.log("Seeded quiz.");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
