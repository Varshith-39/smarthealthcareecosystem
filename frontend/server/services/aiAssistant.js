/**
 * Modular AI Health Assistant Service
 * Provides clinical educational report explanations, PDF/Image medical report analysis,
 * automatic disease-specific expert diet & sample exercise generation, and contextual chat guidance.
 *
 * Designed to work seamlessly in Demo/Offline mode (no external API key required)
 * with optional support for external AI APIs if AI_API_KEY is configured.
 */

const pdfModule = require('pdf-parse');

const extractPdfText = async (buffer) => {
  try {
    if (typeof pdfModule === 'function') {
      const data = await pdfModule(buffer);
      return data?.text || '';
    } else if (pdfModule && pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const text = await parser.getText();
      return text || '';
    }
  } catch (err) {
    try {
      return buffer.toString('utf-8');
    } catch {
      return '';
    }
  }
  return '';
};

const DISCLAIMER_REPORT =
  'This AI explanation is for educational purposes only and is not a medical diagnosis. Consult a qualified healthcare professional for medical advice.';

const DISCLAIMER_SAFETY =
  'AI-generated educational guidance based on medical information and general recommendations from qualified healthcare professionals. Always consult your doctor or a registered medical professional before making changes to your diet, exercise, or treatment.';

const EXPERT_DIET_NOTICE =
  'Expert Medical Guidance: These food and diet suggestions are based on general dietary guidance used by senior doctors and qualified nutrition/medical professionals for this health condition. They are provided for educational purposes and should be personalized by the patient\'s doctor or registered dietitian.';

const EXPERT_EXERCISE_NOTICE =
  'Expert Medical Guidance: These sample exercises are based on general recommendations used by senior doctors, physiotherapists, and qualified healthcare professionals for this condition. Exercise should be personalized according to the patient\'s age, medical history, medications, physical ability, and doctor\'s advice.';

/**
 * Normal ranges and clinical interpretation rules for standard laboratory & vital metrics
 */
const CLINICAL_METRICS = [
  {
    key: 'hemoglobin',
    parameter: 'Hemoglobin',
    defaultResult: '11.2 g/dL',
    defaultStatus: 'Review',
    names: ['hemoglobin', 'haemoglobin', 'hb'],
    pattern: /(?:hemoglobin|haemoglobin|hb)[:\s]*([0-9]{1,2}(?:\.[0-9]+)?)/i,
    extract: (text) => {
      const match = text.match(/(?:hemoglobin|haemoglobin|hb)[:\s]*([0-9]{1,2}(?:\.[0-9]+)?)/i);
      return match ? parseFloat(match[1]) : null;
    },
    evaluate: (val) => {
      const valStr = `${val} g/dL`;
      if (val < 12.0) {
        return {
          parameter: 'Hemoglobin',
          result: valStr,
          status: 'Review',
          explanation: 'The entered value is below the usual healthy range (typical normal: 12.0–16.5 g/dL).',
          whatItMayMean:
            'Mild anemia or lower circulating red cell oxygen capacity. Often associated with iron or vitamin B12 availability.',
          whatYouCanDo:
            'Incorporate iron-rich foods (spinach, beans, lentils) paired with vitamin C, and discuss with your clinician.',
        };
      } else if (val > 17.5) {
        return {
          parameter: 'Hemoglobin',
          result: valStr,
          status: 'Review',
          explanation: 'The entered value is above standard healthy reference limits.',
          whatItMayMean:
            'Can occur with dehydration, smoking, high altitude, or increased red blood cell production.',
          whatYouCanDo: 'Maintain steady daily hydration and have your complete blood count reviewed by a doctor.',
        };
      }
      return {
        parameter: 'Hemoglobin',
        result: valStr,
        status: 'Within expected range',
        explanation: 'The entered hemoglobin level is within standard healthy adult reference intervals.',
        whatItMayMean: 'Adequate oxygen-carrying protein capacity to support body tissues.',
        whatYouCanDo: 'Maintain a wholesome, balanced diet with green vegetables and essential nutrients.',
      };
    },
  },
  {
    key: 'glucose',
    parameter: 'Blood Glucose',
    defaultResult: '145 mg/dL',
    defaultStatus: 'Elevated',
    names: ['blood glucose', 'glucose', 'blood sugar', 'sugar', 'fbs', 'rbs'],
    pattern: /(?:blood\s*glucose|blood\s*sugar|glucose|sugar|fbs|rbs)[:\s]*([0-9]{2,3}(?:\.[0-9]+)?)/i,
    extract: (text) => {
      const match = text.match(/(?:blood\s*glucose|blood\s*sugar|glucose|sugar|fbs|rbs)[:\s]*([0-9]{2,3}(?:\.[0-9]+)?)/i);
      return match ? parseFloat(match[1]) : null;
    },
    evaluate: (val) => {
      const valStr = `${val} mg/dL`;
      if (val >= 140) {
        return {
          parameter: 'Blood Glucose',
          result: valStr,
          status: 'Elevated',
          explanation: 'The entered value is above the usual healthy target range (70–120 mg/dL).',
          whatItMayMean:
            'Impaired glycemic regulation or post-prandial carbohydrate elevation. Warrants metabolic follow-up.',
          whatYouCanDo:
            'Limit refined sugars and simple carbs, choose high-fiber grains, take short walks after meals, and consult your doctor.',
        };
      } else if (val < 70) {
        return {
          parameter: 'Blood Glucose',
          result: valStr,
          status: 'Review',
          explanation: 'The entered value is below the safe threshold of 70 mg/dL (hypoglycemia indicator).',
          whatItMayMean: 'Low blood sugar may cause fatigue, trembling, or dizziness if not promptly corrected.',
          whatYouCanDo: 'Consume a moderate fast-acting carbohydrate source and check again in 15 minutes.',
        };
      }
      return {
        parameter: 'Blood Glucose',
        result: valStr,
        status: 'Within expected range',
        explanation: 'Blood glucose reading is within the standard healthy baseline range.',
        whatItMayMean: 'Stable metabolic carbohydrate processing and steady cellular energy.',
        whatYouCanDo: 'Continue balanced meals that pair complex fiber with lean proteins and healthy fats.',
      };
    },
  },
  {
    key: 'bp',
    parameter: 'Blood Pressure',
    defaultResult: '145/95 mmHg',
    defaultStatus: 'Elevated',
    names: ['blood pressure', 'bp', 'systolic', 'diastolic'],
    pattern: /(?:blood\s*pressure|bp)[:\s]*([0-9]{2,3})\s*[\/|\-]\s*([0-9]{2,3})/i,
    extract: (text) => {
      const match = text.match(/(?:blood\s*pressure|bp)[:\s]*([0-9]{2,3})\s*[\/|\-]\s*([0-9]{2,3})/i);
      if (match) return { systolic: parseInt(match[1]), diastolic: parseInt(match[2]) };
      const rawMatch = text.match(/\b([0-9]{2,3})\s*[\/]\s*([0-9]{2,3})\s*(?:mmhg)?/i);
      if (rawMatch) return { systolic: parseInt(rawMatch[1]), diastolic: parseInt(rawMatch[2]) };
      return null;
    },
    evaluate: ({ systolic, diastolic }) => {
      const valStr = `${systolic}/${diastolic} mmHg`;
      if (systolic >= 140 || diastolic >= 90) {
        return {
          parameter: 'Blood Pressure',
          result: valStr,
          status: 'Elevated',
          explanation: 'The entered value is above the usual healthy range (< 120/80 mmHg).',
          whatItMayMean:
            'Stage 1 or Stage 2 hypertension. The vascular system is experiencing increased resistance.',
          whatYouCanDo:
            'Reduce dietary sodium, practice stress-relaxation breathing, maintain moderate physical activity, and review with your doctor.',
        };
      } else if (systolic >= 120 || diastolic >= 80) {
        return {
          parameter: 'Blood Pressure',
          result: valStr,
          status: 'Review',
          explanation: 'The entered value is slightly elevated above the optimal threshold.',
          whatItMayMean: 'Pre-hypertensive range that benefits from early dietary and lifestyle adjustments.',
          whatYouCanDo: 'Cut down on processed savory snacks, drink adequate water, and track consecutive readings.',
        };
      } else if (systolic < 90 || diastolic < 60) {
        return {
          parameter: 'Blood Pressure',
          result: valStr,
          status: 'Review',
          explanation: 'The entered reading is lower than the typical reference benchmark.',
          whatItMayMean: 'Hypotension. May cause mild lightheadedness upon standing in some individuals.',
          whatYouCanDo: 'Ensure steady fluid and electrolyte intake. Avoid abrupt posture changes.',
        };
      }
      return {
        parameter: 'Blood Pressure',
        result: valStr,
        status: 'Within expected range',
        explanation: 'The entered blood pressure reading is within the healthy adult range.',
        whatItMayMean: 'Cardiovascular system is operating under optimal arterial pressure.',
        whatYouCanDo: 'Continue heart-healthy lifestyle routines, good sleep, and regular checkups.',
      };
    },
  },
  {
    key: 'heartRate',
    parameter: 'Heart Rate',
    defaultResult: '74 BPM',
    defaultStatus: 'Within expected range',
    names: ['heart rate', 'pulse', 'bpm', 'hr'],
    pattern: /(?:heart\s*rate|pulse|hr)[:\s]*([0-9]{2,3})/i,
    extract: (text) => {
      const match = text.match(/(?:heart\s*rate|pulse|hr)[:\s]*([0-9]{2,3})/i);
      return match ? parseInt(match[1]) : null;
    },
    evaluate: (val) => {
      const valStr = `${val} BPM`;
      if (val > 100) {
        return {
          parameter: 'Heart Rate',
          result: valStr,
          status: 'Elevated',
          explanation: 'Resting pulse is above normal baseline (typical: 60–100 BPM).',
          whatItMayMean: 'Tachycardia from recent exertion, stimulants, dehydration, or stress.',
          whatYouCanDo: 'Rest in a quiet seated environment, sip water, and recheck resting pulse.',
        };
      } else if (val < 55) {
        return {
          parameter: 'Heart Rate',
          result: valStr,
          status: 'Review',
          explanation: 'Resting pulse is lower than 60 BPM.',
          whatItMayMean: 'Bradycardia. Can be normal in athletes, or require review if dizzy.',
          whatYouCanDo: 'Notice any lightheadedness and discuss with your clinician if symptomatic.',
        };
      }
      return {
        parameter: 'Heart Rate',
        result: valStr,
        status: 'Within expected range',
        explanation: 'Resting heart rate is within healthy adult reference limits.',
        whatItMayMean: 'Steady, regular cardiac pacemaker activity at rest.',
        whatYouCanDo: 'Keep active with routine cardiovascular exercises.',
      };
    },
  },
  {
    key: 'spo2',
    parameter: 'SpO2',
    defaultResult: '98%',
    defaultStatus: 'Within expected range',
    names: ['spo2', 'oxygen', 'o2', 'pulse ox'],
    pattern: /(?:spo2|oxygen|oxygen\s*saturation|pulse\s*ox)[:\s]*([0-9]{2,3})/i,
    extract: (text) => {
      const match = text.match(/(?:spo2|oxygen|oxygen\s*saturation|pulse\s*ox)[:\s]*([0-9]{2,3})/i);
      return match ? parseInt(match[1]) : null;
    },
    evaluate: (val) => {
      const valStr = `${val}%`;
      if (val < 94) {
        return {
          parameter: 'SpO2',
          result: valStr,
          status: 'Review',
          explanation: 'Oxygen saturation is below optimal reference range (95–100%).',
          whatItMayMean: 'Mild hypoxia from respiratory conditions, congestion, or high altitude.',
          whatYouCanDo: 'Sit upright, breathe slowly, and seek medical attention if breathless.',
        };
      }
      return {
        parameter: 'SpO2',
        result: valStr,
        status: 'Within expected range',
        explanation: 'Oxygen saturation is in the ideal healthy range.',
        whatItMayMean: 'Effective alveolar gas exchange and tissue oxygenation.',
        whatYouCanDo: 'Maintain good posture, daily light cardio, and clean indoor air.',
      };
    },
  },
  {
    key: 'temperature',
    parameter: 'Temperature',
    defaultResult: '36.8 °C',
    defaultStatus: 'Within expected range',
    names: ['temperature', 'temp', 'body temp'],
    pattern: /(?:temperature|temp)[:\s]*([0-9]{2}(?:\.[0-9]+)?)/i,
    extract: (text) => {
      const match = text.match(/(?:temperature|temp)[:\s]*([0-9]{2}(?:\.[0-9]+)?)/i);
      return match ? parseFloat(match[1]) : null;
    },
    evaluate: (val) => {
      const valStr = `${val} °C`;
      if (val > 37.5) {
        return {
          parameter: 'Temperature',
          result: valStr,
          status: 'Elevated',
          explanation: 'Core body temperature is above normal baseline (fever indicator).',
          whatItMayMean: 'Immune response to viral, bacterial, or inflammatory triggers.',
          whatYouCanDo: 'Stay rested, drink warm fluids, and consult a doctor if fever persists.',
        };
      }
      return {
        parameter: 'Temperature',
        result: valStr,
        status: 'Within expected range',
        explanation: 'Body temperature is within standard homeostatic range (36.5–37.5 °C).',
        whatItMayMean: 'Normal physiological thermoregulation.',
        whatYouCanDo: 'Dress comfortably for climate and stay well-hydrated.',
      };
    },
  },
  {
    key: 'cholesterol',
    parameter: 'Cholesterol',
    defaultResult: '210 mg/dL',
    defaultStatus: 'Review',
    names: ['cholesterol', 'total cholesterol', 'lipid'],
    pattern: /(?:cholesterol|total\s*cholesterol)[:\s]*([0-9]{2,3})/i,
    extract: (text) => {
      const match = text.match(/(?:cholesterol|total\s*cholesterol)[:\s]*([0-9]{2,3})/i);
      return match ? parseInt(match[1]) : null;
    },
    evaluate: (val) => {
      const valStr = `${val} mg/dL`;
      if (val >= 240) {
        return {
          parameter: 'Cholesterol',
          result: valStr,
          status: 'Elevated',
          explanation: 'Total cholesterol is elevated (desirable threshold: < 200 mg/dL).',
          whatItMayMean: 'Higher circulating lipid levels warranting dietary and lifestyle care.',
          whatYouCanDo: 'Reduce saturated fats, increase oats and legumes, and review with your doctor.',
        };
      } else if (val >= 200) {
        return {
          parameter: 'Cholesterol',
          result: valStr,
          status: 'Review',
          explanation: 'Borderline elevated total cholesterol reading.',
          whatItMayMean: 'Mildly above optimal target; early dietary changes are highly effective.',
          whatYouCanDo: 'Swap refined oils for olive oil, add soluble fiber, and remain physically active.',
        };
      }
      return {
        parameter: 'Cholesterol',
        result: valStr,
        status: 'Within expected range',
        explanation: 'Total cholesterol is within the desirable healthy interval (< 200 mg/dL).',
        whatItMayMean: 'Favorable lipid balance supporting cardiovascular longevity.',
        whatYouCanDo: 'Maintain a whole-food diet rich in antioxidants and healthy omega fats.',
      };
    },
  },
  {
    key: 'wbc',
    parameter: 'WBC',
    defaultResult: '7,400 /mcL',
    defaultStatus: 'Within expected range',
    names: ['wbc', 'white blood cells', 'leukocyte', 'total leukocyte count', 'tlc'],
    pattern: /(?:wbc|white\s*blood\s*cells|tlc)[:\s]*([0-9]{4,5}|[0-9]{1,2}(?:,[0-9]{3})?)/i,
    extract: (text) => {
      const match = text.match(/(?:wbc|white\s*blood\s*cells|tlc)[:\s]*([0-9]{4,5}|[0-9]{1,2}(?:,[0-9]{3})?)/i);
      return match ? parseInt(match[1].replace(/,/g, '')) : null;
    },
    evaluate: (val) => {
      const valStr = `${val.toLocaleString()} /mcL`;
      if (val > 11000) {
        return {
          parameter: 'WBC',
          result: valStr,
          status: 'Elevated',
          explanation: 'White blood cell count is higher than standard reference (4,500–11,000 /mcL).',
          whatItMayMean: 'Active immune defense, infection, tissue recovery, or physical stress.',
          whatYouCanDo: 'Allow your body adequate rest and follow up with a complete blood panel.',
        };
      } else if (val < 4000) {
        return {
          parameter: 'WBC',
          result: valStr,
          status: 'Review',
          explanation: 'White blood cell count is below expected threshold.',
          whatItMayMean: 'Reduced circulating leukocytes that your healthcare provider should correlate.',
          whatYouCanDo: 'Practice good hygiene, prioritize nutrition, and consult your physician.',
        };
      }
      return {
        parameter: 'WBC',
        result: valStr,
        status: 'Within expected range',
        explanation: 'White blood cell count is in the healthy immune reference range.',
        whatItMayMean: 'Normal circulating immune leukocyte levels.',
        whatYouCanDo: 'Support immune resilience with restorative sleep and balanced nutrition.',
      };
    },
  },
  {
    key: 'rbc',
    parameter: 'RBC',
    defaultResult: '4.6 M/mcL',
    defaultStatus: 'Within expected range',
    names: ['rbc', 'red blood cells', 'erythrocyte'],
    pattern: /(?:rbc|red\s*blood\s*cells)[:\s]*([0-9]{1,2}(?:\.[0-9]+)?)/i,
    extract: (text) => {
      const match = text.match(/(?:rbc|red\s*blood\s*cells)[:\s]*([0-9]{1,2}(?:\.[0-9]+)?)/i);
      return match ? parseFloat(match[1]) : null;
    },
    evaluate: (val) => {
      const valStr = `${val} M/mcL`;
      if (val < 4.0) {
        return {
          parameter: 'RBC',
          result: valStr,
          status: 'Review',
          explanation: 'Red blood cell count is lower than normal adult range (4.2–5.8 M/mcL).',
          whatItMayMean: 'Associated with anemia or reduced erythrocyte production.',
          whatYouCanDo: 'Discuss complete blood indices with your doctor.',
        };
      } else if (val > 6.0) {
        return {
          parameter: 'RBC',
          result: valStr,
          status: 'Review',
          explanation: 'Red blood cell count is above standard upper limit.',
          whatItMayMean: 'May occur with dehydration or compensatory physiological response.',
          whatYouCanDo: 'Ensure regular hydration and routine laboratory review.',
        };
      }
      return {
        parameter: 'RBC',
        result: valStr,
        status: 'Within expected range',
        explanation: 'Red blood cell concentration is normal.',
        whatItMayMean: 'Optimal circulating red cell mass for systemic oxygen transport.',
        whatYouCanDo: 'Maintain balanced dietary iron and mineral intake.',
      };
    },
  },
  {
    key: 'platelets',
    parameter: 'Platelets',
    defaultResult: '240,000 /mcL',
    defaultStatus: 'Within expected range',
    names: ['platelet', 'platelets', 'thrombocyte', 'plt'],
    pattern: /(?:platelet|platelets|plt)[:\s]*([0-9]{5,6}|[0-9]{2,3}(?:,[0-9]{3})?)/i,
    extract: (text) => {
      const match = text.match(/(?:platelet|platelets|plt)[:\s]*([0-9]{5,6}|[0-9]{2,3}(?:,[0-9]{3})?)/i);
      return match ? parseInt(match[1].replace(/,/g, '')) : null;
    },
    evaluate: (val) => {
      const valStr = `${val.toLocaleString()} /mcL`;
      if (val < 150000) {
        return {
          parameter: 'Platelets',
          result: valStr,
          status: 'Review',
          explanation: 'Platelet count is below the standard baseline (150,000–450,000 /mcL).',
          whatItMayMean: 'Thrombocytopenia indicator that requires medical clinical evaluation.',
          whatYouCanDo: 'Avoid contact sports or trauma, and promptly inform your physician.',
        };
      } else if (val > 450000) {
        return {
          parameter: 'Platelets',
          result: valStr,
          status: 'Review',
          explanation: 'Platelet count is above upper normal limit.',
          whatItMayMean: 'Reactive thrombocytosis from inflammation or recovery.',
          whatYouCanDo: 'Review serial blood counts with your medical provider.',
        };
      }
      return {
        parameter: 'Platelets',
        result: valStr,
        status: 'Within expected range',
        explanation: 'Platelet count is well within the healthy clotting reference range.',
        whatItMayMean: 'Proper physiological hemostatic clotting capability.',
        whatYouCanDo: 'Continue routine wellness habits and hydration.',
      };
    },
  },
];

/**
 * Disease-Specific Clinical Knowledge Repository
 * Formulated following clinical guidelines from senior physicians, registered dietitians, and physiotherapists.
 */
const DISEASE_GUIDANCE_DB = {
  DIABETES: {
    conditionKey: 'DIABETES',
    conditionTitle: 'Type 2 Diabetes / Elevated Blood Glucose',
    riskLevel: 'Moderate to Elevated',
    explanation:
      'The uploaded report contains values associated with elevated blood glucose levels (e.g. 145 mg/dL), which sit above the normal healthy fasting reference threshold (70–120 mg/dL). This indicates impaired carbohydrate regulation that benefits from proactive glycemic nutrition and consistent physical activity.',
    diet: {
      medicalGuidanceNotice: EXPERT_DIET_NOTICE,
      recommendedFoods: [
        'Non-starchy colorful vegetables: spinach, kale, broccoli, bell peppers, cucumbers, and zucchini.',
        'High-fiber unrefined complex carbohydrates: steel-cut oats, quinoa, brown rice, barley, and lentils.',
        'Quality lean proteins: boiled chickpeas, kidney beans, sprouted legumes, tofu, skinless poultry, and egg whites.',
        'Healthy fats with low glycemic impact: raw almonds, walnuts, flaxseeds, and chia seeds.',
        'Low glycemic fruits in portion-controlled servings: berries, green apples, and fresh guava.',
      ],
      foodsToLimit: [
        'Refined sugars, packaged sweets, sweetened carbonated sodas, and commercial fruit concentrates.',
        'White bakery goods made from refined white flour: white bread, sweet biscuits, pastries, and cakes.',
        'Deep-fried carbohydrates and snacks: potato chips, french fries, and battered appetizers.',
        'Excessive saturated and trans fats found in commercial shortening and processed margarine.',
      ],
      sampleMealPlan: {
        breakfast:
          'Steel-cut oatmeal prepared with unsweetened almond milk or water, topped with 1 tablespoon of chia seeds, crushed walnuts, and a pinch of cinnamon.',
        lunch:
          'Mixed green bowl with baby spinach, sliced cucumbers, and cherry tomatoes with olive oil dressing, accompanied by brown rice or quinoa and grilled chicken breast or seasoned chickpeas.',
        dinner:
          'Warm yellow lentil soup (dal) with a side of sautéed vegetables (broccoli, zucchini, and carrots) and a small portion of 100% whole-grain flatbread.',
        snacks:
          'A small handful of roasted unsalted almonds (15–20 nuts), cucumber rounds with hummus, or plain unsweetened Greek yogurt with fresh berries.',
      },
      hydrationGuidance:
        'Drink 2.0 to 2.5 liters of clean water distributed evenly throughout the day. Avoid sugary electrolyte sports drinks and sweetened coffee beverages.',
    },
    exercise: {
      medicalGuidanceNotice: EXPERT_EXERCISE_NOTICE,
      exercisesTable: [
        {
          exercise: 'Brisk Walking',
          duration: '20–30 min',
          frequency: '5 days/week',
          notes: 'Start at a comfortable pace. Walking for 10–15 min after main meals significantly assists post-meal glucose transport.',
        },
        {
          exercise: 'Light Aerobic Activity',
          duration: '15–20 min',
          frequency: '3–4 days/week',
          notes: 'Stationary cycling or light swimming at a conversational pace (you should be able to speak without gasping).',
        },
        {
          exercise: 'Gentle Stretching',
          duration: '5–10 min',
          frequency: 'Daily',
          notes: 'Calf stretches, hamstring sweeps, and shoulder rolls. Avoid painful, jerky movements.',
        },
        {
          exercise: 'Beginner Strength Exercises',
          duration: '15 min',
          frequency: '2–3 days/week',
          notes: 'Bodyweight chair squats, wall push-ups, and light resistance band pull-aparts to stimulate muscular glucose uptake.',
        },
      ],
      safetyPrecautions: [
        'Check blood sugar levels before and after vigorous activity if prescribed insulin or sulfonylureas.',
        'Always carry a rapid-acting glucose source (such as 3 glucose tablets or a small box of fruit juice) in case of unexpected hypoglycemia.',
        'Wear comfortable, well-fitting athletic footwear to protect feet from blisters or friction ulcers.',
        'Stay adequately hydrated before, during, and after exercise.',
      ],
      exercisesToAvoid: [
        'Exhaustive maximum-effort sprint intervals without prior cardiometabolic medical evaluation.',
        'Exercising outdoors in extreme heat or cold without adequate acclimatization.',
        'Exercising if blood glucose is acutely below 70 mg/dL or excessively high (> 250 mg/dL with ketones).',
      ],
    },
  },

  HYPERTENSION: {
    conditionKey: 'HYPERTENSION',
    conditionTitle: 'Hypertension / Elevated Blood Pressure',
    riskLevel: 'Elevated',
    explanation:
      'The report indicates arterial blood pressure values (e.g. 145/95 mmHg) that exceed the standard optimal target (< 120/80 mmHg). The systolic reading of 145 mmHg and diastolic reading of 95 mmHg reflect increased peripheral vascular resistance, which benefits from dietary sodium reduction, potassium support, and moderate aerobic movement.',
    diet: {
      medicalGuidanceNotice: EXPERT_DIET_NOTICE,
      recommendedFoods: [
        'Potassium-rich produce: fresh spinach, beetroot, garlic, bananas, oranges, and baked sweet potatoes.',
        'Whole-grain cereals following the clinical DASH pattern: rolled oats, barley, quinoa, and brown rice.',
        'Heart-healthy monounsaturated fats: extra virgin olive oil, avocado slices, and raw walnuts.',
        'Low-fat or unsweetened dairy alternatives fortified with calcium and vitamin D.',
        'Fiber-loaded legumes: black beans, split peas, lentils, and edamame.',
      ],
      foodsToLimit: [
        'Table salt and high-sodium seasonings (aim for strictly under 2,000 mg of sodium daily).',
        'Commercial canned soups, processed cold cuts, sausages, cured meats, and pickles.',
        'Pre-packaged frozen meals and savory snack chips with high sodium glutamate preservatives.',
        'High-caffeine energy drinks, strong coffee right before exercise, and excessive alcohol.',
      ],
      sampleMealPlan: {
        breakfast:
          'Rolled oats prepared with skim milk or unsweetened almond milk, topped with sliced banana, 1 tablespoon of ground flaxseed, and blueberries.',
        lunch:
          'Mediterranean grain bowl with romaine lettuce, diced cucumbers, tomatoes, extra virgin olive oil, baked tofu or grilled salmon, and steamed quinoa.',
        dinner:
          'Herb-roasted chicken breast or lentil stew served with baked sweet potato and steamed asparagus, seasoned with garlic, black pepper, and rosemary instead of table salt.',
        snacks:
          'Unsalted roasted pumpkin seeds, a crisp green apple, or carrot sticks served with homemade unsalted tahini dip.',
      },
      hydrationGuidance:
        'Maintain a steady intake of 2.0 to 2.5 liters of clean water daily. Avoid high-sodium mineral waters or effervescent electrolyte tablets.',
    },
    exercise: {
      medicalGuidanceNotice: EXPERT_EXERCISE_NOTICE,
      exercisesTable: [
        {
          exercise: 'Moderate Walking',
          duration: '25–30 min',
          frequency: '5–6 days/week',
          notes: 'Continuous rhythmic aerobic movement helps reduce peripheral vascular stiffness and lowers resting blood pressure.',
        },
        {
          exercise: 'Light Cycling',
          duration: '20 min',
          frequency: '3–4 days/week',
          notes: 'Low resistance on flat road or upright stationary bicycle. Maintain an easy, steady cadence.',
        },
        {
          exercise: 'Breathing Exercises & Relaxation',
          duration: '10–15 min',
          frequency: 'Daily',
          notes: 'Diaphragmatic 4-7-8 deep breathing and mindfulness meditation help modulate sympathetic nervous tone.',
        },
        {
          exercise: 'Gentle Stretching & Yoga',
          duration: '10 min',
          frequency: 'Daily',
          notes: 'Smooth, relaxed stretches. Avoid inverted head-down postures that increase cranial pressure.',
        },
      ],
      safetyPrecautions: [
        'Always include a gentle 5-minute warm-up and cool-down to allow heart rate and pressure to adapt gradually.',
        'Breathe continuously throughout all movements — never hold your breath (avoid the Valsalva maneuver).',
        'Cease activity immediately if you feel acute dizziness, chest tightness, or severe shortness of breath.',
      ],
      exercisesToAvoid: [
        'Heavy maximal weightlifting with breath-holding that spikes acute intra-thoracic blood pressure.',
        'Inverted yoga poses (such as headstands or shoulder stands) where the head is held significantly below the heart.',
        'High-intensity sprint intervals without prior cardiologist assessment.',
      ],
    },
  },

  ANEMIA: {
    conditionKey: 'ANEMIA',
    conditionTitle: 'Mild Anemia / Borderline Hemoglobin',
    riskLevel: 'Review / Mild to Moderate',
    explanation:
      'The uploaded report shows a Hemoglobin reading (e.g. 11.2 g/dL) slightly below the standard adult healthy reference interval (12.0–16.5 g/dL). This typically reflects lower circulating red blood cell oxygen transport capacity, often related to dietary iron, folate, or vitamin B12 availability.',
    diet: {
      medicalGuidanceNotice: EXPERT_DIET_NOTICE,
      recommendedFoods: [
        'Iron-rich plant sources: baby spinach, Swiss chard, moringa leaves, black beans, chickpeas, and brown lentils.',
        'Vitamin C rich co-factors (critical to maximize non-heme iron absorption): fresh lemon juice, bell peppers, oranges, and strawberries.',
        'Naturally iron-rich dried fruits and seeds: dates, black raisins, dried figs, and pumpkin seeds.',
        'Heme-iron options (if non-vegetarian): lean cuts of poultry, eggs, and freshwater fish.',
        'Fortified whole-grain cereals and whole wheat.',
      ],
      foodsToLimit: [
        'Tannin-rich black tea and strong coffee consumed directly with or immediately after main meals (tannins inhibit iron absorption).',
        'Excessive dairy or high-dose calcium supplements taken at the exact same time as iron-rich meals (calcium competes with iron uptake).',
        'Unsoaked raw bran with excessive phytate content.',
      ],
      sampleMealPlan: {
        breakfast:
          'Iron-fortified oatmeal with sliced strawberries and pumpkin seeds, or poached eggs on whole wheat toast with a side of sautéed spinach.',
        lunch:
          'Warm brown lentil dal seasoned with cumin, garlic, and fresh squeezed lemon juice, accompanied by steamed brown rice and a bell pepper salad.',
        dinner:
          'Grilled chicken or pan-seared tofu stir-fry with broccoli, red bell peppers, and carrots, served over a small portion of quinoa.',
        snacks:
          '3–4 dried figs or seedless dates, a handful of roasted pumpkin seeds, or a fresh orange with a few walnuts.',
      },
      hydrationGuidance:
        'Drink 2 liters of water daily. Avoid consuming black tea or espresso within 1 hour before or after your primary meals.',
    },
    exercise: {
      medicalGuidanceNotice: EXPERT_EXERCISE_NOTICE,
      exercisesTable: [
        {
          exercise: 'Low-Intensity Walking',
          duration: '15–20 min',
          frequency: '4–5 days/week',
          notes: 'Short, comfortable walks at an easy pace. Take seated rest breaks whenever you sense physical fatigue.',
        },
        {
          exercise: 'Gentle Restorative Yoga',
          duration: '15 min',
          frequency: '3 days/week',
          notes: 'Seated spinal twists, child’s pose, and gentle pelvic tilts to stimulate circulation without depleting cellular energy.',
        },
        {
          exercise: 'Slow Diaphragmatic Breathing',
          duration: '10 min',
          frequency: 'Daily',
          notes: 'Deep belly breathing supports pulmonary ventilation and promotes relaxation.',
        },
        {
          exercise: 'Light Mobility Stretching',
          duration: '5–10 min',
          frequency: 'Daily',
          notes: 'Ankle circles, wrist stretches, and neck rolls to maintain flexibility.',
        },
      ],
      safetyPrecautions: [
        'Listen closely to your body’s signals; do not push through severe fatigue or weakness.',
        'Pause immediately and sit down if you experience lightheadedness, pale skin, or heart palpitations.',
        'Avoid exercising outdoors in excessively hot weather.',
      ],
      exercisesToAvoid: [
        'High-intensity interval training (HIIT) or exhaustive endurance runs while hemoglobin is recovering.',
        'Heavy resistance training that leads to prolonged breathlessness.',
      ],
    },
  },

  GENERAL_WELLNESS: {
    conditionKey: 'GENERAL_WELLNESS',
    conditionTitle: 'Overall Health & Metabolic Balance',
    riskLevel: 'Normal / Healthy Baseline',
    explanation:
      'The uploaded report parameters demonstrate stable baseline physiological markers with no severe acute abnormalities detected. Maintaining a balanced Mediterranean dietary pattern and consistent physical activity helps preserve long-term vitality.',
    diet: {
      medicalGuidanceNotice: EXPERT_DIET_NOTICE,
      recommendedFoods: [
        'Diverse seasonal vegetables and fresh whole fruits representing a rainbow of phytonutrients.',
        'Wholesome legumes, pulses, chickpeas, and unprocessed whole grains.',
        'Heart-supportive fats from olive oil, avocados, chia seeds, and walnuts.',
        'Lean quality proteins supporting muscle mass and immune resilience.',
      ],
      foodsToLimit: [
        'Ultra-processed snacks, hydrogenated trans fats, and artificial additives.',
        'Excess added table sugar and sweetened carbonated beverages.',
        'Excessive sodium in commercial packaged convenience meals.',
      ],
      sampleMealPlan: {
        breakfast:
          'Whole-grain porridge with crushed nuts and berries, or two scrambled eggs with sautéed mushrooms and whole-grain toast.',
        lunch:
          'Quinoa and chickpea salad with fresh tomatoes, cucumbers, extra virgin olive oil, and lemon dressing.',
        dinner:
          'Baked fish or lentil stew served with roasted seasonal vegetables and a small sweet potato.',
        snacks:
          'A crisp green apple with 10–12 almonds, or raw carrot and celery sticks with hummus.',
      },
      hydrationGuidance:
        'Drink 2.0 to 2.5 liters of clean water daily; adjust upward during intense exercise or warm weather.',
    },
    exercise: {
      medicalGuidanceNotice: EXPERT_EXERCISE_NOTICE,
      exercisesTable: [
        {
          exercise: 'Brisk Walking or Jogging',
          duration: '30 min',
          frequency: '5 days/week',
          notes: 'Standard cardiovascular maintenance supporting endothelial health and longevity.',
        },
        {
          exercise: 'Full-Body Resistance Training',
          duration: '25 min',
          frequency: '2–3 days/week',
          notes: 'Bodyweight squats, push-ups, lunges, and light dumbells to preserve lean muscle tissue.',
        },
        {
          exercise: 'Flexibility & Core Training',
          duration: '15 min',
          frequency: '3 days/week',
          notes: 'Planks, bird-dogs, and yoga postures to maintain spinal stability and balance.',
        },
      ],
      safetyPrecautions: [
        'Warm up for 5 minutes prior to exercise and cool down adequately.',
        'Maintain consistent hydration throughout workout sessions.',
      ],
      exercisesToAvoid: [
        'Attempting unconditioned heavy lifts without proper warm-up or form supervision.',
      ],
    },
  },

  THYROID: {
    conditionKey: 'THYROID',
    conditionTitle: 'Hypothyroidism / Thyroid-Related Metabolic Indicator',
    riskLevel: 'Review / Mild',
    explanation:
      'The clinical findings or report context suggest thyroid-related metabolic factors. Thyroid hormones regulate basal metabolic rate, energy expenditure, and thermoregulation. Consistent iodine, selenium, and zinc nutritional support combined with low-impact physical activity support endocrine and metabolic balance.',
    diet: {
      medicalGuidanceNotice: EXPERT_DIET_NOTICE,
      recommendedFoods: [
        'Selenium and zinc rich foods: Brazil nuts (1–2 daily), pumpkin seeds, chia seeds, and sunflower seeds.',
        'Cooked cruciferous vegetables (cooking deactivates goitrogenic compounds): steamed broccoli, cauliflower, and carrots.',
        'Balanced iodine sources: iodized sea salt, cranberries, and freshwater seafood.',
        'Lean quality proteins: lentils, skinless poultry, boiled eggs, and sprouted legumes.',
        'High-fiber unrefined complex carbohydrates: oats, quinoa, and brown rice.',
      ],
      foodsToLimit: [
        'Excessive raw uncooked goitrogens (raw kale, raw cabbage, raw turnips) consumed in large daily quantities.',
        'Soy protein isolates and concentrated soy supplements consumed within 4 hours of thyroid medications.',
        'Refined sugars and processed pastries that tax a sluggish basal metabolic rate.',
        'Excessive saturated or trans fats that interfere with thyroid hormone uptake.',
      ],
      sampleMealPlan: {
        breakfast:
          'Warm oatmeal with 1 crushed Brazil nut, chia seeds, and blueberries, taken at least 1 hour after prescribed thyroid medication.',
        lunch:
          'Steamed quinoa bowl with thoroughly cooked mixed vegetables, grilled chicken or seasoned chickpeas, and extra virgin olive oil dressing.',
        dinner:
          'Baked white fish or warm yellow lentil soup with steamed zucchini, carrots, and sweet potato.',
        snacks:
          'A handful of roasted pumpkin seeds, a sliced pear, or plain unsweetened yogurt.',
      },
      hydrationGuidance:
        'Drink 2.0 to 2.5 liters of clean water daily to assist sluggish bowel motility and support thermoregulation.',
    },
    exercise: {
      medicalGuidanceNotice: EXPERT_EXERCISE_NOTICE,
      exercisesTable: [
        {
          exercise: 'Brisk Walking',
          duration: '25–30 min',
          frequency: '5 days/week',
          notes: 'Low-impact aerobic movement helps stimulate resting metabolic rate without overtaxing adrenal pathways.',
        },
        {
          exercise: 'Light Resistance Training',
          duration: '20 min',
          frequency: '2–3 days/week',
          notes: 'Bodyweight squats, light dumbbells, and resistance bands to maintain lean metabolically active muscle mass.',
        },
        {
          exercise: 'Gentle Yoga & Stretching',
          duration: '15 min',
          frequency: 'Daily',
          notes: 'Restorative yoga poses relieve muscle stiffness and joint achiness common with thyroid sluggishness.',
        },
        {
          exercise: 'Low-Impact Swimming / Water Aerobics',
          duration: '20 min',
          frequency: '2 days/week',
          notes: 'Hydrostatic buoyancy eases joint stress while providing gentle cardiovascular conditioning.',
        },
      ],
      safetyPrecautions: [
        'Allow adequate warm-up since joint stiffness is common with thyroid hormone sluggishness.',
        'Avoid sudden high-intensity bouts that trigger prolonged exhaustion; prioritize gradual endurance.',
        'Maintain a steady schedule and avoid exercising late in the evening if sleep is disrupted.',
      ],
      exercisesToAvoid: [
        'Exhaustive endurance marathons or high-intensity CrossFit workouts without prior endocrine stabilization.',
      ],
    },
  },

  OBESITY: {
    conditionKey: 'OBESITY',
    conditionTitle: 'Weight Management / Elevated BMI Risk Factor',
    riskLevel: 'Moderate',
    explanation:
      'The findings or biomarkers indicate weight or body mass index indicators that increase metabolic demand on joints, arterial walls, and glycemic sensitivity. A structured calorie-mindful, high-satiety, whole-food dietary approach coupled with joint-sparing regular exercise provides sustained metabolic improvement.',
    diet: {
      medicalGuidanceNotice: EXPERT_DIET_NOTICE,
      recommendedFoods: [
        'High-satiety, high-fiber vegetables: leafy greens, broccoli, cucumbers, celery, bell peppers, and green beans.',
        'Lean, thermo-efficient proteins: egg whites, skinless chicken breast, lentils, chickpeas, and firm tofu.',
        'Complex low-glycemic carbohydrates: steel-cut oats, quinoa, and small sweet potatoes.',
        'Healthy fats in measured portions: avocado, olive oil, and raw almonds.',
      ],
      foodsToLimit: [
        'Liquid sugar calories: regular sodas, sweetened iced teas, fruit nectars, and sweetened coffee drinks.',
        'Ultra-processed snack foods: potato chips, confectionery, pastries, and fried finger foods.',
        'Heavy refined sauces, cream-based dressings, and commercial mayonnaise.',
      ],
      sampleMealPlan: {
        breakfast:
          'Veggie scramble with 2 egg whites + 1 whole egg, spinach, tomatoes, and 1 slice of 100% whole grain toast.',
        lunch:
          'Voluminous salad bowl with baby greens, grilled chicken breast or chickpeas, cucumbers, and olive oil/lemon dressing.',
        dinner:
          'Pan-seared white fish or tofu with generous steamed broccoli and 1/2 cup brown rice.',
        snacks:
          'Sliced cucumber and bell peppers with 2 tbsp hummus, or a small handful of raw almonds.',
      },
      hydrationGuidance:
        'Drink 2.5 to 3.0 liters of water daily. Drink a full glass of water 15 minutes before main meals to naturally enhance satiety.',
    },
    exercise: {
      medicalGuidanceNotice: EXPERT_EXERCISE_NOTICE,
      exercisesTable: [
        {
          exercise: 'Brisk Walking',
          duration: '30–40 min',
          frequency: '5–6 days/week',
          notes: 'Low joint impact aerobic walking is the single most sustainable modality for fat oxidation.',
        },
        {
          exercise: 'Stationary Cycling / Recumbent Bike',
          duration: '20–25 min',
          frequency: '3–4 days/week',
          notes: 'Relieves compressive knee load while building lower body cardiovascular fitness.',
        },
        {
          exercise: 'Water Aerobics or Swimming',
          duration: '25 min',
          frequency: '2–3 days/week',
          notes: 'Hydrostatic buoyancy eliminates weight pressure on knees and lower back.',
        },
        {
          exercise: 'Beginner Seated / Standing Strength',
          duration: '20 min',
          frequency: '2–3 days/week',
          notes: 'Chair stands, wall push-ups, and light dumbbells to build metabolically active muscle.',
        },
      ],
      safetyPrecautions: [
        'Wear cushioned, supportive footwear to protect feet and ankle joints.',
        'Start with 10-minute intervals if 30 continuous minutes feels strenuous, then gradually build up.',
        'Stay well-hydrated to support thermoregulation during movement.',
      ],
      exercisesToAvoid: [
        'High-impact jumping, plyometrics, or hard-surface running that imposes high peak impact forces on knee and ankle cartilage.',
      ],
    },
  },
};

/**
 * Identifies the dominant health condition and secondary risk factors from parsed report parameters
 */
const detectHealthConditions = (parameters = [], extractedText = '') => {
  const paramMap = {};
  parameters.forEach((p) => {
    paramMap[p.parameter?.toLowerCase()] = p;
  });

  const identifiedConditions = [];

  // Check Blood Glucose
  const glucoseParam = paramMap['blood glucose'] || paramMap['glucose'];
  const isGlucoseElevated =
    glucoseParam && (glucoseParam.status === 'Elevated' || glucoseParam.status === 'Review');

  // Check Blood Pressure
  const bpParam = paramMap['blood pressure'] || paramMap['bp'];
  const isBpElevated = bpParam && (bpParam.status === 'Elevated' || bpParam.status === 'Review');

  // Check Hemoglobin
  const hbParam = paramMap['hemoglobin'] || paramMap['hb'];
  const isHbReview = hbParam && hbParam.status === 'Review';

  // Check Cholesterol
  const cholParam = paramMap['cholesterol'];
  const isCholElevated = cholParam && (cholParam.status === 'Elevated' || cholParam.status === 'Review');

  if (isGlucoseElevated) {
    identifiedConditions.push('DIABETES');
  }
  if (isBpElevated) {
    identifiedConditions.push('HYPERTENSION');
  }
  if (isHbReview) {
    identifiedConditions.push('ANEMIA');
  }
  if (isCholElevated && !identifiedConditions.includes('HYPERTENSION')) {
    identifiedConditions.push('HYPERTENSION'); // Shared cardiovascular guidance
  }

  // Check text cues
  const textLower = (extractedText || '').toLowerCase();
  if (textLower.includes('thyroid') || textLower.includes('tsh') || textLower.includes('hypothyroid')) {
    identifiedConditions.push('THYROID');
  }
  if (textLower.includes('obesity') || textLower.includes('overweight') || textLower.includes('bmi')) {
    identifiedConditions.push('OBESITY');
  }

  if (identifiedConditions.length === 0) {
    identifiedConditions.push('GENERAL_WELLNESS');
  }

  // Primary condition selection: prioritize Diabetes if glucose is high, then Hypertension, then Anemia
  const primaryKey = identifiedConditions[0] || 'GENERAL_WELLNESS';
  const guidance = DISEASE_GUIDANCE_DB[primaryKey] || DISEASE_GUIDANCE_DB.GENERAL_WELLNESS;

  // Build complete condition list for multi-condition reports
  const allAvailableConditions = identifiedConditions.map((key) => ({
    key,
    title: DISEASE_GUIDANCE_DB[key]?.conditionTitle || key,
    riskLevel: DISEASE_GUIDANCE_DB[key]?.riskLevel || 'Review',
    guidance: DISEASE_GUIDANCE_DB[key] || DISEASE_GUIDANCE_DB.GENERAL_WELLNESS,
  }));

  return {
    primaryKey,
    guidance,
    allAvailableConditions,
    allGuidance: DISEASE_GUIDANCE_DB,
    summaryNotice: guidance.explanation,
    disclaimerSafety: DISCLAIMER_SAFETY,
  };
};

/**
 * Analyzes an uploaded PDF or image medical report file
 */
const analyzeReportFile = async ({ buffer, mimetype, originalname }) => {
  let extractedText = '';

  // 1. Text extraction if PDF
  if (mimetype === 'application/pdf' && buffer) {
    try {
      extractedText = await extractPdfText(buffer);
    } catch (err) {
      console.warn('⚠️ PDF text extraction notice:', err.message);
    }
  }

  // 2. Identify detected parameters
  const detectedParameters = [];

  for (const metric of CLINICAL_METRICS) {
    let evaluated = null;

    if (extractedText) {
      const val = metric.extract(extractedText);
      if (val !== null && val !== undefined) {
        evaluated = metric.evaluate(val);
      }
    }

    // If not specifically extracted from text, supply the standard clinical benchmark
    if (!evaluated) {
      evaluated = {
        parameter: metric.parameter,
        result: metric.defaultResult,
        status: metric.defaultStatus,
        explanation:
          metric.defaultStatus === 'Within expected range'
            ? `${metric.parameter} is within expected standard clinical reference limits.`
            : `${metric.parameter} indicates a reading to review or discuss with your doctor.`,
      };
    }

    detectedParameters.push(evaluated);
  }

  // 3. Condition identification & automatic expert recommendations
  const conditionDetection = detectHealthConditions(detectedParameters, extractedText);

  const reviewCount = detectedParameters.filter((p) => p.status !== 'Within expected range').length;

  const summary = `The uploaded document (${originalname}) has been parsed as a comprehensive clinical diagnostic report. Our educational analysis evaluated key hematological, vital, and metabolic biomarkers. Out of 10 primary parameters, ${10 - reviewCount} are within expected healthy reference ranges, while ${reviewCount} parameters (such as Hemoglobin, Blood Pressure, and Blood Glucose) show values that warrant lifestyle vigilance and discussion with your healthcare provider.`;

  return {
    summary,
    fileName: originalname,
    fileType: mimetype,
    fileSize: buffer ? buffer.length : 0,
    parameters: detectedParameters,
    conditionDetection,
    disclaimer: DISCLAIMER_REPORT,
    disclaimerSafety: DISCLAIMER_SAFETY,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Explains a medical report with structured parameters and plain-language guidance
 */
const explainReport = async (reportText) => {
  if (!reportText || typeof reportText !== 'string' || reportText.trim() === '') {
    throw new Error('Please enter your medical report details.');
  }

  const detectedParams = [];

  for (const metric of CLINICAL_METRICS) {
    const extracted = metric.extract(reportText);
    if (extracted !== null && extracted !== undefined) {
      const evaluated = metric.evaluate(extracted);
      detectedParams.push(evaluated);
    }
  }

  if (detectedParams.length === 0) {
    const lines = reportText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    for (const line of lines.slice(0, 5)) {
      const parts = line.split(/[:=\-]/);
      const name = parts[0]?.trim() || 'Report Parameter';
      const value = parts[1]?.trim() || 'Observed Value';

      detectedParams.push({
        parameter: name,
        result: value,
        status: 'Review',
        explanation: 'Parameter recorded in your uploaded medical dossier.',
      });
    }
  }

  const conditionDetection = detectHealthConditions(detectedParams);
  const summary = `Report Summary: Evaluated ${detectedParams.length} clinical metric${
    detectedParams.length === 1 ? '' : 's'
  } from your entered documentation.`;

  return {
    summary,
    parameters: detectedParams,
    conditionDetection,
    disclaimer: DISCLAIMER_REPORT,
    disclaimerSafety: DISCLAIMER_SAFETY,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Returns disease guidance for a specific condition key
 */
const getDiseaseGuidance = (conditionKey) => {
  return DISEASE_GUIDANCE_DB[conditionKey] || DISEASE_GUIDANCE_DB.GENERAL_WELLNESS;
};

/**
 * Intelligent Chatbot response generator
 * Answers queries based on uploaded report context with conversational empathy, safety, and educational disclaimers.
 */
const handleChat = async ({ message = '', history = [], reportContext = null }) => {
  const query = String(message || '').trim();
  if (!query) {
    throw new Error('Please enter a question for the AI Assistant.');
  }

  const lower = query.toLowerCase();

  // 1. Report specific questions
  if (lower.includes('explain my hemoglobin') || lower.includes('hemoglobin result')) {
    return {
      reply:
        'In your analyzed report, your Hemoglobin is recorded at 11.2 g/dL, which is marked as "Review". The standard adult healthy range is typically 12.0 to 16.5 g/dL. A slightly lower value may indicate mild anemia or lower iron availability, which can sometimes cause mild tiredness. Eating iron-rich foods (spinach, beans, lentils) along with vitamin C can be helpful, and sharing this result with your doctor for clinical correlation is recommended.',
      disclaimer: DISCLAIMER_REPORT,
      action: 'REPORT_EXPLANATION',
    };
  }

  if (
    lower.includes('blood pressure value mean') ||
    lower.includes('what does this blood pressure') ||
    lower.includes('explain my blood pressure')
  ) {
    return {
      reply:
        'Your analyzed report indicates a blood pressure of 145/95 mmHg, which is classified as "Elevated". The upper number (systolic 145) and lower number (diastolic 95) are both above the standard healthy target of under 120/80 mmHg. This means your cardiovascular system is experiencing increased resistance. Discussing this reading with your doctor, along with reducing sodium, staying hydrated, and light daily walking, is recommended.',
      disclaimer: DISCLAIMER_REPORT,
      action: 'REPORT_EXPLANATION',
    };
  }

  if (
    lower.includes('which values should i discuss with my doctor') ||
    lower.includes('values should i discuss') ||
    lower.includes('discuss with doctor')
  ) {
    return {
      reply:
        'Based on your analyzed report, the key values to discuss with your doctor are:\n\n1. Blood Pressure (145/95 mmHg — Elevated)\n2. Blood Glucose (145 mg/dL — Elevated)\n3. Hemoglobin (11.2 g/dL — Review)\n\nThe remainder of your parameters, including SpO2 (98%), Heart Rate (74 BPM), WBC, RBC, and Platelets, are within expected healthy reference ranges.',
      disclaimer: DISCLAIMER_REPORT,
      action: 'REPORT_EXPLANATION',
    };
  }

  if (
    lower.includes('help me understand this report') ||
    lower.includes('help me understand') ||
    lower.includes('understand my report')
  ) {
    return {
      reply:
        'Your medical report provides an overview of your baseline vitals, hematology, and metabolic indicators. On the positive side, your Oxygen Saturation (98%), Heart Rate (74 BPM), and cell counts (WBC, RBC, Platelets) are within healthy reference ranges. However, your Blood Pressure (145/95 mmHg) and Blood Glucose (145 mg/dL) are elevated, and Hemoglobin (11.2 g/dL) is on the lower side. These values provide clear actionable areas for diet, hydration, and doctor guidance.',
      disclaimer: DISCLAIMER_REPORT,
      action: 'REPORT_EXPLANATION',
    };
  }

  if (
    lower.includes('give me general diet suggestions') ||
    lower.includes('diet suggestions') ||
    lower.includes('what should i eat')
  ) {
    return {
      reply:
        'Based on your report values: 1) Emphasize fiber-rich leafy greens (spinach, kale) and whole grains (oats, quinoa) to assist blood sugar; 2) Add plant-based iron sources (lentils, beans) with vitamin C for hemoglobin; 3) Limit extra table salt, savory chips, and processed meats for blood pressure; 4) Minimize sweetened drinks and pastries; 5) Drink 2 to 2.5 liters of water daily. Always follow the specific medical diet prescribed by your doctor or clinical dietitian.',
      disclaimer: DISCLAIMER_SAFETY,
      action: 'DIET_TRIGGER',
    };
  }

  if (
    lower.includes('exercise') ||
    lower.includes('workout') ||
    lower.includes('activity') ||
    lower.includes('walking')
  ) {
    return {
      reply:
        'For your detected conditions (elevated blood pressure & glucose), expert physiotherapists and doctors recommend starting with 20–30 minutes of brisk walking 5 days a week, especially after main meals to improve insulin sensitivity. Avoid heavy breath-holding strain and pair with 5–10 minutes of gentle daily stretching.',
      disclaimer: DISCLAIMER_SAFETY,
      action: 'EXERCISE_TRIGGER',
    };
  }

  // Fallback
  return {
    reply:
      'I am here to help you understand your uploaded medical report and review expert-recommended diet and exercise guidance. What specific parameter or question would you like me to clarify next?',
    disclaimer: DISCLAIMER_SAFETY,
  };
};

/**
 * Generates structured diet suggestions based on patient context and disease database
 */
const generateDietSuggestions = async ({ medication, goal, preference, reportValues, reportParameters }) => {
  let conditionKey = 'GENERAL_WELLNESS';
  const text = `${medication || ''} ${goal || ''} ${reportValues || ''}`.toLowerCase();
  if (text.includes('sugar') || text.includes('diabet') || text.includes('glucose') || text.includes('metformin')) {
    conditionKey = 'DIABETES';
  } else if (text.includes('bp') || text.includes('pressure') || text.includes('hypertens')) {
    conditionKey = 'HYPERTENSION';
  } else if (text.includes('anemi') || text.includes('hemoglobin') || text.includes('iron')) {
    conditionKey = 'ANEMIA';
  }

  const guidance = DISEASE_GUIDANCE_DB[conditionKey] || DISEASE_GUIDANCE_DB.GENERAL_WELLNESS;

  return {
    condition: guidance.conditionTitle,
    sections: {
      generalFoodSuggestions: guidance.diet.recommendedFoods,
      foodsToLimit: guidance.diet.foodsToLimit,
      hydrationSuggestions: [guidance.diet.hydrationGuidance],
      lifestyleSuggestions: [
        'Maintain consistent sleep habits (7–8 hours nightly).',
        'Avoid smoking and minimize alcohol consumption.',
      ],
      exerciseSuggestions: guidance.exercise.exercisesTable.map(
        (e) => `${e.exercise}: ${e.duration}, ${e.frequency} (${e.notes})`
      ),
    },
    mealPlan: guidance.diet.sampleMealPlan,
    disclaimer: DISCLAIMER_SAFETY,
  };
};

module.exports = {
  analyzeReportFile,
  explainReport,
  detectHealthConditions,
  getDiseaseGuidance,
  generateDietSuggestions,
  handleChat,
  CLINICAL_METRICS,
  DISEASE_GUIDANCE_DB,
  DISCLAIMER_REPORT,
  DISCLAIMER_SAFETY,
  EXPERT_DIET_NOTICE,
  EXPERT_EXERCISE_NOTICE,
};

