/**
 * Sanjeevani - RESET and Re-seed Insights with correct doctor authors
 * This clears ALL existing insights from the database, then re-seeds with doctor-authored ones.
 * 
 * Run on GCP: sudo docker compose exec backend node scripts/resetInsights.js
 */

const pool = require('../src/config/db');

const INSIGHTS = [
  {
    title: 'The Ancient Power of Ashwagandha: A Natural Stress Reliever',
    authorEmail: 'aanchal@gmail.com',
    content: `Ashwagandha (Withania somnifera) is one of the most powerful adaptogenic herbs in Ayurvedic medicine. Often called "Indian Ginseng," this remarkable root has been used for over 3,000 years to help the body respond to stress, boost energy, and improve concentration.

Modern scientific research has validated what Ayurvedic practitioners have known for millennia. Studies show that Ashwagandha can significantly reduce cortisol levels (the stress hormone) by up to 30%. It also supports healthy sleep patterns by calming the nervous system without causing drowsiness during the day.

How to use it: Take 1-2 Ashwagandha capsules daily with warm milk before bedtime. For those who prefer the traditional method, mix half a teaspoon of Ashwagandha powder in warm milk with a pinch of cardamom. Consistency is key - use for at least 2-3 months for optimal results.

Who should avoid it: Pregnant women, individuals with thyroid conditions (as it may increase thyroid hormone levels), and those on sedative medications should consult their Ayurvedic practitioner before use.`,
  },
  {
    title: 'Triphala: The Three-Fruit Formula for Complete Digestive Health',
    authorEmail: 'rojina@gmail.com',
    content: `Triphala is perhaps the most well-known and widely used herbal formulation in all of Ayurvedic medicine. This powerful combination of three dried fruits - Amla (Emblica officinalis), Bibhitaki (Terminalia bellirica), and Haritaki (Terminalia chebula) - creates a balanced remedy that supports complete digestive wellness.

Each fruit addresses a specific dosha: Amla balances Pitta, Bibhitaki balances Kapha, and Haritaki balances Vata. Together, they create a tridoshic formula suitable for almost everyone.

Beyond digestion, Triphala is a natural detoxifier. It gently cleanses the colon and supports regular bowel movements without the harsh effects of chemical laxatives. The high Vitamin C content from Amla also makes it an excellent immunity booster.

Recommended usage: Mix 1 teaspoon of Triphala powder in warm water and drink before bedtime. Start with a smaller dose if you are new to this formulation.`,
  },
  {
    title: "Turmeric (Haridra) - Ayurveda's Golden Healer for Inflammation",
    authorEmail: 'naina@gmail.com',
    content: `Turmeric, known as Haridra in Sanskrit, is undoubtedly the most scientifically studied herb in the Ayurvedic pharmacopoeia. Its active compound, curcumin, has been the subject of over 12,000 peer-reviewed studies confirming its anti-inflammatory, antioxidant, and healing properties.

In Ayurveda, Haridra is classified as a "Krimighna" (anti-microbial) and "Kushthaghna" (beneficial for skin diseases). It is used both internally as a supplement and externally as a paste for wound healing.

The challenge with turmeric is bioavailability - curcumin is poorly absorbed on its own. Classical Ayurvedic texts solved this problem thousands of years ago by recommending turmeric with black pepper (Trikatu) and healthy fats like ghee or coconut oil.

Daily wellness routine: Take 1 Haridra capsule twice daily after meals, or add a teaspoon of turmeric powder to warm milk with black pepper and honey (Golden Milk).`,
  },
  {
    title: "Neem: Nature's Pharmacy for Skin and Blood Purification",
    authorEmail: 'sumitra@gmail.com',
    content: `Neem (Azadirachta indica) is often called the "Village Pharmacy" in India because virtually every part of this remarkable tree - leaves, bark, seeds, flowers, and roots - has medicinal value. In Ayurveda, Neem is the go-to herb for blood purification and skin health.

The bitter taste of Neem is therapeutically significant. According to Ayurvedic principles, the bitter taste (Tikta Rasa) naturally cleanses the blood, cools excess Pitta, and detoxifies the liver.

How to incorporate Neem: Take 1-2 Neem capsules daily after meals for skin health maintenance. For acute skin conditions, a paste of Neem leaves applied externally can provide soothing relief. Neem oil diluted with coconut oil is excellent for scalp health.

Caution: Neem is a powerful herb and should be used in moderation. It is not recommended during pregnancy.`,
  },
  {
    title: 'Chyawanprash: The 3,000-Year-Old Immunity Superfood',
    authorEmail: 'nipun@gmail.com',
    content: `Chyawanprash is not just an Ayurvedic supplement - it is a living piece of medical history. This dark, jam-like preparation was originally formulated by the sage twins Ashwini Kumaras to rejuvenate the elderly sage Chyawan, restoring his youth and vitality.

The base of Chyawanprash is Amla (Indian Gooseberry), one of nature's richest sources of Vitamin C. But what makes this formulation truly special is the synergy of 40+ herbs, spices, and natural ingredients that work together to create a comprehensive immunity shield.

Traditional usage: Take 1-2 teaspoons daily with warm milk in the morning. Children above 5 years can take half a teaspoon. During winter months or flu season, the dosage can be gently increased. Many families in Nepal and India give Chyawanprash to children before school.`,
  },
  {
    title: 'Brahmi: The Brain Herb for Memory, Focus and Mental Clarity',
    authorEmail: 'samjhana@gmail.com',
    content: `Brahmi (Bacopa monnieri) holds a special place in Ayurvedic neuroscience. Named after Lord Brahma - the creator deity associated with knowledge and intellect - this small, creeping herb has been used for centuries to sharpen memory, improve concentration, and support overall cognitive function.

Brahmi is classified as a "Medhya Rasayana" in Ayurveda, meaning it is a specific rejuvenator for the mind and intellect. Unlike modern stimulants that provide temporary alertness followed by a crash, Brahmi works gradually by nourishing the brain tissue.

How to use Brahmi effectively: Take 2 Brahmi tablets twice daily after meals. For students preparing for exams, start the supplementation at least 2-3 months before the exam period, as the cognitive benefits build over time.

Synergy tip: Combining Brahmi with Shankhpushpi creates an even more powerful brain tonic.`,
  },
];

const resetAndSeed = async () => {
  console.log('Resetting and Re-seeding Insights...');

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

  // Clear existing insights
  const countResult = await pool.query('SELECT COUNT(*) FROM articles');
  const oldCount = countResult.rows[0].count;
  await pool.query('DELETE FROM articles');
  console.log(`Cleared ${oldCount} records from the database.`);

  // Re-insert with correct doctor authors
  let added = 0;

  for (const insight of INSIGHTS) {
    try {
      const authorResult = await pool.query(
        `SELECT userid FROM users WHERE LOWER(email) = LOWER($1)`,
        [insight.authorEmail]
      );

      if (authorResult.rows.length === 0) {
        console.log(`Author ${insight.authorEmail} not found. Ensure doctor users exist first.`);
        continue;
      }

      const authorId = authorResult.rows[0].userid;

      await pool.query(
        `INSERT INTO articles (title, content, imageurl, authorid) VALUES ($1, $2, $3, $4)`,
        [insight.title, insight.content, '', authorId]
      );
      console.log(`Inserted: "${insight.title.substring(0, 45)}..."`);
      added++;
    } catch (err) {
      console.error(`Error inserting ${insight.title.substring(0, 45)}: ${err.message}`);
    }
  }

  console.log(`\nRe-seeding complete. Inserted ${added} insights.`);
  process.exit(0);
};

resetAndSeed();
