/**
 * Sanjeevani - Seed 20 New Ayurvedic Medicines
 * Run: node scripts/seedMedicines20.js
 * On GCP: sudo docker compose exec backend node scripts/seedMedicines20.js
 */

const pool = require('../src/config/db');

const MEDICINES = [
  {
    name: 'Neem Capsules',
    category: 'Capsule',
    description: 'Pure Neem (Azadirachta indica) leaf extract capsules. Neem has been used in Ayurveda for thousands of years as a potent blood purifier and natural detoxifier for clear, healthy skin.',
    dosage: '1-2 capsules twice daily after meals with water',
    benefits: 'Purifies blood naturally, promotes clear and healthy skin, supports liver detoxification, has antibacterial and antifungal properties, helps manage blood sugar levels',
    usageInstructions: 'Take after breakfast and dinner with a full glass of water. For skin conditions, use consistently for 2-3 months.',
    precautions: 'Not recommended during pregnancy or breastfeeding. Avoid if you have low blood sugar. Consult your doctor if on diabetic medication.',
    price: 320,
    stock: 95,
  },
  {
    name: 'Amla Tablets',
    category: 'Tablet',
    description: 'Concentrated Indian Gooseberry (Emblica officinalis) tablets. Amla is one of the richest natural sources of Vitamin C and a cornerstone of Ayurvedic rejuvenation therapy.',
    dosage: '2 tablets twice daily after meals',
    benefits: 'Extremely rich in natural Vitamin C, strengthens immunity, improves hair growth and skin health, supports healthy digestion, powerful antioxidant protection',
    usageInstructions: 'Swallow with warm water after meals. Combine with a balanced diet for best results. Suitable for daily long-term use.',
    precautions: 'May increase acidity in sensitive individuals. Reduce dose if mild stomach discomfort occurs.',
    price: 200,
    stock: 130,
  },
  {
    name: 'Bhringraj Hair Oil',
    category: 'Oil',
    description: 'Traditional Ayurvedic hair oil infused with Bhringraj (Eclipta alba), coconut oil, and sesame oil. Known as the "King of Herbs for Hair" in Ayurveda for promoting thick, lustrous locks.',
    dosage: 'Apply generously to scalp and hair 2-3 times a week',
    benefits: 'Promotes natural hair growth, prevents premature greying, reduces hair fall and dandruff, nourishes scalp deeply, strengthens hair from root to tip',
    usageInstructions: 'Warm slightly and massage into scalp with fingertips for 10-15 minutes. Leave for at least 1 hour or overnight. Wash with a mild herbal shampoo.',
    precautions: 'For external use only. Perform a patch test if you have sensitive skin. Avoid contact with eyes.',
    price: 380,
    stock: 70,
  },
  {
    name: 'Arjuna Tablets',
    category: 'Tablet',
    description: 'Pure Arjuna (Terminalia arjuna) bark extract tablets. Arjuna has been used in Ayurvedic cardiology for centuries as a natural heart tonic and cardiovascular strengthener.',
    dosage: '1 tablet twice daily after meals',
    benefits: 'Supports healthy heart function, helps maintain normal blood pressure, strengthens cardiac muscles, improves blood circulation, rich in natural antioxidants',
    usageInstructions: 'Take with warm water after breakfast and dinner. For heart health maintenance, use consistently for at least 3-6 months.',
    precautions: 'Consult your doctor if you are on blood pressure or heart medications. Not recommended for children under 14 years.',
    price: 290,
    stock: 85,
  },
  {
    name: 'Licorice (Mulethi) Powder',
    category: 'Powder',
    description: 'Finely ground Licorice root (Glycyrrhiza glabra) powder. Called Yashtimadhu in Sanskrit, this sweet root has been treasured in Ayurveda for soothing the throat and supporting respiratory wellness.',
    dosage: 'Half teaspoon (1-2g) with honey or warm water twice daily',
    benefits: 'Soothes sore throat and cough, supports healthy digestion, helps manage acidity, promotes respiratory wellness, natural adaptogen for stress',
    usageInstructions: 'Mix half teaspoon with a spoon of honey for throat relief. Can also be boiled in water as a soothing tea. Take before meals for digestive support.',
    precautions: 'Avoid prolonged use beyond 6 weeks. Not suitable for individuals with high blood pressure or kidney conditions. Avoid during pregnancy.',
    price: 180,
    stock: 120,
  },
  {
    name: 'Shankhpushpi Syrup',
    category: 'Syrup',
    description: 'Premium Shankhpushpi (Convolvulus pluricaulis) herbal syrup. One of the most valued Medhya Rasayana (brain tonics) in classical Ayurvedic texts for enhancing intellect and calming the mind.',
    dosage: '10-15ml twice daily with equal water',
    benefits: 'Enhances memory and learning ability, promotes mental calmness, reduces anxiety and stress, supports sound sleep, improves concentration in students',
    usageInstructions: 'Shake well before use. Take 10-15ml mixed with equal water after meals. Ideal for students during exam preparation.',
    precautions: 'Store in a cool dry place. Use within 45 days of opening. Not recommended for children under 5 years without medical advice.',
    price: 240,
    stock: 80,
  },
  {
    name: 'Haridra (Turmeric) Capsules',
    category: 'Capsule',
    description: 'High-potency Turmeric (Curcuma longa) extract capsules standardized for curcumin content. Haridra is one of the most scientifically studied herbs in Ayurveda with powerful anti-inflammatory action.',
    dosage: '1 capsule twice daily after meals',
    benefits: 'Powerful natural anti-inflammatory, supports joint health and mobility, boosts immunity, promotes healthy skin from within, strong antioxidant protection',
    usageInstructions: 'Take with meals for better absorption. Combining with a pinch of black pepper enhances curcumin bioavailability significantly.',
    precautions: 'Avoid if you have gallbladder problems. Consult a doctor if on blood-thinning medications. May cause mild stomach upset on empty stomach.',
    price: 260,
    stock: 100,
  },
  {
    name: 'Punarnava Tablets',
    category: 'Tablet',
    description: 'Pure Punarnava (Boerhavia diffusa) root extract tablets. The name literally means "one that renews the body" in Sanskrit, reflecting its powerful rejuvenating properties for the urinary system.',
    dosage: '1-2 tablets twice daily before meals',
    benefits: 'Supports kidney and urinary tract health, natural diuretic action, helps reduce water retention, promotes liver function, anti-inflammatory properties',
    usageInstructions: 'Take on an empty stomach with warm water for best absorption. Drink plenty of water throughout the day while using this supplement.',
    precautions: 'Not suitable during pregnancy. Consult your doctor if you have existing kidney disease or are on diuretic medications.',
    price: 270,
    stock: 90,
  },
  {
    name: 'Bala Tailam (Body Oil)',
    category: 'Oil',
    description: 'Classical Ayurvedic body massage oil prepared with Bala (Sida cordifolia) herb infused in sesame oil. A renowned Vata-pacifying oil that strengthens muscles, nerves, and joints.',
    dosage: 'Apply liberally for full body massage, 2-3 times per week',
    benefits: 'Strengthens muscles and nerves, nourishes and tones skin, relieves physical fatigue, calms Vata dosha imbalance, promotes restful sleep when used before bedtime',
    usageInstructions: 'Warm the oil slightly. Apply generously and massage the entire body in long strokes along limbs and circular motions at joints. Rest 20 minutes, then bathe with warm water.',
    precautions: 'For external use only. May stain light-colored clothing. Avoid during acute fever or skin infections.',
    price: 420,
    stock: 55,
  },
  {
    name: 'Avipattikar Powder',
    category: 'Powder',
    description: 'Classical Ayurvedic digestive churna combining 14 potent herbs including Amla, Haritaki, and Black Pepper. An ancient remedy specifically formulated for acid reflux and hyperacidity management.',
    dosage: '1 teaspoon (3-5g) with warm water before meals',
    benefits: 'Relieves acidity and heartburn naturally, improves appetite, supports healthy digestion metabolism, reduces bloating and gas, balances Pitta dosha',
    usageInstructions: 'Mix 1 teaspoon in a glass of warm water. Take 30 minutes before lunch and dinner. For chronic acidity, use for at least 4-6 weeks consistently.',
    precautions: 'Avoid during pregnancy. Reduce dose if loose stools occur. Not suitable for individuals with very low stomach acid.',
    price: 210,
    stock: 110,
  },
  {
    name: 'Kutki Capsules',
    category: 'Capsule',
    description: 'Premium Kutki (Picrorhiza kurroa) root extract capsules. A rare and precious Himalayan herb considered the gold standard in Ayurveda for liver protection and detoxification support.',
    dosage: '1 capsule twice daily before meals',
    benefits: 'Potent hepatoprotective action for liver health, supports bile production, aids in natural body detoxification, anti-inflammatory, helps manage skin conditions from within',
    usageInstructions: 'Take on an empty stomach with warm water. For liver support, use continuously for at least 2-3 months under guidance.',
    precautions: 'May cause mild nausea initially. Not recommended during pregnancy. Consult an Ayurvedic practitioner if you have existing liver conditions.',
    price: 550,
    stock: 45,
  },
  {
    name: 'Vasakasava Syrup',
    category: 'Syrup',
    description: 'Traditional Ayurvedic respiratory tonic made from Vasa (Adhatoda vasica) leaves through a natural fermentation process. Used for centuries as a safe and effective remedy for cough and bronchial conditions.',
    dosage: '15-20ml twice daily after meals with equal water',
    benefits: 'Relieves productive and dry cough, supports bronchial health, expectorant action to clear mucus, soothes inflamed airways, strengthens lung capacity',
    usageInstructions: 'Shake the bottle well. Take 15-20ml mixed with equal amount of lukewarm water after meals. Continue for the duration of respiratory symptoms.',
    precautions: 'Contains a small percentage of self-generated alcohol from fermentation. Not recommended during pregnancy. Store in a cool dry place.',
    price: 195,
    stock: 75,
  },
  {
    name: 'Talisadi Powder',
    category: 'Powder',
    description: 'Ancient Ayurvedic herbal churna made from Talispatra (Abies webbiana), Pippali, and other warming spices. A go-to classical formulation for managing cold, cough, and fever in traditional Ayurvedic practice.',
    dosage: 'Half teaspoon (1-2g) with honey 2-3 times daily',
    benefits: 'Relieves cold and congestion, reduces cough and phlegm, supports healthy respiratory function, improves appetite after illness, mild bronchodilator action',
    usageInstructions: 'Mix half teaspoon with a spoon of raw honey and lick slowly. For children above 5 years, give quarter teaspoon. Best taken between meals.',
    precautions: 'Not suitable for very young children without medical advice. Avoid if you have peptic ulcers. Use honey as the carrier for best therapeutic effect.',
    price: 170,
    stock: 140,
  },
  {
    name: 'Yashtimadhu Tablets',
    category: 'Tablet',
    description: 'Concentrated Yashtimadhu (Glycyrrhiza glabra) extract tablets. One of the most versatile herbs in the Ayurvedic pharmacopoeia, especially valued for gastric health and ulcer prevention support.',
    dosage: '1 tablet twice daily before meals',
    benefits: 'Protects gastric lining naturally, helps manage acid reflux, soothes mouth and stomach ulcers, supports adrenal function, mild anti-stress properties',
    usageInstructions: 'Chew or swallow with water 30 minutes before meals for gastric protection. For throat soothing, allow the tablet to dissolve slowly in the mouth.',
    precautions: 'Avoid prolonged continuous use beyond 4-6 weeks. Not suitable for patients with hypertension or low potassium levels. Consult a doctor during pregnancy.',
    price: 230,
    stock: 100,
  },
  {
    name: 'Khadiradi Vati',
    category: 'Tablet',
    description: 'Classical Ayurvedic oral health tablets made from Khadira (Acacia catechu) and other astringent herbs. A traditional remedy for maintaining strong gums, fresh breath, and overall oral hygiene.',
    dosage: '1-2 tablets to be chewed or dissolved in mouth 2-3 times daily',
    benefits: 'Strengthens gums and teeth, freshens breath naturally, relieves sore throat and mouth ulcers, astringent action prevents bleeding gums, supports overall oral hygiene',
    usageInstructions: 'Place the tablet in your mouth and allow it to dissolve slowly. Do not swallow whole. Use after meals and before bedtime for best oral health results.',
    precautions: 'For oral dissolution only, not meant to be swallowed whole. Keep out of reach of small children. Discontinue if allergic reaction occurs.',
    price: 150,
    stock: 150,
  },
  {
    name: 'Nalpamaradi Tailam',
    category: 'Oil',
    description: 'Premium Ayurvedic skin-brightening body oil prepared with Turmeric, Vetiver, and Indian Gooseberry in a coconut oil base. A legendary Kerala Ayurvedic formulation for radiant, even-toned skin.',
    dosage: 'Apply on face and body before bath, 3-4 times per week',
    benefits: 'Brightens and evens out skin tone, removes tan and dark patches, natural sun protection, deeply moisturizes skin, anti-aging and skin rejuvenation',
    usageInstructions: 'Apply a thin layer on clean skin 20-30 minutes before bathing. Gently massage in upward strokes. For face, avoid the eye area. Wash off with a mild cleanser.',
    precautions: 'For external use only. Contains turmeric which may temporarily tint very fair skin yellow. Perform a patch test before first use.',
    price: 680,
    stock: 40,
  },
  {
    name: 'Amritarishta Syrup',
    category: 'Syrup',
    description: 'Traditional fermented Ayurvedic tonic made from Guduchi (Amrita/Giloy) through classical Arishta preparation. A time-tested immunity booster especially effective during seasonal transitions and fever management.',
    dosage: '15-20ml twice daily after meals with equal water',
    benefits: 'Powerful immunity booster, helps manage chronic and recurring fevers, detoxifies blood naturally, supports liver health, general body rejuvenation',
    usageInstructions: 'Shake well. Mix 15-20ml with equal lukewarm water and drink after meals. During fever episodes, can be taken 3 times daily under medical guidance.',
    precautions: 'Contains naturally generated alcohol from fermentation process. Not recommended for pregnant or lactating women. Diabetic patients should consult their doctor.',
    price: 210,
    stock: 65,
  },
  {
    name: 'Hingvastak Powder',
    category: 'Powder',
    description: 'Classical Ayurvedic digestive churna with Hing (Asafoetida) as the primary ingredient, combined with Cumin, Black Pepper, Ginger, and Pippali. The ultimate remedy for bloating, gas, and sluggish digestion.',
    dosage: 'Half teaspoon with the first morsel of food at lunch and dinner',
    benefits: 'Eliminates bloating and flatulence, stimulates digestive fire (Agni), improves nutrient absorption, relieves abdominal discomfort, appetizer before meals',
    usageInstructions: 'Sprinkle half teaspoon on your first bite of food or mix with a small amount of ghee. Take with both lunch and dinner for consistent digestive support.',
    precautions: 'Avoid on completely empty stomach. Not recommended during pregnancy. May cause a warming sensation which is normal and indicates digestive activation.',
    price: 190,
    stock: 130,
  },
  {
    name: 'Moringa Capsules',
    category: 'Capsule',
    description: 'Premium Moringa (Moringa oleifera) leaf extract capsules. Called the "Miracle Tree" and "Shigru" in Ayurveda, this superfood contains 90+ nutrients including all essential amino acids.',
    dosage: '1-2 capsules twice daily with meals',
    benefits: 'Nutritional powerhouse with 90+ vitamins and minerals, boosts energy naturally, supports healthy inflammation response, rich in iron for blood health, powerful antioxidant',
    usageInstructions: 'Take with meals for best nutrient absorption. Ideal as a daily supplement for overall wellness. Safe for long-term daily use.',
    precautions: 'May interact with thyroid and blood sugar medications. Consult your doctor if on prescription drugs. Not recommended during pregnancy due to uterine contracting properties.',
    price: 340,
    stock: 85,
  },
  {
    name: 'Saraswatarishta Syrup',
    category: 'Syrup',
    description: 'Classical Ayurvedic nervine tonic prepared through traditional Arishta fermentation of Brahmi, Shatavari, Haritaki, and other potent herbs. Named after Goddess Saraswati, the deity of knowledge and wisdom.',
    dosage: '15-20ml twice daily after meals with equal water',
    benefits: 'Calms anxiety and nervous tension, promotes restful sleep, enhances speech and voice clarity, supports memory in elderly, nervine tonic for students and professionals',
    usageInstructions: 'Shake well before use. Mix 15-20ml with equal amount of lukewarm water. Take after lunch and dinner. For insomnia, take the evening dose 1 hour before bedtime.',
    precautions: 'Contains self-generated alcohol from fermentation. Not suitable for children under 12 without practitioner guidance. Avoid driving immediately after consumption.',
    price: 260,
    stock: 60,
  },
];

// -----------------------------------------------
// SEED FUNCTION
// -----------------------------------------------
const seedNewMedicines = async () => {
  console.log('===========================================');
  console.log('  SANJEEVANI - Seeding 20 New Medicines');
  console.log('===========================================\n');

  let added = 0;
  let skipped = 0;

  for (const med of MEDICINES) {
    try {
      // 1. Find category ID
      const catResult = await pool.query(
        `SELECT categoryid FROM categories WHERE LOWER(name) = LOWER($1)`,
        [med.category]
      );
      const categoryId = catResult.rows[0]?.categoryid || null;

      if (!categoryId) {
        console.log(`  SKIP  ${med.name} - Category "${med.category}" not found in DB`);
        skipped++;
        continue;
      }

      // 2. Check if medicine already exists
      const existing = await pool.query(
        `SELECT medicineid FROM medicines WHERE LOWER(name) = LOWER($1)`,
        [med.name]
      );

      if (existing.rows.length > 0) {
        console.log(`  SKIP  ${med.name} (already exists)`);
        skipped++;
        continue;
      }

      // 3. Insert
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
          10,
        ]
      );
      console.log(`  OK    ${med.name} (Rs. ${med.price})`);
      added++;
    } catch (err) {
      console.error(`  FAIL  ${med.name}: ${err.message}`);
    }
  }

  console.log(`\n--- Done! Added: ${added}, Skipped: ${skipped} ---`);
  process.exit(0);
};

seedNewMedicines();
