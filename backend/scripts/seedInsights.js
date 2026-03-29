/**
 * Sanjeevani - Seed 6 Medicinal Insights (Community Articles)
 * Run: node scripts/seedInsights.js
 * On GCP: sudo docker compose exec backend node scripts/seedInsights.js
 */

const pool = require('../src/config/db');

const INSIGHTS = [
  {
    title: 'The Ancient Power of Ashwagandha: A Natural Stress Reliever',
    content: `Ashwagandha (Withania somnifera) is one of the most powerful adaptogenic herbs in Ayurvedic medicine. Often called "Indian Ginseng," this remarkable root has been used for over 3,000 years to help the body respond to stress, boost energy, and improve concentration.

Modern scientific research has validated what Ayurvedic practitioners have known for millennia. Studies show that Ashwagandha can significantly reduce cortisol levels (the stress hormone) by up to 30%. It also supports healthy sleep patterns by calming the nervous system without causing drowsiness during the day.

How to use it: Take 1-2 Ashwagandha capsules daily with warm milk before bedtime. For those who prefer the traditional method, mix half a teaspoon of Ashwagandha powder in warm milk with a pinch of cardamom. Consistency is key - use for at least 2-3 months for optimal results.

Who should avoid it: Pregnant women, individuals with thyroid conditions (as it may increase thyroid hormone levels), and those on sedative medications should consult their Ayurvedic practitioner before use.`,
  },
  {
    title: 'Triphala: The Three-Fruit Formula for Complete Digestive Health',
    content: `Triphala is perhaps the most well-known and widely used herbal formulation in all of Ayurvedic medicine. This powerful combination of three dried fruits - Amla (Emblica officinalis), Bibhitaki (Terminalia bellirica), and Haritaki (Terminalia chebula) - creates a balanced remedy that supports complete digestive wellness.

Each fruit addresses a specific dosha: Amla balances Pitta, Bibhitaki balances Kapha, and Haritaki balances Vata. Together, they create a tridoshic formula suitable for almost everyone.

Beyond digestion, Triphala is a natural detoxifier. It gently cleanses the colon and supports regular bowel movements without the harsh effects of chemical laxatives. The high Vitamin C content from Amla also makes it an excellent immunity booster.

Recommended usage: Mix 1 teaspoon of Triphala powder in warm water and drink before bedtime. Start with a smaller dose if you are new to this formulation. For those who find the taste too bitter, Triphala tablets are an excellent alternative.

Pro tip: Triphala can also be used as an eye wash (strained and cooled decoction) to support healthy vision - a practice described in classical Ayurvedic texts.`,
  },
  {
    title: 'Turmeric (Haridra) - Ayurveda\'s Golden Healer for Inflammation',
    content: `Turmeric, known as Haridra in Sanskrit, is undoubtedly the most scientifically studied herb in the Ayurvedic pharmacopoeia. Its active compound, curcumin, has been the subject of over 12,000 peer-reviewed studies confirming its anti-inflammatory, antioxidant, and healing properties.

In Ayurveda, Haridra is classified as a "Krimighna" (anti-microbial) and "Kushthaghna" (beneficial for skin diseases). It is used both internally as a supplement and externally as a paste for wound healing.

The challenge with turmeric is bioavailability - curcumin is poorly absorbed on its own. Classical Ayurvedic texts solved this problem thousands of years ago by recommending turmeric with black pepper (Trikatu) and healthy fats like ghee or coconut oil. Modern science confirmed that piperine in black pepper increases curcumin absorption by 2,000%.

Daily wellness routine: Take 1 Haridra capsule twice daily after meals, or add a teaspoon of turmeric powder to warm milk with black pepper and honey (Golden Milk). This traditional preparation called "Haldi Doodh" has been a household remedy in South Asian families for generations.

Important note: While turmeric is extremely safe, high-dose supplements should be avoided by those on blood-thinning medications or with gallbladder issues.`,
  },
  {
    title: 'Neem: Nature\'s Pharmacy for Skin and Blood Purification',
    content: `Neem (Azadirachta indica) is often called the "Village Pharmacy" in India because virtually every part of this remarkable tree - leaves, bark, seeds, flowers, and roots - has medicinal value. In Ayurveda, Neem is the go-to herb for blood purification and skin health.

The bitter taste of Neem is therapeutically significant. According to Ayurvedic principles, the bitter taste (Tikta Rasa) naturally cleanses the blood, cools excess Pitta, and detoxifies the liver. This makes Neem capsules particularly effective for conditions like acne, eczema, and other skin inflammations that originate from internal toxin buildup.

Neem also has powerful antibacterial and antifungal properties. Chewing Neem twigs as a natural toothbrush is still practiced in many parts of South Asia - and for good reason. Research shows that Neem bark contains compounds that fight oral bacteria more effectively than many commercial mouthwashes.

How to incorporate Neem: Take 1-2 Neem capsules daily after meals for skin health maintenance. For acute skin conditions, a paste of Neem leaves applied externally can provide soothing relief. Neem oil diluted with coconut oil is excellent for scalp health.

Caution: Neem is a powerful herb and should be used in moderation. It is not recommended during pregnancy, as it has traditional use as a contraceptive. Those with very low blood sugar should also exercise caution.`,
  },
  {
    title: 'Chyawanprash: The 3,000-Year-Old Immunity Superfood',
    content: `Chyawanprash is not just an Ayurvedic supplement - it is a living piece of medical history. This dark, jam-like preparation was originally formulated by the sage twins Ashwini Kumaras to rejuvenate the elderly sage Chyawan, restoring his youth and vitality. The recipe, documented in the Charaka Samhita over 3,000 years ago, remains virtually unchanged today.

The base of Chyawanprash is Amla (Indian Gooseberry), one of nature's richest sources of Vitamin C. But what makes this formulation truly special is the synergy of 40+ herbs, spices, and natural ingredients that work together to create a comprehensive immunity shield.

Key benefits include: enhanced respiratory health (especially important during seasonal changes), improved digestion and metabolism, natural antioxidant protection against cellular damage, and general stamina and energy boost.

Traditional usage: Take 1-2 teaspoons daily with warm milk in the morning. Children above 5 years can take half a teaspoon. During winter months or flu season, the dosage can be gently increased. Many families in Nepal and India give Chyawanprash to children before school as a daily health practice.

Modern lifestyle tip: Spread Chyawanprash on whole wheat toast as a healthy breakfast alternative, or stir it into warm oatmeal for a nutrient-packed morning meal.`,
  },
  {
    title: 'Brahmi: The Brain Herb for Memory, Focus and Mental Clarity',
    content: `Brahmi (Bacopa monnieri) holds a special place in Ayurvedic neuroscience. Named after Lord Brahma - the creator deity associated with knowledge and intellect - this small, creeping herb has been used for centuries to sharpen memory, improve concentration, and support overall cognitive function.

Brahmi is classified as a "Medhya Rasayana" in Ayurveda, meaning it is a specific rejuvenator for the mind and intellect. Unlike modern stimulants that provide temporary alertness followed by a crash, Brahmi works gradually by nourishing the brain tissue and supporting the natural production of neurotransmitters.

Scientific research has been remarkably supportive. Multiple double-blind studies show that regular Brahmi supplementation significantly improves memory acquisition, retention, and recall speed. It has also shown promise in supporting attention and processing speed in both young students and elderly individuals.

How to use Brahmi effectively: Take 2 Brahmi tablets twice daily after meals. For students preparing for exams, start the supplementation at least 2-3 months before the exam period, as the cognitive benefits build over time. Brahmi can also be taken as a fresh juice - 2 teaspoons of Brahmi leaf juice with honey is a traditional preparation.

Synergy tip: Combining Brahmi with Shankhpushpi creates an even more powerful brain tonic. This combination addresses both memory enhancement (Brahmi) and mental calmness (Shankhpushpi), making it ideal for those who experience anxiety alongside concentration difficulties.`,
  },
];

const seedInsights = async () => {
  console.log('===========================================');
  console.log('  SANJEEVANI - Seeding 6 Medicinal Insights');
  console.log('===========================================\n');

  // Find an admin user to be the author
  const adminResult = await pool.query(
    `SELECT userid FROM users WHERE role = 'admin' LIMIT 1`
  );

  let authorId;
  if (adminResult.rows.length > 0) {
    authorId = adminResult.rows[0].userid;
    console.log(`  Using admin user ID: ${authorId} as insight author\n`);
  } else {
    // Fallback: find any doctor
    const doctorResult = await pool.query(
      `SELECT userid FROM users WHERE role = 'doctor' LIMIT 1`
    );
    if (doctorResult.rows.length > 0) {
      authorId = doctorResult.rows[0].userid;
      console.log(`  Using doctor user ID: ${authorId} as insight author\n`);
    } else {
      console.log('  ERROR: No admin or doctor user found. Please create one first.');
      process.exit(1);
    }
  }

  // Ensure articles table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      articleId SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      imageUrl TEXT DEFAULT '',
      authorId INTEGER REFERENCES users(userId),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  let added = 0;
  let skipped = 0;

  for (const insight of INSIGHTS) {
    try {
      // Check if duplicate
      const existing = await pool.query(
        `SELECT articleid FROM articles WHERE LOWER(title) = LOWER($1)`,
        [insight.title]
      );

      if (existing.rows.length > 0) {
        console.log(`  SKIP  ${insight.title.substring(0, 50)}... (already exists)`);
        skipped++;
        continue;
      }

      await pool.query(
        `INSERT INTO articles (title, content, imageurl, authorid) VALUES ($1, $2, $3, $4)`,
        [insight.title, insight.content, '', authorId]
      );
      console.log(`  OK    ${insight.title.substring(0, 60)}...`);
      added++;
    } catch (err) {
      console.error(`  FAIL  ${insight.title.substring(0, 50)}: ${err.message}`);
    }
  }

  console.log(`\n--- Done! Added: ${added}, Skipped: ${skipped} ---`);
  process.exit(0);
};

seedInsights();
