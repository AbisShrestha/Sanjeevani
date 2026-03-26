/**
 * Quick script to update the 3 existing medicines with proper Ayurvedic details.
 * Run: node src/update-existing-medicines.js
 */
const pool = require('./config/db');
require('dotenv').config();

async function run() {
  try {
    // 1. Ashwagandha (id: 17)
    await pool.query(
      `UPDATE medicines SET
        description = $1, dosage = $2, benefits = $3, usageinstructions = $4, precautions = $5, updatedat = CURRENT_TIMESTAMP
       WHERE medicineid = 17`,
      [
        'Pure Ashwagandha (Withania somnifera) root powder. One of the most powerful herbs in Ayurveda, known as Indian Ginseng. Used for over 3000 years to relieve stress, increase energy levels, and improve concentration.',
        '1 teaspoon (3-5g) with warm milk or water, twice daily after meals',
        'Reduces cortisol levels and manages stress, boosts testosterone and fertility in men, increases muscle mass and strength, improves brain function and memory, lowers blood sugar and cholesterol levels',
        'Mix 1 teaspoon of powder in a glass of warm milk with a pinch of black pepper for better absorption. Take once in the morning and once before bed. For best results, use continuously for 2-3 months.',
        'Not recommended during pregnancy or breastfeeding. May interact with thyroid, blood sugar, and blood pressure medications. Consult a doctor if you have autoimmune diseases.',
      ]
    );
    console.log('✅ ashwagandha (id:17) updated');

    // 2. Shilajit (id: 23)
    await pool.query(
      `UPDATE medicines SET
        description = $1, dosage = $2, benefits = $3, usageinstructions = $4, precautions = $5, updatedat = CURRENT_TIMESTAMP
       WHERE medicineid = 23`,
      [
        'Premium grade Shilajit resin sourced from the Himalayan mountains. A powerful mineral-rich substance formed over centuries from plant decomposition. Known as the "Destroyer of Weakness" in Sanskrit.',
        'Pea-sized amount (300-500mg) dissolved in warm milk or water, once or twice daily',
        'Boosts energy and fights chronic fatigue, enhances physical performance and stamina, powerful antioxidant and anti-inflammatory, supports brain health and cognitive function, improves heart health and iron levels',
        'Dissolve a pea-sized portion in warm milk or water. Take on an empty stomach in the morning. Can also be taken before bed with warm milk. Start with a smaller dose and gradually increase.',
        'Buy only purified Shilajit from trusted sources. Do not consume raw or unprocessed Shilajit. Not suitable for children, pregnant or breastfeeding women. Discontinue if you experience dizziness or skin rash.',
      ]
    );
    console.log('✅ shilajit (id:23) updated');

    // 3. Bam (id: 24)
    await pool.query(
      `UPDATE medicines SET
        name = $1, description = $2, dosage = $3, benefits = $4, usageinstructions = $5, precautions = $6, updatedat = CURRENT_TIMESTAMP
       WHERE medicineid = 24`,
      [
        'Bam (Herbal Balm)',
        'Traditional Ayurvedic herbal balm made from camphor, menthol, eucalyptus oil, and natural herbs. Provides quick relief from headaches, body aches, cold, and nasal congestion.',
        'Apply a small amount externally on the affected area 2-3 times daily',
        'Instant relief from headaches and migraines, clears nasal congestion and cold symptoms, soothes muscle pain and joint stiffness, cooling and calming effect, helps with motion sickness and nausea',
        'Gently rub a small amount on the forehead for headache, on the chest for cold, or on sore muscles for pain relief. For nasal congestion, apply under the nostrils and inhale deeply. Wash hands after use.',
        'For external use only. Do not apply on open wounds, broken skin, or near eyes. Keep away from children under 2 years. Stop use if skin irritation develops. Do not ingest.',
      ]
    );
    console.log('✅ Bam (id:24) updated');

    console.log('\n🎉 All 3 medicines updated with full professional details!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
