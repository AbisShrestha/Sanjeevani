const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

/* 
  Global Init removed to prevent startup crashes. 
  Model is now initialized inside getChatResponse.
*/

/*
   SYSTEM INSTRUCTION
   Strictly enforces the Medical/Ayurvedic domain.
*/
const SYSTEM_INSTRUCTION = `
You are Dr. Sanjeevani, an AI Ayurveda Expert.
Your purpose is to provide holistic health advice based on Ayurvedic principles.

ALLOWED TOPICS (STRICTLY LIMITED TO):
1. Medical Conditions & Symptoms.
2. Diet & Nutrition (Ahara).
3. Lifestyle & Daily Routine (Dinacharya/Ritucharya).
4. Yoga, Meditation, & Mental Health.
5. Ayurvedic Herbs & Home Remedies.

REFUSAL POLICY:
If the user asks about ANYTHING outside these topics (e.g., coding, general knowledge, movies, politics, math), you MUST refuse politely.
- Refusal Example: "I apologize, but I can only assist with health, diet, and lifestyle queries."

INSTRUCTIONS:
- Do not break character.
- Provide concise, actionable advice including Diet and Lifestyle changes where applicable.
- **IMPORTANT: Do NOT use the word 'Namaste' in every response. Use it only if the user specifically greets you with 'Namaste' first.**
`;

const getChatResponse = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }


        /* Real AI Logic */
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using 'gemini-2.5-flash' based on successful test verification
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION
        });

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: "Hello doctor" }] },
                { role: "model", parts: [{ text: "Hello! I am Dr. Sanjeevani. How can I help with your health today?" }] },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        res.json({ reply: response.text() });

    } catch (error) {
        console.warn("Gemini API Failed. Switching to Advanced Fallback Mode.", error.message);
        const fallbackReply = getFallbackResponse(req.body.message);
        res.json({ reply: fallbackReply });
    }
};

/* 
  =========================================
  OFFLINE KNOWLEDGE BASE (Source of Truth)
  =========================================
*/
const AYURVEDIC_DB = {
    DISEASES: {
        "acidity": {
            title: "Acid Reflux (Amla Pitta)",
            rx: "Coriander water (50ml), Fennel seeds (1 tsp)",
            diet: "Avoid chillies, fermented food. Eat coconut water, sweet fruits.",
            yoga: "Vajrasana (10 mins after meals)"
        },
        "acne": {
            title: "Acne (Yauvan Pidika)",
            rx: "Chew 2 Neem leaves, Manjistha powder (½ tsp)",
            diet: "Avoid fried/sour/spicy. Eat green vegetables.",
            yoga: "Sheetali Pranayama"
        },
        "anxiety": {
            title: "Anxiety (Chittodvega)",
            rx: "Brahmi tea (1 cup), Ashwagandha milk (1 tsp at night)",
            diet: "Avoid caffeine. Drink warm milk.",
            yoga: "Shavasana, Bhramari Pranayama"
        },
        "insomnia": {
            title: "Insomnia (Anidra/Sleeplessness)",
            rx: "Ashwagandha powder (3g) with warm Buffalo milk at night.",
            diet: "Include Ghee, Milk, Banana. Avoid Coffee/Tea after 4 PM.",
            yoga: "Shavasana, Bhramari Pranayama before bed."
        },
        "arthritis": {
            title: "Arthritis (Sandhivata)",
            rx: "Sesame oil massage, Shallaki (1 tab)",
            diet: "Eat Ghee, Ginger. Avoid Dry/Cold food.",
            yoga: "Gentle joint movements"
        },
        "asthma": {
            title: "Asthma (Tamaka Shwasa)",
            rx: "Trikatu (½ tsp) with honey",
            diet: "Avoid Cold water, Dairy at night.",
            yoga: "Matsyasana, Anulom Vilom"
        },
        "diabetes": {
            title: "Diabetes (Madhumeha)",
            rx: "Jamun seed powder (1 tsp), Gudmar",
            diet: "Eat Barley, Methi, Bitter gourd. Avoid Sugar, Rice.",
            yoga: "Mandukasana (10 mins daily)"
        },
        "bp": {
            title: "Hypertension (High BP)",
            rx: "Arjuna Bark Tea (1 cup)",
            diet: "Eat Bottle Gourd, Garlic. Avoid Salt, Pickles.",
            yoga: "Chandra Bhedana Pranayama"
        },
        "pcos": {
            title: "PCOS (Granthi Roga)",
            rx: "Kanchanar Guggulu (2 tabs)",
            diet: "Eat Seeds (Sesame/Flax). Avoid Sugar, Dairy.",
            yoga: "Butterfly Pose (Baddha Konasana)"
        },
        "thyroid": {
            title: "Hypothyroidism",
            rx: "Kanchanar, Trikatu",
            diet: "Eat Brazil nuts, Coriander water. Avoid Cabbage.",
            yoga: "Ujjayi Pranayama, Sarvangasana"
        },
        "headache": {
            title: "Headache (Shirashoola)",
            rx: "Ginger paste on forehead. Drink Ginger tea.",
            diet: "Avoid skipping meals.",
            yoga: "Shavasana (Corpse Pose)"
        },
        "joint": {
            title: "Joint Pain (Sandhi Shoola)",
            rx: "Mahanarayan Oil Massage. Turmeric milk.",
            diet: "Avoid sour foods (curd, pickles).",
            yoga: "Sukshma Vyayam (Micro exercises)"
        },
        "cold": {
            title: "Common Cold (Pratishyay)",
            rx: "Tulsi-Ginger tea, Sitopaladi Churna (1 tsp with honey)",
            diet: "Warm soups, avoid cold water/curd/dairy.",
            yoga: "Surya Namaskar, Kapalbhati"
        },
        "hairfall": {
            title: "Hair Fall (Khalitya)",
            rx: "Bhringraj Oil massage, Amla powder (1 tsp morning)",
            diet: "Eat Curry leaves, Moringa, Sesame seeds.",
            yoga: "Adho Mukha Svanasana (Inversions)"
        },
        "obesity": {
            title: "Obesity (Sthakulya)",
            rx: "Triphala Guggulu (2 tabs), Honey warm water morning",
            diet: "Fast once a week. Avoid sweets, fried food.",
            yoga: "Surya Namaskar (12 rounds), Kapalbhati"
        },
        "constipation": {
            title: "Constipation (Vibandha)",
            rx: "Triphala Churna (1 tsp) with warm water at night",
            diet: "Eat Papaya, Figs, Warm milk + Ghee.",
            yoga: "Pawanmuktasana"
        },
        "migraine": {
            title: "Migraine (Ardhavabhedaka)",
            rx: "Soaked Raisins (10) morning, Nasya (Ghee in nose)",
            diet: "Avoid skipping meals, excessive tea/coffee.",
            yoga: "Sheetali Pranayama, Meditation"
        }
    },
    HERBS: {
        "ashwagandha": "Strength, Stress, Sleep. Dosage: 3-5g with warm milk.",
        "triphala": "Detox, Digestion, Eyes. Dosage: 1 tsp with warm water at night.",
        "shatavari": "Female Hormones, Cooling. Dosage: 1 tsp with milk.",
        "giloy": "Immunity, Fever. Dosage: 500mg extract or juice.",
        "brahmi": "Memory, Focus, Calmness. Dosage: 1 tsp ghee or tea.",
        "arjuna": "Heart Health. Dosage: 1 cup tea (Ksheerapaka).",
        "tulsi": "Immunity, Cold, Respiratory. Dosage: Chew 5 leaves or take as tea.",
        "amla": "Vitamin C, Hair, Digestion, immunity. Dosage: 1 fresh fruit or 10ml juice.",
        "ginger": "Digestion, Cold, Nausea. Dosage: 1 tsp juice with honey or in tea.",
        "neem": "Skin detox, Blood purification, Infections. Dosage: Chew 2 leaves empty stomach."
    }
};

/*
  ADVANCED FALLBACK ENGINE
*/
const getFallbackResponse = (query) => {
    const lower = query.toLowerCase();

    // 1. GREETINGS
    if (lower.match(/^(hi|hello|hey|namaste)/)) {
        return "Hello! 🙏\nI am Dr. Sanjeevani. \n\n(Note: I am running in 'Offline Mode' as the AI Connection is unstable, but my internal database is fully active). \n\nHow can I help you today?";
    }

    // 1.5 ALIAS MAPPING
    const aliasMap = {
        'sleep': 'insomnia',
        'insomnia': 'insomnia',
        'flu': 'cold',
        'cold': 'cold',
        'cough': 'cold',
        'fat': 'obesity',
        'weight': 'obesity',
        'obesity': 'obesity',
        'stomach': 'acidity', // default to acidity for general stomach pain if unknown
        'bald': 'hairfall',
        'hair': 'hairfall',
        'poop': 'constipation',
        'constipation': 'constipation'
    };

    for (const [alias, key] of Object.entries(aliasMap)) {
        if (lower.includes(alias) && AYURVEDIC_DB.DISEASES[key]) {
            const data = AYURVEDIC_DB.DISEASES[key];
            return `🌿 **Ayurvedic Advice for ${data.title}**:\n\n` +
                `💊 **Prescription**: ${data.rx}\n` +
                `🥗 **Diet**: ${data.diet}\n` +
                `🧘 **Yoga**: ${data.yoga}\n\n` +
                `*Consult a Vaidya for serious conditions.*`;
        }
    }

    // 2. SEARCH DISEASE DATABASE
    for (const [key, data] of Object.entries(AYURVEDIC_DB.DISEASES)) {
        if (lower.includes(key)) {
            return `🌿 **Ayurvedic Advice for ${data.title}**:\n\n` +
                `💊 **Prescription**: ${data.rx}\n` +
                `🥗 **Diet**: ${data.diet}\n` +
                `🧘 **Yoga**: ${data.yoga}\n\n` +
                `*Consult a Vaidya for serious conditions.*`;
        }
    }

    // 3. SEARCH HERB DATABASE
    for (const [key, info] of Object.entries(AYURVEDIC_DB.HERBS)) {
        if (lower.includes(key)) {
            return `🌿 **Herb Info: ${key.charAt(0).toUpperCase() + key.slice(1)}**\n\n${info}`;
        }
    }

    // 4. GENERIC CATEGORIES
    if (lower.includes('diet') || lower.includes('food')) {
        return "🥗 **General Ayurvedic Diet Rules**:\n\n• Eat only when hungry.\n• Include all 6 tastes.\n• Avoid ice-cold drinks.\n• Eat fresh, warm, home-cooked meals.";
    }
    if (lower.includes('weight') || lower.includes('fat')) {
        return "⚖️ **Weight Management**:\n\n• Start your day with warm water + honey + lemon.\n• Avoid sleeping during the day.\n• Eat a light dinner (soup/salad) before 7 PM.";
    }

    // 5. CATCH-ALL
    return "I am Dr. Sanjeevani. 🌿\n\nI can help with home remedies for:\n- Cold, Cough, Hair Fall, Migraine\n- Obesity, Acidity, Acne, Anxiety\n- Diabetes, BP, PCOS, Thyroid\n\nPlease tell me your symptoms.";
};

module.exports = { getChatResponse };
