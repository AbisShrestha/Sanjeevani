/**
 * DATABASE SEEDER
 * Run: node src/seed.js
 * 
 * Populates the database with:
 * 1. Default Categories (Herbs, Capsule, Tablet, Oil, Syrup, Powder)
 * 2. Sample Ayurvedic Medicines (10 products with full details)
 * 3. Default Admin Account (admin@sanjeevani.com / admin123)
 * 
 * Safe to run multiple times (uses ON CONFLICT DO NOTHING)
 */

const pool = require('./config/db');
const bcrypt = require('bcrypt');

// ═══════════════════════════════════════════
// 1. CATEGORIES
// ═══════════════════════════════════════════
const CATEGORIES = [
  { name: 'Herbs', description: 'Natural Ayurvedic herbs and plant-based remedies' },
  { name: 'Capsule', description: 'Herbal capsules for easy consumption' },
  { name: 'Tablet', description: 'Compressed herbal tablets' },
  { name: 'Oil', description: 'Therapeutic and massage oils' },
  { name: 'Syrup', description: 'Herbal syrups and liquid formulations' },
  { name: 'Powder', description: 'Churna and herbal powder formulations' },
];

// ═══════════════════════════════════════════
// 2. MEDICINES
// ═══════════════════════════════════════════
const MEDICINES = [
  {
    name: 'Ashwagandha Capsules',
    category: 'Capsule',
    description: 'Premium Ashwagandha (Withania somnifera) root extract capsules. Known as Indian Ginseng, it is one of the most important herbs in Ayurveda for strength and vitality.',
    dosage: '1-2 capsules twice daily with warm milk or water after meals',
    benefits: 'Reduces stress and anxiety, improves sleep quality, boosts energy and stamina, supports muscle strength, enhances cognitive function',
    usageInstructions: 'Take with warm milk before bedtime for best results. Continue for at least 3 months for optimal benefits.',
    precautions: 'Not recommended during pregnancy. Consult a doctor if you have thyroid conditions or are on sedative medications.',
    price: 450,
    stock: 100,
  },
  {
    name: 'Triphala Powder',
    category: 'Powder',
    description: 'A classic Ayurvedic formulation combining three powerful fruits: Amla, Bibhitaki, and Haritaki. Used for centuries as a natural digestive cleanser.',
    dosage: '1 teaspoon (3-5g) with warm water at bedtime',
    benefits: 'Promotes healthy digestion, natural detoxification, supports eye health, rich in Vitamin C and antioxidants',
    usageInstructions: 'Mix 1 teaspoon in a glass of warm water and drink before sleep. Can also be taken with honey.',
    precautions: 'Avoid during pregnancy and breastfeeding. May cause loose stools initially.',
    price: 250,
    stock: 150,
  },
  {
    name: 'Brahmi Tablets',
    category: 'Tablet',
    description: 'Pure Brahmi (Bacopa monnieri) extract tablets. A renowned brain tonic in Ayurvedic medicine used to enhance memory and concentration.',
    dosage: '2 tablets twice daily after meals',
    benefits: 'Enhances memory and concentration, reduces mental fatigue, promotes calmness, supports nervous system health',
    usageInstructions: 'Take consistently for 2-3 months for noticeable cognitive improvement. Best taken after breakfast and dinner.',
    precautions: 'May cause mild stomach upset in some individuals. Start with a lower dose.',
    price: 350,
    stock: 80,
  },
  {
    name: 'Kumkumadi Tailam (Face Oil)',
    category: 'Oil',
    description: 'Precious Ayurvedic face oil made with Saffron (Kumkuma) and 16 other herbs. A legendary beauty elixir for radiant, glowing skin.',
    dosage: '3-5 drops on face at night',
    benefits: 'Brightens skin complexion, reduces dark spots and pigmentation, anti-aging properties, nourishes and moisturizes skin',
    usageInstructions: 'Apply 3-5 drops on clean face at night. Gently massage in upward circular motions. Leave overnight.',
    precautions: 'Perform a patch test before first use. For external use only. Avoid contact with eyes.',
    price: 850,
    stock: 50,
  },
  {
    name: 'Chyawanprash',
    category: 'Herbs',
    description: 'Traditional Ayurvedic immunity booster made with Amla and over 40 herbs. A time-tested formulation for overall health and wellness.',
    dosage: '1-2 teaspoons daily with warm milk',
    benefits: 'Boosts immunity and stamina, rich in Vitamin C, improves digestion, enhances respiratory health, anti-aging benefits',
    usageInstructions: 'Take 1 teaspoon in the morning with warm milk. Children above 5 years can take half a teaspoon.',
    precautions: 'Diabetic patients should consult their doctor due to sugar content. Store in a cool, dry place.',
    price: 380,
    stock: 200,
  },
  {
    name: 'Mahanarayan Oil',
    category: 'Oil',
    description: 'Traditional Ayurvedic pain relief oil made from a blend of sesame oil and 30+ medicinal herbs. Used for joint pain, muscle stiffness, and arthritis.',
    dosage: 'Apply externally 2-3 times daily on affected area',
    benefits: 'Relieves joint and muscle pain, reduces inflammation, improves blood circulation, soothes stiffness and swelling',
    usageInstructions: 'Warm the oil slightly. Massage gently on affected joints or muscles for 10-15 minutes. Follow with a warm compress for best results.',
    precautions: 'For external use only. Avoid applying on open wounds or broken skin. Wash hands after application.',
    price: 320,
    stock: 75,
  },
  {
    name: 'Tulsi Drops',
    category: 'Syrup',
    description: 'Concentrated Holy Basil (Tulsi) extract drops. Tulsi is revered in Ayurveda as the "Queen of Herbs" for its powerful healing properties.',
    dosage: '2-3 drops in a cup of warm water or tea, twice daily',
    benefits: 'Boosts respiratory health, natural immunity enhancer, relieves cold and cough, stress adaptogen, anti-bacterial properties',
    usageInstructions: 'Add 2-3 drops to warm water, tea or honey. Can also be taken directly under the tongue.',
    precautions: 'Not recommended for pregnant women. Consult doctor if on blood-thinning medications.',
    price: 180,
    stock: 120,
  },
  {
    name: 'Guduchi (Giloy) Tablets',
    category: 'Tablet',
    description: 'Pure Guduchi (Tinospora cordifolia) stem extract tablets. Known as "Amrita" (the root of immortality) in Ayurveda for its powerful immune-boosting properties.',
    dosage: '1-2 tablets twice daily before meals',
    benefits: 'Powerful immunomodulator, helps manage fever, detoxifies the body, supports liver health, anti-inflammatory',
    usageInstructions: 'Take on an empty stomach with warm water for best absorption. Use consistently during seasonal changes.',
    precautions: 'May lower blood sugar levels. Diabetic patients should monitor their levels. Avoid in autoimmune conditions.',
    price: 280,
    stock: 90,
  },
  {
    name: 'Dashamool Syrup',
    category: 'Syrup',
    description: 'Herbal syrup formulation made from the roots of 10 powerful medicinal plants. A classic Ayurvedic remedy for inflammation and respiratory issues.',
    dosage: '10-15ml twice daily after meals',
    benefits: 'Anti-inflammatory action, relieves body aches, supports respiratory health, reduces Vata dosha imbalance, improves appetite',
    usageInstructions: 'Shake well before use. Take 10-15ml with equal quantity of warm water after meals.',
    precautions: 'Store in a cool place. Use within 3 months of opening. Not recommended during pregnancy.',
    price: 220,
    stock: 60,
  },
  {
    name: 'Shatavari Powder',
    category: 'Powder',
    description: 'Premium quality Shatavari (Asparagus racemosus) root powder. Considered the "Queen of Herbs" in Ayurveda, it is especially beneficial for women\'s health.',
    dosage: '1 teaspoon (3g) twice daily with warm milk or water',
    benefits: 'Supports hormonal balance in women, improves lactation, anti-aging properties, enhances immunity, soothes digestive system',
    usageInstructions: 'Mix 1 teaspoon in warm milk with a pinch of cardamom. Best taken morning and evening.',
    precautions: 'Consult doctor if you have kidney disorders or hormone-sensitive conditions. Not for children under 12.',
    price: 300,
    stock: 110,
  },
];

// ═══════════════════════════════════════════
// 3. DEFAULT ADMIN ACCOUNT
// ═══════════════════════════════════════════
const ADMIN_USER = {
  fullName: 'Abis shrestha',
  email: 'abis@gmail.com',
  password: 'admin123',
  phone: '+977 9800000000',
  role: 'admin',
};

// ═══════════════════════════════════════════
// SEED FUNCTIONS
// ═══════════════════════════════════════════

const seedCategories = async () => {
  console.log('\n📦 Seeding Categories...');
  for (const cat of CATEGORIES) {
    try {
      await pool.query(
        `INSERT INTO categories (name, description) 
         VALUES ($1, $2) 
         ON CONFLICT (name) DO NOTHING`,
        [cat.name, cat.description]
      );
      console.log(`  ✅ ${cat.name}`);
    } catch (err) {
      console.error(`  ❌ ${cat.name}:`, err.message);
    }
  }
};

const seedMedicines = async () => {
  console.log('\n💊 Seeding Medicines...');
  for (const med of MEDICINES) {
    try {
      // Find category ID
      const catResult = await pool.query(
        `SELECT categoryid FROM categories WHERE LOWER(name) = LOWER($1)`,
        [med.category]
      );
      const categoryId = catResult.rows[0]?.categoryid || null;

      // Check if medicine already exists
      const existing = await pool.query(
        `SELECT medicineid FROM medicines WHERE LOWER(name) = LOWER($1)`,
        [med.name]
      );

      if (existing.rows.length > 0) {
        console.log(`  ⏭️  ${med.name} (already exists)`);
        continue;
      }

      await pool.query(
        `INSERT INTO medicines (name, categoryid, description, dosage, benefits, usageinstructions, precautions, price, stock, lowstockthreshold)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          med.name,
          categoryId,
          med.description,
          med.dosage,
          med.benefits,
          med.usageInstructions,
          med.precautions,
          med.price,
          med.stock,
          10, // default low stock threshold
        ]
      );
      console.log(`  ✅ ${med.name} (₹${med.price})`);
    } catch (err) {
      console.error(`  ❌ ${med.name}:`, err.message);
    }
  }
};

const seedAdmin = async () => {
  console.log('\n👤 Seeding Admin Account...');
  try {
    // Check if admin already exists
    const existing = await pool.query(
      `SELECT userid FROM users WHERE email = $1`,
      [ADMIN_USER.email]
    );

    if (existing.rows.length > 0) {
      console.log(`  ⏭️  Admin (${ADMIN_USER.email}) already exists`);
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_USER.password, 10);

    await pool.query(
      `INSERT INTO users (fullname, email, passwordhash, phone, role, isactive)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [ADMIN_USER.fullName, ADMIN_USER.email, passwordHash, ADMIN_USER.phone, ADMIN_USER.role, true]
    );
    console.log(`  ✅ Admin created: ${ADMIN_USER.email} / ${ADMIN_USER.password}`);
  } catch (err) {
    console.error(`  ❌ Admin:`, err.message);
  }
};

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

const seed = async () => {
  console.log('🌱 ═══════════════════════════════════════');
  console.log('   SANJEEVANI DATABASE SEEDER');
  console.log('═══════════════════════════════════════════');

  try {
    // Ensure tables exist first
    const { createCategoryTable, createMedicineTable } = require('./models/medicineModel');
    const { createUserTable } = require('./models/userModel');

    await createCategoryTable();
    await createMedicineTable();
    await createUserTable();

    // Now seed data
    await seedCategories();
    await seedMedicines();
    await seedAdmin();

    console.log('\n🎉 ═══════════════════════════════════════');
    console.log('   SEEDING COMPLETE!');
    console.log('═══════════════════════════════════════════');
    console.log('\n📋 Summary:');
    console.log(`   Categories: ${CATEGORIES.length}`);
    console.log(`   Medicines:  ${MEDICINES.length}`);
    console.log(`   Admin:      ${ADMIN_USER.email} / ${ADMIN_USER.password}`);
    console.log('');
  } catch (err) {
    console.error('SEEDER FAILED:', err);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

seed();
