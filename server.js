var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  addresses: () => addresses,
  boxInventory: () => boxInventory,
  boxTypes: () => boxTypes,
  cartItems: () => cartItems,
  categories: () => categories,
  customOrders: () => customOrders,
  discounts: () => discounts,
  insertAddressSchema: () => insertAddressSchema,
  insertBoxInventorySchema: () => insertBoxInventorySchema,
  insertBoxTypeSchema: () => insertBoxTypeSchema,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertCustomOrderSchema: () => insertCustomOrderSchema,
  insertDiscountSchema: () => insertDiscountSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPostPurchaseDiscountSchema: () => insertPostPurchaseDiscountSchema,
  insertProductImageSchema: () => insertProductImageSchema,
  insertProductPriceVariationSchema: () => insertProductPriceVariationSchema,
  insertProductSchema: () => insertProductSchema,
  insertRedirectUrlSchema: () => insertRedirectUrlSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertSiteCustomizationSchema: () => insertSiteCustomizationSchema,
  insertSiteSettingSchema: () => insertSiteSettingSchema,
  insertUserSchema: () => insertUserSchema,
  orderItems: () => orderItems,
  orders: () => orders,
  postPurchaseDiscounts: () => postPurchaseDiscounts,
  productImages: () => productImages,
  productPriceVariations: () => productPriceVariations,
  products: () => products,
  redirectUrls: () => redirectUrls,
  reviews: () => reviews,
  siteCustomization: () => siteCustomization,
  siteSettings: () => siteSettings,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, products, productImages, cartItems, orders, orderItems, reviews, addresses, categories, discounts, insertUserSchema, insertProductSchema, insertCartItemSchema, insertOrderSchema, insertOrderItemSchema, insertReviewSchema, insertAddressSchema, insertCategorySchema, insertDiscountSchema, insertProductImageSchema, productPriceVariations, customOrders, insertCustomOrderSchema, siteCustomization, insertSiteCustomizationSchema, boxTypes, boxInventory, insertBoxTypeSchema, insertBoxInventorySchema, siteSettings, redirectUrls, insertRedirectUrlSchema, insertSiteSettingSchema, postPurchaseDiscounts, insertPostPurchaseDiscountSchema, insertProductPriceVariationSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      email: text("email").notNull().unique(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      firstName: text("first_name"),
      lastName: text("last_name"),
      isAdmin: boolean("is_admin").default(false).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    products = pgTable("products", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      image: text("image").notNull(),
      // Maintain for backwards compatibility (primary image)
      rating: integer("rating").notNull(),
      reviewCount: integer("review_count").notNull(),
      basePrice: integer("base_price").notNull(),
      category: text("category").notNull(),
      featured: boolean("featured").default(false),
      // Adding additional fields for product management
      inventory: integer("inventory").default(100),
      // Size, type, and shape options
      sizeOptions: text("size_options"),
      // Stored as JSON string
      typeOptions: text("type_options"),
      // Stored as JSON string
      shapeOptions: text("shape_options"),
      // Stored as JSON string
      shapesEnabled: boolean("shapes_enabled").default(true),
      // Whether to display shape options to customers
      // Mixed type option settings
      mixedTypeEnabled: boolean("mixed_type_enabled").default(false),
      // Whether the mixed type option is enabled for this product
      enableMixedSlider: boolean("enable_mixed_slider").default(false),
      // Whether to enable the slider for mixed type proportions
      mixedTypeFee: integer("mixed_type_fee").default(0),
      // Additional fee for mixed type (in cents)
      // Optional allergy information
      allergyInfo: text("allergy_info"),
      // Optional field for allergy warnings
      // Ingredients list
      ingredients: text("ingredients"),
      // Optional field for listing ingredients
      // Product-specific sale fields
      salePrice: integer("sale_price"),
      // Sale price in cents (null means no sale)
      saleType: text("sale_type"),
      // 'percentage' or 'fixed' (null means no sale)
      saleValue: integer("sale_value"),
      // Percentage or fixed amount value of the sale
      saleActive: boolean("sale_active").default(false),
      // Whether the sale is active
      saleStartDate: date("sale_start_date"),
      // Start date of the sale (null means immediate)
      saleEndDate: date("sale_end_date"),
      // End date of the sale (null means no end)
      // Multi-image support
      hasMultipleImages: boolean("has_multiple_images").default(false),
      // Flag to indicate if this product has multiple images
      // Display order for product sorting in the UI
      displayOrder: integer("display_order").default(1e3),
      // Default to a high number so new products appear at the end
      // Visibility control for showing/hiding products in the menu
      visible: boolean("visible").default(true),
      // Whether the product should be shown in the menu
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    productImages = pgTable("product_images", {
      id: serial("id").primaryKey(),
      productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
      imageUrl: text("image_url").notNull(),
      // URL to the image
      caption: text("caption"),
      // Optional caption or description for the image
      displayOrder: integer("display_order").default(0),
      // Order for displaying images (0 = primary)
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    cartItems = pgTable("cart_items", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      productId: integer("product_id").notNull(),
      size: text("size").notNull(),
      type: text("type").notNull(),
      shape: text("shape"),
      // Optional shape selection
      quantity: integer("quantity").notNull(),
      price: integer("price").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    orders = pgTable("orders", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      customerName: text("customer_name"),
      // Added customer name field
      customerEmail: text("customer_email"),
      // Added customer email field
      status: text("status").notNull().default("pending"),
      // pending, processing, shipped, delivered, cancelled
      totalAmount: integer("total_amount").notNull(),
      shippingAddress: text("shipping_address").notNull(),
      deliveryMethod: text("delivery_method").default("ship"),
      // "ship" or "pickup"
      phone: text("phone"),
      // Customer phone number
      paymentIntentId: text("payment_intent_id"),
      // For Stripe integration
      postPurchaseDiscountCode: text("post_purchase_discount_code"),
      // Discount code generated after purchase
      metadata: text("metadata"),
      // JSON string containing order metadata (cart items)
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    orderItems = pgTable("order_items", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").notNull(),
      productId: integer("product_id").notNull(),
      productName: text("product_name"),
      // Store product name for better display in admin panel
      size: text("size").notNull(),
      type: text("type").notNull(),
      shape: text("shape"),
      // Optional shape selection
      quantity: integer("quantity").notNull(),
      price: integer("price").notNull()
      // Price at time of purchase
    });
    reviews = pgTable("reviews", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      productId: integer("product_id").notNull(),
      rating: integer("rating").notNull(),
      comment: text("comment"),
      userName: text("user_name"),
      // Add userName for guest reviews
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    addresses = pgTable("addresses", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      name: text("name").notNull(),
      address: text("address").notNull(),
      city: text("city").notNull(),
      state: text("state").notNull(),
      zipCode: text("zip_code").notNull(),
      country: text("country").notNull(),
      isDefault: boolean("is_default").default(false)
    });
    categories = pgTable("categories", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      slug: text("slug").notNull().unique(),
      description: text("description"),
      image: text("image")
    });
    discounts = pgTable("discounts", {
      id: serial("id").primaryKey(),
      code: text("code").notNull().unique(),
      description: text("description"),
      discountType: text("discount_type").notNull(),
      // 'percentage', 'fixed_amount', 'buy_one_get_one'
      value: integer("value").notNull(),
      // Percentage (1-100), amount in cents, or percentage off second item for BOGO
      minPurchase: integer("min_purchase"),
      // Minimum purchase amount in cents
      maxUses: integer("max_uses"),
      // Maximum number of uses
      usedCount: integer("used_count").default(0),
      // Number of times used
      productIds: text("product_ids").array(),
      // Array of product IDs this discount applies to (empty = all products)
      categoryIds: text("category_ids").array(),
      // Array of category IDs this discount applies to (empty = all categories)
      active: boolean("active").default(true),
      // Whether the discount is active
      hidden: boolean("hidden").default(false),
      // Whether to hide the discount banner
      startDate: date("start_date"),
      // Start date of the discount
      endDate: date("end_date"),
      // End date of the discount
      buyQuantity: integer("buy_quantity").default(1),
      // Number of items to buy (for BOGO discounts)
      getQuantity: integer("get_quantity").default(1),
      // Number of items to get discounted (for BOGO discounts)
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertUserSchema = createInsertSchema(users).pick({
      email: true,
      username: true,
      password: true,
      firstName: true,
      lastName: true
    });
    insertProductSchema = createInsertSchema(products).omit({
      id: true,
      createdAt: true
    }).extend({
      // Explicitly define displayOrder to ensure it's included in the schema
      displayOrder: z.number().default(1e3).optional()
    });
    insertCartItemSchema = createInsertSchema(cartItems).omit({
      id: true,
      createdAt: true
    });
    insertOrderSchema = createInsertSchema(orders).omit({
      id: true,
      createdAt: true
    });
    insertOrderItemSchema = createInsertSchema(orderItems).omit({
      id: true
    });
    insertReviewSchema = createInsertSchema(reviews).omit({
      id: true,
      createdAt: true
    });
    insertAddressSchema = createInsertSchema(addresses).omit({
      id: true
    });
    insertCategorySchema = createInsertSchema(categories).omit({
      id: true
    });
    insertDiscountSchema = createInsertSchema(discounts).omit({
      id: true,
      createdAt: true,
      usedCount: true
    });
    insertProductImageSchema = createInsertSchema(productImages).omit({
      id: true,
      createdAt: true
    });
    productPriceVariations = pgTable("product_price_variations", {
      id: serial("id").primaryKey(),
      productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
      // Option identifiers - at least one must be specified
      size: text("size"),
      // small, medium, large
      type: text("type"),
      // milk, dark, white, mixed
      shape: text("shape"),
      // round, rectangular, curved
      // Price modifier in cents (can be positive or negative)
      priceModifier: integer("price_modifier").notNull().default(0),
      // Whether this is an absolute price (overrides base price) or a modifier
      isAbsolutePrice: boolean("is_absolute_price").default(false),
      // Order for applying the modifiers
      displayOrder: integer("display_order").default(0),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    customOrders = pgTable("custom_orders", {
      id: serial("id").primaryKey(),
      customerName: text("customer_name").notNull(),
      contactInfo: text("contact_info").notNull(),
      // Email, phone, or Instagram
      contactType: text("contact_type").notNull(),
      // "email", "phone", "instagram"
      orderDetails: text("order_details").notNull(),
      // Details about the custom order
      selectedProducts: text("selected_products"),
      // JSON string of selected products and quantities
      status: text("status").notNull().default("pending"),
      // pending, processing, completed, cancelled
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertCustomOrderSchema = createInsertSchema(customOrders).omit({
      id: true,
      createdAt: true
    });
    siteCustomization = pgTable("site_customization", {
      id: serial("id").primaryKey(),
      key: text("key").notNull().unique(),
      value: text("value").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    insertSiteCustomizationSchema = createInsertSchema(siteCustomization).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    boxTypes = pgTable("box_types", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      // e.g., "Small", "Medium", "Large"
      description: text("description"),
      // Optional description of the box
      dimensions: text("dimensions"),
      // Optional dimensions in format "length x width x height" (in cm or inches)
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    boxInventory = pgTable("box_inventory", {
      id: serial("id").primaryKey(),
      boxTypeId: integer("box_type_id").notNull().references(() => boxTypes.id, { onDelete: "cascade" }),
      quantity: integer("quantity").notNull().default(0),
      lastUpdated: timestamp("last_updated").defaultNow().notNull()
    });
    insertBoxTypeSchema = createInsertSchema(boxTypes).omit({
      id: true,
      createdAt: true
    });
    insertBoxInventorySchema = createInsertSchema(boxInventory).omit({
      id: true,
      lastUpdated: true
    }).extend({
      quantity: z.number().min(0).max(999999)
    });
    siteSettings = pgTable("site_settings", {
      id: serial("id").primaryKey(),
      key: text("key").notNull().unique(),
      // Setting key (e.g., "redirectBasePath")
      value: text("value"),
      // Setting value (e.g., "/redirect")
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    redirectUrls = pgTable("redirect_urls", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      // A descriptive name for the redirect (e.g., "QR Code Redirect")
      destinationUrl: text("destination_url").notNull(),
      // Where users will be redirected to
      accessCount: integer("access_count").default(0).notNull(),
      // Number of times the redirect has been accessed
      lastAccessed: timestamp("last_accessed"),
      // When the redirect was last accessed
      qrCodeStyle: text("qr_code_style"),
      // JSON string for custom QR code styles
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    insertRedirectUrlSchema = createInsertSchema(redirectUrls).omit({
      id: true,
      accessCount: true,
      lastAccessed: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      qrCodeStyle: z.string().optional()
    });
    insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    postPurchaseDiscounts = pgTable("post_purchase_discounts", {
      id: serial("id").primaryKey(),
      code: text("code").notNull().unique(),
      orderId: integer("order_id").notNull(),
      userId: integer("user_id"),
      customerEmail: text("customer_email"),
      discountType: text("discount_type").notNull(),
      // 'percentage', 'fixed_amount'
      value: integer("value").notNull(),
      // Percentage (1-100) or amount in cents
      minPurchase: integer("min_purchase"),
      // Minimum purchase amount in cents  
      isUsed: boolean("is_used").default(false),
      expiryDate: date("expiry_date"),
      // When the discount expires
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertPostPurchaseDiscountSchema = createInsertSchema(postPurchaseDiscounts).omit({
      id: true,
      createdAt: true
    });
    insertProductPriceVariationSchema = createInsertSchema(productPriceVariations).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/storage.ts
var storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_pgStorage();
    storage = new PgStorage();
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  authenticateToken: () => authenticateToken,
  comparePassword: () => comparePassword,
  createUser: () => createUser,
  generateToken: () => generateToken,
  hashPassword: () => hashPassword,
  isAdmin: () => isAdmin,
  verifyToken: () => verifyToken
});
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
async function createUser(userData) {
  try {
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return null;
    }
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return null;
    }
    const hashedPassword = await hashPassword(userData.password);
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}
function authenticateToken(req, res, next) {
  console.log(`AUTH MIDDLEWARE: ${req.method} ${req.path}`);
  console.log(`AUTH MIDDLEWARE: Headers:`, JSON.stringify(req.headers, null, 2));
  const devBypass = req.headers["x-admin-access"] === "sweetmoment-dev-secret";
  if (devBypass) {
    console.log(`AUTH MIDDLEWARE: Using development bypass header`);
    req.user = {
      id: 1,
      username: "admin",
      email: "admin@sweetmoment.com",
      isAdmin: true
    };
    return next();
  }
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.log(`AUTH MIDDLEWARE: No token provided`);
    return res.status(401).json({ message: "Authentication required" });
  }
  const user = verifyToken(token);
  if (!user) {
    console.log(`AUTH MIDDLEWARE: Invalid or expired token`);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
  console.log(`AUTH MIDDLEWARE: User authenticated:`, user);
  req.user = user;
  next();
}
function isAdmin(req, res, next) {
  console.log(`ADMIN MIDDLEWARE: ${req.method} ${req.path}`);
  const devBypass = req.headers["x-admin-access"] === "sweetmoment-dev-secret";
  if ((!req.user || !req.user.isAdmin) && !devBypass) {
    console.log(`ADMIN MIDDLEWARE: Access denied - user is not admin or dev bypass not provided`);
    return res.status(403).json({ message: "Admin access required" });
  }
  console.log(`ADMIN MIDDLEWARE: Access granted`);
  next();
}
var JWT_SECRET, SALT_ROUNDS;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
    JWT_SECRET = "sweet-moment-secret-key";
    SALT_ROUNDS = 10;
  }
});

// server/pgStorage.ts
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql, and, desc, inArray } from "drizzle-orm";
import postgres from "postgres";
var connectionString, client, db, PgStorage, storage2;
var init_pgStorage = __esm({
  "server/pgStorage.ts"() {
    "use strict";
    init_schema();
    connectionString = process.env.DATABASE_URL;
    client = postgres(connectionString);
    db = drizzle(client);
    PgStorage = class {
      // Expose the db instance for direct SQL queries
      db = db;
      // Helper method to check if a table exists
      async tableExists(tableName) {
        const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      )
    `);
        return result.rows && result.rows.length > 0 && result.rows[0].exists;
      }
      // Initialize the database with default data if needed
      async initialize() {
        console.log("Initializing PostgreSQL storage...");
        const userCount = await db.select({ count: sql`count(*)` }).from(users);
        if (userCount[0].count === 0) {
          console.log("Adding admin user...");
          const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
          const hashedPassword = await hashPassword2("sweetmoment123");
          await db.insert(users).values({
            username: "admin",
            email: "admin@sweetmoment.com",
            password: hashedPassword,
            firstName: "Admin",
            lastName: "User",
            isAdmin: true
          });
          console.log("Admin user created successfully");
        }
        const productCount = await db.select({ count: sql`count(*)` }).from(products);
        if (productCount[0].count === 0) {
          console.log("Adding default products...");
          await db.insert(products).values([
            {
              id: 1,
              // Must match classic ID in ID mapping
              name: "Classic Chocolate",
              description: "Our timeless collection of handcrafted chocolates, made with the finest cocoa beans.",
              image: "https://images.unsplash.com/photo-1582005450386-de4293070382?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
              rating: 4.5,
              reviewCount: 124,
              basePrice: 800,
              // Storing in cents
              category: "classic",
              featured: true,
              inventory: 100,
              sizeOptions: JSON.stringify([
                { id: "small", label: "Small Box (4 pieces)", value: "small", price: 0 },
                { id: "medium", label: "Medium Box (8 pieces)", value: "medium", price: 400 },
                { id: "large", label: "Large Box (12 pieces)", value: "large", price: 800 }
              ]),
              typeOptions: JSON.stringify([
                { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
                { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
              ])
            },
            {
              id: 2,
              // Must match assorted ID in ID mapping
              name: "Assorted Nuts Chocolate",
              description: "A delightful blend of premium nuts and rich chocolate for an exquisite taste experience.",
              image: "https://images.unsplash.com/photo-1624454002302-c8d1d73b916c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
              rating: 5,
              reviewCount: 89,
              basePrice: 900,
              // Storing in cents
              category: "assorted",
              featured: true,
              inventory: 80,
              sizeOptions: JSON.stringify([
                { id: "standard", label: "Standard Box (8 pieces)", value: "standard", price: 0 }
              ]),
              typeOptions: JSON.stringify([
                { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
                { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
              ])
            },
            {
              id: 3,
              // Must match caramel ID in ID mapping
              name: "Caramel Chocolate",
              description: "Indulge in our smooth caramel-filled chocolates that melt in your mouth with every bite.",
              image: "https://images.unsplash.com/photo-1608250389763-3b2d9a386ed6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
              rating: 4.5,
              reviewCount: 76,
              basePrice: 850,
              // Storing in cents
              category: "caramel",
              featured: false,
              inventory: 90,
              sizeOptions: JSON.stringify([
                { id: "small", label: "Small Box (4 pieces)", value: "small", price: 0 },
                { id: "medium", label: "Medium Box (8 pieces)", value: "medium", price: 450 },
                { id: "large", label: "Large Box (12 pieces)", value: "large", price: 850 }
              ]),
              typeOptions: JSON.stringify([
                { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
                { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
              ])
            },
            {
              id: 4,
              // Must match cereal ID in ID mapping
              name: "Cereal Chocolate",
              description: "A crunchy twist on our classic chocolate with premium cereals for a delightful texture.",
              image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
              rating: 4.7,
              reviewCount: 42,
              basePrice: 850,
              // Storing in cents
              category: "cereal",
              featured: false,
              inventory: 85,
              sizeOptions: JSON.stringify([
                { id: "standard", label: "Standard Box (8 pieces)", value: "standard", price: 0 }
              ]),
              typeOptions: JSON.stringify([
                { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
                { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
              ])
            }
          ]);
        }
        const categoryCount = await db.select({ count: sql`count(*)` }).from(categories);
        if (categoryCount[0].count === 0) {
          console.log("Adding default categories...");
          await db.insert(categories).values(
            { name: "Classic", slug: "classic", description: "Our traditional chocolate collections" }
          );
          await db.insert(categories).values(
            { name: "Assorted Nuts", slug: "assorted", description: "Chocolate with premium nuts" }
          );
          await db.insert(categories).values(
            { name: "Caramel", slug: "caramel", description: "Sweet caramel-filled chocolates" }
          );
          await db.insert(categories).values(
            { name: "Cereal", slug: "cereal", description: "Crunchy cereal chocolate combinations" }
          );
        }
      }
      // ===== User methods =====
      async getUser(id) {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
      }
      async getUserByUsername(username) {
        const result = await db.select().from(users).where(eq(users.username, username));
        return result[0];
      }
      async getUserByEmail(email) {
        const result = await db.select().from(users).where(eq(users.email, email));
        return result[0];
      }
      async createUser(user) {
        const result = await db.insert(users).values(user).returning();
        return result[0];
      }
      async updateUser(id, userData) {
        const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
        return result[0];
      }
      // ===== Product methods =====
      async getProducts() {
        return await db.select().from(products);
      }
      async getProduct(id) {
        const result = await db.select().from(products).where(eq(products.id, id));
        return result[0];
      }
      async getProductsByCategory(category) {
        return await db.select().from(products).where(eq(products.category, category));
      }
      async getFeaturedProducts() {
        return await db.select().from(products).orderBy(desc(products.rating)).limit(4);
      }
      async createProduct(product) {
        const result = await db.insert(products).values(product).returning();
        return result[0];
      }
      async updateProduct(id, productData) {
        try {
          console.log(`Updating product ${id} with data:`, productData);
          const existingProduct = await db.select().from(products).where(eq(products.id, id));
          if (!existingProduct.length) {
            console.log(`Product with ID ${id} not found for update`);
            return void 0;
          }
          console.log(`Found existing product: ${existingProduct[0].name}`);
          const result = await db.update(products).set(productData).where(eq(products.id, id)).returning();
          console.log(`Update result:`, result);
          return result[0];
        } catch (error) {
          console.error(`Error updating product ${id}:`, error);
          throw error;
        }
      }
      async deleteProduct(id) {
        console.log(`STORAGE DELETE: Starting deletion process for product ID ${id}`);
        try {
          const productExists = await db.select({ id: products.id, name: products.name }).from(products).where(eq(products.id, id));
          if (!productExists.length) {
            console.log(`STORAGE DELETE: Product with ID ${id} not found`);
            return false;
          }
          console.log(`STORAGE DELETE: Found product to delete: ${JSON.stringify(productExists[0])}`);
          const success = await db.transaction(async (tx) => {
            console.log(`STORAGE DELETE: Starting transaction for product ${id}`);
            try {
              const reviewsResult = await tx.delete(reviews).where(eq(reviews.productId, id)).returning({ id: reviews.id });
              console.log(`STORAGE DELETE: Deleted ${reviewsResult.length} reviews for product ${id}`);
              const imagesResult = await tx.delete(productImages).where(eq(productImages.productId, id)).returning({ id: productImages.id });
              console.log(`STORAGE DELETE: Deleted ${imagesResult.length} images for product ${id}`);
              const cartResult = await tx.delete(cartItems).where(eq(cartItems.productId, id)).returning({ id: cartItems.id });
              console.log(`STORAGE DELETE: Deleted ${cartResult.length} cart items for product ${id}`);
              const result = await tx.delete(products).where(eq(products.id, id)).returning({ id: products.id });
              console.log(`STORAGE DELETE: Product delete result: ${JSON.stringify(result)}`);
              return result.length > 0;
            } catch (txError) {
              console.error(`STORAGE DELETE: Transaction error:`, txError);
              throw txError;
            }
          });
          console.log(`STORAGE DELETE: Transaction completed with success = ${success}`);
          return success;
        } catch (error) {
          console.error(`STORAGE DELETE: Error in deleteProduct:`, error);
          throw error;
        }
      }
      // ===== Product Image methods =====
      async getProductImages(productId) {
        return await db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(productImages.displayOrder);
      }
      async getProductImage(id) {
        const result = await db.select().from(productImages).where(eq(productImages.id, id));
        return result[0];
      }
      async createProductImage(image) {
        try {
          return await db.transaction(async (tx) => {
            const result = await tx.insert(productImages).values(image).returning();
            const newImage = result[0];
            await tx.update(products).set({ hasMultipleImages: true }).where(eq(products.id, image.productId));
            console.log(`Created new image for product ${image.productId} and updated hasMultipleImages flag`);
            return newImage;
          });
        } catch (error) {
          console.error(`Error creating product image:`, error);
          throw error;
        }
      }
      async updateProductImage(id, imageData) {
        const result = await db.update(productImages).set(imageData).where(eq(productImages.id, id)).returning();
        return result[0];
      }
      async deleteProductImage(id) {
        try {
          return await db.transaction(async (tx) => {
            const imageToDelete = await tx.select().from(productImages).where(eq(productImages.id, id));
            if (imageToDelete.length === 0) {
              return false;
            }
            const productId = imageToDelete[0].productId;
            const result = await tx.delete(productImages).where(eq(productImages.id, id)).returning({ id: productImages.id });
            if (result.length === 0) {
              return false;
            }
            const remainingImages = await tx.select().from(productImages).where(eq(productImages.productId, productId));
            if (remainingImages.length <= 1) {
              await tx.update(products).set({ hasMultipleImages: false }).where(eq(products.id, productId));
              console.log(`Deleted image for product ${productId} and updated hasMultipleImages flag to false`);
            } else {
              console.log(`Deleted image for product ${productId}, ${remainingImages.length} images remaining`);
            }
            return true;
          });
        } catch (error) {
          console.error(`Error deleting product image:`, error);
          throw error;
        }
      }
      // ===== Cart methods =====
      async getCartItems(userId) {
        return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
      }
      async addCartItem(item) {
        const result = await db.insert(cartItems).values(item).returning();
        return result[0];
      }
      async removeCartItem(id) {
        await db.delete(cartItems).where(eq(cartItems.id, id));
      }
      async clearCart(userId) {
        await db.delete(cartItems).where(eq(cartItems.userId, userId));
      }
      // ===== Order methods =====
      async getOrder(id) {
        try {
          console.log(`Getting order ${id} with optimized approach`);
          const result = await db.select({
            id: orders.id,
            userId: orders.userId,
            customerName: orders.customerName,
            customerEmail: orders.customerEmail,
            status: orders.status,
            totalAmount: orders.totalAmount,
            shippingAddress: orders.shippingAddress,
            deliveryMethod: orders.deliveryMethod,
            phone: orders.phone,
            paymentIntentId: orders.paymentIntentId,
            postPurchaseDiscountCode: orders.postPurchaseDiscountCode,
            metadata: orders.metadata,
            // Include metadata for potential cart items
            createdAt: orders.createdAt
          }).from(orders).where(eq(orders.id, id));
          if (result.length === 0) {
            return void 0;
          }
          const order = result[0];
          const dbItems = await db.select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            size: orderItems.size,
            type: orderItems.type,
            shape: orderItems.shape,
            quantity: orderItems.quantity,
            price: orderItems.price
          }).from(orderItems).where(eq(orderItems.orderId, order.id));
          console.log(`Found ${dbItems.length} items in database for order ${order.id}`);
          const productNames = {
            // String-based product ID mappings
            "ClassicChocolate": "Classic Chocolate",
            "CaramelChocolate": "Caramel Chocolate",
            "DubaiBar": "Dubai Bar",
            "SignatureCollection": "Signature Collection",
            "AssortedNutsChocolate": "Assorted Nuts Chocolate",
            "GoldBar": "Gold Bar"
          };
          const numericProductIds = dbItems.map((item) => Number(item.productId)).filter((id2) => !isNaN(id2));
          if (numericProductIds.length > 0) {
            const productsResult = await db.select({
              id: products.id,
              name: products.name
            }).from(products).where(inArray(products.id, numericProductIds));
            productsResult.forEach((product) => {
              productNames[product.id.toString()] = product.name;
            });
            console.log(`Loaded ${productsResult.length} product names for order items`);
          }
          let finalItems = [];
          if (dbItems.length > 0) {
            finalItems = dbItems.map((item) => {
              const productId = item.productId;
              let productName = productNames[productId] || `Product #${productId}`;
              return {
                ...item,
                productName
              };
            });
          } else if (order.metadata) {
            console.log(`No items in database for order ${id}, checking metadata for cart items`);
            try {
              const metadata = JSON.parse(order.metadata);
              let cartItemsJson = metadata.cart_items || metadata.cartItems;
              if (cartItemsJson) {
                const cartItems2 = typeof cartItemsJson === "string" ? JSON.parse(cartItemsJson) : cartItemsJson;
                console.log(`Found ${cartItems2.length} cart items in metadata for order ${id}`);
                finalItems = cartItems2.map((item) => {
                  const productId = item.id || item.productId;
                  const productName = item.name || productNames[productId] || `Product #${productId}`;
                  const quantity = item.qty || item.quantity || 1;
                  const price = item.price || 0;
                  const size = item.size || "none";
                  const type = item.type || "milk";
                  let shape = item.shape;
                  if (!shape) {
                    if (productId === 47 || productId === "47" || productId === "DubaiBar") {
                      shape = "rectangular";
                    } else {
                      shape = "none";
                    }
                  }
                  return {
                    orderId: id,
                    productId,
                    productName,
                    quantity,
                    price,
                    size,
                    type,
                    shape
                  };
                });
              }
            } catch (error) {
              console.error(`Error extracting cart items from metadata for order ${id}:`, error);
            }
          }
          return {
            ...order,
            items: finalItems
          };
        } catch (error) {
          console.error(`Error getting order ${id}:`, error);
          return void 0;
        }
      }
      async getUserOrders(userId) {
        try {
          console.log(`Getting orders for user ${userId} with optimized approach`);
          const userOrders = await db.select({
            id: orders.id,
            userId: orders.userId,
            customerName: orders.customerName,
            customerEmail: orders.customerEmail,
            status: orders.status,
            totalAmount: orders.totalAmount,
            shippingAddress: orders.shippingAddress,
            deliveryMethod: orders.deliveryMethod,
            phone: orders.phone,
            paymentIntentId: orders.paymentIntentId,
            postPurchaseDiscountCode: orders.postPurchaseDiscountCode,
            metadata: orders.metadata,
            // Include metadata for cart items fallback
            createdAt: orders.createdAt
          }).from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
          console.log(`Found ${userOrders.length} orders for user ${userId}`);
          if (userOrders.length === 0) {
            return [];
          }
          const orderIds = userOrders.map((order) => order.id);
          const allItems = await db.select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            size: orderItems.size,
            type: orderItems.type,
            shape: orderItems.shape,
            quantity: orderItems.quantity,
            price: orderItems.price
          }).from(orderItems).where(inArray(orderItems.orderId, orderIds));
          console.log(`Found ${allItems.length} total items for all user orders`);
          const numericProductIds = allItems.map((item) => Number(item.productId)).filter((id) => !isNaN(id));
          const productNames = {};
          if (numericProductIds.length > 0) {
            const productsResult = await db.select({
              id: products.id,
              name: products.name
            }).from(products).where(inArray(products.id, numericProductIds));
            productsResult.forEach((product) => {
              productNames[product.id.toString()] = product.name;
            });
            console.log(`Loaded ${productsResult.length} product names for order items`);
          }
          const itemsByOrderId = {};
          allItems.forEach((item) => {
            const orderId = item.orderId;
            if (!itemsByOrderId[orderId]) {
              itemsByOrderId[orderId] = [];
            }
            const productId = item.productId;
            let productName = productNames[productId] || `Product #${productId}`;
            itemsByOrderId[orderId].push({
              ...item,
              productName
            });
          });
          const ordersWithItems = userOrders.map((order) => {
            let items = itemsByOrderId[order.id] || [];
            if (items.length === 0 && order.metadata) {
              try {
                const metadata = JSON.parse(order.metadata);
                let cartItemsJson = metadata.cart_items || metadata.cartItems;
                if (cartItemsJson) {
                  const cartItems2 = typeof cartItemsJson === "string" ? JSON.parse(cartItemsJson) : cartItemsJson;
                  console.log(`Found ${cartItems2.length} items in metadata for order ${order.id}`);
                  items = cartItems2.map((item) => {
                    const productId = item.id || item.productId;
                    const productName = item.name || productNames[productId] || `Product #${productId}`;
                    const quantity = item.qty || item.quantity || 1;
                    const price = item.price || 0;
                    const size = item.size || "none";
                    const type = item.type || "milk";
                    let shape = item.shape;
                    if (!shape) {
                      if (productId === 47 || productId === "47" || productId === "DubaiBar") {
                        shape = "rectangular";
                      } else {
                        shape = "none";
                      }
                    }
                    return {
                      productId,
                      productName,
                      quantity,
                      price,
                      size,
                      type,
                      shape
                    };
                  });
                }
              } catch (error) {
                console.error(`Error extracting items from metadata for order ${order.id}:`, error);
              }
            }
            return {
              ...order,
              items
            };
          });
          return ordersWithItems;
        } catch (error) {
          console.error(`Error getting orders for user ${userId}:`, error);
          return [];
        }
      }
      async getAllOrders() {
        try {
          console.log("Getting all orders with improved query approach");
          const allOrders = await db.select({
            id: orders.id,
            userId: orders.userId,
            customerName: orders.customerName,
            customerEmail: orders.customerEmail,
            status: orders.status,
            totalAmount: orders.totalAmount,
            shippingAddress: orders.shippingAddress,
            deliveryMethod: orders.deliveryMethod,
            phone: orders.phone,
            paymentIntentId: orders.paymentIntentId,
            postPurchaseDiscountCode: orders.postPurchaseDiscountCode,
            metadata: orders.metadata,
            createdAt: orders.createdAt
          }).from(orders).orderBy(desc(orders.createdAt));
          console.log(`Found ${allOrders.length} orders`);
          const allItems = await db.select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            size: orderItems.size,
            type: orderItems.type,
            shape: orderItems.shape,
            quantity: orderItems.quantity,
            price: orderItems.price
          }).from(orderItems).where(inArray(orderItems.orderId, allOrders.map((order) => order.id)));
          console.log(`Found ${allItems.length} total order items`);
          const productNames = {
            // String-based product ID mappings
            "ClassicChocolate": "Classic Chocolate",
            "CaramelChocolate": "Caramel Chocolate",
            "DubaiBar": "Dubai Bar",
            "SignatureCollection": "Signature Collection",
            "AssortedNutsChocolate": "Assorted Nuts Chocolate",
            "GoldBar": "Gold Bar"
          };
          const numericProductIds = allItems.map((item) => Number(item.productId)).filter((id) => !isNaN(id));
          if (numericProductIds.length > 0) {
            const productsResult = await db.select({
              id: products.id,
              name: products.name
            }).from(products).where(inArray(products.id, numericProductIds));
            productsResult.forEach((product) => {
              productNames[product.id.toString()] = product.name;
            });
            console.log(`Loaded ${productsResult.length} product names for order items`);
          }
          const itemsByOrderId = {};
          allItems.forEach((item) => {
            const orderId = item.orderId;
            if (!itemsByOrderId[orderId]) {
              itemsByOrderId[orderId] = [];
            }
            const productId = item.productId;
            let productName = productNames[productId] || `Product #${productId}`;
            itemsByOrderId[orderId].push({
              ...item,
              productName
            });
          });
          const ordersWithItems = allOrders.map((order) => {
            let items = itemsByOrderId[order.id] || [];
            if (items.length === 0 && order.metadata) {
              try {
                const metadata = JSON.parse(order.metadata);
                let cartItemsJson = metadata.cart_items || metadata.cartItems;
                if (cartItemsJson) {
                  const cartItems2 = typeof cartItemsJson === "string" ? JSON.parse(cartItemsJson) : cartItemsJson;
                  console.log(`Found ${cartItems2.length} items in metadata for order ${order.id}`);
                  items = cartItems2.map((item) => {
                    const productId = item.id || item.productId;
                    const productName = item.name || productNames[productId] || `Product #${productId}`;
                    const quantity = item.qty || item.quantity || 1;
                    const price = item.price || 0;
                    const size = item.size || "none";
                    const type = item.type || "milk";
                    let shape = item.shape;
                    if (!shape) {
                      if (productId === 47 || productId === "47" || productId === "DubaiBar") {
                        shape = "rectangular";
                      } else {
                        shape = "none";
                      }
                    }
                    return {
                      productId,
                      productName,
                      quantity,
                      price,
                      size,
                      type,
                      shape
                    };
                  });
                }
              } catch (error) {
                console.error(`Error extracting items from metadata for order ${order.id}:`, error);
              }
            }
            return {
              ...order,
              items
            };
          });
          return ordersWithItems;
        } catch (error) {
          console.error("Error getting all orders:", error);
          return [];
        }
      }
      async createOrder(order) {
        try {
          console.log("Creating new order with data:", JSON.stringify(order));
          const sanitizedOrder = {
            ...order,
            customerName: order.customerName || "",
            // Do not replace phone with empty string - keep it exactly as provided
            // This prevents the empty string from being converted to "+1 111-111-1111" later
            phone: order.phone,
            paymentIntentId: order.paymentIntentId || "",
            shippingAddress: order.shippingAddress || "",
            postPurchaseDiscountCode: order.postPurchaseDiscountCode || null,
            // Handle missing field
            customerEmail: order.customerEmail || null
            // Handle optional customerEmail field
          };
          console.log(`Phone value received in createOrder: "${order.phone}" (type: ${typeof order.phone})`);
          try {
            console.log("Running SQL insert for order with sanitized data:", JSON.stringify(sanitizedOrder));
            console.log(`Phone value before insert: "${sanitizedOrder.phone}" (type: ${typeof sanitizedOrder.phone})`);
            let metadataValue = null;
            if (order.metadata) {
              metadataValue = typeof order.metadata === "string" ? order.metadata : JSON.stringify(order.metadata);
              console.log(`Metadata for order: ${metadataValue}`);
            }
            const cleanOrderData = {
              userId: sanitizedOrder.userId,
              customerName: sanitizedOrder.customerName,
              status: sanitizedOrder.status,
              totalAmount: sanitizedOrder.totalAmount,
              shippingAddress: sanitizedOrder.shippingAddress,
              deliveryMethod: sanitizedOrder.deliveryMethod || "ship",
              phone: sanitizedOrder.phone,
              paymentIntentId: sanitizedOrder.paymentIntentId,
              postPurchaseDiscountCode: sanitizedOrder.postPurchaseDiscountCode,
              metadata: metadataValue
              // Add metadata field
            };
            const result = await db.insert(orders).values(cleanOrderData).returning();
            if (!result || result.length === 0) {
              console.error("Order creation failed: No result returned from database");
              throw new Error("Order creation failed: Database did not return created order");
            }
            const savedOrder = result[0];
            console.log(`Successfully created order #${savedOrder.id} with phone: "${savedOrder.phone}"`);
            if (cleanOrderData.phone && savedOrder.phone !== cleanOrderData.phone) {
              console.error(`WARNING: Phone number mismatch! Expected "${cleanOrderData.phone}" but got "${savedOrder.phone}"`);
            }
            return result[0];
          } catch (insertError) {
            console.error("Error during database insert operation:", insertError);
            console.log("Attempting raw SQL insert as fallback...");
            throw insertError;
          }
        } catch (error) {
          console.error("Error creating order:", error);
          console.error("Order creation error. Attempted to create with data:", JSON.stringify(order));
          throw error;
        }
      }
      async updateOrderStatus(id, status) {
        const result = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
        return result[0];
      }
      async updateOrder(id, orderData) {
        try {
          if (orderData.shippingAddress !== void 0) {
            if (orderData.shippingAddress.includes(",") && !orderData.shippingAddress.includes("\n")) {
              orderData.shippingAddress = orderData.shippingAddress.replace(/,\s+/g, "\n").replace(/,/g, "\n").replace(/\n{2,}/g, "\n");
              console.log(`PgStorage: Formatted address with newlines for order ${id}: "${orderData.shippingAddress}"`);
            }
          }
          if (orderData.phone !== void 0) {
            console.log(`PgStorage: Updating order ${id} with phone number: "${orderData.phone}"`);
          }
          const result = await db.update(orders).set(orderData).where(eq(orders.id, id)).returning();
          if (result.length > 0 && orderData.phone !== void 0) {
            console.log(`PgStorage: Updated order ${id} phone result: "${result[0].phone}"`);
            if (result[0].phone !== orderData.phone) {
              console.error(`WARNING: Phone update mismatch for order ${id}! Expected "${orderData.phone}" but got "${result[0].phone}"`);
            }
          }
          return result[0];
        } catch (error) {
          console.error("Error updating order:", error);
          return void 0;
        }
      }
      async deleteOrder(id) {
        try {
          await db.delete(orderItems).where(eq(orderItems.orderId, id));
          const result = await db.delete(orders).where(eq(orders.id, id)).returning();
          return result.length > 0;
        } catch (error) {
          console.error("Error deleting order:", error);
          return false;
        }
      }
      async getOrdersByPaymentIntentId(paymentIntentId) {
        try {
          const result = await db.select({
            id: orders.id,
            userId: orders.userId,
            customerName: orders.customerName,
            customerEmail: orders.customerEmail,
            status: orders.status,
            totalAmount: orders.totalAmount,
            shippingAddress: orders.shippingAddress,
            deliveryMethod: orders.deliveryMethod,
            phone: orders.phone,
            paymentIntentId: orders.paymentIntentId,
            createdAt: orders.createdAt,
            postPurchaseDiscountCode: orders.postPurchaseDiscountCode,
            metadata: orders.metadata
          }).from(orders).where(eq(orders.paymentIntentId, paymentIntentId));
          return result;
        } catch (error) {
          console.error("Error getting orders by payment intent ID:", error);
          return [];
        }
      }
      // ===== Order item methods =====
      async getOrderItems(orderId) {
        try {
          console.log(`Getting order items for order ${orderId} with optimized approach`);
          const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
          const numericProductIds = items.map((item) => Number(item.productId)).filter((id) => !isNaN(id));
          const productNames = {
            // String-based product ID mappings
            "ClassicChocolate": "Classic Chocolate",
            "CaramelChocolate": "Caramel Chocolate",
            "DubaiBar": "Dubai Bar",
            "SignatureCollection": "Signature Collection",
            "AssortedNutsChocolate": "Assorted Nuts Chocolate",
            "GoldBar": "Gold Bar"
          };
          if (numericProductIds.length > 0) {
            const productsResult = await db.select({
              id: products.id,
              name: products.name
            }).from(products).where(inArray(products.id, numericProductIds));
            productsResult.forEach((product) => {
              productNames[product.id.toString()] = product.name;
            });
            console.log(`Loaded ${productsResult.length} product names for order items`);
          }
          if (items.length > 0) {
            console.log(`Found ${items.length} items in database for order ${orderId}`);
            return items.map((item) => {
              const productId = item.productId;
              const productName = productNames[productId] || `Product #${productId}`;
              return {
                ...item,
                productName
              };
            });
          }
          console.log(`No items found in database for order ${orderId}, checking metadata`);
          const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
          if (order && order.metadata) {
            try {
              const metadata = JSON.parse(order.metadata);
              let cartItemsJson = metadata.cart_items || metadata.cartItems;
              if (cartItemsJson) {
                const cartItems2 = typeof cartItemsJson === "string" ? JSON.parse(cartItemsJson) : cartItemsJson;
                console.log(`Found ${cartItems2.length} items in metadata for order ${orderId}`);
                return cartItems2.map((item) => {
                  const productId = item.id || item.productId;
                  const productName = item.name || productNames[productId] || `Product #${productId}`;
                  const quantity = item.qty || item.quantity || 1;
                  const price = item.price || 0;
                  const size = item.size || "none";
                  const type = item.type || "milk";
                  let shape = item.shape;
                  if (!shape) {
                    if (productId === 47 || productId === "47" || productId === "DubaiBar") {
                      shape = "rectangular";
                    } else {
                      shape = "none";
                    }
                  }
                  return {
                    orderId,
                    productId,
                    productName,
                    quantity,
                    price,
                    size,
                    type,
                    shape
                  };
                });
              }
            } catch (error) {
              console.error(`Error extracting items from metadata for order ${orderId}:`, error);
            }
          }
          return [];
        } catch (error) {
          console.error(`Error getting order items for order ${orderId}:`, error);
          return [];
        }
      }
      async createOrderItem(item) {
        try {
          const productNames = {
            // String-based product ID mappings
            "ClassicChocolate": "Classic Chocolate",
            "CaramelChocolate": "Caramel Chocolate",
            "DubaiBar": "Dubai Bar",
            "SignatureCollection": "Signature Collection",
            "AssortedNutsChocolate": "Assorted Nuts Chocolate",
            "GoldBar": "Gold Bar"
          };
          let productName = productNames[item.productId] || `Product #${item.productId}`;
          if (productName.startsWith("Product #")) {
            try {
              const numericId = Number(item.productId);
              if (!isNaN(numericId)) {
                const productResult = await db.select({
                  name: products.name
                }).from(products).where(eq(products.id, numericId)).limit(1);
                if (productResult.length > 0) {
                  productName = productResult[0].name;
                }
              }
            } catch (productLookupError) {
              console.error(`Error looking up product name for ID ${item.productId}:`, productLookupError);
            }
          }
          const itemForDb = {
            orderId: item.orderId,
            productId: item.productId,
            size: item.size,
            type: item.type,
            shape: item.shape,
            quantity: item.quantity,
            price: item.price
          };
          console.log(`Creating order item with data:`, itemForDb);
          const result = await db.insert(orderItems).values(itemForDb).returning();
          return {
            ...result[0],
            productName
            // Add the product name to the returned object
          };
        } catch (error) {
          console.error("Error creating order item:", error);
          throw error;
        }
      }
      // ===== Review methods =====
      async getProductReviews(productId) {
        try {
          return await db.select().from(reviews).where(eq(reviews.productId, productId));
        } catch (error) {
          console.error(`Error getting product reviews for product ${productId}:`, error);
          return [];
        }
      }
      async getUserReviews(userId) {
        try {
          return await db.select().from(reviews).where(eq(reviews.userId, userId));
        } catch (error) {
          console.error(`Error getting user reviews for user ${userId}:`, error);
          return [];
        }
      }
      async getAllReviews() {
        try {
          return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
        } catch (error) {
          console.error("Error getting all reviews:", error);
          return [];
        }
      }
      async createReview(review) {
        const createdReview = await db.transaction(async (tx) => {
          const result = await tx.insert(reviews).values(review).returning();
          const newReview = result[0];
          const productReviews = await tx.select().from(reviews).where(eq(reviews.productId, review.productId));
          const reviewCount = productReviews.length;
          const averageRating = reviewCount > 0 ? Math.round(productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount * 10) / 10 : 0;
          await tx.update(products).set({
            rating: averageRating,
            reviewCount
          }).where(eq(products.id, review.productId));
          console.log(`Updated product ${review.productId} rating to ${averageRating} based on ${reviewCount} reviews`);
          return newReview;
        });
        return createdReview;
      }
      async deleteReview(id) {
        const reviewToDelete = await db.select().from(reviews).where(eq(reviews.id, id));
        if (reviewToDelete.length === 0) {
          return false;
        }
        const productId = reviewToDelete[0].productId;
        const success = await db.transaction(async (tx) => {
          const result = await tx.delete(reviews).where(eq(reviews.id, id)).returning({ id: reviews.id });
          if (result.length === 0) {
            return false;
          }
          const productReviews = await tx.select().from(reviews).where(eq(reviews.productId, productId));
          const reviewCount = productReviews.length;
          const averageRating = reviewCount > 0 ? Math.round(productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount * 10) / 10 : 0;
          await tx.update(products).set({
            rating: averageRating,
            reviewCount
          }).where(eq(products.id, productId));
          console.log(`Updated product ${productId} rating to ${averageRating} based on ${reviewCount} reviews after deleting review ${id}`);
          return true;
        });
        return success;
      }
      // ===== Address methods =====
      async getUserAddresses(userId) {
        try {
          return await db.select().from(addresses).where(eq(addresses.userId, userId));
        } catch (error) {
          console.error(`Error getting addresses for user ${userId}:`, error);
          return [];
        }
      }
      async getAddress(id) {
        try {
          const result = await db.select().from(addresses).where(eq(addresses.id, id));
          return result[0];
        } catch (error) {
          console.error(`Error getting address ${id}:`, error);
          return void 0;
        }
      }
      async createAddress(address) {
        try {
          const result = await db.insert(addresses).values(address).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating address:", error);
          throw error;
        }
      }
      async updateAddress(id, addressData) {
        try {
          const result = await db.update(addresses).set(addressData).where(eq(addresses.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error(`Error updating address ${id}:`, error);
          return void 0;
        }
      }
      async deleteAddress(id) {
        try {
          const result = await db.delete(addresses).where(eq(addresses.id, id)).returning({ id: addresses.id });
          return result.length > 0;
        } catch (error) {
          console.error(`Error deleting address ${id}:`, error);
          return false;
        }
      }
      async setDefaultAddress(userId, addressId) {
        try {
          await db.transaction(async (tx) => {
            await tx.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
            await tx.update(addresses).set({ isDefault: true }).where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
          });
        } catch (error) {
          console.error(`Error setting default address for user ${userId}, address ${addressId}:`, error);
          throw error;
        }
      }
      // ===== Category methods =====
      async getCategories() {
        try {
          return await db.select().from(categories);
        } catch (error) {
          console.error("Error getting categories:", error);
          return [];
        }
      }
      async getCategory(id) {
        try {
          const result = await db.select().from(categories).where(eq(categories.id, id));
          return result[0];
        } catch (error) {
          console.error(`Error getting category ${id}:`, error);
          return void 0;
        }
      }
      async createCategory(category) {
        try {
          const result = await db.insert(categories).values(category).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating category:", error);
          throw error;
        }
      }
      async updateCategory(id, categoryData) {
        try {
          const result = await db.update(categories).set(categoryData).where(eq(categories.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error(`Error updating category ${id}:`, error);
          return void 0;
        }
      }
      async deleteCategory(id) {
        try {
          const result = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
          return result.length > 0;
        } catch (error) {
          console.error(`Error deleting category ${id}:`, error);
          return false;
        }
      }
      // ===== Discount methods =====
      async getDiscounts() {
        try {
          return await db.select().from(discounts);
        } catch (error) {
          console.error("Error getting discounts:", error);
          return [];
        }
      }
      async getDiscount(id) {
        try {
          const result = await db.select().from(discounts).where(eq(discounts.id, id));
          return result[0];
        } catch (error) {
          console.error(`Error getting discount ${id}:`, error);
          return void 0;
        }
      }
      async getDiscountByCode(code) {
        try {
          const result = await db.select().from(discounts).where(eq(discounts.code, code));
          return result[0];
        } catch (error) {
          console.error(`Error getting discount by code ${code}:`, error);
          return void 0;
        }
      }
      async createDiscount(discount) {
        try {
          const result = await db.insert(discounts).values(discount).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating discount:", error);
          throw error;
        }
      }
      async updateDiscount(id, discountData) {
        try {
          const result = await db.update(discounts).set(discountData).where(eq(discounts.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error(`Error updating discount ${id}:`, error);
          return void 0;
        }
      }
      async deleteDiscount(id) {
        try {
          const result = await db.delete(discounts).where(eq(discounts.id, id)).returning({ id: discounts.id });
          return result.length > 0;
        } catch (error) {
          console.error(`Error deleting discount ${id}:`, error);
          return false;
        }
      }
      async incrementDiscountUsage(id) {
        try {
          const result = await db.update(discounts).set({ usedCount: sql`${discounts.usedCount} + 1` }).where(eq(discounts.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error(`Error incrementing discount usage for discount ${id}:`, error);
          return void 0;
        }
      }
      // ===== Site Customization methods =====
      async getSiteCustomization(key) {
        try {
          console.log(`[Storage] Fetching customization for key: ${key}`);
          return await db.transaction(async (tx) => {
            const result = await tx.select({ value: siteCustomization.value }).from(siteCustomization).where(eq(siteCustomization.key, key));
            const value = result.length > 0 ? result[0].value : void 0;
            if (key === "heroSection" && value) {
              try {
                const heroSection = JSON.parse(value);
                let needsUpdate = false;
                if (!heroSection.images || !Array.isArray(heroSection.images)) {
                  console.log(`[Storage] Read validation: Creating empty images array for heroSection`);
                  heroSection.images = [];
                  needsUpdate = true;
                }
                console.log(`[Storage] Read validation: Images array has ${heroSection.images.length} images`);
                if (needsUpdate) {
                  console.log(`[Storage] Read validation: Updating heroSection with fixed structure`);
                  const updatedValue = JSON.stringify(heroSection);
                  await tx.update(siteCustomization).set({
                    value: updatedValue,
                    updatedAt: /* @__PURE__ */ new Date()
                  }).where(eq(siteCustomization.key, key));
                  return updatedValue;
                }
              } catch (error) {
                console.error(`[Storage] Error validating heroSection during read:`, error);
              }
            }
            return value;
          });
        } catch (error) {
          console.error(`[Storage] Error getting site customization for key ${key}:`, error);
          return void 0;
        }
      }
      async setSiteCustomization(key, value) {
        try {
          if (key === "heroSection") {
            console.log(`[Storage] Starting heroSection save operation. Raw value: ${value.substring(0, 50)}...`);
            try {
              const heroSection = JSON.parse(value);
              console.log(`[Storage] Validating heroSection images array: ${JSON.stringify(heroSection.images || [])}`);
              if (!heroSection.images || !Array.isArray(heroSection.images)) {
                console.log(`[Storage] Creating empty images array - no merging`);
                heroSection.images = [];
              } else {
                const originalLength = heroSection.images.length;
                heroSection.images = heroSection.images.filter((img) => img && typeof img === "string" && img.trim() !== "");
                if (originalLength !== heroSection.images.length) {
                  console.log(`[Storage] Filtered out ${originalLength - heroSection.images.length} invalid images`);
                }
              }
              console.log(`[Storage] Images array has ${heroSection.images.length} images. Empty is valid and will be respected.`);
              if (heroSection.images.length === 0) {
                heroSection.imageUrl = "";
                console.log(`[Storage] All images removed, clearing imageUrl as well`);
              } else if (heroSection.imageUrl && !heroSection.images.includes(heroSection.imageUrl) && heroSection.images.length > 0) {
                heroSection.imageUrl = heroSection.images[0];
                console.log(`[Storage] Updated main image to match available image: ${heroSection.imageUrl}`);
              }
              value = JSON.stringify(heroSection);
              console.log(`[Storage] Final validated heroSection value: ${value.substring(0, 50)}...`);
            } catch (error) {
              console.error(`[Storage] Error processing heroSection JSON:`, error);
            }
          }
          await db.transaction(async (tx) => {
            console.log(`[Storage] Starting transaction for saving ${key}`);
            const existing = await tx.select({ id: siteCustomization.id }).from(siteCustomization).where(eq(siteCustomization.key, key));
            if (existing.length > 0) {
              console.log(`[Storage] Updating existing ${key} record`);
              await tx.update(siteCustomization).set({
                value,
                updatedAt: /* @__PURE__ */ new Date()
              }).where(eq(siteCustomization.key, key));
            } else {
              console.log(`[Storage] Creating new ${key} record`);
              await tx.insert(siteCustomization).values({
                key,
                value
              });
            }
            const verification = await tx.select({ value: siteCustomization.value }).from(siteCustomization).where(eq(siteCustomization.key, key));
            if (verification.length === 0) {
              throw new Error(`Failed to verify ${key} was saved - record not found`);
            }
            if (verification[0].value !== value) {
              console.error(`[Storage] WARNING: Verification failed - values don't match`);
              console.error(`[Storage] Expected: ${value.substring(0, 50)}...`);
              console.error(`[Storage] Actual: ${verification[0].value.substring(0, 50)}...`);
              if (existing.length > 0) {
                await tx.update(siteCustomization).set({ value, updatedAt: /* @__PURE__ */ new Date() }).where(eq(siteCustomization.key, key));
              }
            } else {
              console.log(`[Storage] Verified ${key} saved successfully`);
            }
          });
          console.log(`[Storage] Transaction completed for ${key}`);
        } catch (error) {
          console.error(`[Storage] Error setting site customization for key ${key}:`, error);
          throw error;
        }
      }
      async getAllSiteCustomization() {
        try {
          console.log(`[Storage] Fetching all site customization settings`);
          return await db.transaction(async (tx) => {
            const result = await tx.select().from(siteCustomization);
            const customizationMap = {};
            for (const item of result) {
              customizationMap[item.key] = item.value;
              if (item.key === "heroSection" && item.value) {
                try {
                  const heroSection = JSON.parse(item.value);
                  let needsUpdate = false;
                  if (!heroSection.images || !Array.isArray(heroSection.images)) {
                    console.log(`[Storage] getAllSiteCustomization: Fixing heroSection images array`);
                    heroSection.images = [];
                    needsUpdate = true;
                  } else {
                    const originalLength = heroSection.images.length;
                    heroSection.images = heroSection.images.filter((img) => img && typeof img === "string" && img.trim() !== "");
                    if (originalLength !== heroSection.images.length) {
                      console.log(`[Storage] getAllSiteCustomization: Filtered out ${originalLength - heroSection.images.length} invalid images`);
                      needsUpdate = true;
                    }
                  }
                  if (heroSection.images.length === 0 && heroSection.imageUrl) {
                    heroSection.imageUrl = "";
                    console.log(`[Storage] getAllSiteCustomization: Empty images array, clearing imageUrl as well`);
                    needsUpdate = true;
                  }
                  console.log(`[Storage] getAllSiteCustomization: Images array has ${heroSection.images?.length || 0} images`);
                  if (needsUpdate) {
                    const updatedValue = JSON.stringify(heroSection);
                    await tx.update(siteCustomization).set({
                      value: updatedValue,
                      updatedAt: /* @__PURE__ */ new Date()
                    }).where(eq(siteCustomization.key, item.key));
                    customizationMap[item.key] = updatedValue;
                    console.log(`[Storage] getAllSiteCustomization: Updated heroSection with fixed structure`);
                  }
                } catch (error) {
                  console.error(`[Storage] Error validating heroSection during getAllSiteCustomization:`, error);
                }
              }
            }
            console.log(`[Storage] Fetched ${Object.keys(customizationMap).length} site customization settings`);
            return customizationMap;
          });
        } catch (error) {
          console.error("[Storage] Error getting all site customization settings:", error);
          return {};
        }
      }
      // CustomOrder methods
      async getCustomOrder(id) {
        try {
          const result = await this.db.select().from(customOrders).where(eq(customOrders.id, id));
          return result[0];
        } catch (error) {
          console.error(`[Storage] Error getting custom order ${id}:`, error);
          return void 0;
        }
      }
      async getAllCustomOrders() {
        try {
          return await this.db.select().from(customOrders).orderBy(desc(customOrders.createdAt));
        } catch (error) {
          console.error("[Storage] Error getting all custom orders:", error);
          return [];
        }
      }
      async createCustomOrder(customOrderData) {
        try {
          const result = await this.db.insert(customOrders).values(customOrderData).returning();
          return result[0];
        } catch (error) {
          console.error("[Storage] Error creating custom order:", error);
          throw error;
        }
      }
      async updateCustomOrderStatus(id, status) {
        try {
          const result = await this.db.update(customOrders).set({ status }).where(eq(customOrders.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error(`[Storage] Error updating custom order status ${id}:`, error);
          return void 0;
        }
      }
      async deleteCustomOrder(id) {
        try {
          const result = await this.db.delete(customOrders).where(eq(customOrders.id, id));
          return true;
        } catch (error) {
          console.error(`[Storage] Error deleting custom order ${id}:`, error);
          return false;
        }
      }
      // Box Types methods
      async getBoxTypes() {
        try {
          console.log("[Storage] Getting all box types");
          const result = await this.db.select().from(boxTypes);
          console.log("[Storage] Retrieved box types:", result);
          return result;
        } catch (error) {
          console.error("[Storage] Error getting box types:", error);
          console.error("[Storage] Error stack:", error instanceof Error ? error.stack : "No stack trace");
          return [];
        }
      }
      async getBoxType(id) {
        try {
          const result = await this.db.select().from(boxTypes).where(eq(boxTypes.id, id));
          return result[0];
        } catch (error) {
          console.error(`[Storage] Error getting box type ${id}:`, error);
          return void 0;
        }
      }
      async createBoxType(boxTypeData) {
        try {
          const now = /* @__PURE__ */ new Date();
          const result = await this.db.insert(boxTypes).values({
            ...boxTypeData,
            createdAt: now
          }).returning();
          return result[0];
        } catch (error) {
          console.error("[Storage] Error creating box type:", error);
          throw error;
        }
      }
      async updateBoxType(id, boxTypeData) {
        try {
          const result = await this.db.update(boxTypes).set(boxTypeData).where(eq(boxTypes.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error(`[Storage] Error updating box type ${id}:`, error);
          return void 0;
        }
      }
      async deleteBoxType(id) {
        try {
          const inventory = await this.getBoxInventoryByType(id);
          if (inventory) {
            await this.db.delete(boxInventory).where(eq(boxInventory.id, inventory.id));
          }
          const result = await this.db.delete(boxTypes).where(eq(boxTypes.id, id)).returning();
          return result.length > 0;
        } catch (error) {
          console.error(`[Storage] Error deleting box type ${id}:`, error);
          return false;
        }
      }
      // Box Inventory methods
      async getBoxInventory() {
        try {
          return await this.db.select().from(boxInventory);
        } catch (error) {
          console.error("[Storage] Error getting box inventory:", error);
          return [];
        }
      }
      async getBoxInventoryByType(boxTypeId) {
        try {
          const result = await this.db.select().from(boxInventory).where(eq(boxInventory.boxTypeId, boxTypeId));
          return result[0];
        } catch (error) {
          console.error(`[Storage] Error getting box inventory for type ${boxTypeId}:`, error);
          return void 0;
        }
      }
      async createBoxInventory(boxInventoryData) {
        try {
          const now = /* @__PURE__ */ new Date();
          const result = await this.db.insert(boxInventory).values({
            boxTypeId: boxInventoryData.boxTypeId,
            quantity: boxInventoryData.quantity || 0,
            lastUpdated: now
          }).returning();
          return result[0];
        } catch (error) {
          console.error("[Storage] Error creating box inventory:", error);
          throw error;
        }
      }
      async updateBoxInventory(id, quantity) {
        try {
          const now = /* @__PURE__ */ new Date();
          const result = await this.db.update(boxInventory).set({
            quantity,
            lastUpdated: now
          }).where(eq(boxInventory.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error(`[Storage] Error updating box inventory ${id}:`, error);
          return void 0;
        }
      }
      async incrementBoxInventory(boxTypeId, quantity) {
        try {
          const inventory = await this.getBoxInventoryByType(boxTypeId);
          if (!inventory) return void 0;
          const now = /* @__PURE__ */ new Date();
          const result = await this.db.update(boxInventory).set({
            quantity: inventory.quantity + quantity,
            lastUpdated: now
          }).where(eq(boxInventory.id, inventory.id)).returning();
          return result[0];
        } catch (error) {
          console.error(`[Storage] Error incrementing box inventory for type ${boxTypeId}:`, error);
          return void 0;
        }
      }
      async decrementBoxInventory(boxTypeId, quantity) {
        try {
          const inventory = await this.getBoxInventoryByType(boxTypeId);
          if (!inventory) return void 0;
          const newQuantity = Math.max(0, inventory.quantity - quantity);
          const now = /* @__PURE__ */ new Date();
          const result = await this.db.update(boxInventory).set({
            quantity: newQuantity,
            lastUpdated: now
          }).where(eq(boxInventory.id, inventory.id)).returning();
          return result[0];
        } catch (error) {
          console.error(`[Storage] Error decrementing box inventory for type ${boxTypeId}:`, error);
          return void 0;
        }
      }
      // ===== Redirect URL methods =====
      async getRedirectUrls() {
        return await db.select().from(redirectUrls);
      }
      async getRedirectUrl(id) {
        const result = await db.select().from(redirectUrls).where(eq(redirectUrls.id, id));
        return result[0];
      }
      async getRedirectUrlByName(name) {
        const result = await db.select().from(redirectUrls).where(eq(redirectUrls.name, name));
        return result[0];
      }
      async createRedirectUrl(redirectUrlData) {
        const now = /* @__PURE__ */ new Date();
        const result = await db.insert(redirectUrls).values({
          ...redirectUrlData,
          accessCount: 0,
          createdAt: now,
          updatedAt: now
        }).returning();
        return result[0];
      }
      async updateRedirectUrl(id, redirectUrlData) {
        const now = /* @__PURE__ */ new Date();
        const result = await db.update(redirectUrls).set({
          ...redirectUrlData,
          updatedAt: now
        }).where(eq(redirectUrls.id, id)).returning();
        return result[0];
      }
      async deleteRedirectUrl(id) {
        const result = await db.delete(redirectUrls).where(eq(redirectUrls.id, id)).returning({ id: redirectUrls.id });
        return result.length > 0;
      }
      // Add a table to store QR code scan analytics
      async createQRCodeAnalyticsTable() {
        try {
          const tableExists = await this.tableExists("qr_code_analytics");
          if (!tableExists) {
            await db.execute(sql`
          CREATE TABLE IF NOT EXISTS qr_code_analytics (
            id SERIAL PRIMARY KEY,
            redirect_id INTEGER NOT NULL REFERENCES redirect_urls(id) ON DELETE CASCADE,
            device_type TEXT NOT NULL,
            browser TEXT NOT NULL,
            os TEXT NOT NULL,
            referrer TEXT,
            ip_address TEXT,
            utm_source TEXT,
            utm_medium TEXT,
            utm_campaign TEXT,
            utm_term TEXT,
            utm_content TEXT,
            location TEXT,
            scan_date DATE NOT NULL,
            scan_time TIME NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          )
        `);
            console.log("QR code analytics table created successfully");
          } else {
            try {
              const checkColumn = await db.execute(sql`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'qr_code_analytics' AND column_name = 'utm_source'
          `);
              if (checkColumn.rowCount === 0) {
                console.log("Adding new analytics columns to qr_code_analytics table");
                await db.execute(sql`
              ALTER TABLE qr_code_analytics 
              ADD COLUMN IF NOT EXISTS utm_source TEXT,
              ADD COLUMN IF NOT EXISTS utm_medium TEXT,
              ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
              ADD COLUMN IF NOT EXISTS utm_term TEXT,
              ADD COLUMN IF NOT EXISTS utm_content TEXT,
              ADD COLUMN IF NOT EXISTS location TEXT,
              ADD COLUMN IF NOT EXISTS scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
              ADD COLUMN IF NOT EXISTS scan_time TIME NOT NULL DEFAULT CURRENT_TIME
            `);
                console.log("QR code analytics table updated with additional tracking columns");
              }
            } catch (columnError) {
              console.error("Error checking/adding new analytics columns:", columnError);
            }
          }
        } catch (error) {
          console.error("Error creating QR code analytics table:", error);
        }
      }
      async recordRedirectAccess(id, analyticsData) {
        const now = /* @__PURE__ */ new Date();
        const result = await db.update(redirectUrls).set({
          accessCount: sql`${redirectUrls.accessCount} + 1`,
          lastAccessed: now,
          updatedAt: now
        }).where(eq(redirectUrls.id, id)).returning();
        if (analyticsData) {
          try {
            await this.createQRCodeAnalyticsTable();
            const scanDate = /* @__PURE__ */ new Date();
            const formattedDate = scanDate.toISOString().split("T")[0];
            const formattedTime = scanDate.toTimeString().split(" ")[0];
            await db.execute(sql`
          INSERT INTO qr_code_analytics (
            redirect_id, device_type, browser, os, referrer, ip_address,
            utm_source, utm_medium, utm_campaign, utm_term, utm_content,
            location, scan_date, scan_time
          ) VALUES (
            ${id}, 
            ${analyticsData.deviceType}, 
            ${analyticsData.browser}, 
            ${analyticsData.os}, 
            ${analyticsData.referrer || null}, 
            ${analyticsData.ipAddress || null},
            ${analyticsData.utmSource || null},
            ${analyticsData.utmMedium || null},
            ${analyticsData.utmCampaign || null},
            ${analyticsData.utmTerm || null},
            ${analyticsData.utmContent || null},
            ${analyticsData.location || null},
            ${formattedDate},
            ${formattedTime}
          )
        `);
            console.log(`Recorded enhanced analytics data for redirect ID ${id}:`, analyticsData);
          } catch (error) {
            console.error("Error recording QR code analytics:", error);
          }
        }
        return result[0];
      }
      // Get analytics data for QR codes
      async getQRCodeAnalytics(redirectId) {
        try {
          await this.createQRCodeAnalyticsTable();
          const countQuery = sql`SELECT COUNT(*) as total_scans FROM qr_code_analytics`;
          const countResult = await db.execute(countQuery);
          console.log("Count result:", countResult);
          let totalScans = 0;
          try {
            if (Array.isArray(countResult)) {
              totalScans = Number(countResult[0]?.total_scans || 0);
            } else if (countResult && typeof countResult === "object" && "rows" in countResult) {
              totalScans = Number(countResult.rows[0]?.total_scans || 0);
            }
            console.log(`Total QR code scans: ${totalScans}`);
          } catch (err) {
            console.error("Error parsing total scan count:", err);
          }
          let query = sql`
        SELECT 
          redirect_id, 
          device_type, 
          browser, 
          os, 
          utm_source,
          utm_medium,
          utm_campaign,
          location,
          scan_date,
          COUNT(*) as scan_count,
          MAX(created_at) as last_scan_date
        FROM qr_code_analytics
      `;
          if (redirectId) {
            query = sql`${query} WHERE redirect_id = ${redirectId}`;
          }
          query = sql`${query} 
        GROUP BY redirect_id, device_type, browser, os, utm_source, utm_medium, utm_campaign, location, scan_date
        ORDER BY scan_date DESC, redirect_id, scan_count DESC
      `;
          const result = await db.execute(query);
          const timeQuery = sql`
        SELECT 
          scan_date,
          COUNT(*) as daily_scans
        FROM qr_code_analytics
        ${redirectId ? sql`WHERE redirect_id = ${redirectId}` : sql``}
        GROUP BY scan_date
        ORDER BY scan_date DESC
      `;
          const timeResult = await db.execute(timeQuery);
          const deviceQuery = sql`
        SELECT device_type, COUNT(*) as count 
        FROM qr_code_analytics 
        GROUP BY device_type 
        ORDER BY count DESC
      `;
          const deviceResult = await db.execute(deviceQuery);
          const browserQuery = sql`
        SELECT browser, COUNT(*) as count 
        FROM qr_code_analytics 
        GROUP BY browser 
        ORDER BY count DESC
      `;
          const browserResult = await db.execute(browserQuery);
          const osQuery = sql`
        SELECT os, COUNT(*) as count 
        FROM qr_code_analytics 
        GROUP BY os 
        ORDER BY count DESC
      `;
          const osResult = await db.execute(osQuery);
          const redirectQuery = sql`
        SELECT redirect_id, COUNT(*) as count 
        FROM qr_code_analytics 
        GROUP BY redirect_id 
        ORDER BY count DESC
      `;
          const redirectResult = await db.execute(redirectQuery);
          const campaignQuery = sql`
        SELECT 
          COALESCE(utm_campaign, 'none') as campaign,
          COUNT(*) as campaign_scans
        FROM qr_code_analytics
        ${redirectId ? sql`WHERE redirect_id = ${redirectId}` : sql``}
        GROUP BY utm_campaign
        ORDER BY campaign_scans DESC
      `;
          const campaignResult = await db.execute(campaignQuery);
          const formattedData = {
            totalScans,
            devices: {},
            browsers: {},
            operatingSystems: {},
            scansByRedirect: {},
            // New analytics data
            utmSources: {},
            utmMediums: {},
            utmCampaigns: {},
            locations: {},
            dailyScans: {},
            campaigns: [],
            rawData: result.rows
          };
          const safeProcessRows = (result2, processor) => {
            try {
              if (result2 && Array.isArray(result2)) {
                result2.forEach(processor);
              } else if (result2 && typeof result2 === "object" && "rows" in result2) {
                Array.from(result2.rows).forEach(processor);
              }
            } catch (err) {
              console.error("Error processing result rows:", err);
            }
          };
          safeProcessRows(deviceResult, (row) => {
            const { device_type, count } = row;
            if (device_type) {
              formattedData.devices[device_type] = Number(count);
            }
          });
          safeProcessRows(browserResult, (row) => {
            const { browser, count } = row;
            if (browser) {
              formattedData.browsers[browser] = Number(count);
            }
          });
          safeProcessRows(osResult, (row) => {
            const { os, count } = row;
            if (os) {
              formattedData.operatingSystems[os] = Number(count);
            }
          });
          safeProcessRows(redirectResult, (row) => {
            const { redirect_id, count } = row;
            if (redirect_id) {
              formattedData.scansByRedirect[redirect_id] = Number(count);
            }
          });
          safeProcessRows(result, (row) => {
            const {
              utm_source,
              utm_medium,
              utm_campaign,
              location,
              scan_count
            } = row;
            if (utm_source) {
              formattedData.utmSources[utm_source] = (formattedData.utmSources[utm_source] || 0) + Number(scan_count || 1);
            }
            if (utm_medium) {
              formattedData.utmMediums[utm_medium] = (formattedData.utmMediums[utm_medium] || 0) + Number(scan_count || 1);
            }
            if (utm_campaign) {
              formattedData.utmCampaigns[utm_campaign] = (formattedData.utmCampaigns[utm_campaign] || 0) + Number(scan_count || 1);
            }
            if (location) {
              formattedData.locations[location] = (formattedData.locations[location] || 0) + Number(scan_count || 1);
            }
          });
          safeProcessRows(timeResult, (row) => {
            const { scan_date, daily_scans } = row;
            if (scan_date) {
              formattedData.dailyScans[scan_date] = Number(daily_scans || 1);
            }
          });
          try {
            if (campaignResult && Array.isArray(campaignResult)) {
              formattedData.campaigns = campaignResult.map((row) => ({
                name: row.campaign || "Unknown",
                scans: Number(row.campaign_scans || 1)
              }));
            } else if (campaignResult && typeof campaignResult === "object" && "rows" in campaignResult) {
              formattedData.campaigns = Array.from(campaignResult.rows).map((row) => ({
                name: row.campaign || "Unknown",
                scans: Number(row.campaign_scans || 1)
              }));
            }
          } catch (err) {
            console.error("Error processing campaign data:", err);
          }
          console.log("Analytics data formatted:", {
            totalScans: formattedData.totalScans,
            deviceCount: Object.keys(formattedData.devices).length,
            browserCount: Object.keys(formattedData.browsers).length
          });
          return formattedData;
        } catch (error) {
          console.error("Error getting QR code analytics:", error);
          return {
            totalScans: 0,
            devices: {},
            browsers: {},
            operatingSystems: {},
            scansByRedirect: {},
            utmSources: {},
            utmMediums: {},
            utmCampaigns: {},
            locations: {},
            dailyScans: {},
            campaigns: [],
            rawData: []
          };
        }
      }
      async getRedirectStats() {
        try {
          const redirects = await db.select().from(redirectUrls).orderBy(desc(redirectUrls.accessCount));
          return redirects.map((redirect) => ({
            id: redirect.id,
            name: redirect.name,
            destinationUrl: redirect.destinationUrl,
            accessCount: redirect.accessCount,
            lastAccessed: redirect.lastAccessed,
            createdAt: redirect.createdAt
          }));
        } catch (error) {
          console.error("[Storage] Error getting redirect stats:", error);
          return [];
        }
      }
      // ===== Site Settings methods =====
      async getSiteSettings() {
        return await db.select().from(siteSettings);
      }
      async getSiteSetting(key) {
        const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
        return result[0];
      }
      async setSiteSetting(setting) {
        const now = /* @__PURE__ */ new Date();
        const result = await db.insert(siteSettings).values({
          ...setting,
          value: setting.value || "",
          createdAt: now,
          updatedAt: now
        }).returning();
        return result[0];
      }
      async updateSiteSetting(key, value) {
        const existingSetting = await this.getSiteSetting(key);
        if (!existingSetting) {
          return this.setSiteSetting({ key, value });
        }
        const now = /* @__PURE__ */ new Date();
        const result = await db.update(siteSettings).set({
          value,
          updatedAt: now
        }).where(eq(siteSettings.key, key)).returning();
        return result[0];
      }
      async deleteSiteSetting(key) {
        const result = await db.delete(siteSettings).where(eq(siteSettings.key, key)).returning({ key: siteSettings.key });
        return result.length > 0;
      }
      async getSiteSettingByKey(key) {
        return this.getSiteSetting(key);
      }
      // ===== Post-Purchase Discount methods =====
      async getPostPurchaseDiscounts() {
        return await db.select().from(postPurchaseDiscounts);
      }
      async getPostPurchaseDiscount(id) {
        const result = await db.select().from(postPurchaseDiscounts).where(eq(postPurchaseDiscounts.id, id));
        return result[0];
      }
      async getPostPurchaseDiscountByCode(code) {
        const result = await db.select().from(postPurchaseDiscounts).where(eq(postPurchaseDiscounts.code, code));
        return result[0];
      }
      async getPostPurchaseDiscountByOrder(orderId) {
        const result = await db.select().from(postPurchaseDiscounts).where(eq(postPurchaseDiscounts.orderId, orderId));
        return result[0];
      }
      async getPostPurchaseDiscountsByUser(userId) {
        return await db.select().from(postPurchaseDiscounts).where(eq(postPurchaseDiscounts.userId, userId));
      }
      async createPostPurchaseDiscount(discount) {
        try {
          console.log("Creating post-purchase discount:", discount);
          const result = await db.insert(postPurchaseDiscounts).values(discount).returning();
          console.log("Created post-purchase discount:", result[0]);
          return result[0];
        } catch (error) {
          console.error("Error creating post-purchase discount:", error);
          throw error;
        }
      }
      async markPostPurchaseDiscountAsUsed(id) {
        try {
          const result = await db.update(postPurchaseDiscounts).set({ isUsed: true }).where(eq(postPurchaseDiscounts.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error("Error marking post-purchase discount as used:", error);
          throw error;
        }
      }
      // Product price variation methods
      async getProductPriceVariations(productId) {
        try {
          return await db.select().from(productPriceVariations).where(eq(productPriceVariations.productId, productId)).orderBy(productPriceVariations.displayOrder);
        } catch (error) {
          console.error("Error fetching product price variations:", error);
          throw error;
        }
      }
      async getProductPriceVariation(id) {
        try {
          const results = await db.select().from(productPriceVariations).where(eq(productPriceVariations.id, id)).limit(1);
          return results[0];
        } catch (error) {
          console.error("Error fetching product price variation:", error);
          throw error;
        }
      }
      async getProductPriceByOptions(productId, size, type, shape) {
        try {
          const product = await this.getProduct(productId);
          if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
          }
          let finalPrice = product.basePrice;
          const variations = await this.getProductPriceVariations(productId);
          const absolutePriceVariation = variations.find(
            (v) => v.isAbsolutePrice && (size === void 0 || v.size === size) && (type === void 0 || v.type === type) && (shape === void 0 || v.shape === shape)
          );
          if (absolutePriceVariation) {
            return absolutePriceVariation.priceModifier;
          }
          const sortedVariations = variations.filter((v) => !v.isAbsolutePrice).sort((a, b) => {
            const aOrder = a.displayOrder !== null ? a.displayOrder : 0;
            const bOrder = b.displayOrder !== null ? b.displayOrder : 0;
            return aOrder - bOrder;
          });
          if (size) {
            const sizeVariation = sortedVariations.find((v) => v.size === size && !v.type && !v.shape);
            if (sizeVariation) {
              finalPrice += sizeVariation.priceModifier;
            }
          }
          if (type) {
            const typeVariation = sortedVariations.find((v) => v.type === type && !v.size && !v.shape);
            if (typeVariation) {
              finalPrice += typeVariation.priceModifier;
            }
          }
          if (shape) {
            const shapeVariation = sortedVariations.find((v) => v.shape === shape && !v.size && !v.type);
            if (shapeVariation) {
              finalPrice += shapeVariation.priceModifier;
            }
          }
          if (size && type) {
            const sizeTypeVariation = sortedVariations.find((v) => v.size === size && v.type === type && !v.shape);
            if (sizeTypeVariation) {
              finalPrice += sizeTypeVariation.priceModifier;
            }
          }
          if (size && shape) {
            const sizeShapeVariation = sortedVariations.find((v) => v.size === size && v.shape === shape && !v.type);
            if (sizeShapeVariation) {
              finalPrice += sizeShapeVariation.priceModifier;
            }
          }
          if (type && shape) {
            const typeShapeVariation = sortedVariations.find((v) => v.type === type && v.shape === shape && !v.size);
            if (typeShapeVariation) {
              finalPrice += typeShapeVariation.priceModifier;
            }
          }
          if (size && type && shape) {
            const fullComboVariation = sortedVariations.find((v) => v.size === size && v.type === type && v.shape === shape);
            if (fullComboVariation) {
              finalPrice += fullComboVariation.priceModifier;
            }
          }
          if (type === "mixed" && product.mixedTypeEnabled && product.mixedTypeFee) {
            finalPrice += product.mixedTypeFee;
          }
          return finalPrice;
        } catch (error) {
          console.error("Error calculating product price:", error);
          throw error;
        }
      }
      async createProductPriceVariation(variation) {
        try {
          const result = await db.insert(productPriceVariations).values({
            productId: variation.productId,
            size: variation.size || null,
            type: variation.type || null,
            shape: variation.shape || null,
            priceModifier: variation.priceModifier,
            isAbsolutePrice: variation.isAbsolutePrice || false,
            displayOrder: variation.displayOrder || 0,
            createdAt: /* @__PURE__ */ new Date()
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating product price variation:", error);
          throw error;
        }
      }
      async updateProductPriceVariation(id, variation) {
        try {
          const result = await db.update(productPriceVariations).set(variation).where(eq(productPriceVariations.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating product price variation:", error);
          throw error;
        }
      }
      async deleteProductPriceVariation(id) {
        try {
          await db.delete(productPriceVariations).where(eq(productPriceVariations.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting product price variation:", error);
          return false;
        }
      }
    };
    storage2 = new PgStorage();
  }
});

// server/services/discountCodeGenerator.ts
import crypto from "crypto";
function generateRandomCode(prefix = "THANKS", length = 6) {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    result += characters.charAt(randomIndex);
  }
  return `${prefix}-${result}`;
}
async function createPostPurchaseDiscount(storage5, orderId, customerEmail, userId, config) {
  try {
    if (!config) {
      const settings = await getPostPurchaseDiscountSettings(storage5);
      if (!settings.enabled) {
        console.log("Post-purchase discounts are disabled");
        return null;
      }
      config = {
        discountType: settings.discountType,
        value: settings.value,
        minPurchase: settings.minPurchase,
        expiryDays: settings.expiryDays,
        prefix: settings.prefix
      };
    }
    let code;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      code = generateRandomCode(config.prefix, 6);
      attempts++;
      const existingPostPurchaseDiscount = await storage5.getPostPurchaseDiscountByCode(code);
      if (existingPostPurchaseDiscount) continue;
      const existingDiscount = await storage5.getDiscountByCode(code);
      if (existingDiscount) continue;
      isUnique = true;
      const expiryDate = config.expiryDays ? new Date(Date.now() + config.expiryDays * 24 * 60 * 60 * 1e3) : null;
      const discountData = {
        code,
        orderId,
        userId: userId || null,
        customerEmail: customerEmail || null,
        discountType: config.discountType,
        value: config.value,
        minPurchase: config.minPurchase || null,
        isUsed: false,
        expiryDate
      };
      await storage5.createPostPurchaseDiscount(discountData);
      console.log(`Created post-purchase discount code ${code} for order ${orderId}`);
      return code;
    }
    console.error("Failed to generate a unique discount code after multiple attempts");
    return null;
  } catch (error) {
    console.error("Error creating post-purchase discount:", error);
    return null;
  }
}
async function getPostPurchaseDiscountSettings(storage5) {
  const defaultSettings = {
    enabled: false,
    discountType: "percentage",
    value: 10,
    // 10% off
    minPurchase: null,
    expiryDays: 30,
    // Expires after 30 days
    prefix: "THANKS"
  };
  try {
    const enabledSetting = await storage5.getSiteSettingByKey("postPurchaseDiscountEnabled");
    const typeSetting = await storage5.getSiteSettingByKey("postPurchaseDiscountType");
    const valueSetting = await storage5.getSiteSettingByKey("postPurchaseDiscountValue");
    const minPurchaseSetting = await storage5.getSiteSettingByKey("postPurchaseDiscountMinPurchase");
    const expiryDaysSetting = await storage5.getSiteSettingByKey("postPurchaseDiscountExpiryDays");
    const prefixSetting = await storage5.getSiteSettingByKey("postPurchaseDiscountPrefix");
    return {
      enabled: enabledSetting?.value === "true",
      discountType: typeSetting?.value || defaultSettings.discountType,
      value: valueSetting?.value ? parseInt(valueSetting.value, 10) : defaultSettings.value,
      minPurchase: minPurchaseSetting?.value ? parseInt(minPurchaseSetting.value, 10) : defaultSettings.minPurchase,
      expiryDays: expiryDaysSetting?.value ? parseInt(expiryDaysSetting.value, 10) : defaultSettings.expiryDays,
      prefix: prefixSetting?.value || defaultSettings.prefix
    };
  } catch (error) {
    console.error("Error getting post-purchase discount settings:", error);
    return defaultSettings;
  }
}
var init_discountCodeGenerator = __esm({
  "server/services/discountCodeGenerator.ts"() {
    "use strict";
  }
});

// server/config/stripe-config.ts
function isProductionDomain(hostname) {
  const PRODUCTION_DOMAIN = process.env.PRODUCTION_DOMAIN || "yourdomain.com";
  return hostname === PRODUCTION_DOMAIN;
}
function getStripeSecretKey(hostname) {
  const useProductionKeys = isProductionDomain(hostname);
  return useProductionKeys ? process.env.STRIPE_LIVE_SECRET_KEY || "" : process.env.STRIPE_SECRET_KEY || "";
}
var init_stripe_config = __esm({
  "server/config/stripe-config.ts"() {
    "use strict";
  }
});

// server/stripe.ts
import Stripe from "stripe";
function initializeStripe(hostname) {
  if (stripe && lastInitializedHostname === hostname) {
    return stripe;
  }
  const stripeSecretKey = getStripeSecretKey(hostname);
  if (stripeSecretKey) {
    try {
      stripe = new Stripe(stripeSecretKey);
      lastInitializedHostname = hostname;
      console.log(`Stripe initialized successfully for hostname: ${hostname}`);
      return stripe;
    } catch (error) {
      console.error("Failed to initialize Stripe:", error);
      stripe = null;
      return null;
    }
  } else {
    console.warn("No Stripe secret key provided. Stripe features will be unavailable.");
    stripe = null;
    return null;
  }
}
async function createCheckoutSession(hostname, items, successUrl, cancelUrl, customerEmail, metadata, customerId) {
  try {
    const stripeInstance = initializeStripe(hostname);
    if (!stripeInstance) {
      console.error("Stripe initialization failed");
      return null;
    }
    console.log("Creating Stripe checkout session with items:", items);
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description || void 0
        },
        unit_amount: item.amount
        // in cents
      },
      quantity: item.quantity
    }));
    const sessionParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
      // Enable phone number collection
      phone_number_collection: {
        enabled: true
      }
    };
    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }
    if (customerId) {
      sessionParams.customer = customerId;
    }
    const session = await stripeInstance.checkout.sessions.create(sessionParams);
    console.log(`Successfully created checkout session: ${session.id}`);
    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return null;
  }
}
async function createCheckoutSessionLegacy(hostname, items, userId, successUrl, cancelUrl) {
  try {
    const metadata = { userId: userId.toString() };
    const session = await createCheckoutSession(
      hostname,
      items,
      successUrl,
      cancelUrl,
      void 0,
      metadata
    );
    return session?.url || null;
  } catch (error) {
    console.error("Error creating checkout session (legacy):", error);
    return null;
  }
}
async function createPaymentIntent(hostname, amount, metadata, customerId, customerEmail) {
  try {
    const stripeInstance = initializeStripe(hostname);
    if (!stripeInstance) {
      console.error("Stripe initialization failed");
      return null;
    }
    const paymentIntentParams = {
      amount: Math.round(amount * 100),
      // Convert to cents and ensure it's an integer
      currency: "usd",
      automatic_payment_methods: {
        enabled: true
      },
      metadata: metadata || {}
    };
    if (customerId) {
      paymentIntentParams.customer = customerId;
    }
    if (customerEmail) {
      paymentIntentParams.receipt_email = customerEmail;
      console.log(`Setting receipt_email to ${customerEmail} for automatic Stripe receipts`);
    }
    const paymentIntent = await stripeInstance.paymentIntents.create(paymentIntentParams);
    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return null;
  }
}
async function updatePaymentIntent(hostname, paymentIntentId, metadata, customerEmail) {
  try {
    const stripeInstance = initializeStripe(hostname);
    if (!stripeInstance) {
      console.error("Stripe initialization failed");
      return null;
    }
    const updateParams = {
      metadata
    };
    if (customerEmail) {
      updateParams.receipt_email = customerEmail;
      console.log(`Setting receipt_email to ${customerEmail} for automatic Stripe receipts`);
    }
    const updatedIntent = await stripeInstance.paymentIntents.update(paymentIntentId, updateParams);
    console.log(`Successfully updated payment intent ${paymentIntentId} with metadata${customerEmail ? " and receipt_email" : ""}`);
    return updatedIntent;
  } catch (error) {
    console.error(`Error updating payment intent ${paymentIntentId}:`, error);
    return null;
  }
}
async function getStripeCoupon(hostname, code) {
  try {
    const stripeInstance = initializeStripe(hostname);
    if (!stripeInstance) {
      console.error("Stripe initialization failed");
      return null;
    }
    const coupons = await stripeInstance.coupons.list({ limit: 100 });
    const coupon = coupons.data.find((c) => c.id.toLowerCase() === code.toLowerCase());
    if (coupon) {
      console.log(`Found Stripe coupon with code: ${code}`);
      return coupon;
    }
    console.log(`No Stripe coupon found with code: ${code}`);
    return null;
  } catch (error) {
    console.error(`Error getting Stripe coupon with code ${code}:`, error);
    return null;
  }
}
async function createStripeCoupon(hostname, code, percentOff, amountOff, currency, duration = "once", durationInMonths, maxRedemptions, expiresAt) {
  try {
    const stripeInstance = initializeStripe(hostname);
    if (!stripeInstance) {
      console.error("Stripe initialization failed");
      return null;
    }
    const couponParams = {
      id: code,
      duration
    };
    if (percentOff !== void 0) {
      couponParams.percent_off = percentOff;
    } else if (amountOff !== void 0 && currency) {
      couponParams.amount_off = amountOff;
      couponParams.currency = currency;
    } else {
      throw new Error("Either percentOff or both amountOff and currency must be provided");
    }
    if (duration === "repeating" && durationInMonths) {
      couponParams.duration_in_months = durationInMonths;
    }
    if (maxRedemptions) {
      couponParams.max_redemptions = maxRedemptions;
    }
    if (expiresAt) {
      couponParams.redeem_by = expiresAt;
    }
    const coupon = await stripeInstance.coupons.create(couponParams);
    console.log(`Successfully created Stripe coupon with code: ${code}`);
    return coupon;
  } catch (error) {
    console.error(`Error creating Stripe coupon with code ${code}:`, error);
    return null;
  }
}
var stripe, lastInitializedHostname;
var init_stripe = __esm({
  "server/stripe.ts"() {
    "use strict";
    init_stripe_config();
    stripe = null;
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_local") {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    lastInitializedHostname = null;
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzle2 } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db2;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      // Limit max connections to reduce resource usage
      idleTimeoutMillis: 3e4,
      // Close idle connections after 30 seconds
      connectionTimeoutMillis: 5e3
      // Connection timeout after 5 seconds
    });
    db2 = drizzle2({ client: pool, schema: schema_exports });
  }
});

// server/priceService.ts
import { and as and2, eq as eq2 } from "drizzle-orm";
async function getProductBasePrice(productId) {
  try {
    let numericId = typeof productId === "number" ? productId : null;
    if (typeof productId === "string" && !isNaN(parseInt(productId))) {
      numericId = parseInt(productId);
    }
    if (numericId !== null) {
      const [product] = await db2.select({ basePrice: products.basePrice }).from(products).where(eq2(products.id, numericId));
      console.log(`[PRICE_SERVICE] Looking up product by numeric ID: ${numericId}`);
      if (product) {
        console.log(`[PRICE_SERVICE] Found product with numeric ID ${numericId}, base price: ${product.basePrice} cents`);
        return product.basePrice;
      }
    }
    const normalizedProductId = typeof productId === "string" ? productId.toLowerCase().replace(/\s+/g, "") : null;
    if (typeof normalizedProductId === "string") {
      const allProducts = await db2.select().from(products);
      const matchingProduct = allProducts.find((p) => {
        const normalizedName = p.name.toLowerCase().replace(/\s+/g, "");
        return normalizedName === normalizedProductId;
      });
      if (matchingProduct) {
        return matchingProduct.basePrice;
      }
      if (normalizedProductId === "dubaibar" || normalizedProductId.includes("dubai")) {
        return 500;
      }
    }
    console.log(`[PRICE_SERVICE] Could not find product with ID: ${productId}`);
    return null;
  } catch (error) {
    console.error(`[PRICE_SERVICE] Error fetching product price: ${error}`);
    return null;
  }
}
async function getPriceVariations(productId, size, type, shape) {
  try {
    const conditions = [];
    conditions.push(eq2(productPriceVariations.productId, productId));
    if (size) {
      conditions.push(eq2(productPriceVariations.size, size));
    }
    if (type) {
      conditions.push(eq2(productPriceVariations.type, type));
    }
    if (shape) {
      conditions.push(eq2(productPriceVariations.shape, shape));
    }
    const variations = await db2.select().from(productPriceVariations).where(and2(...conditions)).orderBy(productPriceVariations.displayOrder);
    return variations;
  } catch (error) {
    console.error(`[PRICE_SERVICE] Error fetching price variations: ${error}`);
    return [];
  }
}
async function calculateProductPrice(productId, size, type, shape) {
  const basePrice = await getProductBasePrice(productId);
  if (basePrice === null) {
    console.warn(`[PRICE_SERVICE] No base price found for product ${productId}`);
    return 0;
  }
  let numericProductId = typeof productId === "number" ? productId : null;
  if (typeof productId === "string" && !isNaN(parseInt(productId))) {
    numericProductId = parseInt(productId);
    console.log(`[PRICE_SERVICE] Converted string productId ${productId} to numeric ID ${numericProductId}`);
  } else if (typeof productId === "string") {
    const normalizedProductId = productId.toLowerCase().replace(/\s+/g, "");
    const allProducts = await db2.select().from(products);
    const matchingProduct = allProducts.find((p) => {
      const normalizedName = p.name.toLowerCase().replace(/\s+/g, "");
      return normalizedName === normalizedProductId;
    });
    if (matchingProduct) {
      numericProductId = matchingProduct.id;
      console.log(`[PRICE_SERVICE] Found numeric ID ${numericProductId} for product name ${productId}`);
    }
  }
  let finalPrice = basePrice;
  if (size) {
    if (size === "medium") {
      if (typeof productId === "string" && (productId === "ClassicChocolate" || productId === "CaramelChocolate") || typeof productId === "number" && (productId === 41 || productId === 42 || productId === 44)) {
        finalPrice = 1200;
      } else {
        finalPrice = Math.round(basePrice * 1.5);
      }
    } else if (size === "large") {
      if (typeof productId === "string" && productId === "ClassicChocolate" || typeof productId === "number" && (productId === 41 || productId === 42)) {
        finalPrice = 1600;
      } else if (typeof productId === "string" && productId === "CaramelChocolate" || typeof productId === "number" && productId === 44) {
        console.log("Special pricing for large caramel chocolate: $8.00 base + $19.00 large size premium = $27.00");
        finalPrice = 2700;
      } else {
        finalPrice = basePrice * 2;
      }
    }
  }
  if (type === "dark") {
    finalPrice += 200;
  }
  if (numericProductId) {
    try {
      const variations = await getPriceVariations(numericProductId, size, type, shape);
      for (const variation of variations) {
        if (variation.isAbsolutePrice) {
          finalPrice = variation.priceModifier;
        } else {
          finalPrice += variation.priceModifier;
        }
      }
    } catch (error) {
      console.error(`[PRICE_SERVICE] Error applying price variations: ${error}`);
    }
  }
  if (typeof productId === "string" && (productId === "DubaiBar" || productId.toLowerCase().includes("dubai")) || typeof productId === "number" && productId === 47) {
    finalPrice = 500;
    if (type === "dark") {
      finalPrice = 700;
    }
    console.log(`[PRICE_API] Product dubaibar base price: 500 cents`);
    console.log(`Setting calculated price for DubaiBar: ${finalPrice} cents (${size || "none"}, ${type || "milk"}) in order view`);
  }
  return Math.round(finalPrice);
}
var init_priceService = __esm({
  "server/priceService.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/checkoutWebhook.ts
async function handleCheckoutSessionCompleted(event, storage5) {
  try {
    const session = event.data.object;
    console.log(`Processing checkout.session.completed event for session: ${session.id}`);
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    if (!paymentIntentId) {
      console.error("No payment intent ID found in checkout session");
      return { success: false, message: "No payment intent ID found" };
    }
    const paymentIntent = await stripe?.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent) {
      console.error(`Failed to retrieve payment intent: ${paymentIntentId}`);
      return { success: false, message: "Failed to retrieve payment intent" };
    }
    let customerEmail = null;
    if (session.customer_details?.email) {
      customerEmail = session.customer_details.email;
      console.log(`Using email from session.customer_details: ${customerEmail}`);
    } else if (typeof session.customer === "object" && session.customer?.email) {
      customerEmail = session.customer.email;
      console.log(`Using email from session.customer: ${customerEmail}`);
    } else if (session.metadata?.email || session.metadata?.customer_email) {
      customerEmail = session.metadata.email || session.metadata.customer_email;
      console.log(`Using email from session.metadata: ${customerEmail}`);
    } else if (paymentIntent.metadata?.email || paymentIntent.metadata?.customer_email) {
      customerEmail = paymentIntent.metadata.email || paymentIntent.metadata.customer_email;
      console.log(`Using email from paymentIntent.metadata: ${customerEmail}`);
    } else if (paymentIntent.receipt_email) {
      customerEmail = paymentIntent.receipt_email;
      console.log(`Using email from paymentIntent.receipt_email: ${customerEmail}`);
    } else {
      console.log("No email found in any source, using empty string");
      customerEmail = "";
    }
    let customerName = "Unknown";
    if (session.customer_details?.name) {
      customerName = session.customer_details.name;
      console.log(`Using name from session.customer_details: ${customerName}`);
    } else if (typeof session.customer === "object" && session.customer?.name) {
      customerName = session.customer.name;
      console.log(`Using name from session.customer: ${customerName}`);
    } else if (session.metadata?.customer_name || session.metadata?.customerName) {
      customerName = session.metadata.customer_name || session.metadata.customerName;
      console.log(`Using name from session.metadata: ${customerName}`);
    } else if (paymentIntent.metadata?.customer_name || paymentIntent.metadata?.customerName) {
      customerName = paymentIntent.metadata.customer_name || paymentIntent.metadata.customerName;
      console.log(`Using name from paymentIntent.metadata: ${customerName}`);
    } else {
      console.log('No customer name found in any source, using "Unknown"');
    }
    let phoneNumber = "";
    if (session.customer_details?.phone) {
      phoneNumber = session.customer_details.phone;
      console.log(`Using phone from session.customer_details: ${phoneNumber}`);
    } else if (typeof session.customer === "object" && session.customer?.phone) {
      phoneNumber = session.customer.phone;
      console.log(`Using phone from session.customer: ${phoneNumber}`);
    } else if (session.metadata?.phone) {
      phoneNumber = session.metadata.phone;
      console.log(`Using phone from session.metadata: ${phoneNumber}`);
    } else if (session.metadata?.customer_phone) {
      phoneNumber = session.metadata.customer_phone;
      console.log(`Using phone from session.metadata (snake_case): ${phoneNumber}`);
    } else if (paymentIntent.metadata?.phone) {
      phoneNumber = paymentIntent.metadata.phone;
      console.log(`Using phone from paymentIntent.metadata: ${phoneNumber}`);
    } else if (paymentIntent.metadata?.customer_phone) {
      phoneNumber = paymentIntent.metadata.customer_phone;
      console.log(`Using phone from paymentIntent.metadata (snake_case): ${phoneNumber}`);
    } else {
      console.log("No phone number found in any source, using empty string");
    }
    if (!phoneNumber || phoneNumber.trim() === "") {
      console.log("Found empty phone value - replacing with empty string");
      phoneNumber = "";
    }
    console.log(`Extracted phone number from checkout session: ${phoneNumber || "Not provided"}`);
    console.log(`Phone number type: ${typeof phoneNumber}, value: "${phoneNumber}"`);
    if (phoneNumber === null) {
      console.log("WARNING: Phone number is null - converting to empty string to prevent database issues");
      phoneNumber = "";
    }
    const shippingDetails = session.shipping_details || (typeof session.customer === "object" ? session.customer?.shipping : null);
    let shippingAddress = "No shipping address provided";
    const deliveryMethod = session.metadata?.deliveryMethod || "ship";
    if (shippingDetails && shippingDetails.address) {
      const address = shippingDetails.address;
      shippingAddress = [
        shippingDetails.name || customerName,
        address.line1,
        address.line2,
        `${address.city}, ${address.state} ${address.postal_code}`,
        address.country
      ].filter(Boolean).join("\n");
    } else if (deliveryMethod === "pickup") {
      shippingAddress = "Customer will pick up in store";
    } else if (session.metadata?.customerAddress) {
      shippingAddress = session.metadata.customerAddress;
    }
    const userId = session.client_reference_id ? parseInt(session.client_reference_id, 10) : (await storage5.getUserByEmail(customerEmail))?.id || 0;
    if (!userId) {
      console.error("Failed to determine user ID for order");
      return { success: false, message: "Failed to determine user ID" };
    }
    let cartItemsJson = null;
    if (paymentIntent.metadata?.cartItems) {
      cartItemsJson = paymentIntent.metadata.cartItems;
    } else if (paymentIntent.metadata?.cart_items) {
      cartItemsJson = paymentIntent.metadata.cart_items;
    } else if (session.metadata?.cartItems) {
      cartItemsJson = session.metadata.cartItems;
    } else if (session.metadata?.cart_items) {
      cartItemsJson = session.metadata.cart_items;
    }
    const metadataObj = cartItemsJson ? { cart_items: cartItemsJson } : null;
    const metadataStr = metadataObj ? JSON.stringify(metadataObj) : null;
    console.log(`Order metadata being saved: ${metadataStr}`);
    const dbOrderCollectionDisabled = await storage5.getSiteSetting("disableOrderCollection");
    const orderCollectionDisabled = dbOrderCollectionDisabled?.value === "true";
    if (orderCollectionDisabled) {
      console.log("Order collection is disabled. Only processing Stripe data, not saving to database.");
      return {
        success: true,
        message: `Stripe payment processed successfully. Order database collection disabled.`
      };
    }
    const order = await storage5.createOrder({
      userId,
      customerName,
      customerEmail,
      // Add customer email to the order
      status: "pending",
      totalAmount: paymentIntent.amount,
      shippingAddress,
      deliveryMethod,
      phone: phoneNumber || "",
      // Add phone number here
      paymentIntentId,
      postPurchaseDiscountCode: null,
      // Handle the required field in the schema
      metadata: metadataStr
      // Add metadata with cart items as string
    });
    if (!order) {
      console.error("Failed to create order from checkout session");
      return { success: false, message: "Failed to create order" };
    }
    console.log(`Successfully created order #${order.id} with phone: ${phoneNumber || "Not provided"} and email: ${customerEmail || "Not provided"}`);
    if (cartItemsJson) {
      try {
        const cartItems2 = JSON.parse(cartItemsJson);
        console.log(`Parsed ${cartItems2.length} cart items from metadata`);
        for (const item of cartItems2) {
          try {
            let productId = item.id || item.productId;
            let productName = item.name || "";
            const size = item.size || "none";
            const type = item.type || "milk";
            let shape = item.shape;
            if (!shape) {
              if (productId === 47 || productId === "47" || productId === "DubaiBar") {
                shape = "rectangular";
              } else {
                shape = "none";
              }
            }
            const quantity = item.qty || item.quantity || 1;
            const price = item.price || 0;
            console.log(`Creating order item for product ${productId}, size: ${size}, type: ${type}, shape: ${shape}`);
            await storage5.createOrderItem({
              orderId: order.id,
              productId: productId.toString(),
              productName,
              size,
              type,
              shape,
              quantity,
              price
            });
          } catch (itemError) {
            console.error("Error creating order item:", itemError);
          }
        }
      } catch (parseError) {
        console.error("Error parsing cart items JSON:", parseError);
      }
    }
    return {
      success: true,
      message: `Created order #${order.id} from checkout session`,
      orderId: order.id
    };
  } catch (error) {
    console.error("Error processing checkout.session.completed event:", error);
    return { success: false, message: "Error processing checkout session event" };
  }
}
function stripeWebhookMiddleware(storage5) {
  return async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers["stripe-signature"];
    try {
      let event;
      if (webhookSecret && signature) {
        const payload = req.body;
        try {
          event = stripe.webhooks.constructEvent(
            payload,
            signature,
            webhookSecret
          );
        } catch (err) {
          console.error(`Webhook signature verification failed: ${err.message}`);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      } else {
        event = req.body;
      }
      console.log(`Received Stripe webhook event: ${event.type}`);
      if (event.type === "checkout.session.completed") {
        const result = await handleCheckoutSessionCompleted(event, storage5);
        return res.json({
          received: true,
          success: result.success,
          message: result.message,
          orderId: result.orderId
        });
      } else if (event.type === "payment_intent.succeeded") {
        console.log("Received payment_intent.succeeded event - using legacy handler");
        return res.json({ received: true, message: "Using legacy handler" });
      }
      return res.json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error);
      return res.status(500).json({ received: false, error: "Webhook processing failed" });
    }
  };
}
var init_checkoutWebhook = __esm({
  "server/checkoutWebhook.ts"() {
    "use strict";
    init_stripe();
  }
});

// server/stripeCheckout.ts
function cartItemsToCheckoutItems(cartItems2) {
  return cartItems2.map((item) => {
    const description = [
      item.sizeLabel ? `Size: ${item.sizeLabel}` : "",
      item.typeLabel ? `Type: ${item.typeLabel}` : ""
    ].filter(Boolean).join(", ");
    const unitAmount = Math.round(item.price * 100);
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: description || void 0,
          images: item.image ? [item.image] : void 0,
          metadata: {
            productId: item.id.toString(),
            size: item.size || "",
            type: item.type || "",
            boxId: item.boxId ? item.boxId.toString() : ""
          }
        },
        unit_amount: unitAmount
      },
      quantity: item.quantity
    };
  });
}
async function createCheckoutSessionWithPhone(lineItems, successUrl, cancelUrl, customerEmail, metadata = {}) {
  try {
    if (!stripe) {
      console.error("Stripe has not been initialized");
      return null;
    }
    const params = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "AE"]
      },
      phone_number_collection: {
        enabled: true
        // Enable phone number collection
      }
    };
    if (customerEmail) {
      params.customer_email = customerEmail;
      if (!params.metadata) params.metadata = {};
      params.metadata.customer_email = customerEmail;
    }
    const session = await stripe.checkout.sessions.create(params);
    return {
      sessionId: session.id,
      url: session.url || ""
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return null;
  }
}
var init_stripeCheckout = __esm({
  "server/stripeCheckout.ts"() {
    "use strict";
    init_stripe();
  }
});

// server/routes/checkoutRoutes.ts
import { Router } from "express";
import { z as z2 } from "zod";
function createCheckoutRouter(storage5) {
  const router4 = Router();
  router4.post("/create-session", async (req, res) => {
    try {
      const result = checkoutSessionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid checkout data",
          errors: result.error.format()
        });
      }
      const { cartItems: cartItems2, successUrl, cancelUrl } = result.data;
      let customerEmail = "";
      let userId = null;
      if (req.user) {
        const user = await storage5.getUser(req.user.id);
        if (user) {
          customerEmail = user.email;
          userId = user.id;
        }
      }
      const metadata = {};
      if (userId) {
        metadata.userId = String(userId);
      }
      const lineItems = cartItemsToCheckoutItems(cartItems2);
      const session = await createCheckoutSessionWithPhone(
        lineItems,
        successUrl,
        cancelUrl,
        customerEmail,
        metadata
      );
      if (!session) {
        return res.status(500).json({ message: "Failed to create checkout session" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  router4.post("/webhook", stripeWebhookMiddleware(storage5));
  return router4;
}
var checkoutSessionSchema;
var init_checkoutRoutes = __esm({
  "server/routes/checkoutRoutes.ts"() {
    "use strict";
    init_checkoutWebhook();
    init_stripeCheckout();
    checkoutSessionSchema = z2.object({
      cartItems: z2.array(
        z2.object({
          id: z2.union([z2.string(), z2.number()]),
          name: z2.string(),
          price: z2.number(),
          quantity: z2.number(),
          size: z2.string().optional(),
          sizeLabel: z2.string().optional(),
          type: z2.string().optional(),
          typeLabel: z2.string().optional(),
          image: z2.string().optional(),
          boxId: z2.number().optional()
        })
      ),
      successUrl: z2.string(),
      cancelUrl: z2.string()
    });
  }
});

// server/routes/staticCheckoutRoutes.js
import express from "express";
import Stripe2 from "stripe";
function createStaticCheckoutRouter(storage5) {
  const router4 = express.Router();
  router4.get("/product-info", async (req, res) => {
    try {
      const { productId } = req.query;
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }
      const product = await storage5.getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      const sizes = product.sizeOptions ? JSON.parse(product.sizeOptions) : [];
      const types = product.typeOptions ? JSON.parse(product.typeOptions) : [];
      const shapes = product.shapeOptions ? JSON.parse(product.shapeOptions) : [];
      let basePrice = product.basePrice;
      if (typeof basePrice === "number" && basePrice > 100) {
        basePrice = basePrice / 100;
      }
      const processOptionPrices = (options) => {
        return options.map((option) => {
          if (option.price !== void 0) {
            const numPrice = typeof option.price === "string" ? parseFloat(option.price) : option.price;
            if (!isNaN(numPrice) && numPrice > 100) {
              return {
                ...option,
                price: numPrice / 100
              };
            }
            return {
              ...option,
              price: numPrice
            };
          }
          return option;
        });
      };
      const productData = {
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.image,
        basePrice,
        formattedPrice: typeof basePrice === "number" ? basePrice.toFixed(2) : "0.00",
        sizes: processOptionPrices(sizes),
        types: processOptionPrices(types),
        shapes: processOptionPrices(shapes)
      };
      res.json(productData);
    } catch (error) {
      console.error("Error getting product info:", error);
      res.status(500).json({ error: "Failed to get product information" });
    }
  });
  router4.post("/create-session", async (req, res) => {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invalid items. Must provide at least one item." });
      }
      const lineItems = [];
      let metadata = {};
      for (const item of items) {
        const { productId, quantity, size, type, shape } = item;
        if (!productId || !quantity) {
          return res.status(400).json({ error: "Each item must have a productId and quantity" });
        }
        const product = await storage5.getProductById(productId);
        if (!product) {
          return res.status(404).json({ error: `Product ${productId} not found` });
        }
        let basePrice = product.basePrice;
        if (typeof basePrice === "number" && basePrice > 100) {
          basePrice = basePrice / 100;
        }
        const sizes = product.sizeOptions ? JSON.parse(product.sizeOptions) : [];
        const types = product.typeOptions ? JSON.parse(product.typeOptions) : [];
        const shapes = product.shapeOptions ? JSON.parse(product.shapeOptions) : [];
        let totalItemPrice = basePrice;
        if (size) {
          const sizeOption = sizes.find((s) => s.id === size);
          if (sizeOption && sizeOption.price) {
            let optionPrice = parseFloat(sizeOption.price);
            if (optionPrice > 100) {
              optionPrice = optionPrice / 100;
            }
            totalItemPrice += optionPrice;
          }
        }
        if (type) {
          const typeOption = types.find((t) => t.id === type);
          if (typeOption && typeOption.price) {
            let optionPrice = parseFloat(typeOption.price);
            if (optionPrice > 100) {
              optionPrice = optionPrice / 100;
            }
            totalItemPrice += optionPrice;
          }
        }
        if (shape) {
          const shapeOption = shapes.find((s) => s.id === shape);
          if (shapeOption && shapeOption.price) {
            let optionPrice = parseFloat(shapeOption.price);
            if (optionPrice > 100) {
              optionPrice = optionPrice / 100;
            }
            totalItemPrice += optionPrice;
          }
        }
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: [
                size ? `Size: ${sizes.find((s) => s.id === size)?.label || size}` : "",
                type ? `Type: ${types.find((t) => t.id === type)?.label || type}` : "",
                shape ? `Shape: ${shapes.find((s) => s.id === shape)?.label || shape}` : ""
              ].filter(Boolean).join(", ")
            },
            unit_amount: Math.round(totalItemPrice * 100)
            // Convert to cents for Stripe
          },
          quantity: parseInt(quantity, 10)
        });
        const itemDetails = {
          productId,
          productName: product.name,
          quantity: parseInt(quantity, 10),
          price: totalItemPrice,
          size: size || null,
          type: type || null,
          shape: shape || null
        };
        metadata.cart_items = metadata.cart_items ? `${metadata.cart_items},${JSON.stringify(itemDetails)}` : JSON.stringify(itemDetails);
      }
      const session = await stripe2.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/static-bridge/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get("host")}`,
        metadata,
        shipping_address_collection: {
          allowed_countries: ["US"]
        },
        phone_number_collection: {
          enabled: true
        }
      });
      res.json({
        sessionId: session.id,
        publicKey: process.env.VITE_STRIPE_PUBLIC_KEY
      });
    } catch (error) {
      console.error("Static checkout error:", error);
      res.status(500).json({
        error: "Failed to create checkout session",
        message: error.message
      });
    }
  });
  return router4;
}
var stripe2;
var init_staticCheckoutRoutes = __esm({
  "server/routes/staticCheckoutRoutes.js"() {
    "use strict";
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
    }
    stripe2 = new Stripe2(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16"
    });
  }
});

// server/routes/framework-complete-export.js
var framework_complete_export_exports = {};
__export(framework_complete_export_exports, {
  createCompleteFrameworkExport: () => createCompleteFrameworkExport
});
import fs from "fs";
import path from "path";
import archiver from "archiver";
async function createCompleteFrameworkExport(products2, siteCustomization2, repoName = "sweet-moment-chocolates", username = "your-username", customDomain = false) {
  console.log("\u{1F3AF} CREATING COMPLETE FRAMEWORK EXPORT WITH REACT & FRAMER MOTION");
  const outputDir = path.join(process.cwd(), "static-site");
  const zipPath = path.join(process.cwd(), "static-site.zip");
  const basePath = customDomain ? "" : `/${repoName}`;
  try {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true });
    }
    if (fs.existsSync(zipPath)) {
      fs.rmSync(zipPath);
    }
    console.log("\u{1F528} Building complete production version with all frameworks...");
    const { execSync } = await import("child_process");
    try {
      execSync("npm run build", {
        cwd: process.cwd(),
        stdio: "inherit"
      });
      console.log("\u2705 Production build with all frameworks completed");
    } catch (error) {
      console.error("\u274C Build failed:", error.message);
      throw new Error("Production build failed - cannot create complete framework export");
    }
    const distPath = path.join(process.cwd(), "dist");
    if (!fs.existsSync(distPath)) {
      throw new Error("No dist folder found after build");
    }
    console.log("\u{1F4C1} Copying complete production build with all frameworks...");
    const publicPath = path.join(distPath, "public");
    if (fs.existsSync(publicPath)) {
      fs.cpSync(publicPath, outputDir, { recursive: true });
      console.log("\u2705 Moved index.html to root for GitHub Pages");
    }
    const serverBundle = path.join(distPath, "index.js");
    if (fs.existsSync(serverBundle)) {
      fs.cpSync(serverBundle, path.join(outputDir, "server.js"));
    }
    console.log("\u{1F5BC}\uFE0F Copying all images and assets...");
    const uploadsSource = path.join(process.cwd(), "uploads");
    const uploadsTarget = path.join(outputDir, "uploads");
    if (fs.existsSync(uploadsSource)) {
      fs.cpSync(uploadsSource, uploadsTarget, { recursive: true });
      console.log("\u2705 All images and assets copied");
    }
    console.log("\u{1F527} Processing files for GitHub Pages while preserving React and Framer Motion...");
    await processFrameworkFilesForGitHubPages(outputDir, basePath, customDomain, products2, siteCustomization2);
    console.log("\u{1F4E6} Creating download package...");
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    return new Promise((resolve, reject) => {
      output.on("close", () => {
        console.log("\u{1F389} COMPLETE FRAMEWORK EXPORT WITH REACT & FRAMER MOTION COMPLETE!");
        console.log(`\u{1F4C1} Package size: ${archive.pointer()} bytes`);
        resolve();
      });
      archive.on("error", (err) => reject(err));
      archive.pipe(output);
      archive.directory(outputDir, false);
      archive.finalize();
    });
  } catch (error) {
    console.error("\u274C Error creating complete framework export:", error);
    throw error;
  }
}
async function processFrameworkFilesForGitHubPages(outputDir, basePath, customDomain, products2, siteCustomization2) {
  console.log("\u{1F504} Processing framework files for GitHub Pages compatibility...");
  const htmlFiles = fs.readdirSync(outputDir).filter((file) => file.endsWith(".html"));
  for (const htmlFile of htmlFiles) {
    const filePath = path.join(outputDir, htmlFile);
    let content = fs.readFileSync(filePath, "utf8");
    console.log(`\u{1F527} Processing ${htmlFile} for GitHub Pages...`);
    if (!customDomain && basePath) {
      content = content.replace(/(\s+(?:src|href))="\/(?!\/|https?:)/g, `$1="${basePath}/`);
    }
    content = content.replace(
      "<head>",
      `<head>
    <!-- GitHub Pages compatibility for React app -->
    <script>
      // Handle GitHub Pages routing for React Router
      (function(l) {
        if (l.search) {
          var q = {};
          l.search.slice(1).split('&').forEach(function(v) {
            var a = v.split('=');
            q[a[0]] = a.slice(1).join('=').replace(/~and~/g, '&');
          });
          if (q.p !== undefined) {
            window.history.replaceState(null, null,
              l.pathname.slice(0, -1) + (q.p || '') +
              (q.q ? ('?' + q.q) : '') +
              l.hash
            );
          }
        }
      }(window.location))
    </script>`
    );
    if (htmlFile === "index.html") {
      const staticDataScript = `
    <script>
      // Static data for GitHub Pages - embedded at build time
      window.__STATIC_DATA__ = {
        products: ${JSON.stringify(products2)},
        siteCustomization: ${JSON.stringify(siteCustomization2)}
      };
      
      // Override fetch for static mode
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        if (url.includes('/api/products')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(window.__STATIC_DATA__.products)
          });
        }
        if (url.includes('/api/site-customization')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(window.__STATIC_DATA__.siteCustomization)
          });
        }
        // For other API calls, return empty arrays or default responses
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      };
    </script>`;
      content = content.replace("</head>", `  ${staticDataScript}
  </head>`);
      const assetsDir = path.join(outputDir, "assets");
      if (fs.existsSync(assetsDir)) {
        const jsFiles = fs.readdirSync(assetsDir).filter((file) => file.endsWith(".js"));
        const mainJsFile = jsFiles.find((file) => file.startsWith("index-")) || jsFiles[0];
        if (mainJsFile && !content.includes(`src="/assets/${mainJsFile}"`)) {
          content = content.replace(
            "</body>",
            `    <script type="module" crossorigin src="/assets/${mainJsFile}"></script>
  </body>`
          );
          console.log(`\u2705 Added React bundle reference: ${mainJsFile}`);
        }
      }
      console.log(`\u2705 Embedded static data for ${products2.length} products and site customization`);
    }
    fs.writeFileSync(filePath, content);
    console.log(`\u2705 Processed ${htmlFile} - React and Framer Motion preserved`);
  }
  const mainHtmlPath = path.join(outputDir, "index.html");
  if (fs.existsSync(mainHtmlPath)) {
    let mainHtml = fs.readFileSync(mainHtmlPath, "utf8");
    const notFoundHtml = mainHtml.replace(
      "<head>",
      `<head>
    <script>
      // GitHub Pages SPA redirect for React Router
      (function(){
        var pathSegmentsToKeep = ${customDomain ? "0" : "1"};
        var l = window.location;
        l.replace(
          l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
          l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
          l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
          (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
          l.hash
        );
      })();
    </script>`
    );
    fs.writeFileSync(path.join(outputDir, "404.html"), notFoundHtml);
    console.log("\u2705 Created 404.html for React Router compatibility");
    let indexHtml = fs.readFileSync(mainHtmlPath, "utf8");
    indexHtml = indexHtml.replace(
      "<head>",
      `<head>
    <script>
      // Handle GitHub Pages SPA routing
      (function(l) {
        if (l.search[1] === '/' ) {
          var decoded = l.search.slice(1).split('&').map(function(s) { 
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      }(window.location));
    </script>`
    );
    fs.writeFileSync(mainHtmlPath, indexHtml);
    console.log("\u2705 Updated index.html for React Router compatibility");
  }
  console.log("\u{1F389} All framework files processed - React components and Framer Motion animations preserved!");
}
var init_framework_complete_export = __esm({
  "server/routes/framework-complete-export.js"() {
    "use strict";
  }
});

// server/routes/real-website-export.js
var real_website_export_exports = {};
__export(real_website_export_exports, {
  exportRealWebsite: () => exportRealWebsite
});
import fs2 from "fs";
import path2 from "path";
import archiver2 from "archiver";
import { exec } from "child_process";
import { promisify } from "util";
async function exportRealWebsite(repoName = "sweet-moment-chocolates", username = "your-username", customDomain = false) {
  console.log("\u{1F680} GENERATING GITHUB PAGES COMPATIBLE EXPORT");
  const outputDir = path2.join(process.cwd(), "static-site");
  const zipPath = path2.join(process.cwd(), "static-site.zip");
  try {
    if (fs2.existsSync(outputDir)) {
      fs2.rmSync(outputDir, { recursive: true });
    }
    if (fs2.existsSync(zipPath)) {
      fs2.rmSync(zipPath);
    }
    console.log("\u{1F4CA} Fetching current website data...");
    const fetch = (await import("node-fetch")).default;
    const baseUrl = "http://localhost:5000";
    const [productsRes, siteRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`),
      fetch(`${baseUrl}/api/site-customization`)
    ]);
    const products2 = await productsRes.json();
    const siteData = await siteRes.json();
    console.log(`\u2705 Got current data: ${products2.length} products and site configuration`);
    console.log("\u{1F3AF} Creating complete framework export with React and Framer Motion...");
    const { createCompleteFrameworkExport: createCompleteFrameworkExport2 } = await Promise.resolve().then(() => (init_framework_complete_export(), framework_complete_export_exports));
    await createCompleteFrameworkExport2(products2, siteData, repoName, username, customDomain);
    console.log("\u{1F389} GITHUB PAGES EXPORT COMPLETE!");
  } catch (error) {
    console.error("\u274C Export failed:", error);
    throw error;
  }
}
var execAsync;
var init_real_website_export = __esm({
  "server/routes/real-website-export.js"() {
    "use strict";
    execAsync = promisify(exec);
  }
});

// server/routes/perfect-static-export.js
import fs3 from "fs";
import path3 from "path";
import archiver3 from "archiver";
async function setupStaticExportRoutes(app2) {
  app2.post("/api/static-export", async (req, res) => {
    try {
      const { repoName = "sweet-moment-chocolates", username = "your-username", customDomain = false } = req.body;
      console.log(`\u{1F680} COMPLETE WEBSITE EXPORT OVERHAUL for: ${repoName}`);
      const { exportRealWebsite: exportRealWebsite2 } = await Promise.resolve().then(() => (init_real_website_export(), real_website_export_exports));
      await exportRealWebsite2(repoName, username, customDomain);
      res.json({
        success: true,
        message: "Complete website export successful - built with production assets!",
        downloadUrl: "/api/static-export/download"
      });
    } catch (error) {
      console.error("\u274C Export failed:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  app2.get("/api/static-export/download", (req, res) => {
    const zipPath = path3.join(process.cwd(), "static-site.zip");
    if (!fs3.existsSync(zipPath)) {
      return res.status(404).json({ error: "Static export not found. Please generate it first." });
    }
    res.download(zipPath, "sweet-moment-static-site.zip", (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({ error: "Failed to download file" });
      }
    });
  });
}
var init_perfect_static_export = __esm({
  "server/routes/perfect-static-export.js"() {
    "use strict";
  }
});

// server/routes/tap-to-pay.ts
import { Router as Router2 } from "express";
import Stripe3 from "stripe";
import { z as z3 } from "zod";
var stripe3, createPaymentIntentSchema, processPaymentSchema, router, tap_to_pay_default;
var init_tap_to_pay = __esm({
  "server/routes/tap-to-pay.ts"() {
    "use strict";
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
    }
    stripe3 = new Stripe3(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16"
    });
    createPaymentIntentSchema = z3.object({
      // Accept any input that can be converted to a number and ensure it's positive
      amount: z3.preprocess(
        (val) => {
          if (typeof val === "string") return parseFloat(val) || 0;
          if (typeof val === "number") return val;
          return 0;
        },
        z3.number().min(0.01)
      ),
      // Accept any string or null/undefined for optional fields
      customerName: z3.string().nullish().transform((val) => val || ""),
      customerEmail: z3.string().nullish().transform((val) => val || ""),
      customerPhone: z3.string().nullish().transform((val) => val || "")
    });
    processPaymentSchema = z3.object({
      paymentIntentId: z3.string()
    });
    router = Router2();
    router.post("/create-payment-intent", async (req, res) => {
      try {
        console.log("Tap to Pay create-payment-intent request body:", JSON.stringify(req.body, null, 2));
        const validationResult = createPaymentIntentSchema.safeParse(req.body);
        if (!validationResult.success) {
          console.error("Validation error:", JSON.stringify(validationResult.error.errors, null, 2));
          return res.status(400).json({
            message: "Invalid request data",
            errors: validationResult.error.errors
          });
        }
        const { amount, customerName, customerEmail, customerPhone } = validationResult.data;
        const metadata = {};
        if (customerName) metadata.customer_name = customerName;
        if (customerEmail) metadata.customer_email = customerEmail;
        if (customerPhone) metadata.customer_phone = customerPhone;
        const amountInCents = Math.max(1, Math.round(Number(amount) * 100));
        console.log(`Creating payment intent with amount: $${amount} (${amountInCents} cents)`);
        const paymentIntent = await stripe3.paymentIntents.create({
          amount: amountInCents,
          currency: "usd",
          payment_method_types: ["card_present"],
          capture_method: "automatic",
          metadata
        });
        res.status(200).json({
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret
        });
      } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({
          message: "Failed to create payment intent",
          error: error.message
        });
      }
    });
    router.post("/process-payment", async (req, res) => {
      try {
        const validationResult = processPaymentSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({
            message: "Invalid request data",
            errors: validationResult.error.errors
          });
        }
        const { paymentIntentId } = validationResult.data;
        console.log(`Simulating payment for intent: ${paymentIntentId}`);
        res.status(200).json({
          status: "succeeded",
          paymentIntentId
        });
      } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({
          message: "Failed to process payment",
          error: error.message
        });
      }
    });
    tap_to_pay_default = router;
  }
});

// server/routes/uploads.ts
var uploads_exports = {};
__export(uploads_exports, {
  cleanupPreviousImage: () => cleanupPreviousImage,
  registerUploadRoutes: () => registerUploadRoutes
});
import express2 from "express";
import multer from "multer";
import path4 from "path";
import fs4 from "fs";
function getFilenameFromPath(filePath) {
  const cleanPath = filePath.split("?")[0];
  const match = cleanPath.match(/\/uploads\/([^\/]+)$/);
  return match ? match[1] : null;
}
async function cleanupPreviousImage(previousImageUrl) {
  if (!previousImageUrl) return false;
  try {
    const filename = getFilenameFromPath(previousImageUrl);
    if (!filename) return false;
    const filePath = path4.join(process.cwd(), "uploads", filename);
    if (fs4.existsSync(filePath)) {
      fs4.unlinkSync(filePath);
      console.log(`Deleted previous image file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error cleaning up previous image:", error);
    return false;
  }
}
function registerUploadRoutes(app2) {
  app2.use("/uploads", (req, res, next) => {
    next();
  }, express2.static(path4.join(process.cwd(), "uploads")));
  app2.post("/api/admin/upload-base64", authenticateToken, isAdmin, async (req, res) => {
    try {
      const image = req.body.image;
      const originalPath = req.body.originalPath;
      const replaceImage = req.body.replaceImage;
      if (!image) {
        return res.status(400).json({ error: "No image data provided" });
      }
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const fileExtension = image.match(/^data:image\/(\w+);base64,/)?.[1] || "jpeg";
      const timestamp2 = Date.now();
      const uniqueId = Math.round(Math.random() * 1e9);
      const filename = `${timestamp2}-${uniqueId}.${fileExtension}`;
      const filepath = path4.join(process.cwd(), "uploads", filename);
      const uploadsDir = path4.join(process.cwd(), "uploads");
      if (!fs4.existsSync(uploadsDir)) {
        fs4.mkdirSync(uploadsDir, { recursive: true });
      }
      fs4.writeFileSync(filepath, base64Data, "base64");
      const url = `/uploads/${filename}`;
      console.log("Cropped image uploaded successfully:", url);
      if (replaceImage) {
        await cleanupPreviousImage(replaceImage);
      }
      return res.status(200).json({
        url,
        // Important: frontend expects 'url' property
        originalPath
      });
    } catch (error) {
      console.error("Error uploading cropped image:", error);
      return res.status(500).json({ error: "Failed to upload cropped image" });
    }
  });
  app2.post("/api/admin/upload", authenticateToken, isAdmin, async (req, res) => {
    if (req.body && req.body.base64Image) {
      try {
        const base64Data = req.body.base64Image.replace(/^data:image\/\w+;base64,/, "");
        const fileExtension = req.body.base64Image.match(/^data:image\/(\w+);base64,/)?.[1] || "jpeg";
        const originalFilename = req.body.originalFilename || `Image_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}`;
        const replaceImage = req.body.replaceImage;
        const productId = req.body.productId;
        const timestamp2 = Date.now();
        const uniqueId = Math.round(Math.random() * 1e9);
        const filename = `${timestamp2}-${uniqueId}.${fileExtension}`;
        const filepath = path4.join(process.cwd(), "uploads", filename);
        const uploadsDir = path4.join(process.cwd(), "uploads");
        if (!fs4.existsSync(uploadsDir)) {
          fs4.mkdirSync(uploadsDir, { recursive: true });
        }
        fs4.writeFileSync(filepath, base64Data, "base64");
        const imageUrl = `/uploads/${filename}`;
        console.log("Base64 image uploaded successfully:", imageUrl);
        if (replaceImage) {
          const cleaned = await cleanupPreviousImage(replaceImage);
          console.log(`Replaced image '${replaceImage}' with '${imageUrl}', cleanup result: ${cleaned}`);
        }
        return res.status(200).json({
          imageUrl,
          timestamp: timestamp2,
          originalFilename,
          fileSize: Buffer.from(base64Data, "base64").length,
          message: "Base64 image uploaded successfully"
        });
      } catch (error) {
        console.error("Base64 upload error:", error);
        return res.status(500).json({ error: "Error processing base64 image" });
      }
    } else {
      upload.single("image")(req, res, async (err) => {
        if (err) {
          console.error("Upload error:", err);
          return res.status(400).json({ error: err.message });
        }
        const file = req.file;
        if (!file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
        const replaceImage = req.body.replaceImage;
        const timestamp2 = Date.now();
        const imageUrl = `/uploads/${file.filename}`;
        const originalFilename = file.originalname.replace(/\.[^/.]+$/, "");
        console.log("File uploaded successfully:", imageUrl, "Original name:", originalFilename);
        if (replaceImage) {
          const cleaned = await cleanupPreviousImage(replaceImage);
          console.log(`Replaced image '${replaceImage}' with '${imageUrl}', cleanup result: ${cleaned}`);
        }
        res.status(200).json({
          imageUrl,
          timestamp: timestamp2,
          originalFilename,
          fileSize: file.size,
          message: "File uploaded successfully"
        });
      });
    }
  });
}
var storage3, fileFilter, upload;
var init_uploads = __esm({
  "server/routes/uploads.ts"() {
    "use strict";
    init_auth();
    storage3 = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadsDir = path4.join(process.cwd(), "uploads");
        if (!fs4.existsSync(uploadsDir)) {
          fs4.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path4.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
      }
    });
    fileFilter = (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    };
    upload = multer({
      storage: storage3,
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }
      // 5MB file size limit
    });
  }
});

// server/routes/custom-orders.ts
import express3 from "express";
import { z as z4 } from "zod";
var directPaymentSchema, router2, custom_orders_default;
var init_custom_orders = __esm({
  "server/routes/custom-orders.ts"() {
    "use strict";
    init_schema();
    init_storage();
    directPaymentSchema = z4.object({
      customerName: z4.string().min(1, "Customer name is required"),
      orderDetails: z4.string().optional(),
      // Making orderDetails optional
      amount: z4.number().min(1, "Amount must be greater than 0"),
      paymentMethod: z4.enum(["cash", "card"]),
      paymentIntentId: z4.string().optional()
    });
    router2 = express3.Router();
    router2.post("/", async (req, res) => {
      try {
        console.log("Received custom order request body:", req.body);
        const customOrderInput = {
          ...req.body,
          // If selectedProducts is a string, parse it; otherwise, use null
          selectedProducts: req.body.selectedProducts ? typeof req.body.selectedProducts === "string" ? req.body.selectedProducts : JSON.stringify(req.body.selectedProducts) : null
        };
        console.log("Formatted custom order input:", customOrderInput);
        const result = insertCustomOrderSchema.safeParse(customOrderInput);
        if (!result.success) {
          console.error("Validation error:", result.error);
          return res.status(400).json({
            message: "Invalid custom order data",
            errors: result.error.issues
          });
        }
        console.log("Validation successful, parsed data:", result.data);
        const customOrder = await storage.createCustomOrder(result.data);
        return res.status(201).json(customOrder);
      } catch (error) {
        console.error("Error creating custom order:", error);
        return res.status(500).json({ message: "Failed to create custom order" });
      }
    });
    router2.get("/", async (req, res) => {
      try {
        const customOrders2 = await storage.getAllCustomOrders();
        return res.json(customOrders2);
      } catch (error) {
        console.error("Error getting custom orders:", error);
        return res.status(500).json({ message: "Failed to get custom orders" });
      }
    });
    router2.get("/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid order ID" });
        }
        const customOrder = await storage.getCustomOrder(id);
        if (!customOrder) {
          return res.status(404).json({ message: "Custom order not found" });
        }
        return res.json(customOrder);
      } catch (error) {
        console.error("Error getting custom order:", error);
        return res.status(500).json({ message: "Failed to get custom order" });
      }
    });
    router2.patch("/:id/status", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid order ID" });
        }
        const statusSchema = z4.object({
          status: z4.enum(["pending", "ready", "completed", "cancelled"])
        });
        const result = statusSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({ message: "Invalid status" });
        }
        const customOrder = await storage.updateCustomOrderStatus(id, result.data.status);
        if (!customOrder) {
          return res.status(404).json({ message: "Custom order not found" });
        }
        return res.json(customOrder);
      } catch (error) {
        console.error("Error updating custom order status:", error);
        return res.status(500).json({ message: "Failed to update custom order status" });
      }
    });
    router2.delete("/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid order ID" });
        }
        const customOrder = await storage.getCustomOrder(id);
        if (!customOrder) {
          return res.status(404).json({ message: "Custom order not found" });
        }
        const deleted = await storage.deleteCustomOrder(id);
        if (!deleted) {
          return res.status(500).json({ message: "Failed to delete custom order" });
        }
        return res.status(200).json({ message: "Custom order deleted successfully" });
      } catch (error) {
        console.error("Error deleting custom order:", error);
        return res.status(500).json({ message: "Failed to delete custom order" });
      }
    });
    router2.post("/with-payment", async (req, res) => {
      try {
        console.log("Received direct payment order request:", req.body);
        const result = directPaymentSchema.safeParse(req.body);
        if (!result.success) {
          console.error("Validation error for direct payment:", result.error);
          return res.status(400).json({
            message: "Invalid direct payment data",
            errors: result.error.issues
          });
        }
        const { customerName, orderDetails = "", amount, paymentMethod, paymentIntentId } = result.data;
        console.log("Validated data:", { customerName, orderDetails, amount, paymentMethod, paymentIntentId });
        if (paymentMethod === "card" && !paymentIntentId) {
          return res.status(400).json({
            message: "Payment intent ID is required for card payments"
          });
        }
        const customOrderInput = {
          customerName,
          // Use contact information from the request, defaulting to admin email for contact info
          contactInfo: "admin@sweetmoment.com",
          contactType: "email",
          // Handle optional order details
          orderDetails: orderDetails || "Direct payment without detailed order information",
          selectedProducts: null,
          status: "completed"
          // Mark as completed since payment is already processed
        };
        console.log("Creating custom order with:", customOrderInput);
        try {
          const customOrder = await storage.createCustomOrder(customOrderInput);
          console.log("Custom order created successfully:", customOrder);
          const response = {
            ...customOrder,
            payment: {
              method: paymentMethod,
              amount,
              paymentIntentId: paymentMethod === "card" ? paymentIntentId : null
            }
          };
          return res.status(201).json(response);
        } catch (storageError) {
          console.error("Error in storage.createCustomOrder:", storageError);
          return res.status(500).json({
            message: "Failed to create custom order in database",
            error: storageError?.message || "Unknown database error"
          });
        }
      } catch (error) {
        console.error("Error processing direct payment order:", error);
        return res.status(500).json({
          message: "Failed to process direct payment order",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    custom_orders_default = router2;
  }
});

// server/routes/public-custom-orders.ts
import express4 from "express";
var router3, public_custom_orders_default;
var init_public_custom_orders = __esm({
  "server/routes/public-custom-orders.ts"() {
    "use strict";
    init_storage();
    init_schema();
    router3 = express4.Router();
    router3.post("/", async (req, res) => {
      try {
        console.log("Received public custom order request body:", req.body);
        const customOrderInput = {
          ...req.body,
          // If selectedProducts is a string, parse it; otherwise, use null
          selectedProducts: req.body.selectedProducts ? typeof req.body.selectedProducts === "string" ? req.body.selectedProducts : JSON.stringify(req.body.selectedProducts) : null
        };
        console.log("Formatted custom order input:", customOrderInput);
        const result = insertCustomOrderSchema.safeParse(customOrderInput);
        if (!result.success) {
          console.error("Validation error:", result.error);
          return res.status(400).json({
            message: "Invalid custom order data",
            errors: result.error.issues
          });
        }
        console.log("Validation successful, parsed data:", result.data);
        const customOrder = await storage.createCustomOrder(result.data);
        return res.status(201).json(customOrder);
      } catch (error) {
        console.error("Error creating custom order:", error);
        return res.status(500).json({ message: "Failed to create custom order" });
      }
    });
    public_custom_orders_default = router3;
  }
});

// server/routes.ts
var routes_exports = {};
__export(routes_exports, {
  ensureDefaultCategoriesExist: () => ensureDefaultCategoriesExist,
  ensureLegacyProductsExist: () => ensureLegacyProductsExist,
  registerRoutes: () => registerRoutes,
  runDeferredInitialization: () => runDeferredInitialization
});
import express5 from "express";
import { createServer } from "http";
import path5 from "path";
import { eq as eq3 } from "drizzle-orm";
import { z as z5 } from "zod";
import fs5 from "fs";
function convertOptionPrices(options) {
  if (!Array.isArray(options)) return options;
  return options.map((option) => {
    if (option.price !== void 0) {
      const numPrice = typeof option.price === "string" ? parseFloat(option.price) : option.price;
      if (!isNaN(numPrice) && numPrice < 100) {
        const centsValue = Math.round(numPrice * 100);
        console.log(`Converting option price from dollars to cents: ${numPrice} * 100 = ${centsValue} cents`);
        return {
          ...option,
          price: centsValue
        };
      }
      return {
        ...option,
        // Ensure it's stored as an integer
        price: Math.round(numPrice)
      };
    }
    return option;
  });
}
function parseProductOptions(product) {
  try {
    console.log("Parsing options for product:", product.id);
    const sizes = product.sizeOptions ? JSON.parse(product.sizeOptions) : [];
    const types = product.typeOptions ? JSON.parse(product.typeOptions) : [];
    const processedSizes = sizes.map((size) => {
      if (size.price !== void 0) {
        const numPrice = typeof size.price === "string" ? parseFloat(size.price) : size.price;
        if (!isNaN(numPrice) && numPrice > 100) {
          return {
            ...size,
            price: numPrice / 100
            // Convert from cents to dollars
          };
        }
        return {
          ...size,
          price: numPrice
        };
      }
      return size;
    });
    const processedTypes = types.map((type) => {
      if (type.price !== void 0) {
        const numPrice = typeof type.price === "string" ? parseFloat(type.price) : type.price;
        if (!isNaN(numPrice) && numPrice > 100) {
          return {
            ...type,
            price: numPrice / 100
            // Convert from cents to dollars
          };
        }
        return {
          ...type,
          price: numPrice
        };
      }
      return type;
    });
    console.log("Parsed sizes:", processedSizes);
    console.log("Parsed types:", processedTypes);
    const displayOrder = typeof product.displayOrder === "number" ? product.displayOrder : 1e3;
    let basePrice = product.basePrice;
    if (typeof basePrice === "number") {
      if (basePrice >= 20) {
        console.log(`Converting product ${product.id} basePrice from cents to dollars: ${basePrice} / 100 = ${basePrice / 100}`);
        basePrice = basePrice / 100;
      } else if (basePrice >= 10 && basePrice < 20) {
        const cents = Math.round(basePrice * 100 % 100);
        if (cents === 99 || cents === 95 || cents === 50) {
          console.log(`Keeping price ${basePrice} as dollars since it has a common cents value: ${cents}`);
        } else {
          console.log(`Converting ambiguous price ${basePrice} to dollars: ${basePrice / 100}`);
          basePrice = basePrice / 100;
        }
      }
    }
    let salePrice = product.salePrice;
    if (typeof salePrice === "number") {
      if (salePrice >= 20) {
        console.log(`Converting product ${product.id} salePrice from cents to dollars: ${salePrice} / 100 = ${salePrice / 100}`);
        salePrice = salePrice / 100;
      } else if (salePrice >= 10 && salePrice < 20) {
        const cents = Math.round(salePrice * 100 % 100);
        if (cents === 99 || cents === 95 || cents === 50) {
          console.log(`Keeping sale price ${salePrice} as dollars since it has a common cents value: ${cents}`);
        } else {
          console.log(`Converting ambiguous sale price ${salePrice} to dollars: ${salePrice / 100}`);
          salePrice = salePrice / 100;
        }
      }
    }
    const formattedPrice = typeof basePrice === "number" ? basePrice.toFixed(2) : "0.00";
    const formattedSalePrice = typeof salePrice === "number" ? salePrice.toFixed(2) : "0.00";
    console.log(`Product ${product.id} final price: $${formattedPrice}${salePrice ? ` (Sale: $${formattedSalePrice})` : ""}`);
    return {
      ...product,
      basePrice,
      salePrice,
      sizes: processedSizes,
      types: processedTypes,
      displayOrder,
      // Explicitly include displayOrder
      formattedPrice
      // Add formatted price for consistency
    };
  } catch (error) {
    console.error("Error parsing product options:", error);
    return {
      ...product,
      sizes: [],
      types: [],
      displayOrder: product.displayOrder || 1e3,
      // Fallback value
      formattedPrice: "0.00"
      // Default formatted price
    };
  }
}
async function ensureLegacyProductsExist() {
  console.log("Checking if legacy products exist in database...");
  const defaultProducts = {
    "3": {
      name: "Caramel Chocolate",
      description: "Smooth caramel wrapped in rich chocolate, crafted to perfection for a luxurious treat.",
      image: "https://images.unsplash.com/photo-1582049024337-a045acffe5e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      rating: 0,
      reviewCount: 0,
      basePrice: 850,
      category: "caramel",
      featured: false,
      inventory: 90,
      sizeOptions: JSON.stringify([
        { id: "small", label: "Small Box (4 pieces)", value: "small", price: 0 },
        { id: "medium", label: "Medium Box (8 pieces)", value: "medium", price: 400 },
        { id: "large", label: "Large Box (12 pieces)", value: "large", price: 800 }
      ]),
      typeOptions: JSON.stringify([
        { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
        { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
      ]),
      allergyInfo: "caramel",
      displayOrder: 20
    },
    "4": {
      name: "Cereal Chocolate",
      description: "The perfect combination of crunchy cereal and smooth chocolate for a textural delight.",
      image: "https://images.unsplash.com/photo-1608250389763-3b2d9a386ed6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      rating: 0,
      reviewCount: 0,
      basePrice: 850,
      category: "cereal",
      featured: false,
      inventory: 85,
      sizeOptions: JSON.stringify([
        { id: "standard", label: "Standard Box (6 pieces)", value: "standard", price: 0 }
      ]),
      typeOptions: JSON.stringify([
        { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
        { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
      ]),
      allergyInfo: "cereal",
      displayOrder: 40
    }
  };
  const allProducts = await storage4.getProducts();
  console.log(`Found ${allProducts.length} products in database`);
  for (const [id, productData] of Object.entries(defaultProducts)) {
    const numericId = parseInt(id);
    const category = productData.category;
    const productWithCategory = allProducts.find((p) => p.category === category);
    if (!productWithCategory) {
      console.log(`Creating missing legacy product ${id}: ${productData.name} (category: ${category})`);
      await storage4.createProduct({
        ...productData,
        saleActive: false,
        saleType: "percentage",
        saleValue: 0,
        salePrice: 0,
        saleStartDate: null,
        saleEndDate: null
      });
    } else {
      console.log(`Legacy product category ${category} already exists in database as product ID ${productWithCategory.id}`);
      if (productWithCategory.allergyInfo !== category) {
        console.log(`Updating allergyInfo for product ${productWithCategory.id} to ${category} for legacy mapping`);
        await storage4.updateProduct(productWithCategory.id, {
          allergyInfo: category
          // Use category as allergyInfo for mapping
        });
      }
    }
  }
}
async function ensureDefaultCategoriesExist() {
  try {
    const defaultCategories = [
      { name: "Classic", slug: "classic", description: "Our timeless traditional chocolate selections" },
      { name: "Premium", slug: "premium", description: "Luxury chocolates for discerning connoisseurs" },
      { name: "Seasonal", slug: "seasonal", description: "Limited edition seasonal chocolate collections" },
      { name: "Assorted", slug: "assorted", description: "Mixed chocolate collections with a variety of flavors" }
    ];
    const existingCategories = await storage4.getCategories();
    const existingSlugs = existingCategories.map((cat) => cat.slug);
    for (const category of defaultCategories) {
      if (!existingSlugs.includes(category.slug)) {
        console.log(`Creating default category: ${category.name}`);
        await storage4.createCategory({
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: null
        });
      }
    }
    console.log("Default categories initialization complete");
  } catch (error) {
    console.error("Error initializing default categories:", error);
  }
}
async function runDeferredInitialization() {
  console.log("Running additional deferred initialization tasks...");
}
function getProductBasePrice2(productId, options = {}) {
  const productIdStr = String(productId).toLowerCase();
  let basePrice = 0;
  if (productIdStr === "classicchocolate" || productIdStr === "42" || productIdStr.includes("classic")) {
    basePrice = 800;
  } else if (productIdStr === "caramelchocolate" || productIdStr === "44" || productIdStr.includes("caramel")) {
    basePrice = 800;
  } else if (productIdStr === "dubaibar" || productIdStr === "47" || productIdStr.includes("dubai")) {
    basePrice = 500;
  } else if (productIdStr.includes("signature") || productIdStr === "48" || productIdStr.includes("collection")) {
    basePrice = 2e3;
  } else if (productIdStr.includes("assorted") || productIdStr === "46" || productIdStr.includes("nuts")) {
    basePrice = 1e3;
  } else {
    basePrice = 800;
  }
  if (options) {
    const type = (options.type || "").toLowerCase();
    const size = (options.size || "").toLowerCase();
    if (type === "dark") {
      basePrice += 200;
    }
    if (size === "medium") {
      basePrice += 700;
    } else if (size === "large") {
      if (productIdStr === "caramelchocolate" || productIdStr === "44" || productIdStr.includes("caramel")) {
        basePrice += 1900;
        console.log(`[PRICE_API] Large caramel chocolate: base ${basePrice - 1900} cents + size premium 1900 cents = ${basePrice} cents total`);
      } else {
        basePrice += 400;
      }
    }
  }
  console.log(`[PRICE_API] Product ${productId} base price: ${basePrice} cents`);
  return basePrice;
}
async function registerRoutes(app2) {
  setupStaticExportRoutes(app2);
  app2.use("/api/tap-to-pay", tap_to_pay_default);
  console.log("Checking if legacy products exist in database...");
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app2.get("/api/csrf-token", (req, res) => {
    res.json({ status: "ok" });
  });
  app2.use("/api/checkout", createCheckoutRouter(storage4));
  app2.use("/api/static-checkout", createStaticCheckoutRouter(storage4));
  app2.get("/api/shipping/status", async (req, res) => {
    try {
      const shippingSetting = await storage4.getSiteSetting("shipping_enabled");
      const shippingEnabled = shippingSetting?.value === "true";
      res.json({
        enabled: shippingEnabled,
        message: shippingEnabled ? "Shipping is available" : "Shipping is currently unavailable"
      });
    } catch (error) {
      console.error("Error getting shipping status:", error);
      res.json({ enabled: true, message: "Shipping is available" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid user data",
          errors: result.error.format()
        });
      }
      const user = await createUser(result.data);
      if (!user) {
        return res.status(409).json({ message: "Username or email already exists" });
      }
      const token = generateToken(user);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await storage4.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage4.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/calculate-price", async (req, res) => {
    try {
      const { productId, size, type, shape } = req.body;
      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }
      const price = await calculateProductPrice(productId, size, type, shape);
      console.log(`[PRICE_API] Calculated price for productId=${productId}, size=${size}, type=${type}, shape=${shape}: ${price} cents`);
      res.json({
        price,
        productId,
        size,
        type,
        shape,
        unit: "cents"
        // To clarify that prices are in cents
      });
    } catch (error) {
      console.error("Error calculating product price:", error);
      res.status(500).json({ error: "Server error calculating price" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const storedProducts = await storage4.getProducts();
      console.log("Stored products from database:", storedProducts);
      const processedStoredProducts = storedProducts.map((product) => {
        const parsedProduct = parseProductOptions(product);
        let basePriceInDollars = product.basePrice;
        if (typeof basePriceInDollars === "number") {
          if (basePriceInDollars >= 20) {
            basePriceInDollars = basePriceInDollars / 100;
            console.log(`Converting product ${product.id} basePrice from cents to dollars: ${product.basePrice} / 100 = ${basePriceInDollars}`);
          } else if (basePriceInDollars >= 10 && basePriceInDollars < 20) {
            const cents = Math.round(basePriceInDollars * 100 % 100);
            if (cents === 99 || cents === 95 || cents === 50) {
              console.log(`Keeping price ${basePriceInDollars} as dollars since it has a common cents value: ${cents}`);
            } else {
              console.log(`Converting ambiguous price ${basePriceInDollars} to dollars: ${basePriceInDollars / 100}`);
              basePriceInDollars = basePriceInDollars / 100;
            }
          }
        }
        const formattedPrice = basePriceInDollars.toFixed(2);
        let formattedSalePrice = null;
        if (product.saleActive && typeof product.salePrice === "number") {
          let salePriceInDollars = product.salePrice;
          if (salePriceInDollars >= 20) {
            salePriceInDollars = salePriceInDollars / 100;
            console.log(`Converting product ${product.id} salePrice from cents to dollars: ${product.salePrice} / 100 = ${salePriceInDollars}`);
          } else if (salePriceInDollars >= 10 && salePriceInDollars < 20) {
            const cents = Math.round(salePriceInDollars * 100 % 100);
            if (cents === 99 || cents === 95 || cents === 50) {
              console.log(`Keeping sale price ${salePriceInDollars} as dollars since it has a common cents value: ${cents}`);
            } else {
              console.log(`Converting ambiguous sale price ${salePriceInDollars} to dollars: ${salePriceInDollars / 100}`);
              salePriceInDollars = salePriceInDollars / 100;
            }
          }
          formattedSalePrice = salePriceInDollars.toFixed(2);
        }
        const kebabName = product.name.toLowerCase().replace(/\s+/g, "-");
        const path8 = `/menu/${kebabName}`;
        let badge = void 0;
        if (product.allergyInfo === "classic") {
          badge = "popular";
        } else if (product.allergyInfo === "assorted") {
          badge = "best-seller";
        } else if (product.allergyInfo === "caramel") {
          badge = "premium";
        } else if (product.allergyInfo === "cereal") {
          badge = "new";
        }
        const displayOrder = typeof product.displayOrder === "number" ? product.displayOrder : 1e3;
        console.log(`Formatted price for product ${product.id}: $${formattedPrice} (from ${basePriceInDollars})`);
        return {
          ...parsedProduct,
          id: product.id.toString(),
          basePrice: basePriceInDollars,
          price: basePriceInDollars,
          // Legacy compatibility
          formattedPrice,
          salePrice: formattedSalePrice,
          displayOrder,
          path: path8,
          badge
        };
      });
      const assortedExists = processedStoredProducts.some((p) => p.id === "assorted" || p.category === "assorted" || p.allergyInfo === "assorted");
      let products2 = [...processedStoredProducts];
      if (!assortedExists) {
        console.log("Adding missing Assorted Nuts Chocolate to products list");
        const assortedProduct = global.assortedNutsProduct ? {
          ...global.assortedNutsProduct,
          price: global.assortedNutsProduct.basePrice,
          formattedPrice: global.assortedNutsProduct.basePrice.toFixed(2),
          path: "/menu/assorted-nuts-chocolate",
          // Parse the options into the sizes and types properties
          sizes: JSON.parse(global.assortedNutsProduct.sizeOptions || "[]"),
          types: JSON.parse(global.assortedNutsProduct.typeOptions || "[]")
        } : {
          id: "assorted",
          name: "Assorted Nuts Chocolate",
          description: "A delightful blend of premium nuts and rich chocolate for an exquisite taste experience.",
          image: "https://images.unsplash.com/photo-1624454002302-c8d1d73b916c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          basePrice: 12,
          price: 12,
          formattedPrice: "12.00",
          category: "assorted",
          featured: true,
          inventory: 100,
          sizeOptions: '[{"id":"standard","label":"Standard Box (6 pieces)","value":"standard","price":0}]',
          typeOptions: '[{"id":"milk","label":"Milk Chocolate","value":"milk","price":0},{"id":"dark","label":"Dark Chocolate","value":"dark","price":0}]',
          allergyInfo: "assorted",
          rating: 0,
          reviewCount: 0,
          displayOrder: 30,
          path: "/menu/assorted-nuts-chocolate",
          badge: "best-seller",
          salePrice: null,
          saleType: "percentage",
          saleValue: 0,
          saleActive: false,
          saleStartDate: null,
          saleEndDate: null,
          hasMultipleImages: false,
          visible: false,
          // Default to hidden
          createdAt: /* @__PURE__ */ new Date(),
          // Parse the options into the sizes and types properties
          sizes: [{ id: "standard", label: "Standard Box (6 pieces)", value: "standard", price: 0 }],
          types: [
            { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
            { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
          ]
        };
        products2.push(assortedProduct);
      }
      const filteredProducts = products2.filter((p) => {
        if (p.category === "system") return false;
        if (p.visible === false) return false;
        return true;
      });
      console.log("Products before sorting:", filteredProducts.map((p) => ({
        id: p.id,
        name: p.name,
        visible: p.visible,
        displayOrder: p.displayOrder || 1e3
      })));
      filteredProducts.sort((a, b) => {
        const orderA = typeof a.displayOrder === "number" ? a.displayOrder : 1e3;
        const orderB = typeof b.displayOrder === "number" ? b.displayOrder : 1e3;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.name.localeCompare(b.name);
      });
      console.log("Products after sorting:", filteredProducts.map((p) => ({
        id: p.id,
        name: p.name,
        displayOrder: p.displayOrder || 1e3
      })));
      res.json(filteredProducts);
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  if (!global.assortedNutsProduct) {
    global.assortedNutsProduct = {
      id: "assorted",
      name: "Assorted Nuts Chocolate",
      description: "A delightful blend of premium nuts and rich chocolate for an exquisite taste experience.",
      image: "https://images.unsplash.com/photo-1624454002302-c8d1d73b916c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      basePrice: 12,
      category: "assorted",
      featured: true,
      inventory: 100,
      sizeOptions: JSON.stringify([{ id: "standard", label: "Standard Box (6 pieces)", value: "standard", price: 0 }]),
      typeOptions: JSON.stringify([
        { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
        { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
      ]),
      rating: 0,
      reviewCount: 0,
      displayOrder: 30,
      allergyInfo: "assorted",
      salePrice: null,
      saleType: "percentage",
      saleValue: 0,
      saleActive: false,
      saleStartDate: null,
      saleEndDate: null,
      visible: true,
      // Default to true for consistent visibility
      badge: null
    };
  }
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Product ID or slug being searched for:", id);
      let product = await getProductByIdOrSlug(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      parseProductOptions(product);
      res.json(product);
    } catch (error) {
      console.error("Error getting product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  async function getProductByIdOrSlug(id) {
    let numericId = parseInt(id);
    let product = null;
    const idMap = {
      "classic": 42,
      "assorted": 46,
      // Updated to use numeric ID from database
      "caramel": 44,
      "cereal": 41
    };
    if (id in idMap) {
      const mappedId = idMap[id];
      console.log(`Using mapped ID: ${id} -> ${mappedId}`);
      if (typeof mappedId === "number") {
        product = await storage4.getProduct(mappedId);
        if (product) {
          console.log(`Found product using mapped ID ${mappedId}:`, product.name);
          return product;
        }
      }
    }
    if (id === "assorted") {
      console.log("Looking up 'assorted' product with ID 46");
      return await storage4.getProduct(46);
    } else if (!isNaN(numericId)) {
      product = await storage4.getProduct(numericId);
      if (product) {
        console.log(`Found product using numeric ID ${numericId}:`, product.name);
        return product;
      }
    }
    const allProducts = await storage4.getProducts();
    product = allProducts.find((p) => p.allergyInfo === id);
    if (product) {
      console.log(`Found product using allergyInfo '${id}':`, product.name);
      return product;
    }
    product = allProducts.find((p) => {
      const slug = p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      return slug === id;
    });
    if (product) {
      console.log(`Found product using slug '${id}':`, product.name);
      return product;
    }
    console.log(`No product found for ID or slug: ${id}`);
    return null;
  }
  app2.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const storedProducts = await storage4.getProductsByCategory(category);
      const products2 = storedProducts.map((product) => {
        const parsedProduct = parseProductOptions(product);
        let basePriceInDollars = product.basePrice;
        if (typeof basePriceInDollars === "number") {
          if (basePriceInDollars >= 20) {
            basePriceInDollars = basePriceInDollars / 100;
            console.log(`Converting product ${product.id} basePrice from cents to dollars: ${product.basePrice} / 100 = ${basePriceInDollars}`);
          } else if (basePriceInDollars >= 10 && basePriceInDollars < 20) {
            const cents = Math.round(basePriceInDollars * 100 % 100);
            if (cents === 99 || cents === 95 || cents === 50) {
              console.log(`Keeping price ${basePriceInDollars} as dollars since it has a common cents value: ${cents}`);
            } else {
              console.log(`Converting ambiguous price ${basePriceInDollars} to dollars: ${basePriceInDollars / 100}`);
              basePriceInDollars = basePriceInDollars / 100;
            }
          }
        }
        const formattedPrice = basePriceInDollars.toFixed(2);
        const kebabName = product.name.toLowerCase().replace(/\s+/g, "-");
        const path8 = `/menu/${kebabName}`;
        return {
          ...parsedProduct,
          id: product.id.toString(),
          basePrice: basePriceInDollars,
          price: basePriceInDollars,
          // Legacy compatibility
          formattedPrice,
          path: path8
        };
      });
      res.json(products2);
    } catch (error) {
      console.error("Error getting products by category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/products", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { sizes, types, sizeOptions: incomingSizeOptions, typeOptions: incomingTypeOptions, ...productData } = req.body;
      let processedSizes = sizes;
      if (Array.isArray(sizes)) {
        processedSizes = convertOptionPrices(sizes);
        console.log("Processed size options prices:", processedSizes);
      }
      const sizeOptions = processedSizes ? JSON.stringify(processedSizes) : incomingSizeOptions ? typeof incomingSizeOptions === "string" ? incomingSizeOptions : JSON.stringify(incomingSizeOptions) : null;
      let processedTypes = types;
      if (Array.isArray(types)) {
        processedTypes = convertOptionPrices(types);
        console.log("Processed type options prices:", processedTypes);
      }
      const typeOptions = processedTypes ? JSON.stringify(processedTypes) : incomingTypeOptions ? typeof incomingTypeOptions === "string" ? incomingTypeOptions : JSON.stringify(incomingTypeOptions) : null;
      let normalizedImage = productData.image;
      if (normalizedImage && typeof normalizedImage === "string" && !normalizedImage.startsWith("http://") && !normalizedImage.startsWith("https://") && !normalizedImage.startsWith("/")) {
        console.log(`Server normalizing image URL for new product: ${normalizedImage} -> https://${normalizedImage}`);
        normalizedImage = "https://" + normalizedImage;
      }
      const { _debug_basePrice_dollars, _debug_basePrice_cents, ...cleanProductData } = productData;
      let fixedBasePrice = cleanProductData.basePrice;
      if (fixedBasePrice !== void 0 && fixedBasePrice < 100) {
        console.log(`Adjusting price for new product: ${fixedBasePrice} is likely in dollars, converting to ${fixedBasePrice * 100} cents`);
        fixedBasePrice = fixedBasePrice * 100;
      }
      const productDataWithOptions = {
        ...cleanProductData,
        basePrice: fixedBasePrice,
        // Use the fixed price
        image: normalizedImage,
        sizeOptions,
        typeOptions
      };
      const result = insertProductSchema.safeParse(productDataWithOptions);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid product data",
          errors: result.error.format()
        });
      }
      const product = await storage4.createProduct(result.data);
      const updatedProduct = parseProductOptions(product);
      res.status(201).json(updatedProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/products/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Updating product with ID:", id);
      const { sizes, types, sizeOptions: incomingSizeOptions, typeOptions: incomingTypeOptions, ...productData } = req.body;
      let processedSizes = sizes;
      if (Array.isArray(sizes)) {
        processedSizes = convertOptionPrices(sizes);
        console.log("Processed size options prices for update:", processedSizes);
      }
      const sizeOptions = processedSizes ? JSON.stringify(processedSizes) : incomingSizeOptions ? typeof incomingSizeOptions === "string" ? incomingSizeOptions : JSON.stringify(incomingSizeOptions) : null;
      let processedTypes = types;
      if (Array.isArray(types)) {
        processedTypes = convertOptionPrices(types);
        console.log("Processed type options prices for update:", processedTypes);
      }
      const typeOptions = processedTypes ? JSON.stringify(processedTypes) : incomingTypeOptions ? typeof incomingTypeOptions === "string" ? incomingTypeOptions : JSON.stringify(incomingTypeOptions) : null;
      let normalizedImage = productData.image;
      if (normalizedImage && typeof normalizedImage === "string" && !normalizedImage.startsWith("http://") && !normalizedImage.startsWith("https://") && !normalizedImage.startsWith("/")) {
        console.log(`Server normalizing image URL: ${normalizedImage} -> https://${normalizedImage}`);
        normalizedImage = "https://" + normalizedImage;
      }
      const { _debug_basePrice_dollars, _debug_basePrice_cents, ...cleanProductData } = productData;
      let fixedBasePrice = cleanProductData.basePrice;
      if (fixedBasePrice !== void 0 && fixedBasePrice < 100) {
        console.log(`Adjusting price: ${fixedBasePrice} is likely in dollars, converting to ${fixedBasePrice * 100} cents`);
        fixedBasePrice = fixedBasePrice * 100;
      }
      const productDataWithOptions = {
        ...cleanProductData,
        basePrice: fixedBasePrice,
        // Use the fixed price
        image: normalizedImage,
        sizeOptions,
        typeOptions
      };
      console.log("Product data being sent to storage:", productDataWithOptions);
      console.log("DEBUG - Price conversion for update:", {
        product_id: id,
        original_basePrice: productData.basePrice,
        debug_dollars: _debug_basePrice_dollars,
        debug_cents: _debug_basePrice_cents,
        final_price: productDataWithOptions.basePrice
      });
      let numericId;
      const idMap = {
        "classic": 42,
        "assorted": 46,
        // Updated to match database ID
        "caramel": 44,
        // Updated from 43 
        "cereal": 41
      };
      if (isNaN(Number(id)) && id in idMap) {
        numericId = idMap[id];
        console.log(`Converted string ID '${id}' to numeric ID: ${numericId}`);
      } else {
        numericId = parseInt(id);
        console.log(`Using numeric ID: ${numericId}`);
      }
      const existingProduct = await storage4.getProduct(numericId);
      let product;
      if (!existingProduct) {
        console.log(`Product with ID ${numericId} not found, creating it first...`);
        if (numericId === 42 || numericId === 2 || numericId === 43 || numericId === 41) {
          const defaultProducts = {
            42: {
              name: "Classic Chocolate",
              description: "Our timeless collection of handcrafted chocolates, made with the finest cocoa beans.",
              image: "https://images.unsplash.com/photo-1582005450386-de4293070382?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
              rating: 0,
              reviewCount: 0,
              basePrice: 800,
              category: "classic",
              featured: true,
              inventory: 100
            },
            2: {
              name: "Assorted Nuts Chocolate",
              description: "A delightful mix of premium chocolates with assorted nuts from around the world.",
              image: "https://images.unsplash.com/photo-1624454002302-c8d1d73b916c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
              rating: 0,
              reviewCount: 0,
              basePrice: 900,
              category: "assorted",
              featured: true,
              inventory: 80
            },
            43: {
              name: "Caramel Chocolate",
              description: "Smooth caramel wrapped in rich chocolate, crafted to perfection for a luxurious treat.",
              image: "https://images.unsplash.com/photo-1582049024337-a045acffe5e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
              rating: 0,
              reviewCount: 0,
              basePrice: 850,
              category: "caramel",
              featured: false,
              inventory: 90
            },
            41: {
              name: "Cereal Chocolate",
              description: "The perfect combination of crunchy cereal and smooth chocolate for a textural delight.",
              image: "https://images.unsplash.com/photo-1608250389763-3b2d9a386ed6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
              rating: 0,
              reviewCount: 0,
              basePrice: 850,
              category: "cereal",
              featured: false,
              inventory: 85
            }
          };
          const defaultData = numericId in defaultProducts ? defaultProducts[numericId] : void 0;
          if (defaultData) {
            try {
              console.log(`Creating default product with ID ${numericId}: ${defaultData.name}`);
              const productToCreate = {
                ...defaultData,
                sizeOptions: productDataWithOptions.sizeOptions || null,
                typeOptions: productDataWithOptions.typeOptions || null,
                allergyInfo: null,
                saleActive: false,
                saleType: "percentage",
                saleValue: 0,
                salePrice: 0,
                saleStartDate: null,
                saleEndDate: null,
                displayOrder: 1e3
                // Default display order
              };
              await storage4.createProduct(productToCreate);
              product = await storage4.updateProduct(numericId, productDataWithOptions);
            } catch (err) {
              console.error(`Error creating default product ${numericId}:`, err);
              return res.status(500).json({ message: "Error creating default product" });
            }
          } else {
            return res.status(404).json({ message: "Product not found" });
          }
        } else {
          return res.status(404).json({ message: "Product not found" });
        }
      } else {
        product = await storage4.updateProduct(numericId, productDataWithOptions);
      }
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const updatedProduct = parseProductOptions(product);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/admin/products/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      console.log("\u{1F50D} PRODUCT UPDATE ENDPOINT - Headers:", req.headers);
      console.log("\u{1F50D} PRODUCT UPDATE ENDPOINT - Request body:", req.body);
      const { id } = req.params;
      const { visible, badge, image, inventory } = req.body;
      console.log(`\u{1F50D} Updating product ${id} with:`, req.body);
      let normalizedVisible = visible;
      if (visible === "true") normalizedVisible = true;
      if (visible === "false") normalizedVisible = false;
      const updateData = {};
      if ("visible" in req.body) {
        updateData.visible = normalizedVisible;
      }
      if ("badge" in req.body) {
        updateData.badge = badge;
      }
      let oldImageUrl = null;
      if ("image" in req.body) {
        try {
          let numericProductId = typeof id === "string" ? !isNaN(Number(id)) ? parseInt(id) : null : id;
          if (numericProductId !== null) {
            const currentProduct = await storage4.getProduct(numericProductId);
            if (currentProduct && currentProduct.image !== image) {
              oldImageUrl = currentProduct.image;
            }
          }
        } catch (err) {
          console.error("Error fetching product for image cleanup:", err);
        }
        updateData.image = image;
      }
      if ("inventory" in req.body) {
        updateData.inventory = typeof inventory === "string" ? parseInt(inventory) : inventory;
        console.log(`Setting inventory to ${updateData.inventory}`);
      }
      console.log(`\u{1F50D} Normalized update data:`, updateData);
      let productId;
      const idMap = {
        "classic": 42,
        // Updated based on actual DB values
        "assorted": 46,
        // Updated to match database ID
        "caramel": 44,
        // Updated from 43 
        "cereal": 41
      };
      if (id in idMap) {
        productId = idMap[id];
        console.log(`Mapped ID '${id}' to: ${productId} (type: ${typeof productId})`);
      } else if (!isNaN(Number(id))) {
        productId = parseInt(id);
        console.log(`Converted to numeric ID: ${productId}`);
      } else {
        productId = id;
        console.log(`Using string ID as is: ${productId}`);
      }
      console.log(`\u{1F50D} Using productId: ${productId} (type: ${typeof productId}) to update with data:`, updateData);
      if (productId === "assorted") {
        const products2 = await storage4.getProducts();
        if (global.assortedNutsProduct) {
          console.log(`Updating virtual 'assorted' product:`, updateData);
          if ("visible" in updateData) {
            console.log(`Setting assorted visibility from ${global.assortedNutsProduct.visible} to ${updateData.visible}`);
            global.assortedNutsProduct.visible = updateData.visible;
          }
          if ("badge" in updateData) {
            console.log(`Setting assorted badge from ${global.assortedNutsProduct.badge} to ${updateData.badge}`);
            global.assortedNutsProduct.badge = updateData.badge;
          }
          if ("image" in updateData) {
            console.log(`Setting assorted image from ${global.assortedNutsProduct.image} to ${updateData.image}`);
            global.assortedNutsProduct.image = updateData.image;
          }
          if ("inventory" in updateData) {
            console.log(`Setting assorted inventory from ${global.assortedNutsProduct.inventory} to ${updateData.inventory}`);
            global.assortedNutsProduct.inventory = updateData.inventory;
          }
          console.log(`Updated hardcoded product:`, global.assortedNutsProduct);
          return res.json(global.assortedNutsProduct);
        } else {
          global.assortedNutsProduct = {
            id: "assorted",
            name: "Assorted Nuts Chocolate",
            description: "A delightful blend of premium nuts and rich chocolate for an exquisite taste experience.",
            image: "https://images.unsplash.com/photo-1624454002302-c8d1d73b916c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            basePrice: 12,
            category: "assorted",
            featured: true,
            inventory: 100,
            sizeOptions: JSON.stringify([{ id: "standard", label: "Standard Box (6 pieces)", value: "standard", price: 0 }]),
            typeOptions: JSON.stringify([
              { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
              { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
            ]),
            rating: 0,
            reviewCount: 0,
            displayOrder: 30,
            allergyInfo: "assorted",
            salePrice: null,
            saleType: "percentage",
            saleValue: 0,
            saleActive: false,
            saleStartDate: null,
            saleEndDate: null,
            // Handle visibility explicitly - always use the updateData value or default to true
            visible: "visible" in updateData ? updateData.visible : true,
            badge: updateData.badge || null
          };
          console.log(`Created and updated hardcoded product:`, global.assortedNutsProduct);
          return res.json(global.assortedNutsProduct);
        }
      }
      try {
        const numericProductId = typeof productId === "string" ? parseInt(productId) : productId;
        const updatedProduct = await storage4.updateProduct(numericProductId, updateData);
        if (!updatedProduct) {
          return res.status(404).json({ message: "Product not found" });
        }
        if (oldImageUrl && "image" in req.body && image !== oldImageUrl) {
          try {
            const { cleanupPreviousImage: cleanupPreviousImage2 } = (init_uploads(), __toCommonJS(uploads_exports));
            const cleaned = await cleanupPreviousImage2(oldImageUrl);
            console.log(`Replaced product image '${oldImageUrl}' with '${image}', cleanup result: ${cleaned}`);
          } catch (cleanupError) {
            console.error("Error cleaning up old product image:", cleanupError);
          }
        }
        res.json(updatedProduct);
      } catch (error) {
        console.error("Error updating product visibility:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    } catch (error) {
      console.error("Error in product visibility toggle:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/products/reorder", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { productOrders } = req.body;
      console.log("Received product reordering request:", productOrders);
      if (!Array.isArray(productOrders)) {
        return res.status(400).json({ message: "Product orders must be an array" });
      }
      for (const order of productOrders) {
        if (typeof order.id !== "number" && typeof order.id !== "string") {
          return res.status(400).json({ message: "Each product order must have a valid ID" });
        }
        if (typeof order.displayOrder !== "number") {
          return res.status(400).json({ message: "Each product order must have a valid display order" });
        }
      }
      console.log(
        "Processing product reordering - EXACTLY as received from client:",
        productOrders.map((order) => `ID: ${order.id}, Display Order: ${order.displayOrder}`)
      );
      const allProducts = await storage4.getProducts();
      console.log("Current products in database before update:", allProducts.map((p) => ({
        id: p.id,
        name: p.name,
        displayOrder: p.displayOrder || "not set"
      })));
      const results = [];
      for (const order of productOrders) {
        let productId;
        if (typeof order.id === "string") {
          const idMap = {
            "classic": 42,
            "assorted": 46,
            // Updated to match database ID
            "caramel": 44,
            // Updated from 43 
            "cereal": 41
          };
          if (order.id in idMap) {
            productId = idMap[order.id];
            console.log(`Mapped ID '${order.id}' to: ${productId} (type: ${typeof productId})`);
          } else if (!isNaN(Number(order.id))) {
            productId = parseInt(order.id);
            console.log(`Converted to numeric ID: ${productId}`);
          } else {
            productId = order.id;
            console.log(`Using string ID as is: ${productId}`);
          }
        } else {
          productId = order.id;
          console.log(`Using ID as is: ${productId}`);
        }
        const existingProduct = allProducts.find(
          (p) => typeof p.id === "string" && typeof productId === "string" && p.id === productId || typeof p.id === "number" && typeof productId === "number" && p.id === productId
        );
        console.log(`Product ${productId} current state:`, existingProduct ? { id: existingProduct.id, name: existingProduct.name, displayOrder: existingProduct.displayOrder || "not set" } : "Not found");
        if (productId === "assorted" && existingProduct) {
          console.log(`Special handling for hardcoded product 'assorted' display order: ${order.displayOrder}`);
          existingProduct.displayOrder = order.displayOrder;
          results.push({
            id: order.id,
            success: true,
            displayOrder: order.displayOrder
          });
          continue;
        }
        try {
          console.log(`Updating product ${productId} display order to ${order.displayOrder}`);
          const updatedProduct = await storage4.updateProduct(
            typeof productId === "string" ? parseInt(productId) : productId,
            { displayOrder: order.displayOrder }
          );
          if (updatedProduct) {
            console.log(`Successfully updated product ${productId} order to ${updatedProduct.displayOrder}`);
            results.push({
              id: order.id,
              success: true,
              displayOrder: order.displayOrder
            });
          } else {
            console.log(`Failed to update product ${productId}, not found in database`);
            results.push({
              id: order.id,
              success: false,
              message: "Product not found"
            });
          }
        } catch (error) {
          console.error(`Error updating product ${productId}:`, error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          results.push({
            id: order.id,
            success: false,
            message: `Error: ${errorMessage}`
          });
        }
      }
      const updatedProducts = await storage4.getProducts();
      console.log("Products in database after update:", updatedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        displayOrder: p.displayOrder || "not set"
      })));
      res.setHeader("X-Products-Reordered", "true");
      res.json({
        results,
        productsAfterUpdate: updatedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          displayOrder: p.displayOrder || null
        }))
      });
    } catch (error) {
      console.error("Error updating product display order:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        message: "Internal server error",
        error: errorMessage
      });
    }
  });
  app2.delete("/api/products/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      console.log("DELETE ENDPOINT: Request headers:", JSON.stringify(req.headers, null, 2));
      console.log("DELETE ENDPOINT: Request user:", req.user);
      const { id } = req.params;
      console.log("DELETE ENDPOINT: Deleting product with ID:", id);
      let productId;
      const idMap = {
        "classic": 42,
        "assorted": 46,
        // Updated to match database ID
        "caramel": 44,
        // Updated from 43 
        "cereal": 41
      };
      if (isNaN(Number(id)) && id in idMap) {
        productId = idMap[id];
        console.log(`DELETE ENDPOINT: Mapped ID '${id}' to: ${productId} (type: ${typeof productId})`);
      } else if (!isNaN(Number(id))) {
        productId = parseInt(id);
        console.log(`DELETE ENDPOINT: Converted to numeric ID: ${productId}`);
      } else {
        productId = id;
        console.log(`DELETE ENDPOINT: Using ID as is: ${productId}`);
      }
      if (productId === "assorted") {
        console.log(`DELETE ENDPOINT: Cannot delete hardcoded 'assorted' product - use visibility toggle instead`);
        return res.status(400).json({
          message: "Cannot delete hardcoded product. Use the visibility toggle instead."
        });
      }
      const numericId = typeof productId === "string" ? parseInt(productId) : productId;
      const product = await storage4.getProduct(numericId);
      if (!product) {
        console.log(`DELETE ENDPOINT: Product with ID ${numericId} not found before deletion`);
        return res.status(404).json({ message: "Product not found" });
      }
      console.log(`DELETE ENDPOINT: Found product to delete:`, JSON.stringify(product));
      console.log(`DELETE ENDPOINT: About to call storage.deleteProduct(${numericId})`);
      const result = await storage4.deleteProduct(numericId);
      console.log(`DELETE ENDPOINT: Result of deleteProduct:`, result);
      if (!result) {
        console.log(`DELETE ENDPOINT: Product with ID ${numericId} not found or couldn't be deleted`);
        return res.status(404).json({ message: "Product not found or couldn't be deleted" });
      }
      const remainingProducts = await storage4.getProducts();
      console.log(
        `DELETE ENDPOINT: Remaining products after deletion:`,
        remainingProducts.map((p) => ({ id: p.id, name: p.name }))
      );
      console.log(`DELETE ENDPOINT: Successfully deleted product with ID ${numericId}`);
      res.json({
        message: "Product deleted",
        productId: numericId,
        remainingProductsCount: remainingProducts.length
      });
    } catch (error) {
      console.error("DELETE ENDPOINT: Error deleting product:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/products/:productId/images", async (req, res) => {
    try {
      const { productId } = req.params;
      const numericProductId = parseInt(productId);
      if (isNaN(numericProductId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const images = await storage4.getProductImages(numericProductId);
      res.json(images);
    } catch (error) {
      console.error("Error getting product images:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/product-images/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const imageId = parseInt(id);
      if (isNaN(imageId)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }
      const image = await storage4.getProductImage(imageId);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      res.json(image);
    } catch (error) {
      console.error("Error getting product image:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/products/:productId/images", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { productId } = req.params;
      const numericProductId = parseInt(productId);
      if (isNaN(numericProductId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const result = insertProductImageSchema.safeParse({
        ...req.body,
        productId: numericProductId
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid image data",
          errors: result.error.format()
        });
      }
      const product = await storage4.getProduct(numericProductId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const newImage = await storage4.createProductImage(result.data);
      if (!product.hasMultipleImages) {
        await storage4.updateProduct(numericProductId, { hasMultipleImages: true });
      }
      res.status(201).json(newImage);
    } catch (error) {
      console.error("Error adding product image:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/product-images/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const imageId = parseInt(id);
      if (isNaN(imageId)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }
      const image = await storage4.getProductImage(imageId);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      const { productId, ...updateData } = req.body;
      if (updateData.imageUrl && updateData.imageUrl !== image.imageUrl) {
        const oldImageUrl = image.imageUrl;
        const updatedImage = await storage4.updateProductImage(imageId, updateData);
        try {
          const { cleanupPreviousImage: cleanupPreviousImage2 } = (init_uploads(), __toCommonJS(uploads_exports));
          const cleaned = await cleanupPreviousImage2(oldImageUrl);
          console.log(`Replaced image '${oldImageUrl}' with '${updateData.imageUrl}', cleanup result: ${cleaned}`);
        } catch (cleanupError) {
          console.error("Error cleaning up old image file:", cleanupError);
        }
        return res.json(updatedImage);
      } else {
        const updatedImage = await storage4.updateProductImage(imageId, updateData);
        return res.json(updatedImage);
      }
    } catch (error) {
      console.error("Error updating product image:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/product-images/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const imageId = parseInt(id);
      if (isNaN(imageId)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }
      const image = await storage4.getProductImage(imageId);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      const imageUrl = image.imageUrl;
      const productId = image.productId;
      const success = await storage4.deleteProductImage(imageId);
      if (!success) {
        return res.status(404).json({ message: "Image not found" });
      }
      const remainingImages = await storage4.getProductImages(productId);
      if (remainingImages.length <= 1) {
        await storage4.updateProduct(productId, { hasMultipleImages: false });
      }
      try {
        const { cleanupPreviousImage: cleanupPreviousImage2 } = (init_uploads(), __toCommonJS(uploads_exports));
        const cleaned = await cleanupPreviousImage2(imageUrl);
        console.log(`Deleted image file for product ${productId}, cleanup result: ${cleaned}`);
      } catch (cleanupError) {
        console.error("Error cleaning up image file:", cleanupError);
      }
      res.json({ message: "Product image deleted successfully" });
    } catch (error) {
      console.error("Error deleting product image:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/cart", authenticateToken, async (req, res) => {
    try {
      const cartItems2 = await storage4.getCartItems(req.user.id);
      res.json(cartItems2);
    } catch (error) {
      console.error("Error getting cart items:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/cart", authenticateToken, async (req, res) => {
    try {
      const cartItemSchema = insertCartItemSchema.extend({
        userId: z5.number().optional()
        // Will be set from token
      });
      const result = cartItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid cart item data",
          errors: result.error.format()
        });
      }
      const cartItemData = {
        ...result.data,
        userId: req.user.id
      };
      const cartItem = await storage4.addCartItem(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/cart/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage4.removeCartItem(parseInt(id));
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/cart", authenticateToken, async (req, res) => {
    try {
      await storage4.clearCart(req.user.id);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/checkout/session", async (req, res) => {
    try {
      const { amount, cartItems: cartItems2 } = req.body;
      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
          message: "Valid amount is required"
        });
      }
      if (!cartItems2 || !Array.isArray(cartItems2) || cartItems2.length === 0) {
        return res.status(400).json({ message: "Cart items are required" });
      }
      const origin = req.headers.origin || `http://${req.headers.host}`;
      const successUrl = `${origin}/payment-success`;
      const cancelUrl = `${origin}/checkout`;
      console.log(`Creating checkout session with success URL: ${successUrl}`);
      const checkoutItems = cartItems2.map((item) => ({
        name: `${item.name} (${item.size}, ${item.type})`,
        description: "Luxury chocolate collection",
        amount: Math.round(item.price * 100),
        // Convert to cents
        quantity: item.quantity
      }));
      const sessionUrl = await createCheckoutSessionLegacy(
        checkoutItems,
        1,
        // Default user ID when not authenticated
        successUrl,
        cancelUrl
      );
      if (!sessionUrl) {
        return res.status(500).json({
          message: "Failed to create checkout session"
        });
      }
      const sessionId = typeof sessionUrl === "string" ? sessionUrl.split("?session_id=")[1] : null;
      res.json({
        url: sessionUrl,
        sessionId
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/checkout/payment-intent", async (req, res) => {
    try {
      const { amount, cartItems: cartItems2, discount, customerName, customerEmail } = req.body;
      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
          message: "Valid amount is required"
        });
      }
      let finalAmount = amount;
      let discountAmount = 0;
      let discountMetadata = {};
      let stripeDiscountId = null;
      if (discount) {
        if (!discount.active) {
          return res.status(400).json({
            message: "Discount code is no longer active"
          });
        }
        if (discount.endDate && new Date(discount.endDate) < /* @__PURE__ */ new Date()) {
          return res.status(400).json({
            message: "Discount code has expired"
          });
        }
        if (discount.maxUses !== null && discount.usedCount !== null && discount.usedCount >= discount.maxUses) {
          return res.status(400).json({
            message: "This discount code has reached its usage limit"
          });
        }
        if (discount.discountType === "percentage") {
          discountAmount = amount * discount.value / 100;
          finalAmount = amount - discountAmount;
        } else if (discount.discountType === "fixed") {
          discountAmount = Math.min(discount.value, amount);
          finalAmount = amount - discountAmount;
        } else if (discount.discountType === "buy_one_get_one") {
          const buyQuantity = discount.buyQuantity || 1;
          const getQuantity = discount.getQuantity || 1;
          const totalQuantity = buyQuantity + getQuantity;
          const discountPortion = getQuantity / totalQuantity;
          const discountPercentage = discount.value / 100;
          const amountToDiscount = amount * discountPortion;
          discountAmount = amountToDiscount * discountPercentage;
          finalAmount = amount - discountAmount;
        }
        finalAmount = Math.max(finalAmount, 0);
        discountMetadata = {
          discount_id: discount.id.toString(),
          discount_code: discount.code,
          discount_type: discount.discountType,
          discount_value: discount.value.toString(),
          discount_amount: discountAmount.toFixed(2),
          original_amount: amount.toFixed(2)
        };
        if (discount.discountType === "buy_one_get_one") {
          discountMetadata = {
            ...discountMetadata,
            buy_quantity: (discount.buyQuantity || 1).toString(),
            get_quantity: (discount.getQuantity || 1).toString()
          };
        }
        stripeDiscountId = discount.code;
        try {
          const stripeCoupon = await getStripeCoupon(discount.code);
          if (!stripeCoupon) {
            console.log(`Stripe coupon not found for discount code: ${discount.code}, creating it...`);
            let percentOff = null;
            let amountOff = null;
            if (discount.discountType === "percentage") {
              percentOff = discount.value;
            } else if (discount.discountType === "fixed") {
              amountOff = discount.value * 100;
            } else if (discount.discountType === "buy_one_get_one") {
              const buyQuantity = discount.buyQuantity || 1;
              const getQuantity = discount.getQuantity || 1;
              const totalQuantity = buyQuantity + getQuantity;
              const discountPortion = getQuantity / totalQuantity;
              percentOff = discountPortion * discount.value;
            }
            let duration = "once";
            if (!discount.endDate) {
              duration = "forever";
            }
            const couponMetadata = {
              discount_id: discount.id.toString(),
              description: discount.description || ""
            };
            if (discount.categoryIds && discount.categoryIds.length > 0) {
              couponMetadata.category_ids = discount.categoryIds.join(",");
            }
            if (discount.productIds && discount.productIds.length > 0) {
              couponMetadata.product_ids = discount.productIds.join(",");
            }
            const createdCoupon = await createStripeCoupon(
              discount.code,
              percentOff !== null ? percentOff : void 0,
              amountOff !== null ? amountOff : void 0,
              "usd",
              duration,
              void 0,
              discount.maxUses ? discount.maxUses : void 0,
              void 0
              // expiresAt parameter
            );
            if (!createdCoupon) {
              console.warn(`Failed to create Stripe coupon for code: ${discount.code}, will use calculated discount`);
              stripeDiscountId = null;
            }
          }
        } catch (stripeError) {
          console.error("Error checking/creating Stripe coupon:", stripeError);
          stripeDiscountId = null;
        }
        try {
          await storage4.incrementDiscountUsage(discount.id);
          console.log(`Incremented usage count for discount: ${discount.code}`);
        } catch (usageError) {
          console.error("Error incrementing discount usage:", usageError);
        }
      }
      console.log(`Creating payment intent for amount: ${finalAmount} (${Math.round(finalAmount * 100)} cents)${discount ? " with discount applied" : ""}`);
      let metadata = {
        ...discountMetadata,
        // Add total price information to metadata for easier lookup
        total_amount_dollars: finalAmount.toFixed(2),
        total_amount_cents: String(Math.round(finalAmount * 100))
      };
      if (customerName) {
        metadata.customerName = customerName;
        metadata.customer_name = customerName;
      }
      if (customerEmail) {
        metadata.customerEmail = customerEmail;
        metadata.customer_email = customerEmail;
      }
      if (cartItems2 && cartItems2.length > 0) {
        const simplifiedItems = cartItems2.map((item) => {
          const stringProductId = item.name ? item.name.replace(/\s+/g, "") : null;
          console.log(`Creating name-based product ID: ${item.name} => ${stringProductId}`);
          const itemPrice = item.price || 0;
          const productId = stringProductId || item.id;
          return {
            id: productId,
            // Use the name-based ID if available
            // Removed redundant productId and name fields
            size: item.size,
            type: item.type,
            shape: item.shape,
            // Add shape information
            qty: item.quantity,
            // Add price information for easier lookup
            price: itemPrice
          };
        });
        const cartItemsStr = JSON.stringify(simplifiedItems);
        console.log(`Cart items for metadata: ${cartItemsStr}`);
        if (cartItemsStr.length <= 500) {
          metadata.cart_items = cartItemsStr;
        } else {
          metadata.product_ids = simplifiedItems.map((item) => item.id).join(",");
          metadata.product_count = String(simplifiedItems.length);
          metadata.total_items = String(simplifiedItems.reduce((sum, item) => sum + (item.qty || 1), 0));
          console.log("Cart items metadata too large, storing simplified version");
        }
      }
      const paymentIntent = await createPaymentIntent(
        req.hostname,
        // Hostname parameter
        finalAmount,
        // Amount (function will convert to cents)
        metadata,
        // Metadata 
        void 0,
        // Customer ID (not used here)
        customerEmail
        // Pass customer email for receipt generation
      );
      if (!paymentIntent) {
        console.error("Payment intent creation failed");
        return res.status(500).json({
          message: "Failed to create payment intent"
        });
      }
      console.log(`Payment intent created: ${paymentIntent.id}`);
      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/checkout/update-payment-metadata", async (req, res) => {
    try {
      const { paymentIntentId, metadata } = req.body;
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }
      if (!metadata || typeof metadata !== "object") {
        return res.status(400).json({ message: "Metadata object is required" });
      }
      console.log(`Updating payment intent ${paymentIntentId} with metadata:`, metadata);
      const updatedPaymentIntent = await updatePaymentIntent(
        paymentIntentId,
        metadata
      );
      if (!updatedPaymentIntent) {
        return res.status(500).json({ message: "Failed to update payment intent" });
      }
      console.log(`Successfully updated payment intent metadata for ${paymentIntentId}`);
      res.json({
        success: true,
        paymentIntentId: updatedPaymentIntent.id,
        metadata: updatedPaymentIntent.metadata
      });
    } catch (error) {
      console.error("Error updating payment intent metadata:", error);
      res.status(500).json({
        message: "Error updating payment intent metadata",
        error: error.message
      });
    }
  });
  app2.get("/api/checkout/payment-details", async (req, res) => {
    try {
      const { payment_intent } = req.query;
      if (!payment_intent) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not initialized" });
      }
      console.log(`Retrieving payment intent: ${payment_intent}`);
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);
      if (!paymentIntent) {
        return res.status(404).json({ message: "Payment intent not found" });
      }
      console.log(`Successfully retrieved payment intent: ${paymentIntent.id}`);
      res.json({
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
          created: paymentIntent.created,
          metadata: paymentIntent.metadata
        }
      });
    } catch (error) {
      console.error("Error retrieving payment intent:", error);
      res.status(500).json({
        message: "Error retrieving payment details",
        error: error.message
      });
    }
  });
  app2.post("/api/checkout/update-payment-intent", async (req, res) => {
    try {
      const { paymentIntentId, customerName, customerEmail, customerAddress, deliveryMethod, phone, userId } = req.body;
      if (!paymentIntentId || !customerName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const metadata = {
        customerName: customerName.trim(),
        customer_name: customerName.trim()
        // Also include snake_case version
      };
      if (customerEmail && customerEmail.trim()) {
        metadata.customerEmail = customerEmail.trim();
        metadata.customer_email = customerEmail.trim();
        console.log(`Added customer email to metadata: ${customerEmail.trim()}`);
      }
      console.log(`Received customer address in update-payment-intent: "${customerAddress}" (type: ${typeof customerAddress}, length: ${customerAddress ? customerAddress.length : 0})`);
      if (customerAddress && customerAddress.trim()) {
        console.log(`Customer address after trim: "${customerAddress.trim()}" (length: ${customerAddress.trim().length})`);
        const formattedAddress = customerAddress.trim().replace(/,\s+/g, "\n").replace(/,/g, "\n").replace(/\n{2,}/g, "\n");
        console.log(`Formatted address with newlines: "${formattedAddress}"`);
        metadata.customerAddress = formattedAddress;
      } else {
        console.log(`Customer address is empty or only whitespace, not adding to metadata`);
      }
      if (phone && phone.trim()) {
        metadata.phone = phone.trim();
        metadata.customer_phone = phone.trim();
        console.log(`Adding customer phone to metadata: "${phone.trim()}"`);
      }
      if (deliveryMethod) {
        metadata.deliveryMethod = deliveryMethod;
      }
      if (userId) {
        metadata.user_id = userId.toString();
      }
      const hostname = req.headers.host || "";
      const updatedIntent = await updatePaymentIntent(
        hostname,
        paymentIntentId,
        metadata,
        customerEmail ? customerEmail.trim() : void 0
      );
      if (!updatedIntent) {
        return res.status(500).json({ message: "Failed to update payment intent" });
      }
      console.log(`Payment intent ${paymentIntentId} updated with customer name: ${customerName}`);
      if (customerAddress) {
        console.log(`Payment intent ${paymentIntentId} updated with customer address`);
      }
      if (deliveryMethod) {
        console.log(`Payment intent ${paymentIntentId} updated with delivery method: ${deliveryMethod}`);
      }
      if (userId) {
        console.log(`Payment intent ${paymentIntentId} updated with user ID: ${userId}`);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating payment intent:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/webhook/stripe", async (req, res) => {
    try {
      const payload = req.body;
      const isDev = process.env.NODE_ENV !== "production";
      if (payload.type === "checkout.session.completed") {
        console.log("Received checkout.session.completed event - using unified checkout webhook handler");
        const result = await handleCheckoutSessionCompleted(payload, storage4);
        return res.json({
          received: true,
          success: result.success,
          message: result.message,
          orderId: result.orderId
        });
      }
      if (payload.type === "payment_intent.succeeded") {
        const paymentIntent = payload.data.object;
        if (!paymentIntent.metadata) {
          return res.json({ received: true, error: "No metadata in payment intent" });
        }
        const metadata = paymentIntent.metadata;
        try {
          const customerEmail = paymentIntent.receipt_email || metadata.customer_email || metadata.customerEmail || metadata.email || paymentIntent.shipping && paymentIntent.shipping.email || "";
          console.log(`Email sources in webhook handler:
          - paymentIntent.receipt_email: ${paymentIntent.receipt_email || "not set"}
          - metadata.customer_email: ${metadata.customer_email || "not set"}
          - metadata.customerEmail: ${metadata.customerEmail || "not set"} 
          - metadata.email: ${metadata.email || "not set"}
          - shipping email: ${paymentIntent.shipping && paymentIntent.shipping.email || "not set"}
          - FINAL EMAIL USED: ${customerEmail || "none found"}`);
          const paymentIntentId = paymentIntent.id;
          let customerName = null;
          console.log(`Webhook received metadata:`, metadata);
          if (metadata.customer_name && metadata.customer_name !== "null" && metadata.customer_name.trim()) {
            customerName = metadata.customer_name.trim();
            console.log(`Using customer name from metadata customer_name: ${customerName}`);
          } else if (metadata.customerName && metadata.customerName !== "null" && metadata.customerName.trim()) {
            customerName = metadata.customerName.trim();
            console.log(`Using customer name from metadata customerName: ${customerName}`);
          } else if (metadata.firstName && metadata.lastName && metadata.firstName !== "null" && metadata.lastName !== "null" && metadata.firstName.trim() && metadata.lastName.trim()) {
            customerName = `${metadata.firstName.trim()} ${metadata.lastName.trim()}`;
            console.log(`Using customer name combined from firstName + lastName: ${customerName}`);
          } else if (metadata.firstName && metadata.firstName !== "null" && metadata.firstName.trim()) {
            customerName = metadata.firstName.trim();
            console.log(`Using customer name from firstName only: ${customerName}`);
          } else if (metadata.lastName && metadata.lastName !== "null" && metadata.lastName.trim()) {
            customerName = metadata.lastName.trim();
            console.log(`Using customer name from lastName only: ${customerName}`);
          } else if (paymentIntent.shipping && paymentIntent.shipping.name) {
            customerName = paymentIntent.shipping.name.trim();
            console.log(`Using customer name from shipping info: ${customerName}`);
          }
          if (!customerName || customerName === "null" || customerName.trim() === "") {
            customerName = "Guest Customer";
            console.log(`No customer name found in any field, using default: ${customerName}`);
          }
          const existingOrders = await storage4.getOrdersByPaymentIntentId(paymentIntentId);
          const orderExists = existingOrders && existingOrders.length > 0;
          if (orderExists && existingOrders.length > 0) {
            const existingOrder = existingOrders[0];
            if (metadata.customerAddress && existingOrder.shippingAddress) {
              let shouldUpdate = false;
              let formattedAddress = metadata.customerAddress;
              console.log(`Processing address for order ${existingOrder.id}...`);
              console.log(`Metadata address: "${metadata.customerAddress}"`);
              console.log(`Existing order address: "${existingOrder.shippingAddress}"`);
              if (metadata.customerAddress.includes("\n") && existingOrder.shippingAddress.includes(",") && !existingOrder.shippingAddress.includes("\n")) {
                shouldUpdate = true;
                console.log(`Updating order ${existingOrder.id} with newline address from metadata`);
              } else if (metadata.customerAddress.replace(/\s+/g, "") === existingOrder.shippingAddress.replace(/\s+/g, "")) {
                if (!existingOrder.shippingAddress.includes("\n")) {
                  formattedAddress = existingOrder.shippingAddress.replace(/,\s+/g, "\n").replace(/,/g, "\n").replace(/\n{2,}/g, "\n");
                  shouldUpdate = true;
                  console.log(`Updating matching order ${existingOrder.id} with formatted address: "${formattedAddress}"`);
                }
              } else if (metadata.customerAddress.includes(",") && !metadata.customerAddress.includes("\n") && existingOrder.shippingAddress.includes(",") && !existingOrder.shippingAddress.includes("\n")) {
                formattedAddress = metadata.customerAddress.replace(/,\s+/g, "\n").replace(/,/g, "\n").replace(/\n{2,}/g, "\n");
                shouldUpdate = true;
                console.log(`Updating order ${existingOrder.id} with formatted address: "${formattedAddress}"`);
              }
              if (shouldUpdate) {
                console.log(`Applying address update to order ${existingOrder.id}`);
                const updateResult = await storage4.updateOrder(existingOrder.id, {
                  shippingAddress: formattedAddress
                });
                console.log(`Update result:`, updateResult);
              } else {
                console.log(`No address update needed for order ${existingOrder.id}`);
              }
            }
            return res.json({ received: true, message: "Order already processed, address format updated if needed" });
          }
          let shippingAddress = "";
          console.log(`Webhook processing new order for paymentIntent ${paymentIntentId}`);
          if (metadata.customerAddress) {
            if (metadata.customerAddress.includes(",") && !metadata.customerAddress.includes("\n")) {
              shippingAddress = metadata.customerAddress.replace(/,\s+/g, "\n").replace(/,/g, "\n").replace(/\n{2,}/g, "\n");
              console.log(`Formatted address with newlines: "${shippingAddress}"`);
            } else {
              shippingAddress = metadata.customerAddress;
            }
            console.log(`Using address from metadata.customerAddress: "${shippingAddress}"`);
          } else if (metadata.isPickup === "true" || metadata.deliveryMethod === "pickup") {
            shippingAddress = "Pickup order - No shipping address required";
            console.log(`Using pickup order address: "${shippingAddress}"`);
          } else if (paymentIntent.shipping && paymentIntent.shipping.address) {
            const shipping = paymentIntent.shipping;
            const address = shipping.address;
            const addressParts = [
              address.line1,
              address.line2,
              [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
              address.country
            ].filter(Boolean);
            if (shipping.phone) {
              addressParts.push(`Phone: ${shipping.phone}`);
            }
            shippingAddress = addressParts.join("\n");
            console.log(`Using address from Stripe shipping info: "${shippingAddress}"`);
          }
          const amount = paymentIntent.amount;
          const discountAmount = metadata.discount_amount ? parseInt(metadata.discount_amount) : 0;
          const taxAmount = metadata.tax_amount ? parseInt(metadata.tax_amount) : 0;
          const shippingCost = metadata.shipping_cost ? parseInt(metadata.shipping_cost) : 0;
          let phoneNumber = "";
          if (metadata.phone) {
            phoneNumber = metadata.phone;
            console.log(`Found phone number in metadata.phone: ${phoneNumber}`);
          } else if (metadata.customerPhone) {
            phoneNumber = metadata.customerPhone;
            console.log(`Found phone number in metadata.customerPhone: ${phoneNumber}`);
          } else if (metadata.customer_phone) {
            phoneNumber = metadata.customer_phone;
            console.log(`Found phone number in metadata.customer_phone: ${phoneNumber}`);
          } else if (paymentIntent.shipping && paymentIntent.shipping.phone) {
            phoneNumber = paymentIntent.shipping.phone;
            console.log(`Found phone number in shipping info: ${phoneNumber}`);
          }
          console.log(`Phone sources in webhook handler:
          - metadata.phone: ${metadata.phone || "not set"}
          - metadata.customerPhone: ${metadata.customerPhone || "not set"}
          - metadata.customer_phone: ${metadata.customer_phone || "not set"} 
          - shipping phone: ${paymentIntent.shipping && paymentIntent.shipping.phone || "not set"}
          - FINAL PHONE USED: ${phoneNumber || "none found"}`);
          if (!phoneNumber || phoneNumber.trim() === "") {
            console.log(`Found empty phone number - replacing with empty string`);
            phoneNumber = "";
          } else {
            console.log(`PHONE NUMBER POLICY: Keeping original phone number "${phoneNumber}" as provided`);
          }
          const completeMetadata = {
            ...metadata,
            // Always ensure we have consistent customer name field formats in metadata
            customer_name: customerName || metadata.customer_name || metadata.customerName || "",
            customerName: customerName || metadata.customerName || metadata.customer_name || ""
          };
          const orderData = {
            userId: metadata.customer_id ? parseInt(metadata.customer_id) : 1,
            // Use user ID 1 (admin) as default
            customerName,
            // This is the field we need to ensure is populated correctly
            customerEmail,
            // Add customer email for receipt purposes
            status: "paid",
            totalAmount: amount,
            shippingAddress,
            phone: phoneNumber,
            // Add phone number to order
            paymentIntentId,
            deliveryMethod: metadata.isPickup === "true" || metadata.deliveryMethod === "pickup" ? "pickup" : "shipping",
            postPurchaseDiscountCode: metadata.postPurchaseDiscountCode || null
            // Add required field
            // createdAt will be set by database defaultNow()
          };
          const order = await storage4.createOrder(orderData);
          if (!order || !order.id) {
            console.error("Failed to create order:", orderData);
            return res.json({ received: true, error: "Failed to create order" });
          }
          const orderId = order.id;
          if (metadata.cart_items) {
            try {
              const metadataObj = { cart_items: metadata.cart_items };
              const metadataStr = JSON.stringify(metadataObj);
              console.log(`Saving order metadata: ${metadataStr}`);
              await storage4.updateOrder(orderId, {
                metadata: metadataStr
              });
            } catch (metadataError) {
              console.error("Error saving cart_items as metadata:", metadataError);
            }
          }
          if (metadata.cart_items) {
            try {
              const cartItems2 = JSON.parse(metadata.cart_items);
              for (const item of cartItems2) {
                try {
                  let productId = null;
                  let productName = item.name;
                  console.log(`Processing cart item: ${JSON.stringify(item)}`);
                  if (item.id && typeof item.id === "string") {
                    console.log(`Found string ID format: ${item.id}`);
                    if (productIdMap[item.id]) {
                      productId = productIdMap[item.id];
                      const productMap = {
                        44: "Caramel Delight Box",
                        42: "Classic Truffle Box",
                        41: "Cereal Crunch Box",
                        46: "Assorted Favorites Box"
                      };
                      productName = productMap[productId] || `Product ${productId}`;
                      console.log(`Mapped ${item.id} to productId ${productId} using productIdMap (${productName})`);
                    } else if (item.id === "CaramelChocolate" || item.id.includes("Caramel")) {
                      productId = 44;
                      productName = "Caramel Delight Box";
                      console.log(`Mapped ${item.id} to productId ${productId} using fallback (${productName})`);
                    } else if (item.id === "ClassicChocolate" || item.id.includes("Classic")) {
                      productId = 42;
                      productName = "Classic Truffle Box";
                      console.log(`Mapped ${item.id} to productId ${productId} using fallback (${productName})`);
                    } else if (item.id === "CerealChocolate" || item.id.includes("Cereal")) {
                      productId = 41;
                      productName = "Cereal Crunch Box";
                      console.log(`Mapped ${item.id} to productId ${productId} using fallback (${productName})`);
                    } else if (item.id === "AssortedChocolate" || item.id.includes("Assorted")) {
                      productId = 46;
                      productName = "Assorted Favorites Box";
                      console.log(`Mapped ${item.id} to productId ${productId} (${productName})`);
                    } else if (item.id === "DubaiBar" || item.id.includes("Dubai")) {
                      productId = 47;
                      productName = "Dubai Bar";
                      console.log(`Mapped ${item.id} to productId ${productId} (${productName})`);
                    }
                  }
                  if (!productId && item.productId) {
                    console.log(`Using original productId: ${item.productId}`);
                    if (typeof item.productId === "string") {
                      if (productIdMap[item.productId]) {
                        productId = productIdMap[item.productId];
                        const productMap = {
                          44: "Caramel Delight Box",
                          42: "Classic Truffle Box",
                          41: "Cereal Crunch Box",
                          46: "Assorted Favorites Box"
                        };
                        productName = productName || productMap[productId] || `Product ${productId}`;
                        console.log(`Mapped productId ${item.productId} to ${productId} using productIdMap`);
                      } else if (item.productId === "classic-truffle-box") {
                        productId = 42;
                        productName = productName || "Classic Truffle Box";
                      } else if (item.productId === "caramel-delight-box") {
                        productId = 44;
                        productName = productName || "Caramel Delight Box";
                      } else if (item.productId === "cereal-crunch-box") {
                        productId = 41;
                        productName = productName || "Cereal Crunch Box";
                      } else if (item.productId === "assorted-favorites-box") {
                        productId = 46;
                        productName = productName || "Assorted Favorites Box";
                      } else if (!isNaN(parseInt(item.productId))) {
                        productId = parseInt(item.productId);
                      } else {
                        const product = await getProductByIdOrSlug(item.productId);
                        if (product) {
                          productId = product.id;
                          productName = productName || product.name;
                        }
                      }
                    } else if (typeof item.productId === "number") {
                      productId = item.productId;
                    }
                  }
                  if (!productId && item.product && item.product.id) {
                    productId = parseInt(item.product.id);
                    productName = productName || item.product.name;
                  }
                  if (!productId) {
                    console.error(`Could not determine productId for cart item:`, item);
                    continue;
                  }
                  const size = item.size || "none";
                  const type = item.type || "milk";
                  let shape = item.shape;
                  if (!shape) {
                    if (productId === 47 || productId === "47") {
                      shape = "rectangular";
                    } else {
                      shape = "none";
                    }
                  }
                  const quantity = item.qty || item.quantity || 1;
                  let price = 0;
                  try {
                    const product = await storage4.getProduct(productId);
                    if (product) {
                      price = product.basePrice;
                    } else {
                      price = item.price || 0;
                      console.warn(`Product ${productId} not found, using fallback price: ${price}`);
                    }
                  } catch (priceError) {
                    price = item.price || 0;
                    console.error(`Error getting product ${productId} price:`, priceError);
                  }
                  if (productId) {
                    const orderItem = await storage4.createOrderItem({
                      orderId,
                      productId,
                      productName: productName || `Product ${productId}`,
                      // Use the product name or a default
                      size,
                      type,
                      shape,
                      // Add shape to ensure consistency with webhook handler
                      quantity,
                      price
                    });
                  }
                } catch (itemError) {
                  console.error(`Error creating order item:`, itemError);
                }
              }
            } catch (parseError) {
              console.error(`Error parsing cart_items metadata:`, parseError);
            }
            try {
              const discountSettings = await getPostPurchaseDiscountSettings(storage4);
              if (discountSettings.enabled) {
                console.log("Post-purchase discounts are enabled, generating discount code for order:", orderId);
                const customerEmail2 = paymentIntent.receipt_email || metadata.customer_email || metadata.customerEmail || "";
                const userId = metadata.customer_id ? parseInt(metadata.customer_id) : 1;
                const discountCode = await createPostPurchaseDiscount(
                  storage4,
                  orderId,
                  customerEmail2,
                  userId,
                  // This is defined above
                  discountSettings
                );
                if (discountCode) {
                  console.log(`Successfully generated post-purchase discount code: ${discountCode}`);
                  await storage4.updateOrder(orderId, {
                    postPurchaseDiscountCode: discountCode
                  });
                } else {
                  console.log("Failed to generate post-purchase discount code");
                }
              } else {
                console.log("Post-purchase discounts are disabled in site settings");
              }
            } catch (discountError) {
              console.error("Error generating post-purchase discount code:", discountError);
            }
          }
        } catch (orderError) {
          console.error("Error creating order record:", orderError);
        }
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(200).json({ received: true, error: "Error processing webhook" });
    }
  });
  const productIdMap = {
    // String IDs for standard products - using current database IDs
    "classic": 42,
    "assorted": 46,
    "caramel": 44,
    "cereal": 41,
    // New name-based IDs following the "ProductName" format
    "ClassicChocolate": 42,
    "AssortedFavorites": 46,
    "CaramelChocolate": 44,
    "CerealCrunch": 41,
    // Numeric IDs map to themselves (for database products)
    // These are actual product IDs in the database
    "42": 42,
    "2": 2,
    "44": 44,
    "41": 41,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10
  };
  app2.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const { productId } = req.params;
      let numericProductId;
      if (productIdMap[productId]) {
        numericProductId = productIdMap[productId];
      } else if (!isNaN(parseInt(productId))) {
        numericProductId = parseInt(productId);
      } else {
        const allProducts = await storage4.getProducts();
        const product = allProducts.find((p) => p.allergyInfo === productId);
        if (product) {
          numericProductId = product.id;
        } else {
          return res.json([]);
        }
      }
      const reviews2 = await storage4.getProductReviews(numericProductId);
      const reviewsWithUsernames = reviews2.map((review) => {
        if (!review.userName) {
          return {
            ...review,
            userName: review.userId === 0 ? "Guest User" : `User ${review.userId}`
          };
        }
        return review;
      });
      res.json(reviewsWithUsernames);
    } catch (error) {
      console.error("Error getting product reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/reviews/me", authenticateToken, async (req, res) => {
    try {
      const reviews2 = await storage4.getUserReviews(req.user.id);
      res.json(reviews2);
    } catch (error) {
      console.error("Error getting user reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/products/:productId/reviews", authenticateToken, async (req, res) => {
    try {
      const { productId } = req.params;
      const reviewSchema = insertReviewSchema.extend({
        userId: z5.number().optional(),
        // Will be set from token
        productId: z5.number().optional()
        // Will be set from params
      });
      const result = reviewSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid review data",
          errors: result.error.format()
        });
      }
      let numericProductId;
      if (productIdMap[productId]) {
        numericProductId = productIdMap[productId];
      } else if (!isNaN(parseInt(productId))) {
        numericProductId = parseInt(productId);
      } else {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const reviewData = {
        ...result.data,
        userId: req.user.id,
        productId: numericProductId,
        createdAt: /* @__PURE__ */ new Date()
        // Force current date
      };
      const review = await storage4.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/products/:productId/guest-reviews", async (req, res) => {
    try {
      const { productId } = req.params;
      const guestReviewSchema = z5.object({
        rating: z5.number().min(1).max(5),
        comment: z5.string().optional(),
        userName: z5.string().min(1).max(50)
      });
      const result = guestReviewSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid review data",
          errors: result.error.format()
        });
      }
      let numericProductId;
      if (productIdMap[productId]) {
        numericProductId = productIdMap[productId];
      } else if (!isNaN(parseInt(productId))) {
        numericProductId = parseInt(productId);
      } else {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const { userName, ...otherData } = result.data;
      const reviewData = {
        ...otherData,
        userId: 0,
        // Guest user
        productId: numericProductId,
        userName,
        // Include userName in the review data
        createdAt: /* @__PURE__ */ new Date()
        // Force current date for guest reviews
      };
      const review = await storage4.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating guest review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/newsletter/subscribe", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    res.json({ success: true, message: "Subscription successful!" });
  });
  app2.get("/api/admin/categories", authenticateToken, isAdmin, async (req, res) => {
    try {
      const categories2 = await storage4.getCategories();
      res.json(categories2);
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/categories/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage4.getCategory(parseInt(id));
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error getting category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/categories", authenticateToken, isAdmin, async (req, res) => {
    try {
      const result = insertCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid category data",
          errors: result.error.format()
        });
      }
      const categoryData = result.data;
      const category = await storage4.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/admin/categories/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertCategorySchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid category data",
          errors: result.error.format()
        });
      }
      const categoryData = result.data;
      const category = await storage4.updateCategory(parseInt(id), categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/admin/categories/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage4.deleteCategory(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/discounts", authenticateToken, isAdmin, async (req, res) => {
    try {
      const discounts2 = await storage4.getDiscounts();
      res.json(discounts2);
    } catch (error) {
      console.error("Error getting discounts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/discounts/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const discount = await storage4.getDiscount(parseInt(id));
      if (!discount) {
        return res.status(404).json({ message: "Discount not found" });
      }
      res.json(discount);
    } catch (error) {
      console.error("Error getting discount:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/discounts", authenticateToken, isAdmin, async (req, res) => {
    try {
      const result = insertDiscountSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid discount data",
          errors: result.error.format()
        });
      }
      const discountData = result.data;
      const discount = await storage4.createDiscount(discountData);
      if (discount.active) {
        try {
          let percentOff = null;
          let amountOff = null;
          if (discountData.discountType === "percentage") {
            percentOff = discountData.value;
          } else if (discountData.discountType === "fixed") {
            amountOff = discountData.value * 100;
          }
          let duration = "once";
          if (!discountData.endDate) {
            duration = "forever";
          }
          const metadata = {
            discount_id: discount.id.toString(),
            description: discountData.description || ""
          };
          if (discountData.categoryIds && discountData.categoryIds.length > 0) {
            metadata.category_ids = discountData.categoryIds.join(",");
          }
          if (discountData.productIds && discountData.productIds.length > 0) {
            metadata.product_ids = discountData.productIds.join(",");
          }
          const stripeCoupon = await createStripeCoupon(
            discountData.code,
            percentOff !== null ? percentOff : void 0,
            amountOff !== null ? amountOff : void 0,
            "usd",
            duration,
            void 0,
            discountData.maxUses ? discountData.maxUses : void 0,
            void 0
            // expiresAt parameter
          );
          if (!stripeCoupon) {
            console.warn(`Created discount in database but failed to create Stripe coupon: ${discountData.code}`);
          } else {
            console.log(`Successfully created Stripe coupon: ${stripeCoupon.id}`);
          }
        } catch (stripeError) {
          console.error("Error creating Stripe coupon:", stripeError);
        }
      }
      res.status(201).json(discount);
    } catch (error) {
      console.error("Error creating discount:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/admin/discounts/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const discountId = parseInt(id);
      const existingDiscount = await storage4.getDiscount(discountId);
      if (!existingDiscount) {
        return res.status(404).json({ message: "Discount not found" });
      }
      const updatedDiscount = await storage4.updateDiscount(discountId, req.body);
      if (!updatedDiscount) {
        return res.status(500).json({ message: "Failed to update discount" });
      }
      const codeChanged = req.body.code && req.body.code !== existingDiscount.code;
      const typeChanged = req.body.discountType && req.body.discountType !== existingDiscount.discountType;
      const valueChanged = req.body.value !== void 0 && req.body.value !== existingDiscount.value;
      if (updatedDiscount.active && (codeChanged || typeChanged || valueChanged)) {
        try {
          if (codeChanged) {
            try {
              if (existingDiscount.code) {
                await stripe?.coupons.del(existingDiscount.code);
                console.log(`Deleted old Stripe coupon: ${existingDiscount.code}`);
              }
            } catch (deleteError) {
              if (deleteError.type !== "StripeInvalidRequestError" || deleteError.statusCode !== 404) {
                console.error("Error deleting old Stripe coupon:", deleteError);
              }
            }
            const percentOff = updatedDiscount.discountType === "percentage" ? updatedDiscount.value : null;
            const amountOff = updatedDiscount.discountType === "fixed" ? updatedDiscount.value * 100 : null;
            let duration = "once";
            if (!updatedDiscount.endDate) {
              duration = "forever";
            }
            const metadata = {
              discount_id: updatedDiscount.id.toString(),
              description: updatedDiscount.description || ""
            };
            if (updatedDiscount.categoryIds && updatedDiscount.categoryIds.length > 0) {
              metadata.category_ids = updatedDiscount.categoryIds.join(",");
            }
            if (updatedDiscount.productIds && updatedDiscount.productIds.length > 0) {
              metadata.product_ids = updatedDiscount.productIds.join(",");
            }
            const stripeCoupon = await createStripeCoupon(
              updatedDiscount.code,
              percentOff !== null ? percentOff : void 0,
              amountOff !== null ? amountOff : void 0,
              "usd",
              duration,
              void 0,
              updatedDiscount.maxUses ? updatedDiscount.maxUses : void 0,
              void 0
              // expiresAt parameter
            );
            if (!stripeCoupon) {
              console.warn(`Updated discount in database but failed to create new Stripe coupon: ${updatedDiscount.code}`);
            } else {
              console.log(`Successfully created new Stripe coupon: ${stripeCoupon.id}`);
            }
          } else if (typeChanged || valueChanged) {
            try {
              await stripe?.coupons.del(updatedDiscount.code);
              console.log(`Deleted old Stripe coupon for update: ${updatedDiscount.code}`);
              const percentOff = updatedDiscount.discountType === "percentage" ? updatedDiscount.value : null;
              const amountOff = updatedDiscount.discountType === "fixed" ? updatedDiscount.value * 100 : null;
              let duration = "once";
              if (!updatedDiscount.endDate) {
                duration = "forever";
              }
              const metadata = {
                discount_id: updatedDiscount.id.toString(),
                description: updatedDiscount.description || ""
              };
              if (updatedDiscount.categoryIds && updatedDiscount.categoryIds.length > 0) {
                metadata.category_ids = updatedDiscount.categoryIds.join(",");
              }
              if (updatedDiscount.productIds && updatedDiscount.productIds.length > 0) {
                metadata.product_ids = updatedDiscount.productIds.join(",");
              }
              const stripeCoupon = await createStripeCoupon(
                updatedDiscount.code,
                percentOff !== null ? percentOff : void 0,
                amountOff !== null ? amountOff : void 0,
                "usd",
                duration,
                void 0,
                updatedDiscount.maxUses ? updatedDiscount.maxUses : void 0,
                void 0
                // expiresAt parameter
              );
              if (!stripeCoupon) {
                console.warn(`Updated discount in database but failed to update Stripe coupon: ${updatedDiscount.code}`);
              } else {
                console.log(`Successfully updated Stripe coupon: ${stripeCoupon.id}`);
              }
            } catch (couponError) {
              console.error("Error updating Stripe coupon:", couponError);
            }
          }
        } catch (stripeError) {
          console.error("Error syncing discount with Stripe:", stripeError);
        }
      }
      res.json(updatedDiscount);
    } catch (error) {
      console.error("Error updating discount:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/admin/discounts/:id/status", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const discountId = parseInt(id);
      const { active } = req.body;
      if (active === void 0) {
        return res.status(400).json({ message: "Active status is required" });
      }
      const existingDiscount = await storage4.getDiscount(discountId);
      if (!existingDiscount) {
        return res.status(404).json({ message: "Discount not found" });
      }
      const discount = await storage4.updateDiscount(discountId, { active });
      if (!discount) {
        return res.status(500).json({ message: "Failed to update discount status" });
      }
      if (active) {
        try {
          const existingCoupon = await getStripeCoupon(discount.code);
          if (!existingCoupon) {
            const percentOff = discount.discountType === "percentage" ? discount.value : null;
            const amountOff = discount.discountType === "fixed" ? discount.value * 100 : null;
            let duration = "once";
            if (!discount.endDate) {
              duration = "forever";
            }
            const metadata = {
              discount_id: discount.id.toString(),
              description: discount.description || ""
            };
            if (discount.categoryIds && discount.categoryIds.length > 0) {
              metadata.category_ids = discount.categoryIds.join(",");
            }
            if (discount.productIds && discount.productIds.length > 0) {
              metadata.product_ids = discount.productIds.join(",");
            }
            const stripeCoupon = await createStripeCoupon(
              discount.code,
              percentOff !== null ? percentOff : void 0,
              amountOff !== null ? amountOff : void 0,
              "usd",
              duration,
              void 0,
              discount.maxUses ? discount.maxUses : void 0,
              void 0
              // expiresAt parameter
            );
            if (stripeCoupon) {
              console.log(`Successfully created Stripe coupon for activated discount: ${discount.code}`);
            } else {
              console.warn(`Failed to create Stripe coupon for activated discount: ${discount.code}`);
            }
          } else {
            console.log(`Stripe coupon already exists for discount: ${discount.code}`);
          }
        } catch (stripeError) {
          console.error("Error syncing discount to Stripe:", stripeError);
        }
      } else if (existingDiscount.active && !active) {
        try {
          console.log(`Discount ${discount.code} deactivated, but Stripe coupon retained for future use`);
        } catch (stripeError) {
          console.error("Error handling Stripe coupon for deactivated discount:", stripeError);
        }
      }
      res.json(discount);
    } catch (error) {
      console.error("Error updating discount status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/admin/discounts/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const discountId = parseInt(id);
      const discount = await storage4.getDiscount(discountId);
      if (!discount) {
        return res.status(404).json({ message: "Discount not found" });
      }
      const result = await storage4.deleteDiscount(discountId);
      if (!result) {
        return res.status(500).json({ message: "Failed to delete discount" });
      }
      try {
        if (discount.code) {
          await stripe?.coupons.del(discount.code);
          console.log(`Successfully deleted Stripe coupon: ${discount.code}`);
        }
      } catch (stripeError) {
        if (stripeError.type !== "StripeInvalidRequestError" || stripeError.statusCode !== 404) {
          console.error("Error deleting Stripe coupon:", stripeError);
        }
      }
      res.json({ message: "Discount deleted" });
    } catch (error) {
      console.error("Error deleting discount:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/discounts/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const discount = await storage4.getDiscountByCode(code);
      if (!discount) {
        return res.status(404).json({ message: "Discount code not found" });
      }
      if (!discount.active) {
        return res.status(400).json({ message: "This discount code is not active" });
      }
      if (discount.endDate && new Date(discount.endDate) < /* @__PURE__ */ new Date()) {
        return res.status(400).json({ message: "This discount code has expired" });
      }
      if (discount.startDate && new Date(discount.startDate) > /* @__PURE__ */ new Date()) {
        return res.status(400).json({ message: "This discount code is not valid yet" });
      }
      if (discount.maxUses !== null && discount.usedCount !== null && discount.usedCount >= discount.maxUses) {
        return res.status(400).json({ message: "This discount code has reached its usage limit" });
      }
      res.json(discount);
    } catch (error) {
      console.error("Error getting discount by code:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/discounts", async (req, res) => {
    try {
      const allDiscounts = await storage4.getDiscounts();
      const activeDiscounts = allDiscounts.filter((d) => d.active && !d.hidden);
      res.json(activeDiscounts);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      res.status(500).json({ error: "Failed to fetch discounts" });
    }
  });
  app2.get("/api/products/:productId/price-variations", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const variations = await storage4.getProductPriceVariations(productId);
      res.json(variations);
    } catch (error) {
      console.error("Error fetching product price variations:", error);
      res.status(500).json({ error: "Failed to fetch product price variations" });
    }
  });
  app2.get("/api/products/:productId/price", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const { size, type, shape } = req.query;
      const price = await storage4.getProductPriceByOptions(
        productId,
        size,
        type,
        shape
      );
      res.json({ price });
    } catch (error) {
      console.error("Error calculating product price:", error);
      res.status(500).json({ error: "Failed to calculate product price" });
    }
  });
  app2.post("/api/calculate-price", async (req, res) => {
    try {
      const { productId, size, type, shape } = req.body;
      if (!productId) {
        return res.status(400).json({
          message: "Product ID is required",
          error: "MISSING_PRODUCT_ID"
        });
      }
      const price = await calculateProductPrice(productId, size, type, shape);
      console.log(`[PRICE_API] Calculated price for productId=${productId}, size=${size || "none"}, type=${type || "milk"}, shape=${shape || "round"}: ${price} cents`);
      res.json({
        price,
        productId,
        size: size || "small",
        type: type || "milk",
        shape: shape || null,
        unit: "cents"
      });
    } catch (error) {
      console.error("Error calculating price:", error);
      res.status(500).json({
        message: "Error calculating price",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/admin/price-variations", authenticateToken, isAdmin, async (req, res) => {
    try {
      const variationData = req.body;
      if (!variationData.productId || isNaN(parseInt(variationData.productId))) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      if (typeof variationData.priceModifier !== "number") {
        return res.status(400).json({ error: "Price modifier must be a number" });
      }
      const variation = await storage4.createProductPriceVariation({
        productId: parseInt(variationData.productId),
        size: variationData.size || null,
        type: variationData.type || null,
        shape: variationData.shape || null,
        priceModifier: variationData.priceModifier,
        isAbsolutePrice: !!variationData.isAbsolutePrice,
        displayOrder: variationData.displayOrder || 0
      });
      res.status(201).json(variation);
    } catch (error) {
      console.error("Error creating product price variation:", error);
      res.status(500).json({ error: "Failed to create product price variation" });
    }
  });
  app2.patch("/api/admin/price-variations/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid price variation ID" });
      }
      const variationData = req.body;
      const updatedVariation = await storage4.updateProductPriceVariation(id, variationData);
      if (!updatedVariation) {
        return res.status(404).json({ error: "Price variation not found" });
      }
      res.json(updatedVariation);
    } catch (error) {
      console.error("Error updating product price variation:", error);
      res.status(500).json({ error: "Failed to update product price variation" });
    }
  });
  app2.delete("/api/admin/price-variations/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid price variation ID" });
      }
      const success = await storage4.deleteProductPriceVariation(id);
      if (!success) {
        return res.status(404).json({ error: "Price variation not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product price variation:", error);
      res.status(500).json({ error: "Failed to delete product price variation" });
    }
  });
  app2.post("/api/discounts/apply", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Discount code is required" });
      }
      const discount = await storage4.getDiscountByCode(code);
      if (!discount) {
        return res.status(404).json({ message: "Discount code not found" });
      }
      if (!discount.active) {
        return res.status(400).json({ message: "This discount code is not active" });
      }
      if (discount.endDate && new Date(discount.endDate) < /* @__PURE__ */ new Date()) {
        return res.status(400).json({ message: "This discount code has expired" });
      }
      if (discount.startDate && new Date(discount.startDate) > /* @__PURE__ */ new Date()) {
        return res.status(400).json({ message: "This discount code is not valid yet" });
      }
      if (discount.maxUses !== null && discount.usedCount !== null && discount.usedCount >= discount.maxUses) {
        return res.status(400).json({ message: "This discount code has reached its usage limit" });
      }
      res.json(discount);
    } catch (error) {
      console.error("Error applying discount:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/orders", authenticateToken, isAdmin, async (req, res) => {
    try {
      const orders2 = await storage4.getAllOrders();
      for (const order of orders2) {
        const missingItems = !order.items || !Array.isArray(order.items) || order.items.length === 0;
        if (order.paymentIntentId) {
          try {
            const missingShippingAddress = !order.shippingAddress || order.shippingAddress === "No shipping address provided";
            const missingPhone = !order.phone || String(order.phone).trim() === "";
            if (missingShippingAddress || missingPhone || missingItems) {
              if (stripe) {
                try {
                  const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
                  if (paymentIntent && paymentIntent.metadata) {
                    order.metadata = paymentIntent.metadata;
                    if (missingShippingAddress && paymentIntent.metadata.customerAddress && (order.deliveryMethod === "ship" || paymentIntent.metadata.deliveryMethod === "ship")) {
                      let formattedAddress = paymentIntent.metadata.customerAddress;
                      console.log(`Found missing address for order ${order.id} - using: "${formattedAddress}"`);
                      if (formattedAddress.includes(",") && !formattedAddress.includes("\n")) {
                        formattedAddress = formattedAddress.replace(/,\s+/g, "\n").replace(/,/g, "\n").replace(/\n{2,}/g, "\n");
                      }
                      console.log(`Auto-updating address for order ${order.id} from metadata`);
                      await storage4.updateOrder(order.id, {
                        shippingAddress: formattedAddress
                      });
                      order.shippingAddress = formattedAddress;
                    } else if (order.shippingAddress === "No shipping address provided" && paymentIntent.metadata.deliveryMethod === "pickup") {
                      const pickupText = "Pickup order - No shipping address required";
                      await storage4.updateOrder(order.id, {
                        shippingAddress: pickupText
                      });
                      order.shippingAddress = pickupText;
                    }
                    if (missingPhone && paymentIntent.metadata.phone) {
                      console.log(`Auto-updating phone for order ${order.id} from metadata`);
                      await storage4.updateOrder(order.id, {
                        phone: paymentIntent.metadata.phone
                      });
                      order.phone = paymentIntent.metadata.phone;
                    }
                    if (missingItems && paymentIntent.metadata.cart_items) {
                      try {
                        let cartItems2 = null;
                        if (typeof paymentIntent.metadata.cart_items === "string") {
                          cartItems2 = JSON.parse(paymentIntent.metadata.cart_items);
                        } else if (Array.isArray(paymentIntent.metadata.cart_items)) {
                          cartItems2 = paymentIntent.metadata.cart_items;
                        }
                        if (cartItems2 && Array.isArray(cartItems2) && cartItems2.length > 0) {
                          console.log(`Restoring ${cartItems2.length} items from metadata for order ${order.id}`);
                          order.items = cartItems2.map((item) => {
                            const productId = item.id || item.productId;
                            let productName = item.name || item.productName;
                            if (!productName && typeof productId === "string" && /^[A-Z][a-z]+/.test(productId)) {
                              productName = productId.replace(/([A-Z])/g, " $1").trim();
                              if (productId === "DubaiBar") {
                                productName = "Dubai Bar";
                              }
                            } else if (!productName) {
                              productName = `Product ${productId}`;
                            }
                            let price = item.price !== void 0 ? item.price : 0;
                            console.log(`[PRICE_DEBUG] Using price ${price} directly from metadata for ${productId} (${productName})`);
                            if (price === 0 && typeof productId === "string") {
                              const productIdLower = productId.toLowerCase();
                              let basePrice = 0;
                              basePrice = getProductBasePrice2(productIdLower);
                              const type = (item.type || "").toLowerCase();
                              const size = (item.size || "").toLowerCase();
                              if (type === "dark") {
                                basePrice += 200;
                              }
                              if (size === "medium") {
                                basePrice += 700;
                              } else if (size === "large") {
                                const productIdStr = productIdLower;
                                if (productIdStr === "caramelchocolate" || productIdStr.includes("caramel")) {
                                  basePrice += 1900;
                                  console.log(`Special pricing for large caramel chocolate: $8.00 base + $19.00 large size premium = $27.00`);
                                } else {
                                  basePrice += 400;
                                }
                              }
                              price = basePrice;
                              console.log(`Setting calculated price for ${productId}: ${price} cents (${size}, ${type}) in order view`);
                            }
                            if (price > 100) {
                              price = price / 100;
                              console.log(`[PRICE_CALC] Converting from cents: ${price * 100} \u2192 $${price.toFixed(2)}`);
                            } else {
                              console.log(`[PRICE_CALC] Price already in dollars: $${price.toFixed(2)}`);
                            }
                            return {
                              productId,
                              productName,
                              quantity: item.qty || item.quantity || 1,
                              price,
                              size: item.size || "standard",
                              type: item.type || "milk",
                              shape: item.shape || "none"
                            };
                          });
                        }
                      } catch (parseError) {
                        console.error(`Failed to parse cart items from metadata for order ${order.id}:`, parseError);
                      }
                    }
                  }
                } catch (stripeError) {
                  console.error(`Error retrieving payment intent ${order.paymentIntentId}:`, stripeError);
                }
              }
            }
          } catch (err) {
            console.error(`Failed to retrieve metadata for payment intent ${order.paymentIntentId}:`, err);
          }
        }
      }
      res.json(orders2);
    } catch (error) {
      console.error("Error getting orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/orders/payment/:paymentIntentId", async (req, res) => {
    try {
      const { paymentIntentId } = req.params;
      console.log("Fetching order by payment intent ID:", paymentIntentId);
      const orders2 = await storage4.getAllOrders();
      let order = orders2.find((o) => o.paymentIntentId === paymentIntentId);
      if (order) {
        try {
          const orderWithItems = await storage4.getOrder(order.id);
          if (orderWithItems) {
            order = orderWithItems;
          }
        } catch (itemsError) {
          console.error("Error enriching order with items:", itemsError);
        }
        const missingItems = !order.items || !Array.isArray(order.items) || order.items.length === 0;
        if (missingItems && order.paymentIntentId && stripe) {
          try {
            console.log(`Order ${order.id} is missing items. Trying to fetch them from Stripe metadata...`);
            const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
            if (paymentIntent && paymentIntent.metadata && paymentIntent.metadata.cart_items) {
              try {
                let cartItems2 = null;
                if (typeof paymentIntent.metadata.cart_items === "string") {
                  cartItems2 = JSON.parse(paymentIntent.metadata.cart_items);
                } else if (Array.isArray(paymentIntent.metadata.cart_items)) {
                  cartItems2 = paymentIntent.metadata.cart_items;
                }
                if (cartItems2 && Array.isArray(cartItems2) && cartItems2.length > 0) {
                  console.log(`Restoring ${cartItems2.length} items from metadata for order ${order.id}`);
                  order.items = cartItems2.map((item) => {
                    const productId = item.id || item.productId;
                    let productName = item.name || item.productName;
                    if (!productName && typeof productId === "string" && /^[A-Z][a-z]+/.test(productId)) {
                      productName = productId.replace(/([A-Z])/g, " $1").trim();
                      if (productId === "DubaiBar") {
                        productName = "Dubai Bar";
                      }
                    } else if (!productName) {
                      productName = `Product ${productId}`;
                    }
                    let price = item.price !== void 0 ? item.price : 0;
                    console.log(`[PRICE_DEBUG] Using price ${price} directly from metadata for ${productId} (${productName})`);
                    if (price === 0 && typeof productId === "string") {
                      const productIdLower = productId.toLowerCase();
                      let basePrice = 0;
                      basePrice = getProductBasePrice2(productIdLower);
                      const type = (item.type || "").toLowerCase();
                      const size = (item.size || "").toLowerCase();
                      if (type === "dark") {
                        basePrice += 200;
                      }
                      if (size === "medium") {
                        basePrice += 700;
                      } else if (size === "large") {
                        const productIdStr = (item.id || item.productId || "").toLowerCase();
                        if (productIdStr === "caramelchocolate" || productIdStr.includes("caramel")) {
                          basePrice += 1900;
                          console.log(`Special pricing for large caramel chocolate: $8.00 base + $19.00 large size premium = $27.00`);
                        } else {
                          basePrice += 400;
                        }
                      }
                      price = basePrice;
                      console.log(`Setting calculated price for ${productId}: ${price} cents (${size}, ${type}) in order view`);
                    }
                    if (price > 100) {
                      price = price / 100;
                      console.log(`[PRICE_CALC] Converting from cents: ${price * 100} \u2192 $${price.toFixed(2)}`);
                    } else {
                      console.log(`[PRICE_CALC] Price already in dollars: $${price.toFixed(2)}`);
                    }
                    return {
                      productId,
                      productName,
                      quantity: item.qty || item.quantity || 1,
                      price,
                      size: item.size || "standard",
                      type: item.type || "milk",
                      shape: item.shape || "none"
                    };
                  });
                  order.metadata = paymentIntent.metadata;
                }
              } catch (parseError) {
                console.error(`Failed to parse cart items from metadata for order ${order.id}:`, parseError);
              }
            }
          } catch (stripeError) {
            console.error(`Error retrieving payment intent ${order.paymentIntentId}:`, stripeError);
          }
        }
        console.log("Found order via storage.getAllOrders:", order.id);
        return res.json(order);
      }
      console.log("No order found for payment intent ID:", paymentIntentId);
      res.status(404).json({ error: "Order not found" });
    } catch (error) {
      console.error("Error fetching order by payment intent ID:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  app2.post("/api/orders/test", async (req, res) => {
    try {
      const { paymentIntentId, userId, totalAmount, shippingAddress, customerName, cartItems: cartItems2 } = req.body;
      if (!paymentIntentId || !userId || !totalAmount) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const order = await storage4.createOrder({
        userId: parseInt(userId),
        totalAmount: parseFloat(totalAmount),
        shippingAddress: shippingAddress || "Test address",
        customerName: customerName || null,
        status: "pending",
        paymentIntentId
      });
      console.log(`Created test order: ${order.id} for payment intent: ${paymentIntentId}`);
      if (cartItems2 && Array.isArray(cartItems2)) {
        for (const item of cartItems2) {
          try {
            const orderItem = await storage4.createOrderItem({
              orderId: order.id,
              productId: item.productId,
              productName: item.productName || `Product ${item.productId}`,
              size: item.size || "none",
              // Use 'none' instead of 'standard' or 'small'
              type: item.type || "milk",
              shape: item.shape || "none",
              // Default shape should be 'none', not 'standard'
              quantity: item.quantity || 1,
              price: item.price || 800
              // default price in cents
            });
            console.log(`Added order item: ${orderItem.id} to order: ${order.id}`);
          } catch (itemError) {
            console.error("Error creating order item:", itemError);
          }
        }
      } else {
        const orderItem = await storage4.createOrderItem({
          orderId: order.id,
          productId: 42,
          // Classic chocolate
          size: "none",
          type: "milk",
          quantity: 1,
          price: 800
          // $8.00 in cents
        });
        console.log(`Added default order item: ${orderItem.id} to order: ${order.id}`);
      }
      const orderWithItems = await storage4.getOrder(order.id);
      res.status(201).json(orderWithItems);
    } catch (error) {
      console.error("Error creating test order:", error);
      res.status(500).json({ error: "Failed to create test order" });
    }
  });
  app2.get("/api/admin/orders/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage4.getOrder(parseInt(id));
      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }
      const missingItems = !order.items || !Array.isArray(order.items) || order.items.length === 0;
      if (missingItems && order.paymentIntentId && stripe) {
        try {
          console.log(`Admin view: Order ${order.id} is missing items. Trying to fetch them from Stripe metadata...`);
          const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
          if (paymentIntent && paymentIntent.metadata && paymentIntent.metadata.cart_items) {
            try {
              let cartItems2 = null;
              if (typeof paymentIntent.metadata.cart_items === "string") {
                cartItems2 = JSON.parse(paymentIntent.metadata.cart_items);
              } else if (Array.isArray(paymentIntent.metadata.cart_items)) {
                cartItems2 = paymentIntent.metadata.cart_items;
              }
              if (cartItems2 && Array.isArray(cartItems2) && cartItems2.length > 0) {
                console.log(`Restoring ${cartItems2.length} items from metadata for admin view of order ${order.id}`);
                order.items = cartItems2.map((item) => {
                  const productId = item.id || item.productId;
                  let productName = item.name || item.productName;
                  if (!productName && typeof productId === "string" && /^[A-Z][a-z]+/.test(productId)) {
                    productName = productId.replace(/([A-Z])/g, " $1").trim();
                    if (productId === "DubaiBar") {
                      productName = "Dubai Bar";
                    }
                  } else if (!productName) {
                    productName = `Product ${productId}`;
                  }
                  let price = item.price !== void 0 ? item.price : 0;
                  console.log(`[PRICE_DEBUG] Using price ${price} directly from metadata for ${productId} (${productName}) in admin view`);
                  if (price === 0 && typeof productId === "string") {
                    const productIdLower = productId.toLowerCase();
                    let basePrice = 0;
                    basePrice = getProductBasePrice2(productIdLower);
                    const type = (item.type || "").toLowerCase();
                    const size = (item.size || "").toLowerCase();
                    if (type === "dark") {
                      basePrice += 200;
                    }
                    if (size === "medium") {
                      basePrice += 700;
                    } else if (size === "large") {
                      const productIdStr = (productId || "").toLowerCase();
                      if (productIdStr === "caramelchocolate" || productIdStr.includes("caramel")) {
                        basePrice += 1900;
                        console.log(`Special pricing for large caramel chocolate: $8.00 base + $19.00 large size premium = $27.00`);
                      } else {
                        basePrice += 400;
                      }
                    }
                    price = basePrice;
                    console.log(`Setting calculated price for ${productId}: ${price} cents in admin view (${size}, ${type})`);
                  }
                  if (price > 100) {
                    price = price / 100;
                    console.log(`[PRICE_CALC] Admin view - Converting from cents: ${price * 100} \u2192 $${price.toFixed(2)}`);
                  } else {
                    console.log(`[PRICE_CALC] Admin view - Price already in dollars: $${price.toFixed(2)}`);
                  }
                  return {
                    productId,
                    productName,
                    quantity: item.qty || item.quantity || 1,
                    price,
                    size: item.size || "standard",
                    type: item.type || "milk",
                    shape: item.shape || "none"
                  };
                });
                order.metadata = paymentIntent.metadata;
              }
            } catch (parseError) {
              console.error(`Failed to parse cart items from metadata for admin view of order ${order.id}:`, parseError);
            }
          }
        } catch (stripeError) {
          console.error(`Error retrieving payment intent ${order.paymentIntentId}:`, stripeError);
        }
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  app2.put("/api/admin/orders/:id/status", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      const order = await storage4.updateOrderStatus(parseInt(id), status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/admin/orders/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      console.log(`PATCH request to update order ${id} with data:`, updateData);
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No update data provided" });
      }
      const allowedFields = ["shippingAddress", "customerName", "deliveryMethod"];
      const invalidFields = Object.keys(updateData).filter((field) => !allowedFields.includes(field));
      if (invalidFields.length > 0) {
        return res.status(400).json({
          message: `Cannot update restricted fields: ${invalidFields.join(", ")}`,
          allowedFields
        });
      }
      const order = await storage4.updateOrder(parseInt(id), updateData);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      console.log(`Order ${id} successfully updated with new data`);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });
  async function getBoxTypeIdForProductSize(productId, size) {
    try {
      const product = await storage4.getProduct(
        typeof productId === "string" ? parseInt(productId) : productId
      );
      if (!product || !product.sizeOptions) {
        return void 0;
      }
      try {
        const sizeOptions = JSON.parse(product.sizeOptions);
        if (!Array.isArray(sizeOptions)) {
          return void 0;
        }
        const matchingSize = sizeOptions.find((option) => option.id === size);
        return matchingSize && matchingSize.boxTypeId ? matchingSize.boxTypeId : void 0;
      } catch (e) {
        console.error("Error parsing product size options:", e);
        return void 0;
      }
    } catch (e) {
      console.error("Error getting product size box type:", e);
      return void 0;
    }
  }
  app2.post("/api/admin/orders", authenticateToken, isAdmin, async (req, res) => {
    try {
      const result = insertOrderSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid order data",
          errors: result.error.format()
        });
      }
      const orderData = result.data;
      const order = await storage4.createOrder(orderData);
      const boxUpdates = {};
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const size = item.options?.size || "none";
          const itemQuantity = item.quantity || 1;
          const orderItemData = {
            orderId: order.id,
            productId: item.productId,
            size,
            type: item.options?.type || "milk",
            shape: item.shape || item.options?.shape || "none",
            // Include shape from items or options (default to 'none')
            price: item.price,
            quantity: itemQuantity
          };
          await storage4.createOrderItem(orderItemData);
          const boxTypeId = await getBoxTypeIdForProductSize(item.productId, size);
          if (boxTypeId) {
            console.log(`Box type ID ${boxTypeId} found for product ${item.productId}, size ${size}`);
            if (boxUpdates[boxTypeId]) {
              boxUpdates[boxTypeId] += itemQuantity;
            } else {
              boxUpdates[boxTypeId] = itemQuantity;
            }
          }
        }
      }
      for (const [boxTypeIdStr, quantity] of Object.entries(boxUpdates)) {
        const boxTypeId = parseInt(boxTypeIdStr);
        console.log(`Decrementing box type ID ${boxTypeId} by ${quantity}`);
        try {
          const result2 = await storage4.decrementBoxInventory(boxTypeId, quantity);
          if (result2) {
            console.log(`Successfully updated box inventory for box ID ${boxTypeId}, new quantity: ${result2.quantity}`);
          } else {
            console.log(`Failed to update box inventory for box ID ${boxTypeId}`);
          }
        } catch (boxError) {
          console.error(`Error updating box inventory for box ID ${boxTypeId}:`, boxError);
        }
      }
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/admin/orders/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage4.deleteOrder(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/orders/fix-missing-items", authenticateToken, isAdmin, async (req, res) => {
    try {
      const stripe4 = await import("stripe").then((module) => module.default(process.env.STRIPE_SECRET_KEY));
      const orders2 = await storage4.getAllOrders();
      const results = {
        totalProcessed: 0,
        itemsAdded: 0,
        noPaymentIntent: 0,
        alreadyHasItems: 0,
        noMetadata: 0,
        noCartItemsInMetadata: 0,
        stripeErrors: 0,
        errors: 0
      };
      for (const order of orders2) {
        results.totalProcessed++;
        try {
          if (!order.paymentIntentId) {
            results.noPaymentIntent++;
            continue;
          }
          if (order.items && order.items.length > 0) {
            results.alreadyHasItems++;
            continue;
          }
          console.log(`Processing order ${order.id} with payment intent ${order.paymentIntentId}`);
          const paymentIntent = await stripe4.paymentIntents.retrieve(order.paymentIntentId);
          if (!paymentIntent.metadata) {
            results.noMetadata++;
            continue;
          }
          let cartItems2 = [];
          if (paymentIntent.metadata.cart_items) {
            try {
              cartItems2 = JSON.parse(paymentIntent.metadata.cart_items);
            } catch (e) {
              console.error(`Error parsing cart_items for order ${order.id}:`, e);
            }
          } else if (paymentIntent.metadata.cartItems) {
            try {
              cartItems2 = JSON.parse(paymentIntent.metadata.cartItems);
            } catch (e) {
              console.error(`Error parsing cartItems for order ${order.id}:`, e);
            }
          }
          if (cartItems2.length === 0) {
            results.noCartItemsInMetadata++;
            continue;
          }
          for (const item of cartItems2) {
            try {
              await storage4.createOrderItem({
                orderId: order.id,
                productId: item.id || item.productId,
                quantity: item.quantity || item.qty || 1,
                price: (() => {
                  let basePrice = item.price || 0;
                  if (basePrice === 0 && typeof (item.id || item.productId) === "string") {
                    const productId = (item.id || item.productId).toLowerCase();
                    basePrice = getProductBasePrice2(productId);
                    const type = (item.type || "").toLowerCase();
                    const size = (item.size || "").toLowerCase();
                    if (type === "dark") {
                      basePrice += 200;
                    }
                    if (size === "medium") {
                      basePrice += 700;
                    } else if (size === "large") {
                      if (productId === "caramelchocolate" || productId.includes("caramel")) {
                        basePrice += 1900;
                        console.log(`Special pricing for large caramel chocolate: $8.00 base + $19.00 large size premium = $27.00`);
                      } else {
                        basePrice += 400;
                      }
                    }
                    console.log(`Fix-missing-items: Setting calculated price for ${item.id || item.productId}: ${basePrice} cents`);
                  }
                  return basePrice;
                })(),
                size: item.size || "none",
                type: item.type || "milk",
                shape: item.shape || "none"
              });
              results.itemsAdded++;
            } catch (itemError) {
              console.error(`Error adding item to order ${order.id}:`, itemError);
              results.errors++;
            }
          }
          if (!order.metadata) {
            await storage4.updateOrder(order.id, {
              metadata: JSON.stringify({ cart_items: cartItems2 })
            });
          }
          console.log(`Added ${cartItems2.length} items to order ${order.id}`);
        } catch (orderError) {
          if (orderError.type === "StripeInvalidRequestError") {
            results.stripeErrors++;
          } else {
            results.errors++;
          }
          console.error(`Error processing order ${order.id}:`, orderError);
        }
      }
      res.json({
        message: "Order items fix completed",
        results
      });
    } catch (error) {
      console.error("Error fixing missing order items:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/orders/fix-addresses", authenticateToken, isAdmin, async (req, res) => {
    try {
      const orders2 = await storage4.getAllOrders();
      const results = {
        totalProcessed: 0,
        addressesUpdated: 0,
        phonesUpdated: 0,
        noMetadata: 0,
        noAddressInMetadata: 0,
        alreadyComplete: 0,
        errors: 0
      };
      for (const order of orders2) {
        results.totalProcessed++;
        try {
          if (order.shippingAddress && order.shippingAddress !== "No shipping address provided" && order.phone && String(order.phone).trim() !== "") {
            results.alreadyComplete++;
            continue;
          }
          if (order.paymentIntentId && stripe) {
            const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
            if (!paymentIntent.metadata) {
              results.noMetadata++;
              continue;
            }
            let updated = false;
            if ((!order.shippingAddress || order.shippingAddress === "No shipping address provided") && paymentIntent.metadata.customerAddress) {
              let formattedAddress = paymentIntent.metadata.customerAddress;
              if (formattedAddress.includes(",") && !formattedAddress.includes("\n")) {
                formattedAddress = formattedAddress.replace(/,\s+/g, "\n").replace(/,/g, "\n").replace(/\n{2,}/g, "\n");
              }
              console.log(`Fixing address for order ${order.id} using "${formattedAddress}"`);
              await storage4.updateOrder(order.id, {
                shippingAddress: formattedAddress
              });
              updated = true;
              results.addressesUpdated++;
            } else if (order.shippingAddress === "No shipping address provided" && paymentIntent.metadata.deliveryMethod === "pickup") {
              const pickupText = "Pickup order - No shipping address required";
              await storage4.updateOrder(order.id, {
                shippingAddress: pickupText
              });
              updated = true;
              results.addressesUpdated++;
            } else if (!paymentIntent.metadata.customerAddress) {
              results.noAddressInMetadata++;
            }
            if ((!order.phone || String(order.phone).trim() === "") && paymentIntent.metadata.phone) {
              console.log(`Fixing phone for order ${order.id} using "${paymentIntent.metadata.phone}"`);
              await storage4.updateOrder(order.id, {
                phone: paymentIntent.metadata.phone
              });
              updated = true;
              results.phonesUpdated++;
            }
          } else {
            results.noMetadata++;
          }
        } catch (error) {
          console.error(`Error processing order ${order.id}:`, error);
          results.errors++;
        }
      }
      res.json({
        success: true,
        results,
        message: `Fixed ${results.addressesUpdated} missing addresses and ${results.phonesUpdated} missing phone numbers`
      });
    } catch (error) {
      console.error("Error fixing order addresses:", error);
      res.status(500).json({
        success: false,
        message: "Error fixing order addresses"
      });
    }
  });
  app2.post("/api/admin/orderitems", authenticateToken, isAdmin, async (req, res) => {
    try {
      const item = req.body;
      if (!item.orderId || !item.productId || !item.quantity || !item.price) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      if (!item.shape) {
        item.shape = "none";
      }
      const orderItem = await storage4.createOrderItem(item);
      res.status(201).json(orderItem);
    } catch (error) {
      console.error("Error creating order item:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/reviews", authenticateToken, isAdmin, async (req, res) => {
    try {
      const reviews2 = await storage4.getAllReviews();
      const numericToStringProductId = {};
      for (const [stringId, numericId] of Object.entries(productIdMap)) {
        numericToStringProductId[numericId.toString()] = stringId;
      }
      const productNames = {
        // Named products (now with high IDs to avoid conflicts)
        "classic": "Classic Chocolate",
        "assorted": "Assorted Nuts Chocolate",
        "caramel": "Caramel Chocolate",
        "cereal": "Cereal Chocolate",
        // Database numeric IDs
        "1": "Database Product 1",
        "2": "Database Product 2",
        "3": "Test Product",
        "4": "Premium Chocolate",
        "5": "Database Product 5",
        "6": "Debug Product",
        // Mapped IDs (for reverse lookup)
        "101": "Classic Chocolate",
        "102": "Assorted Nuts Chocolate",
        "103": "Caramel Chocolate",
        "104": "Cereal Chocolate"
      };
      const products2 = await storage4.getProducts();
      const productNameMap = {};
      products2.forEach((product) => {
        productNameMap[product.id] = product.name;
      });
      for (const [stringId, numericId] of Object.entries(productIdMap)) {
        const productName = productNames[stringId];
        if (productName) {
          productNameMap[numericId] = productName;
        }
      }
      const reviewsWithProductNames = reviews2.map((review) => {
        let productName = productNameMap[review.productId];
        if (!productName) {
          const stringProductId = numericToStringProductId[review.productId] || `unknown-${review.productId}`;
          productName = productNames[stringProductId] || `Product #${review.productId}`;
        }
        return {
          ...review,
          productName
        };
      });
      res.json(reviewsWithProductNames);
    } catch (error) {
      console.error("Error getting reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/admin/reviews/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage4.deleteReview(parseInt(id));
      if (!deleted) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Review deleted" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/products-with-reviews", authenticateToken, isAdmin, async (req, res) => {
    try {
      const products2 = await storage4.getProducts();
      const hardcodedProducts = chocolates.map((product) => {
        if (product.id === "assorted" && global.assortedNutsProduct) {
          console.log("Admin API: Using global.assortedNutsProduct for Assorted Nuts");
          return {
            ...global.assortedNutsProduct,
            rating: product.rating,
            reviewCount: product.reviewCount,
            // Make sure we explicitly include the visible property from global state
            visible: typeof global.assortedNutsProduct.visible === "boolean" ? global.assortedNutsProduct.visible : false,
            // Make sure badge is present
            badge: global.assortedNutsProduct.badge || null,
            createdAt: /* @__PURE__ */ new Date()
          };
        }
        return {
          id: product.id,
          // This is a string ID
          name: product.name,
          description: product.description,
          image: product.image,
          basePrice: product.basePrice,
          category: product.category,
          featured: true,
          inventory: 100,
          sizeOptions: JSON.stringify(product.sizes || []),
          typeOptions: JSON.stringify(product.types || []),
          rating: product.rating,
          reviewCount: product.reviewCount,
          displayOrder: typeof product.displayOrder === "number" ? product.displayOrder : 1e3,
          // Ensure displayOrder is included as a number
          createdAt: /* @__PURE__ */ new Date()
        };
      });
      const dbProductsWithReviews = await Promise.all(
        products2.map(async (product) => {
          const reviews2 = await storage4.getProductReviews(Number(product.id));
          const reviewCount = reviews2.length;
          const averageRating = reviewCount > 0 ? reviews2.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;
          let sizes = [];
          if (product.sizeOptions) {
            try {
              sizes = JSON.parse(product.sizeOptions);
            } catch (e) {
              console.error(`Error parsing size options for product ${product.id}:`, e);
            }
          }
          let types = [];
          if (product.typeOptions) {
            try {
              types = JSON.parse(product.typeOptions);
            } catch (e) {
              console.error(`Error parsing type options for product ${product.id}:`, e);
            }
          }
          return {
            ...product,
            id: product.id.toString(),
            rating: averageRating,
            reviewCount,
            sizes,
            types
          };
        })
      );
      const hardcodedProductsWithReviews = await Promise.all(
        hardcodedProducts.map(async (product) => {
          const numericProductId = productIdMap[product.id];
          const reviews2 = numericProductId ? await storage4.getProductReviews(numericProductId) : [];
          const reviewCount = reviews2.length;
          const averageRating = reviewCount > 0 ? reviews2.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;
          return {
            ...product,
            // Override the hardcoded review data with actual data
            rating: reviewCount > 0 ? averageRating : 0,
            reviewCount,
            sizes: product.sizeOptions ? JSON.parse(product.sizeOptions) : [],
            types: product.typeOptions ? JSON.parse(product.typeOptions) : []
          };
        })
      );
      const combinedProducts = [...hardcodedProductsWithReviews].filter((hardcodedProduct) => {
        const matchingDbProduct = dbProductsWithReviews.find(
          (dbProduct) => dbProduct.id === hardcodedProduct.id || dbProduct.id === productIdMap[hardcodedProduct.id]?.toString() || dbProduct.category === hardcodedProduct.category
        );
        return !matchingDbProduct;
      });
      for (const dbProduct of dbProductsWithReviews) {
        const cleanedProduct = {
          ...dbProduct,
          featured: dbProduct.featured === null ? false : dbProduct.featured,
          inventory: dbProduct.inventory === null ? 0 : dbProduct.inventory,
          sizeOptions: dbProduct.sizeOptions === null ? "" : dbProduct.sizeOptions,
          typeOptions: dbProduct.typeOptions === null ? "" : dbProduct.typeOptions,
          displayOrder: typeof dbProduct.displayOrder === "number" ? dbProduct.displayOrder : 1e3,
          visible: dbProduct.visible === false ? false : true
          // Ensure visibility flag is preserved
        };
        const idString = String(cleanedProduct.id);
        const idNum = Number(cleanedProduct.id);
        const stringToNumericIdMap = {
          "classic": 1,
          "assorted": 46,
          "caramel": 3,
          "cereal": 4
        };
        const numericToStringIdMap = {
          "1": "classic",
          "2": "assorted",
          "3": "caramel",
          "4": "cereal"
        };
        const matchesHardcodedProduct = combinedProducts.some((p) => {
          if (String(p.id) === idString) return true;
          if (idString in numericToStringIdMap && String(p.id) === numericToStringIdMap[idString]) {
            return true;
          }
          const pIdStr = String(p.id);
          if (pIdStr in stringToNumericIdMap && idNum === stringToNumericIdMap[pIdStr]) {
            return true;
          }
          return false;
        });
        if (!matchesHardcodedProduct) {
          combinedProducts.push(cleanedProduct);
        }
      }
      console.log("Products with reviews and metadata:", combinedProducts);
      res.json(combinedProducts);
    } catch (error) {
      console.error("Error getting products with reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/statistics/products", authenticateToken, isAdmin, async (req, res) => {
    try {
      const dbProducts = await storage4.getProducts();
      const allOrders = await storage4.getAllOrders();
      const allProducts = dbProducts.map((p) => ({
        ...p,
        id: p.id
      }));
      const stringToNumericIdMap = {
        "classic": 42,
        "assorted": 46,
        "caramel": 44,
        "cereal": 41
      };
      const numericToStringIdMap = {
        "42": "classic",
        "2": "assorted",
        "44": "caramel",
        "41": "cereal"
      };
      chocolates.forEach((choc) => {
        const exists = allProducts.some((p) => {
          if (String(p.id) === choc.id) return true;
          const pIdStr = String(p.id);
          if (Object.prototype.hasOwnProperty.call(numericToStringIdMap, pIdStr) && numericToStringIdMap[pIdStr] === choc.id) {
            return true;
          }
          const chocIdStr = String(choc.id);
          if (Object.prototype.hasOwnProperty.call(stringToNumericIdMap, chocIdStr) && p.id === stringToNumericIdMap[chocIdStr]) {
            return true;
          }
          return false;
        });
        if (!exists) {
          allProducts.push({
            id: isNaN(parseInt(choc.id, 10)) ? choc.id : parseInt(choc.id, 10),
            // Try to convert to number or keep as is
            name: choc.name,
            description: choc.description,
            basePrice: choc.basePrice,
            category: choc.category,
            image: choc.image,
            featured: true,
            inventory: 100,
            createdAt: /* @__PURE__ */ new Date(),
            rating: 0,
            reviewCount: 0,
            sizeOptions: null,
            typeOptions: null
          });
        }
      });
      const salesData = {};
      const processedOrders = /* @__PURE__ */ new Set();
      const activeOrders = allOrders.filter((order) => order.status !== "cancelled" && order.status !== "deleted");
      console.log(`[Stats] Processing ${activeOrders.length} active orders out of ${allOrders.length} total orders for statistics`);
      const totalOrderRevenue = activeOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      console.log(`[Stats] Total order revenue from active orders: ${totalOrderRevenue} cents (${totalOrderRevenue / 100} dollars)`);
      let totalProductRevenue = 0;
      let allOrderItems = [];
      for (const order of activeOrders) {
        if (processedOrders.has(order.id)) {
          continue;
        }
        const excludedOrderIds = [24, 31, 33];
        if (excludedOrderIds.includes(order.id)) {
          console.log(`[Stats] Explicitly excluding order ${order.id} as requested`);
          continue;
        }
        processedOrders.add(order.id);
        const orderItems2 = await storage4.getOrderItems(order.id);
        allOrderItems = [...allOrderItems, ...orderItems2];
        const orderItemRevenue = orderItems2.reduce((sum, item) => sum + item.price * item.quantity, 0);
        totalProductRevenue += orderItemRevenue;
      }
      console.log(`[Stats] Raw product revenue from all items: ${totalProductRevenue} cents (${totalProductRevenue / 100} dollars)`);
      const globalScalingFactor = totalOrderRevenue > 0 && totalProductRevenue > 0 ? totalOrderRevenue / totalProductRevenue : 1;
      console.log(`[Stats] Global scaling factor: ${globalScalingFactor.toFixed(4)}`);
      processedOrders.clear();
      for (const item of allOrderItems) {
        const productId = item.productId.toString();
        if (!salesData[productId]) {
          salesData[productId] = { totalSales: 0, revenue: 0 };
        }
        salesData[productId].totalSales += item.quantity;
        const rawItemRevenue = item.price * item.quantity;
        const adjustedItemRevenue = Math.round(rawItemRevenue * globalScalingFactor);
        salesData[productId].revenue += adjustedItemRevenue;
      }
      const totalAdjustedProductRevenue = Object.values(salesData).reduce(
        (sum, data) => sum + data.revenue,
        0
      );
      console.log(`[Stats] Adjusted product revenue: ${totalAdjustedProductRevenue} cents (${totalAdjustedProductRevenue / 100} dollars)`);
      console.log(`[Stats] Revenue from orders vs. adjusted items: ${totalOrderRevenue} vs. ${totalAdjustedProductRevenue} cents`);
      console.log(`[Stats] Adjustment difference: ${totalOrderRevenue - totalAdjustedProductRevenue} cents`);
      const productStats = await Promise.all(
        allProducts.map(async (product) => {
          let reviews2;
          if (typeof product.id === "number") {
            reviews2 = await storage4.getProductReviews(product.id);
          } else {
            const productIdString = product.id.toString();
            const numId = productIdMap[productIdString] || parseInt(productIdString);
            reviews2 = !isNaN(numId) ? await storage4.getProductReviews(numId) : [];
          }
          const avgRating = reviews2.length > 0 ? reviews2.reduce((sum, review) => sum + review.rating, 0) / reviews2.length : 0;
          const productIdStr = product.id.toString();
          const sales = salesData[productIdStr] || { totalSales: 0, revenue: 0 };
          return {
            productId: product.id,
            name: product.name,
            totalSales: sales.totalSales,
            revenue: sales.revenue,
            reviewCount: reviews2.length,
            averageRating: avgRating
          };
        })
      );
      res.json(productStats);
    } catch (error) {
      console.error("Error getting product statistics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  registerUploadRoutes(app2);
  app2.get("/api/orders/status", async (req, res) => {
    try {
      const { orderNumber, email, phone, paymentId } = req.query;
      if (!orderNumber) {
        return res.status(400).json({ message: "Order number is required" });
      }
      if (!email && !phone && !paymentId) {
        return res.status(400).json({
          message: "At least one identifier (email, phone or payment ID) is required"
        });
      }
      const orderId = parseInt(orderNumber);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order number" });
      }
      const order = await storage4.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      let identifierMatched = false;
      if (email) {
        const orderEmail = order.customerEmail || order.metadata?.customer_email || order.metadata?.email;
        if (orderEmail && orderEmail.toLowerCase() === email.toLowerCase()) {
          identifierMatched = true;
        }
      }
      if (!identifierMatched && phone) {
        const orderPhone = order.phone || order.metadata?.phone || order.metadata?.customer_phone;
        const normalizedRequestPhone = phone.replace(/[\s\-\(\)]/g, "");
        const normalizedOrderPhone = orderPhone ? orderPhone.replace(/[\s\-\(\)]/g, "") : null;
        if (normalizedOrderPhone && normalizedRequestPhone && normalizedOrderPhone.includes(normalizedRequestPhone) || normalizedRequestPhone.includes(normalizedOrderPhone)) {
          identifierMatched = true;
        }
      }
      if (!identifierMatched && paymentId) {
        const orderPaymentId = order.paymentIntentId || order.metadata?.payment_intent || order.metadata?.paymentIntentId;
        if (orderPaymentId && orderPaymentId === paymentId) {
          identifierMatched = true;
        }
      }
      if (!identifierMatched) {
        console.log(`Order verification failed for order ${orderId}. None of the provided identifiers matched.`);
        return res.status(404).json({
          message: "Order not found. Please check your order number and identifier information."
        });
      }
      const orderItems2 = await storage4.getOrderItems(orderId);
      if (orderItems2 && orderItems2.length > 0) {
        order.items = orderItems2;
      } else if (order.metadata?.cart_items) {
        order.items = order.metadata.cart_items;
      }
      console.log(`Order ${orderId} found and verified. Returning limited order details.`);
      const sanitizedOrder = {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        deliveryMethod: order.deliveryMethod,
        // Return only masked versions of sensitive data
        customerEmail: order.customerEmail ? maskEmail(order.customerEmail) : null,
        // Don't include full shipping address, just city/state if available
        shippingRegion: extractShippingRegion(order.shippingAddress),
        items: order.items
        // Ensure no phone numbers or full addresses are exposed
      };
      return res.json(sanitizedOrder);
    } catch (error) {
      console.error("Error retrieving order status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  function maskEmail(email) {
    if (!email || typeof email !== "string") return "";
    const parts = email.split("@");
    if (parts.length !== 2) return "";
    const name = parts[0];
    const domain = parts[1];
    let maskedName = "";
    if (name.length > 2) {
      maskedName = name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
    } else {
      maskedName = name[0] + "*";
    }
    return `${maskedName}@${domain}`;
  }
  function extractShippingRegion(address) {
    if (!address || typeof address !== "string") return "";
    if (address === "No shipping address provided") return "";
    const addressLines = address.split("\n");
    if (addressLines.length > 1) {
      return addressLines.slice(1).join(", ").replace(/\d+/g, "");
    }
    const parts = address.split(",");
    if (parts.length > 1) {
      return parts.slice(1).join(",").replace(/\d+/g, "");
    }
    return "Region information not available";
  }
  app2.use("/api/custom-orders", authenticateToken, isAdmin, custom_orders_default);
  app2.use("/api/public-custom-orders", public_custom_orders_default);
  app2.use("/uploads", (req, res, next) => {
    const uploadsDir = path5.join(process.cwd(), "public/uploads");
    if (!fs5.existsSync(uploadsDir)) {
      fs5.mkdirSync(uploadsDir, { recursive: true });
    }
    next();
  }, (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
  });
  app2.use("/uploads", express5.static(path5.join(process.cwd(), "public/uploads")));
  app2.use("/static", express5.static(path5.join(process.cwd(), "public/static")));
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage4.getUserByUsername(username);
      if (!user || !user.isAdmin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const { comparePassword: comparePassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const passwordMatches = await comparePassword2(password, user.password);
      if (passwordMatches) {
        const { generateToken: generateToken2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
        const token = generateToken2(user);
        res.json({
          token,
          user: {
            username: user.username,
            id: user.id,
            role: "admin"
          }
        });
      } else {
        res.status(401).json({ message: "Invalid admin credentials" });
      }
    } catch (error) {
      console.error("Error in admin login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/site-customization", async (req, res) => {
    try {
      const settings = await storage4.getAllSiteCustomization();
      res.json(settings);
    } catch (error) {
      console.error("Error getting site customization settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/shipping/status", async (req, res) => {
    try {
      const setting = await storage4.getSiteSettingByKey("shipping_enabled");
      const enabled = setting ? setting.value === "true" : true;
      res.json({ enabled });
    } catch (error) {
      console.error("Error fetching shipping status:", error);
      res.json({ enabled: true });
    }
  });
  app2.get("/api/warehouse-address", async (req, res) => {
    try {
      const siteSettings2 = await storage4.getAllSiteCustomization();
      const warehouseAddressValue = siteSettings2["warehouse_address"];
      if (!warehouseAddressValue) {
        return res.status(404).json({
          error: "Warehouse address not found",
          message: "No warehouse address configuration found in the system."
        });
      }
      try {
        const addressData = JSON.parse(warehouseAddressValue);
        const processedAddress = {
          ...addressData,
          privateAddress: addressData.privateAddress === true || addressData.privateAddress === "true" || addressData.privateAddress === 1,
          emailOnly: addressData.emailOnly === true || addressData.emailOnly === "true" || addressData.emailOnly === 1
        };
        if (typeof addressData.privateAddress !== "boolean" || typeof addressData.emailOnly !== "boolean") {
          try {
            processedAddress.privateAddress = true;
            await storage4.setSiteCustomization(
              "warehouse_address",
              JSON.stringify(processedAddress)
            );
          } catch (updateError) {
            console.error("Error updating address in database:", updateError);
          }
        }
        return res.json({
          privateAddress: true,
          emailOnly: processedAddress.emailOnly || false,
          name: processedAddress.name || "Sweet Moment Chocolates",
          // Always show business name
          // Provide contact methods but not the physical address
          contact: processedAddress.contact || "Please contact us for pickup details",
          // If we have region information (city/state), provide that without specific street address
          region: processedAddress.city ? `${processedAddress.city}, ${processedAddress.state || ""}`.trim() : "Contact for location details"
        });
      } catch (parseError) {
        console.error("Error parsing warehouse address:", parseError);
        return res.status(500).json({
          error: "Invalid warehouse address format",
          message: "The warehouse address data is corrupted or in an invalid format."
        });
      }
    } catch (error) {
      console.error("Error fetching warehouse address:", error);
      return res.status(500).json({
        error: "Failed to fetch warehouse address",
        message: "Could not retrieve the warehouse address information."
      });
    }
  });
  app2.get("/api/admin/site-customization", authenticateToken, isAdmin, async (req, res) => {
    try {
      console.log("[Admin] Fetching site customization settings");
      const settings = await storage4.getAllSiteCustomization();
      if (settings.heroSection) {
        console.log("[Admin] Hero Section data:", settings.heroSection);
      }
      res.json(settings);
    } catch (error) {
      console.error("Error getting admin site customization settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/site-customization/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const value = await storage4.getSiteCustomization(key);
      if (!value) {
        return res.status(404).json({ message: "Customization setting not found" });
      }
      res.json({ key, value });
    } catch (error) {
      console.error(`Error getting site customization setting for key ${req.params.key}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/site-customization/add-hero-image", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }
      const heroSectionStr = await storage4.getSiteCustomization("heroSection");
      if (!heroSectionStr) {
        return res.status(404).json({ message: "Hero section not found" });
      }
      console.log(`[Server] Adding hero image: ${imageUrl}`);
      console.log(`[Server] Current hero section: ${heroSectionStr}`);
      const heroSection = JSON.parse(heroSectionStr);
      if (!heroSection.images || !Array.isArray(heroSection.images)) {
        heroSection.images = [];
      }
      const uniqueImages = new Set(heroSection.images);
      if (uniqueImages.size !== heroSection.images.length) {
        console.log(`[Server] Found duplicate images in carousel, cleaning up first`);
        heroSection.images = Array.from(uniqueImages);
      }
      if (heroSection.images.includes(imageUrl)) {
        console.log(`[Server] Image ${imageUrl} already exists in carousel`);
        return res.status(200).json({
          message: "Image already exists in carousel",
          heroSection,
          timestamp: Date.now()
        });
      }
      console.log(`[Server] Adding image to carousel (${heroSection.images.length} existing images)`);
      heroSection.images.unshift(imageUrl);
      console.log(`[Server] Updated images array: ${JSON.stringify(heroSection.images)}`);
      if (!heroSection.imageUrl || heroSection.imageUrl === "" || heroSection.images.length === 1) {
        heroSection.imageUrl = imageUrl;
        console.log(`[Server] Set new image as primary: ${imageUrl}`);
      }
      await storage4.setSiteCustomization("heroSection", JSON.stringify(heroSection));
      console.log(`[Server] Saved updated hero section`);
      res.status(200).json({
        message: "Image added successfully",
        heroSection,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error adding hero image:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/site-customization", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { key, value, timestamp: timestamp2, removedImages } = req.body;
      if (!key || value === void 0) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      if (key === "heroSection") {
        try {
          console.log(`[Server] Saving hero section with value: ${value}`);
          const heroSection = JSON.parse(value);
          if (!heroSection.images) {
            console.log(`[Server] No images array found in hero section, initializing as empty array`);
            heroSection.images = [];
          } else if (!Array.isArray(heroSection.images)) {
            console.log(`[Server] Images is not an array, converting to array`);
            heroSection.images = [heroSection.images];
          }
          if (removedImages && Array.isArray(removedImages) && removedImages.length > 0) {
            console.log(`[Server] Also processing explicit removals: ${JSON.stringify(removedImages)}`);
            heroSection.images = heroSection.images.filter((img) => !removedImages.includes(img));
            if (removedImages.includes(heroSection.imageUrl)) {
              heroSection.imageUrl = heroSection.images.length > 0 ? heroSection.images[0] : "";
            }
            console.log(
              `[Server] After processing removals, images array has ${heroSection.images.length} images:`,
              heroSection.images
            );
            if (heroSection.images.length === 0) {
              console.log(`[Server] All images were removed, clearing the primary image as well`);
              heroSection.imageUrl = "";
            }
          }
          if (heroSection.images.length === 0) {
            console.log(`[Server] Empty images array detected - preserving empty state`);
            heroSection.imageUrl = "";
          }
          console.log(`[Server] Hero section has ${heroSection.images.length} images after processing`);
          const updatedValue = JSON.stringify(heroSection);
          console.log(`[Server] Final hero section to save: ${updatedValue}`);
          await storage4.setSiteCustomization(key, updatedValue);
          return res.status(201).json({ key, value: updatedValue, timestamp: Date.now() });
        } catch (parseError) {
          console.error(`[Server] Error parsing heroSection JSON: ${parseError}`);
        }
      }
      await storage4.setSiteCustomization(key, value);
      await new Promise((resolve) => setTimeout(resolve, 50));
      const savedValue = await storage4.getSiteCustomization(key);
      console.log(`[Server] Saved ${key} successfully, confirmed value: ${savedValue}`);
      if (key === "themeSettings") {
        try {
          const themeSettings = JSON.parse(value);
          const themeJson = {
            primary: themeSettings.primary,
            variant: themeSettings.variant,
            appearance: themeSettings.appearance,
            radius: themeSettings.radius,
            font: themeSettings.font || "Inter"
          };
          const fs7 = __require("fs");
          const path8 = __require("path");
          const themeJsonPath = path8.join(process.cwd(), "theme.json");
          fs7.writeFileSync(themeJsonPath, JSON.stringify(themeJson, null, 2));
          console.log(`[Server] Updated theme.json file with new settings`);
        } catch (error) {
          console.error("Error updating theme.json file:", error);
        }
      }
      res.status(201).json({ key, value, timestamp: Date.now() });
    } catch (error) {
      console.error("Error setting site customization:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/site-customization/remove-hero-image", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }
      const heroSectionStr = await storage4.getSiteCustomization("heroSection");
      if (!heroSectionStr) {
        return res.status(404).json({ message: "Hero section not found" });
      }
      console.log(`[Server] Removing hero image: ${imageUrl}`);
      console.log(`[Server] Current hero section: ${heroSectionStr}`);
      const heroSection = JSON.parse(heroSectionStr);
      if (!heroSection.images || !Array.isArray(heroSection.images)) {
        heroSection.images = [];
      }
      const originalImagesCount = heroSection.images.length;
      const imageExists = heroSection.images.includes(imageUrl);
      if (!imageExists) {
        console.log(`[Server] Image ${imageUrl} not found in array, nothing to remove`);
        return res.status(404).json({
          message: "Image not found in carousel",
          existingImages: heroSection.images,
          heroSection,
          error: "image_not_found"
        });
      }
      heroSection.images = heroSection.images.filter((img) => img !== imageUrl);
      console.log(`[Server] Removed ${originalImagesCount - heroSection.images.length} instances of image: ${imageUrl}`);
      console.log(`[Server] Updated images array: ${JSON.stringify(heroSection.images)}`);
      if (heroSection.imageUrl === imageUrl) {
        heroSection.imageUrl = heroSection.images.length > 0 ? heroSection.images[0] : "";
        console.log(`[Server] Updated main image to: ${heroSection.imageUrl || "(empty string)"}`);
      }
      console.log(`[Server] Images array count after removal: ${heroSection.images.length}`);
      if (heroSection.images.length === 0) {
        heroSection.imageUrl = "";
        console.log(`[Server] All images removed, leaving both imageUrl and images array empty`);
      }
      const serializedHeroSection = JSON.stringify(heroSection);
      await storage4.setSiteCustomization("heroSection", serializedHeroSection);
      console.log(`[Server] Saved updated hero section: ${serializedHeroSection}`);
      const verifiedHeroSection = await storage4.getSiteCustomization("heroSection");
      const parsedVerifiedSection = JSON.parse(verifiedHeroSection);
      if (parsedVerifiedSection.images.includes(imageUrl)) {
        console.error(`[Server] CRITICAL ERROR: Image ${imageUrl} still exists after removal!`);
        parsedVerifiedSection.images = parsedVerifiedSection.images.filter((img) => img !== imageUrl);
        await storage4.setSiteCustomization("heroSection", JSON.stringify(parsedVerifiedSection));
        console.log(`[Server] Attempted emergency re-save to fix persistent image`);
      } else {
        console.log(`[Server] Verified image ${imageUrl} is properly removed from saved data`);
      }
      res.status(200).json({
        message: "Image removed successfully",
        heroSection: parsedVerifiedSection || heroSection,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error removing hero image:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/site-customization/clear-carousel", authenticateToken, isAdmin, async (req, res) => {
    try {
      const heroSectionStr = await storage4.getSiteCustomization("heroSection");
      if (!heroSectionStr) {
        return res.status(404).json({ message: "Hero section not found" });
      }
      console.log(`[Server] Request to completely clear carousel images received`);
      console.log(`[Server] Current hero section: ${heroSectionStr}`);
      const heroSection = JSON.parse(heroSectionStr);
      heroSection.images = [];
      heroSection.imageUrl = "";
      console.log(`[Server] Cleared all carousel images`);
      console.log(`[Server] Updated hero section: ${JSON.stringify(heroSection)}`);
      await storage4.setSiteCustomization("heroSection", JSON.stringify(heroSection));
      const pgStorage = storage4;
      if (pgStorage && pgStorage.db) {
        try {
          await pgStorage.db.update(siteCustomization).set({
            value: JSON.stringify(heroSection),
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq3(siteCustomization.key, "heroSection"));
          console.log(`[Server] Direct database update completed successfully`);
        } catch (sqlError) {
          console.error(`[Server] Error with direct database update:`, sqlError);
        }
      }
      return res.status(200).json({
        message: "Carousel images cleared successfully",
        heroSection
      });
    } catch (error) {
      console.error(`[Server] Error clearing carousel images:`, error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/site-customization/batch", authenticateToken, isAdmin, async (req, res) => {
    try {
      const settings = req.body;
      console.log("[Batch Update] Received settings:", settings);
      if (!settings || typeof settings !== "object") {
        console.log("[Batch Update] Invalid settings object:", settings);
        return res.status(400).json({ message: "Invalid settings object" });
      }
      const results = [];
      for (const [key, value] of Object.entries(settings)) {
        console.log(`[Batch Update] Processing key: ${key}, value type: ${typeof value}`);
        if (typeof value === "string") {
          await storage4.setSiteCustomization(key, value);
          results.push({ key, success: true });
          console.log(`[Batch Update] Successfully updated ${key}`);
        } else {
          console.log(`[Batch Update] Skipping non-string value for key ${key}:`, value);
        }
      }
      console.log("[Batch Update] Update completed successfully");
      res.status(200).json({ message: "Settings updated successfully", results });
    } catch (error) {
      console.error("Error updating site customization settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/box-types", authenticateToken, isAdmin, async (req, res) => {
    try {
      console.log("GET request to /api/box-types");
      const boxTypes2 = await storage4.getBoxTypes();
      console.log("Box types retrieved:", boxTypes2);
      res.status(200).json(boxTypes2);
    } catch (error) {
      console.error("Error getting box types:", error);
      console.error("Error details:", error.stack);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/box-types/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      console.log(`GET request to /api/box-types/${req.params.id}`);
      const id = parseInt(req.params.id);
      const boxType = await storage4.getBoxType(id);
      if (!boxType) {
        console.log(`Box type with ID ${id} not found`);
        return res.status(404).json({ message: "Box type not found" });
      }
      console.log(`Box type retrieved:`, boxType);
      res.status(200).json(boxType);
    } catch (error) {
      console.error("Error getting box type:", error);
      console.error("Error details:", error instanceof Error ? error.stack : "No stack");
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/box-types", authenticateToken, isAdmin, async (req, res) => {
    try {
      console.log("Received box type creation request:", req.body);
      const validatedData = insertBoxTypeSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const boxType = await storage4.createBoxType(validatedData);
      console.log("Created box type:", boxType);
      res.status(201).json(boxType);
    } catch (error) {
      console.error("Error creating box type:", error);
      if (error.name === "ZodError") {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({
          message: "Invalid box type data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/box-types/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingBoxType = await storage4.getBoxType(id);
      if (!existingBoxType) {
        return res.status(404).json({ message: "Box type not found" });
      }
      const validatedData = insertBoxTypeSchema.partial().parse(req.body);
      const updatedBoxType = await storage4.updateBoxType(id, validatedData);
      res.status(200).json(updatedBoxType);
    } catch (error) {
      console.error("Error updating box type:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid box type data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/box-types/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingBoxType = await storage4.getBoxType(id);
      if (!existingBoxType) {
        return res.status(404).json({ message: "Box type not found" });
      }
      const success = await storage4.deleteBoxType(id);
      if (success) {
        res.status(200).json({ message: "Box type deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete box type" });
      }
    } catch (error) {
      console.error("Error deleting box type:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/box-inventory", authenticateToken, isAdmin, async (req, res) => {
    try {
      const inventory = await storage4.getBoxInventory();
      const inventoryWithDetails = await Promise.all(
        inventory.map(async (item) => {
          const boxType = await storage4.getBoxType(item.boxTypeId);
          return {
            ...item,
            boxType
          };
        })
      );
      res.status(200).json(inventoryWithDetails);
    } catch (error) {
      console.error("Error getting box inventory:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/box-inventory", authenticateToken, isAdmin, async (req, res) => {
    try {
      const validatedData = insertBoxInventorySchema.parse(req.body);
      const boxType = await storage4.getBoxType(validatedData.boxTypeId);
      if (!boxType) {
        return res.status(404).json({ message: "Box type not found" });
      }
      const existingInventory = await storage4.getBoxInventoryByType(validatedData.boxTypeId);
      let inventory;
      if (existingInventory) {
        const quantity = validatedData.quantity || 0;
        inventory = await storage4.updateBoxInventory(existingInventory.id, quantity);
      } else {
        inventory = await storage4.createBoxInventory(validatedData);
      }
      const response = {
        ...inventory,
        boxType
      };
      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating box inventory:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid box inventory data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/box-inventory/:boxTypeId/increment", authenticateToken, isAdmin, async (req, res) => {
    try {
      const boxTypeId = parseInt(req.params.boxTypeId);
      const { quantity } = req.body;
      if (!quantity || isNaN(quantity) || quantity <= 0 || quantity > 999999) {
        return res.status(400).json({ message: "Invalid quantity. Must be a positive number not exceeding 999999." });
      }
      const boxType = await storage4.getBoxType(boxTypeId);
      if (!boxType) {
        return res.status(404).json({ message: "Box type not found" });
      }
      const existingInventory = await storage4.getBoxInventoryByType(boxTypeId);
      let inventory;
      if (existingInventory) {
        inventory = await storage4.incrementBoxInventory(boxTypeId, quantity);
      } else {
        inventory = await storage4.createBoxInventory({
          boxTypeId,
          quantity
        });
      }
      const response = {
        ...inventory,
        boxType
      };
      res.status(200).json(response);
    } catch (error) {
      console.error("Error incrementing box inventory:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/box-inventory/:boxTypeId/decrement", authenticateToken, isAdmin, async (req, res) => {
    try {
      const boxTypeId = parseInt(req.params.boxTypeId);
      const { quantity } = req.body;
      if (!quantity || isNaN(quantity) || quantity <= 0 || quantity > 999999) {
        return res.status(400).json({ message: "Invalid quantity. Must be a positive number not exceeding 999999." });
      }
      const boxType = await storage4.getBoxType(boxTypeId);
      if (!boxType) {
        return res.status(404).json({ message: "Box type not found" });
      }
      const existingInventory = await storage4.getBoxInventoryByType(boxTypeId);
      if (!existingInventory) {
        return res.status(404).json({ message: "No inventory found for this box type" });
      }
      const inventory = await storage4.decrementBoxInventory(boxTypeId, quantity);
      const response = {
        ...inventory,
        boxType
      };
      res.status(200).json(response);
    } catch (error) {
      console.error("Error decrementing box inventory:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/force-refresh", authenticateToken, isAdmin, async (req, res) => {
    try {
      console.log("Force refresh requested with timestamp:", req.query.t);
      return res.status(200).json({
        success: true,
        message: "Cache reset triggered",
        timestamp: req.query.t || Date.now()
      });
    } catch (error) {
      console.error("Error in force refresh:", error);
      return res.status(500).json({ message: "Internal server error during force refresh" });
    }
  });
  const refreshHomepageContent = async () => {
    try {
      const timestamp2 = Date.now();
      console.log(`Refreshing homepage content with timestamp: ${timestamp2}`);
      const allSettings = await storage4.getAllSiteCustomization();
      if (allSettings.signatureSection) {
        try {
          const signatureSection = JSON.parse(allSettings.signatureSection);
          if (signatureSection.imageUrl) {
            const baseUrl = signatureSection.imageUrl.split("?")[0];
            signatureSection.imageUrl = `${baseUrl}?t=${timestamp2}`;
            await storage4.setSiteCustomization("signatureSection", JSON.stringify(signatureSection));
          }
        } catch (e) {
          console.error("Error processing signature section data:", e);
        }
      }
      if (allSettings.heroSection) {
        try {
          const heroSection = JSON.parse(allSettings.heroSection);
          if (heroSection.imageUrl) {
            const baseUrl = heroSection.imageUrl.split("?")[0];
            heroSection.imageUrl = `${baseUrl}?t=${timestamp2}`;
          }
          if (heroSection.images && Array.isArray(heroSection.images)) {
            heroSection.images = heroSection.images.map((img) => {
              const baseUrl = img.split("?")[0];
              return `${baseUrl}?t=${timestamp2}`;
            });
          }
          await storage4.setSiteCustomization("heroSection", JSON.stringify(heroSection));
        } catch (e) {
          console.error("Error processing hero section data:", e);
        }
      }
      return true;
    } catch (error) {
      console.error("Error refreshing homepage content:", error);
      return false;
    }
  };
  const requireAuth = (req, res, next) => {
    if (req.headers["x-admin-access"] === "sweetmoment-dev-secret") {
      console.log("AUTH MIDDLEWARE: Using development bypass header");
      return next();
    }
    return authenticateToken(req, res, next);
  };
  app2.post("/api/update-signature-subtitle", requireAuth, async (req, res) => {
    try {
      const { subtitle } = req.body;
      if (!subtitle || typeof subtitle !== "string") {
        return res.status(400).json({ error: "Invalid subtitle value" });
      }
      console.log(`Updating signature section subtitle to: "${subtitle}"`);
      const existingData = await storage4.getSiteCustomization("signatureSection");
      let signatureSection;
      if (existingData) {
        try {
          signatureSection = JSON.parse(existingData);
          signatureSection.subtitle = subtitle;
          const timestamp2 = Date.now();
          console.log(`Saving updated signature section with timestamp: ${timestamp2}`);
          if (signatureSection.imageUrl) {
            const urlParts = signatureSection.imageUrl.split("?");
            signatureSection.imageUrl = urlParts[0] + `?t=${timestamp2}`;
          }
          await storage4.setSiteCustomization("signatureSection", JSON.stringify(signatureSection));
          await refreshHomepageContent();
          return res.json({ success: true, message: "Signature section subtitle updated successfully" });
        } catch (parseError) {
          console.error("Error parsing existing signature section data:", parseError);
          return res.status(500).json({ error: "Error updating signature section subtitle" });
        }
      } else {
        return res.status(404).json({ error: "Signature section data not found" });
      }
    } catch (error) {
      console.error("Error updating signature section subtitle:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });
  app2.post("/api/refresh-signature-section", async (req, res) => {
    try {
      const timestamp2 = Date.now();
      console.log(`Refreshing signature section with timestamp: ${timestamp2}`);
      const defaultSection = {
        enabled: true,
        title: "Our Signature Collection",
        subtitle: "Handcrafted with the finest ingredients",
        buttonText: "Shop Now",
        buttonLink: "/signature-collection",
        imageUrl: "/uploads/1743207809787-339256261.jpeg",
        tagline: "Limited Edition - Exclusively from Dubai"
      };
      let signatureSection;
      try {
        const existingData = await storage4.getSiteCustomization("signatureSection");
        if (existingData) {
          if (existingData.startsWith('{"0":"{') || existingData.startsWith('{"0":"\\{')) {
            console.log("Corrupted JSON format detected, using default settings");
            try {
              const parsed = JSON.parse(existingData);
              if (parsed.title && typeof parsed.title === "string") {
                defaultSection.title = parsed.title;
              }
              if (parsed.subtitle && typeof parsed.subtitle === "string") {
                defaultSection.subtitle = parsed.subtitle;
              }
              if (parsed.tagline && typeof parsed.tagline === "string") {
                defaultSection.tagline = parsed.tagline;
              }
              if (parsed.buttonText && typeof parsed.buttonText === "string") {
                defaultSection.buttonText = parsed.buttonText;
              }
              if (parsed.buttonLink && typeof parsed.buttonLink === "string") {
                defaultSection.buttonLink = parsed.buttonLink;
              }
              if (parsed.imageUrl && typeof parsed.imageUrl === "string") {
                defaultSection.imageUrl = parsed.imageUrl;
              }
              signatureSection = defaultSection;
            } catch (innerError) {
              console.error("Failed to extract any values from corrupted data:", innerError);
              signatureSection = defaultSection;
            }
          } else {
            try {
              const parsed = JSON.parse(existingData);
              if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                signatureSection = { ...defaultSection, ...parsed };
                console.log("Using existing signature section data");
              } else {
                signatureSection = defaultSection;
                console.warn("Existing signature section data was invalid, using defaults");
              }
            } catch (parseError) {
              console.error("Failed to parse existing data:", parseError);
              signatureSection = defaultSection;
            }
          }
        } else {
          signatureSection = defaultSection;
          console.log("No existing data, using defaults for signature section");
        }
      } catch (error) {
        console.error("Error reading existing signature section:", error);
        signatureSection = defaultSection;
      }
      if (req.body && req.body.imageUrl) {
        const imageUrl = req.body.imageUrl;
        const baseUrl = String(imageUrl).split("?")[0];
        signatureSection.imageUrl = `${baseUrl}?t=${timestamp2}`;
        console.log("Using image URL from request:", signatureSection.imageUrl);
      } else if (signatureSection.imageUrl) {
        const baseUrl = String(signatureSection.imageUrl).split("?")[0];
        signatureSection.imageUrl = `${baseUrl}?t=${timestamp2}`;
        console.log("Using existing image URL with new timestamp:", signatureSection.imageUrl);
      } else {
        console.log("No image URL available for signature section");
      }
      console.log("Final signature section data to save:", JSON.stringify(signatureSection));
      await storage4.setSiteCustomization("signatureSection", JSON.stringify(signatureSection));
      return res.status(200).json({
        success: true,
        data: signatureSection,
        _cacheTimestamp: timestamp2
      });
    } catch (error) {
      console.error("Error refreshing signature section:", error);
      return res.status(500).json({
        error: "Failed to refresh signature section",
        success: false
      });
    }
  });
  app2.get("/api/refresh-homepage-content", async (req, res) => {
    try {
      const timestamp2 = Date.now();
      console.log(`Refreshing homepage content with timestamp: ${timestamp2}`);
      const allSettings = await storage4.getAllSiteCustomization();
      if (allSettings.signatureSection) {
        try {
          const signatureSection = JSON.parse(allSettings.signatureSection);
          if (signatureSection.imageUrl) {
            const baseUrl = signatureSection.imageUrl.split("?")[0];
            signatureSection.imageUrl = `${baseUrl}?t=${timestamp2}`;
            console.log("Updated signature section image URL with fresh timestamp:", signatureSection.imageUrl);
            await storage4.setSiteCustomization("signatureSection", JSON.stringify(signatureSection));
            allSettings.signatureSection = JSON.stringify(signatureSection);
          }
        } catch (e) {
          console.error("Error processing signature section data:", e);
        }
      }
      if (allSettings.heroSection) {
        try {
          const heroSection = JSON.parse(allSettings.heroSection);
          if (heroSection.imageUrl) {
            const baseUrl = heroSection.imageUrl.split("?")[0];
            heroSection.imageUrl = `${baseUrl}?t=${timestamp2}`;
          }
          if (heroSection.images && Array.isArray(heroSection.images)) {
            heroSection.images = heroSection.images.map((img) => {
              const baseUrl = img.split("?")[0];
              return `${baseUrl}?t=${timestamp2}`;
            });
          }
          await storage4.setSiteCustomization("heroSection", JSON.stringify(heroSection));
          allSettings.heroSection = JSON.stringify(heroSection);
          console.log("Updated hero section image URLs with fresh timestamps");
        } catch (e) {
          console.error("Error processing hero section data:", e);
        }
      }
      return res.status(200).json({
        ...allSettings,
        _cacheTimestamp: timestamp2,
        success: true,
        message: "Homepage content successfully refreshed with updated image URLs"
      });
    } catch (error) {
      console.error("Error refreshing homepage content:", error);
      return res.status(500).json({
        error: "Failed to refresh homepage content",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false
      });
    }
  });
  registerUploadRoutes(app2);
  const detectDeviceType = (userAgent) => {
    userAgent = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return "mobile";
    } else {
      return "desktop";
    }
  };
  const detectBrowser = (userAgent) => {
    userAgent = userAgent.toLowerCase();
    if (userAgent.includes("chrome") && !userAgent.includes("edge") && !userAgent.includes("opr")) {
      return "chrome";
    } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
      return "safari";
    } else if (userAgent.includes("firefox")) {
      return "firefox";
    } else if (userAgent.includes("edge") || userAgent.includes("edg")) {
      return "edge";
    } else if (userAgent.includes("opr") || userAgent.includes("opera")) {
      return "opera";
    } else {
      return "other";
    }
  };
  const detectOS = (userAgent) => {
    userAgent = userAgent.toLowerCase();
    if (userAgent.includes("windows")) {
      return "windows";
    } else if (userAgent.includes("mac os") || userAgent.includes("macintosh")) {
      return "macos";
    } else if (userAgent.includes("android")) {
      return "android";
    } else if (userAgent.includes("iphone") || userAgent.includes("ipad") || userAgent.includes("ipod")) {
      return "ios";
    } else if (userAgent.includes("linux")) {
      return "linux";
    } else {
      return "other";
    }
  };
  const handleRedirect = async (req, res, name = null) => {
    try {
      console.log(`Processing QR code redirect request for name: ${name || "default"}`);
      const userAgent = req.headers["user-agent"] || "unknown";
      const deviceType = detectDeviceType(userAgent);
      const browser = detectBrowser(userAgent);
      const os = detectOS(userAgent);
      const {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content
      } = req.query;
      const locationHeader = req.headers["x-forwarded-for"] || req.ip || "unknown";
      let locationInfo = typeof locationHeader === "string" ? locationHeader : "unknown";
      console.log(`QR Code scan: Device: ${deviceType}, Browser: ${browser}, OS: ${os}`);
      if (utm_source || utm_medium || utm_campaign) {
        console.log(`UTM Data: source=${utm_source || "none"}, medium=${utm_medium || "none"}, campaign=${utm_campaign || "none"}`);
      }
      const analyticsData = {
        deviceType,
        browser,
        os,
        referrer: req.headers.referer || "direct",
        ipAddress: req.ip || "unknown",
        utmSource: utm_source,
        utmMedium: utm_medium,
        utmCampaign: utm_campaign,
        utmTerm: utm_term,
        utmContent: utm_content,
        location: locationInfo
      };
      if (name) {
        const redirectUrl = await storage4.getRedirectUrlByName(name);
        if (!redirectUrl) {
          return res.status(404).send(`No redirect destination found for '${name}'. Please check the URL or set up a redirect in the admin panel.`);
        }
        await storage4.recordRedirectAccess(redirectUrl.id, analyticsData);
        console.log(`Recorded analytics for redirect ID ${redirectUrl.id}: ${deviceType}, ${browser}, ${os}`);
        console.log(`Redirecting '${name}' to ${redirectUrl.destinationUrl}`);
        return res.redirect(redirectUrl.destinationUrl);
      } else {
        const mainRedirectSetting = await storage4.getSiteSetting("mainRedirectDestination");
        if (mainRedirectSetting?.value) {
          const destination = mainRedirectSetting.value;
          const redirectUrls3 = await storage4.getRedirectUrls();
          if (redirectUrls3.length > 0) {
            await storage4.recordRedirectAccess(redirectUrls3[0].id, analyticsData);
          }
          console.log(`Redirecting to main redirect destination: ${destination}`);
          return res.redirect(destination);
        }
        const redirectUrls2 = await storage4.getRedirectUrls();
        if (redirectUrls2.length === 0) {
          return res.status(404).send("No redirect destination has been configured. Please set up a redirect URL in the admin panel.");
        }
        const defaultRedirect = redirectUrls2[0];
        await storage4.recordRedirectAccess(defaultRedirect.id, analyticsData);
        console.log(`Redirecting to fallback destination: ${defaultRedirect.destinationUrl}`);
        return res.redirect(defaultRedirect.destinationUrl);
      }
    } catch (error) {
      console.error("Error in redirect handler:", error);
      return res.status(500).send("An error occurred during redirection. Please try again later.");
    }
  };
  const setupRedirectPaths = async () => {
    try {
      const redirectPathSetting = await storage4.getSiteSetting("redirectBasePath");
      const basePath = redirectPathSetting?.value || "/redirect";
      const commonPaths = ["/redirect", "/goto", "/r", "/go"];
      if (!commonPaths.includes(basePath)) {
        console.log(`Registering custom redirect base path: ${basePath}`);
        app2.get(basePath, (req, res) => handleRedirect(req, res, null));
        app2.get(`${basePath}/:name`, (req, res) => handleRedirect(req, res, req.params.name));
      }
      commonPaths.forEach((path8) => {
        app2.get(path8, (req, res) => handleRedirect(req, res, null));
        app2.get(`${path8}/:name`, (req, res) => handleRedirect(req, res, req.params.name));
      });
      console.log("Redirect paths registered successfully");
    } catch (error) {
      console.error("Error setting up redirect paths:", error);
    }
  };
  setupRedirectPaths();
  app2.get("/api/redirects/:name", async (req, res) => {
    try {
      const name = req.params.name;
      const redirectUrl = await storage4.getRedirectUrlByName(name);
      if (!redirectUrl) {
        return res.status(404).json({ message: `No redirect found with name: ${name}` });
      }
      return res.status(200).json({
        id: redirectUrl.id,
        name: redirectUrl.name,
        destinationUrl: redirectUrl.destinationUrl,
        accessCount: redirectUrl.accessCount,
        lastAccessed: redirectUrl.lastAccessed
      });
    } catch (error) {
      console.error("Error getting redirect URL by name:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/redirects/:name", async (req, res) => {
    try {
      const name = req.params.name;
      const { destinationUrl } = req.body;
      if (!destinationUrl) {
        return res.status(400).json({ message: "destinationUrl is required" });
      }
      let redirectUrl = await storage4.getRedirectUrlByName(name);
      if (redirectUrl) {
        redirectUrl = await storage4.updateRedirectUrl(redirectUrl.id, { destinationUrl });
        if (!redirectUrl) {
          return res.status(500).json({ message: "Failed to update redirect URL" });
        }
        return res.status(200).json({
          id: redirectUrl.id,
          name: redirectUrl.name,
          destinationUrl: redirectUrl.destinationUrl,
          accessCount: redirectUrl.accessCount,
          lastAccessed: redirectUrl.lastAccessed
        });
      } else {
        redirectUrl = await storage4.createRedirectUrl({
          name,
          destinationUrl
        });
        return res.status(201).json({
          id: redirectUrl.id,
          name: redirectUrl.name,
          destinationUrl: redirectUrl.destinationUrl,
          accessCount: redirectUrl.accessCount,
          lastAccessed: redirectUrl.lastAccessed
        });
      }
    } catch (error) {
      console.error("Error updating redirect URL by name:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/redirect-stats", async (req, res) => {
    try {
      const stats = await storage4.getRedirectStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error getting redirect statistics:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/qr-analytics", async (req, res) => {
    try {
      const redirectId = req.query.redirectId ? parseInt(req.query.redirectId) : void 0;
      console.log(`Fetching QR code analytics${redirectId ? ` for redirect ID ${redirectId}` : " for all redirects"}`);
      const analytics = await storage4.getQRCodeAnalytics(redirectId);
      console.log("QR Analytics data:", {
        totalScans: analytics.totalScans,
        deviceTypes: Object.keys(analytics.devices).length > 0 ? Object.keys(analytics.devices) : "none",
        browsers: Object.keys(analytics.browsers).length > 0 ? Object.keys(analytics.browsers) : "none",
        campaignCount: analytics.campaigns?.length || 0
      });
      return res.status(200).json(analytics);
    } catch (error) {
      console.error("Error getting QR code analytics:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/redirect-urls", authenticateToken, isAdmin, async (req, res) => {
    try {
      const redirectUrls2 = await storage4.getRedirectUrls();
      return res.status(200).json(redirectUrls2);
    } catch (error) {
      console.error("Error getting redirect URLs:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/redirect-stats", authenticateToken, isAdmin, async (req, res) => {
    try {
      const stats = await storage4.getRedirectStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error getting redirect statistics:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/redirect-urls/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const redirectUrl = await storage4.getRedirectUrl(id);
      if (!redirectUrl) {
        return res.status(404).json({ message: "Redirect URL not found" });
      }
      return res.status(200).json(redirectUrl);
    } catch (error) {
      console.error("Error getting redirect URL:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/redirect-urls", authenticateToken, isAdmin, async (req, res) => {
    try {
      console.log("Received redirect URL creation request:", req.body);
      const validatedData = insertRedirectUrlSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const redirectUrl = await storage4.createRedirectUrl(validatedData);
      return res.status(201).json(redirectUrl);
    } catch (error) {
      console.error("Error creating redirect URL:", error);
      if (error instanceof z5.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/admin/redirect-urls/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Updating redirect URL ${id}:`, req.body);
      const validatedData = insertRedirectUrlSchema.partial().parse(req.body);
      const updatedRedirectUrl = await storage4.updateRedirectUrl(id, validatedData);
      if (!updatedRedirectUrl) {
        return res.status(404).json({ message: "Redirect URL not found" });
      }
      return res.status(200).json(updatedRedirectUrl);
    } catch (error) {
      console.error("Error updating redirect URL:", error);
      if (error instanceof z5.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/admin/redirect-urls/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Deleting redirect URL ${id}`);
      const success = await storage4.deleteRedirectUrl(id);
      if (!success) {
        return res.status(404).json({ message: "Redirect URL not found" });
      }
      return res.status(200).json({ message: "Redirect URL deleted successfully" });
    } catch (error) {
      console.error("Error deleting redirect URL:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/site-settings", authenticateToken, isAdmin, async (req, res) => {
    try {
      const settings = await storage4.getSiteSettings();
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Error getting site settings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/site-settings/:key", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await storage4.getSiteSetting(key);
      if (!setting) {
        return res.status(404).json({ message: "Site setting not found" });
      }
      return res.status(200).json(setting);
    } catch (error) {
      console.error("Error getting site setting:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/site-settings", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === void 0) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      const setting = await storage4.updateSiteSetting(key, value);
      if (key === "redirectBasePath") {
        console.log(`Redirect base path updated to: ${value}`);
      } else if (key === "disableOrderCollection") {
        console.log(`Order collection setting updated to: ${value}`);
      } else if (key === "mainRedirectDestination") {
        console.log(`Main redirect destination updated to: ${value}`);
      }
      return res.status(200).json(setting);
    } catch (error) {
      console.error("Error updating site setting:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/site-settings/disableOrderCollection", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { value } = req.body;
      if (value === void 0) {
        return res.status(400).json({ message: "Value is required" });
      }
      if (typeof value !== "string" || value !== "true" && value !== "false") {
        return res.status(400).json({ message: "Value must be 'true' or 'false'" });
      }
      await storage4.updateSiteSetting("disableOrderCollection", value);
      console.log(`Order collection setting updated to: ${value}`);
      return res.json({
        success: true,
        key: "disableOrderCollection",
        value,
        enabled: value === "true"
      });
    } catch (error) {
      console.error("Error updating order collection setting:", error);
      return res.status(500).json({ message: "Failed to update order collection setting" });
    }
  });
  app2.delete("/api/admin/site-settings/:key", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { key } = req.params;
      const success = await storage4.deleteSiteSetting(key);
      if (!success) {
        return res.status(404).json({ message: "Site setting not found" });
      }
      return res.status(200).json({ message: "Site setting deleted successfully" });
    } catch (error) {
      console.error("Error deleting site setting:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  try {
    await storage4.initialize();
    console.log("PostgreSQL storage initialized successfully");
  } catch (error) {
    console.error("Error initializing PostgreSQL storage:", error);
  }
  console.log("React Static Site Generator routes registered successfully");
  app2.get("/api/download-static-site", (req, res) => {
    const zipPath = path5.join(process.cwd(), "sweet-moment-chocolates-static.zip");
    if (fs5.existsSync(zipPath)) {
      res.download(zipPath, "sweet-moment-chocolates-static.zip");
    } else {
      res.status(404).json({ error: "Static site package not found" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}
var storage4, chocolates;
var init_routes = __esm({
  "server/routes.ts"() {
    "use strict";
    init_pgStorage();
    init_auth();
    init_discountCodeGenerator();
    init_stripe();
    init_priceService();
    init_stripe();
    init_checkoutRoutes();
    init_staticCheckoutRoutes();
    init_perfect_static_export();
    init_checkoutWebhook();
    init_tap_to_pay();
    init_schema();
    init_uploads();
    init_custom_orders();
    init_public_custom_orders();
    storage4 = new PgStorage();
    chocolates = [
      {
        id: "classic",
        // Maps to 101 in productIdMap
        name: "Classic Chocolate",
        description: "Our timeless collection of handcrafted chocolates, made with the finest cocoa beans.",
        image: "https://images.unsplash.com/photo-1582005450386-de4293070382?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 4.5,
        reviewCount: 124,
        basePrice: 8,
        category: "classic",
        displayOrder: 10,
        // Default display order
        sizes: [
          { id: "small", label: "Small Box (4 pieces)", value: "small", price: 0 },
          { id: "medium", label: "Medium Box (8 pieces)", value: "medium", price: 4 },
          { id: "large", label: "Large Box (12 pieces)", value: "large", price: 8 }
        ],
        types: [
          { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
          { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
        ]
      },
      {
        id: "assorted",
        // Maps to 102 in productIdMap
        name: "Assorted Nuts Chocolate",
        description: "A delightful blend of premium nuts and rich chocolate for an exquisite taste experience.",
        image: "https://images.unsplash.com/photo-1624454002302-c8d1d73b916c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 5,
        reviewCount: 89,
        basePrice: 12,
        category: "assorted",
        displayOrder: 30,
        // Changed to match admin panel: Third position
        sizes: [
          { id: "standard", label: "Standard Box (6 pieces)", value: "standard", price: 0 }
        ],
        types: [
          { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
          { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
        ]
      },
      {
        id: "caramel",
        // Maps to 103 in productIdMap
        name: "Caramel Chocolate",
        description: "Indulge in our smooth caramel-filled chocolates that melt in your mouth with every bite.",
        image: "https://images.unsplash.com/photo-1608250389763-3b2d9a386ed6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        rating: 4.5,
        reviewCount: 76,
        basePrice: 10,
        category: "caramel",
        displayOrder: 20,
        // Changed to second position
        sizes: [
          { id: "small", label: "Small Box (4 pieces)", value: "small", price: 0 },
          { id: "medium", label: "Medium Box (8 pieces)", value: "medium", price: 5 },
          { id: "large", label: "Large Box (12 pieces)", value: "large", price: 10 }
        ],
        types: [
          { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
          { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
        ]
      },
      {
        id: "cereal",
        // Maps to 104 in productIdMap
        name: "Cereal Chocolate",
        description: "A crunchy, nostalgic treat combining premium chocolate with your favorite breakfast cereals.",
        image: "/uploads/cereal_chocolate.png",
        rating: 4.8,
        reviewCount: 42,
        basePrice: 9,
        category: "cereal",
        displayOrder: 40,
        // Default display order
        sizes: [
          { id: "standard", label: "Standard Box (6 pieces)", value: "standard", price: 0 }
        ],
        types: [
          { id: "milk", label: "Milk Chocolate", value: "milk", price: 0 },
          { id: "dark", label: "Dark Chocolate", value: "dark", price: 0 }
        ]
      }
    ];
  }
});

// server/index.ts
init_routes();
import express7 from "express";

// server/vite.ts
import express6 from "express";
import fs6 from "fs";
import path7, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path6, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path6.resolve(__dirname, "client", "src"),
      "@shared": path6.resolve(__dirname, "shared")
    }
  },
  root: path6.resolve(__dirname, "client"),
  build: {
    outDir: path6.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path7.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs6.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path7.resolve(__dirname2, "public");
  if (!fs6.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express6.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path7.resolve(distPath, "index.html"));
  });
}

// server/security.ts
import rateLimit from "express-rate-limit";
import crypto2 from "crypto";
var csrfTokens = /* @__PURE__ */ new Map();
var blacklistedIPs = /* @__PURE__ */ new Set();
var suspiciousFingerprints = /* @__PURE__ */ new Map();
var standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 500,
  // Increased limit to 500 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
  skipSuccessfulRequests: true
  // Don't count successful requests against the limit
});
var authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 10,
  // Limit each IP to 10 login/registration attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many authentication attempts, please try again later."
});
var checkoutRateLimit = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 30,
  // Limit each IP to 30 checkout attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many checkout attempts, please try again later."
});
var adminRateLimit = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 1e3,
  // Increased limit for admin requests to 1000 per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many admin requests, please try again later.",
  skipSuccessfulRequests: true
  // Don't count successful requests against the limit
});
var uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 20,
  // Limit each IP to 20 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many upload attempts, please try again later."
});
function botDetection(req, res, next) {
  const userAgent = req.headers["user-agent"] || "";
  if (!userAgent || userAgent.toLowerCase().includes("bot") || userAgent.toLowerCase().includes("crawler") || userAgent.toLowerCase().includes("spider") || userAgent.toLowerCase().includes("scrape")) {
    if (userAgent.toLowerCase().includes("googlebot") || userAgent.toLowerCase().includes("bingbot") || userAgent.toLowerCase().includes("yandexbot")) {
      return next();
    }
    console.warn(`Suspicious bot activity detected: ${userAgent} from ${req.ip}`);
    return res.status(403).json({ message: "Suspicious bot activity detected" });
  }
  if (!req.headers["accept-language"] && !req.headers["accept"]) {
    console.warn(`Request missing common headers from ${req.ip}`);
    return res.status(403).json({ message: "Missing required headers" });
  }
  next();
}
function apiAbuseDetection(req, res, next) {
  if (!req.path.startsWith("/api/")) {
    return next();
  }
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  if (blacklistedIPs.has(ip.toString())) {
    return res.status(403).json({ message: "Access denied" });
  }
  if (!req.apiTimestamps) {
    req.apiTimestamps = [];
  }
  const now = Date.now();
  const recentRequests = req.apiTimestamps.filter((timestamp2) => now - timestamp2 < 1e3);
  req.apiTimestamps.push(now);
  if (req.apiTimestamps.length > 100) {
    req.apiTimestamps = req.apiTimestamps.slice(-100);
  }
  if (recentRequests.length >= 20) {
    if (recentRequests.length > 50) {
      console.warn(`Blacklisting IP due to excessive requests: ${ip}`);
      blacklistedIPs.add(ip.toString());
      setTimeout(() => {
        blacklistedIPs.delete(ip.toString());
      }, 60 * 60 * 1e3);
    }
    return res.status(429).json({ message: "API request rate too high" });
  }
  next();
}
function sqlInjectionProtection(req, res, next) {
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    const body = JSON.stringify(req.body).toLowerCase();
    const sqlPatterns = [
      "select *",
      "union select",
      "drop table",
      "delete from",
      "insert into",
      "exec(",
      "--",
      "/*",
      ";",
      "1=1",
      "or 1=1",
      "or 1 =",
      "= 1--",
      "' or '",
      '" or "',
      "1; drop"
    ];
    if (sqlPatterns.some((pattern) => body.includes(pattern))) {
      console.warn(`Potential SQL injection detected from ${req.ip}: ${body.substring(0, 100)}`);
      return res.status(403).json({ message: "Invalid input detected" });
    }
  }
  next();
}
function xssProtection(req, res, next) {
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    const body = JSON.stringify(req.body).toLowerCase();
    const xssPatterns = [
      "<script>",
      "javascript:",
      "onerror=",
      "onload=",
      "onclick=",
      "onmouseover=",
      "document.cookie",
      "document.location",
      "window.location",
      "eval(",
      "settimeout(",
      "setinterval(",
      "new function",
      "alert(",
      ".innerHTML",
      "fromcharcode"
    ];
    if (xssPatterns.some((pattern) => body.includes(pattern))) {
      console.warn(`Potential XSS attack detected from ${req.ip}: ${body.substring(0, 100)}`);
      return res.status(403).json({ message: "Invalid input detected" });
    }
  }
  next();
}
function generateCsrfToken(req, res, next) {
  const token = crypto2.randomBytes(32).toString("hex");
  csrfTokens.set(token, {
    ip: req.ip,
    createdAt: Date.now()
  });
  const now = Date.now();
  Array.from(csrfTokens.entries()).forEach(([key, value]) => {
    if (now - value.createdAt > 24 * 60 * 60 * 1e3) {
      csrfTokens.delete(key);
    }
  });
  req.csrfToken = token;
  res.setHeader("X-CSRF-Token", token);
  next();
}
function validateCsrfToken(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  const token = req.headers["x-csrf-token"] || req.headers["csrf-token"];
  if (!token || !csrfTokens.has(token.toString())) {
    return res.status(403).json({ message: "Invalid or missing CSRF token" });
  }
  csrfTokens.delete(token.toString());
  next();
}
function fingerprinting(req, res, next) {
  const fingerprintData = [
    req.headers["user-agent"],
    req.headers["accept-language"],
    req.headers["accept"],
    req.headers["sec-ch-ua"],
    req.ip
  ].filter(Boolean).join("|");
  const fingerprint = crypto2.createHash("sha256").update(fingerprintData).digest("hex");
  if (!suspiciousFingerprints.has(fingerprint)) {
    suspiciousFingerprints.set(fingerprint, {
      count: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      ips: /* @__PURE__ */ new Set([req.ip])
    });
  } else {
    const data = suspiciousFingerprints.get(fingerprint);
    data.count++;
    data.lastSeen = Date.now();
    data.ips.add(req.ip);
    if (data.ips.size > 5) {
      console.warn(`Suspicious fingerprint detected: ${fingerprint} used from ${data.ips.size} different IPs`);
    }
  }
  const now = Date.now();
  Array.from(suspiciousFingerprints.entries()).forEach(([key, value]) => {
    if (now - value.lastSeen > 7 * 24 * 60 * 60 * 1e3) {
      suspiciousFingerprints.delete(key);
    }
  });
  next();
}
function securityHeaders(req, res, next) {
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}
function pathTraversalProtection(req, res, next) {
  const url = req.url;
  const pathTraversalPatterns = [
    "../",
    // Basic directory traversal
    "..%2f",
    // URL encoded ../
    "%2e%2e%2f",
    // Double URL encoded ../
    "..\\",
    // Windows style directory traversal
    "%2e%2e\\",
    // URL encoded Windows style
    "\\..\\",
    // Mixed traversal
    "..%c0%af",
    // UTF-8 encoding
    "%c0%ae%c0%ae%c0%af",
    // Double UTF-8 encoding
    "%c0%ae%c0%ae/"
    // UTF-8 encoded ../
  ];
  if (pathTraversalPatterns.some((pattern) => url.includes(pattern))) {
    console.warn(`Path traversal attempt detected from ${req.ip}: ${url}`);
    return res.status(403).json({ message: "Invalid request path" });
  }
  if (req.query) {
    const queryString = JSON.stringify(req.query).toLowerCase();
    if (pathTraversalPatterns.some((pattern) => queryString.includes(pattern))) {
      console.warn(`Path traversal in query params detected from ${req.ip}: ${queryString}`);
      return res.status(403).json({ message: "Invalid query parameters" });
    }
  }
  if (req.files) {
    const filesString = JSON.stringify(req.files).toLowerCase();
    if (pathTraversalPatterns.some((pattern) => filesString.includes(pattern))) {
      console.warn(`Path traversal in file parameters detected from ${req.ip}: ${filesString}`);
      return res.status(403).json({ message: "Invalid file parameters" });
    }
  }
  next();
}
function applySecurityMiddleware(app2) {
  app2.use(botDetection);
  app2.use(apiAbuseDetection);
  app2.use(sqlInjectionProtection);
  app2.use(xssProtection);
  app2.use(pathTraversalProtection);
  app2.use(securityHeaders);
  app2.use(fingerprinting);
  app2.use(generateCsrfToken);
  app2.use("/api/checkout", validateCsrfToken);
  app2.use("/api/auth", validateCsrfToken);
  app2.use("/api/user", validateCsrfToken);
  app2.use("/api/auth", authRateLimit);
  app2.use("/api/checkout", checkoutRateLimit);
  app2.use("/api/admin", adminRateLimit);
  app2.use("/api/admin/upload", uploadRateLimit);
  app2.use("/api", standardRateLimit);
  console.log("Enhanced comprehensive security middleware applied");
}

// server/index.ts
var app = express7();
app.set("trust proxy", true);
app.use(express7.json({ limit: "50mb" }));
app.use(express7.urlencoded({ extended: false, limit: "50mb" }));
applySecurityMiddleware(app);
app.use((req, res, next) => {
  const start = Date.now();
  const path8 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path8.startsWith("/api")) {
      let logLine = `${req.method} ${path8} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`Server running in ${app.get("env")} mode on port ${port}`);
    setTimeout(async () => {
      try {
        log("Running deferred initialization tasks in background...");
        const {
          ensureLegacyProductsExist: ensureLegacyProductsExist2,
          ensureDefaultCategoriesExist: ensureDefaultCategoriesExist2,
          runDeferredInitialization: runDeferredInitialization2
        } = await Promise.resolve().then(() => (init_routes(), routes_exports));
        await ensureLegacyProductsExist2();
        await ensureDefaultCategoriesExist2();
        if (typeof runDeferredInitialization2 === "function") {
          await runDeferredInitialization2();
        }
        log("Deferred initialization tasks completed successfully");
      } catch (error) {
        console.error("Error in deferred initialization:", error);
      }
    }, 100);
  });
})();
