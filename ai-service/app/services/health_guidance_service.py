"""Disease-Specific Clinical Guidance for Food, Diet, and Exercises."""
from typing import Any
from app.models.report_models import DietGuidance, ExerciseGuidance, ExerciseItem, MealPlan
from app.services.prompt_service import (
    DISCLAIMER_SAFETY,
    EXPERT_DIET_NOTICE,
    EXPERT_EXERCISE_NOTICE
)

DISEASE_GUIDANCE_DB: dict[str, dict[str, Any]] = {
    "DIABETES": {
        "condition_key": "DIABETES",
        "condition_title": "Type 2 Diabetes / Elevated Blood Glucose",
        "risk_level": "Moderate to Elevated",
        "explanation": (
            "The report indicates elevated blood glucose readings (such as ≥ 140 mg/dL), "
            "exceeding standard healthy fasting reference intervals (70–120 mg/dL). "
            "This reflects impaired carbohydrate regulation that benefits from proactive glycemic nutrition and regular physical activity."
        ),
        "diet": {
            "medicalGuidanceNotice": EXPERT_DIET_NOTICE,
            "recommendedFoods": [
                "Non-starchy colorful vegetables: spinach, kale, broccoli, bell peppers, cucumbers, and zucchini.",
                "High-fiber complex carbohydrates: steel-cut oats, quinoa, brown rice, barley, and whole lentils.",
                "Quality lean proteins: boiled chickpeas, kidney beans, sprouted legumes, tofu, skinless chicken, and egg whites.",
                "Healthy fats with low glycemic impact: raw almonds, walnuts, flaxseeds, and chia seeds.",
                "Low-glycemic whole fruits in measured portions: blueberries, green apples, and fresh guava."
            ],
            "foodsToLimit": [
                "Refined sugars, packaged sweets, sweetened carbonated sodas, and commercial fruit juices.",
                "White bakery goods made from refined white flour: white bread, sweet biscuits, pastries, and cakes.",
                "Deep-fried carbohydrates and snacks: potato chips, french fries, and battered appetizers.",
                "Excessive saturated and trans fats found in commercial shortening and processed margarine."
            ],
            "sampleMealPlan": {
                "breakfast": "Steel-cut oatmeal prepared with unsweetened almond milk or water, topped with 1 tbsp chia seeds, crushed walnuts, and cinnamon.",
                "lunch": "Mixed green bowl with baby spinach, sliced cucumbers, and tomatoes with olive oil dressing, quinoa, and grilled chicken breast or seasoned chickpeas.",
                "dinner": "Warm yellow lentil soup (dal) with sautéed vegetables (broccoli, zucchini, carrots) and a small portion of whole-wheat flatbread.",
                "snacks": "A small handful of roasted unsalted almonds (15–20 nuts), cucumber rounds with hummus, or plain unsweetened Greek yogurt."
            },
            "hydrationGuidance": "Drink 2.0 to 2.5 liters of clean water distributed evenly throughout the day. Avoid sugary electrolyte sports drinks and sweetened beverages."
        },
        "exercise": {
            "medicalGuidanceNotice": EXPERT_EXERCISE_NOTICE,
            "exercisesTable": [
                {
                    "exercise": "Brisk Walking",
                    "duration": "20–30 min",
                    "frequency": "5 days/week",
                    "notes": "Start at a conversational pace. Walking for 10–15 min after main meals significantly assists post-meal glucose disposal.",
                    "beginnerInstructions": "Walk comfortably in supportive athletic shoes. Gradually build speed after 5 minutes."
                },
                {
                    "exercise": "Light Aerobic Cycling",
                    "duration": "15–20 min",
                    "frequency": "3–4 days/week",
                    "notes": "Stationary cycling at moderate resistance. Maintain steady breathing.",
                    "beginnerInstructions": "Set the stationary bike seat to hip height and pedal smoothly without straining knees."
                },
                {
                    "exercise": "Gentle Mobility & Stretching",
                    "duration": "5–10 min",
                    "frequency": "Daily",
                    "notes": "Calf stretches, hamstring sweeps, and shoulder rolls to prevent muscular stiffness.",
                    "beginnerInstructions": "Hold each stretch for 15–20 seconds smoothly without bouncing."
                },
                {
                    "exercise": "Beginner Bodyweight Strength",
                    "duration": "15 min",
                    "frequency": "2–3 days/week",
                    "notes": "Chair squats, wall push-ups, and light resistance band pull-aparts to stimulate muscular glucose uptake.",
                    "beginnerInstructions": "Perform 2 sets of 8–10 repetitions with 60 seconds rest between sets."
                }
            ],
            "safetyPrecautions": [
                "Check blood sugar levels before and after strenuous activity if prescribed insulin or secretagogues.",
                "Always carry a rapid-acting glucose source (such as 3 glucose tablets or a small juice box) in case of unexpected hypoglycemia.",
                "Wear comfortable, well-fitting athletic footwear to protect feet from blisters or friction ulcers.",
                "Stay adequately hydrated before, during, and after exercise."
            ],
            "exercisesToAvoid": [
                "Exhaustive maximum-effort sprint intervals without prior cardiometabolic medical evaluation.",
                "Exercising outdoors in extreme heat or cold without adequate acclimatization.",
                "Exercising if blood glucose is acutely below 70 mg/dL or excessively high (> 250 mg/dL with ketones)."
            ],
            "whenToStop": "Stop immediately if you experience dizziness, sudden cold sweat, shakiness, or chest tightness.",
            "whenToConsultDoctor": "Consult your doctor before initiating new high-intensity programs or if peripheral neuropathy is present."
        }
    },
    "HYPERTENSION": {
        "condition_key": "HYPERTENSION",
        "condition_title": "Hypertension / Elevated Blood Pressure",
        "risk_level": "Elevated",
        "explanation": (
            "The report demonstrates arterial blood pressure values (such as ≥ 140/90 mmHg) exceeding optimal reference benchmarks (< 120/80 mmHg). "
            "This reflects increased peripheral vascular resistance that benefits from dietary sodium reduction, potassium support, and moderate aerobic movement."
        ),
        "diet": {
            "medicalGuidanceNotice": EXPERT_DIET_NOTICE,
            "recommendedFoods": [
                "Potassium-rich produce: fresh spinach, beetroot, garlic, bananas, oranges, and baked sweet potatoes.",
                "Whole-grain cereals following clinical DASH patterns: rolled oats, barley, quinoa, and brown rice.",
                "Heart-healthy monounsaturated fats: extra virgin olive oil, avocado slices, and raw walnuts.",
                "Low-fat or unsweetened dairy alternatives fortified with calcium and vitamin D.",
                "Fiber-loaded legumes: black beans, split peas, lentils, and edamame."
            ],
            "foodsToLimit": [
                "Table salt and high-sodium seasonings (aim strictly under 2,000 mg of sodium daily).",
                "Commercial canned soups, processed cold cuts, sausages, cured meats, and pickles.",
                "Pre-packaged frozen meals and savory snack chips with high sodium glutamate preservatives.",
                "High-caffeine energy drinks, strong coffee right before workouts, and excessive alcohol."
            ],
            "sampleMealPlan": {
                "breakfast": "Rolled oats prepared with skim milk or unsweetened almond milk, topped with sliced banana, 1 tbsp ground flaxseed, and blueberries.",
                "lunch": "Mediterranean grain bowl with romaine lettuce, diced cucumbers, tomatoes, extra virgin olive oil, baked tofu or grilled salmon, and steamed quinoa.",
                "dinner": "Herb-roasted chicken breast or lentil stew served with baked sweet potato and steamed asparagus, seasoned with garlic and rosemary instead of table salt.",
                "snacks": "Unsalted roasted pumpkin seeds, a crisp green apple, or carrot sticks with homemade unsalted tahini dip."
            },
            "hydrationGuidance": "Maintain steady intake of 2.0 to 2.5 liters of clean water daily. Avoid high-sodium mineral waters or effervescent electrolyte tablets."
        },
        "exercise": {
            "medicalGuidanceNotice": EXPERT_EXERCISE_NOTICE,
            "exercisesTable": [
                {
                    "exercise": "Moderate Aerobic Walking",
                    "duration": "25–30 min",
                    "frequency": "5–6 days/week",
                    "notes": "Continuous rhythmic aerobic movement reduces arterial stiffness and lowers resting blood pressure.",
                    "beginnerInstructions": "Walk at a steady pace where you can comfortably speak in full sentences."
                },
                {
                    "exercise": "Low-Resistance Cycling",
                    "duration": "20 min",
                    "frequency": "3–4 days/week",
                    "notes": "Low resistance on flat ground or stationary upright bicycle with smooth pedaling cadence.",
                    "beginnerInstructions": "Keep resistance light to prevent sudden increases in blood pressure."
                },
                {
                    "exercise": "Diaphragmatic Breathing & Meditation",
                    "duration": "10–15 min",
                    "frequency": "Daily",
                    "notes": "Slow 4-7-8 deep breathing and mindfulness meditation help modulate sympathetic nervous tone.",
                    "beginnerInstructions": "Sit quietly, inhale through your nose for 4 seconds, hold for 4, exhale slowly for 6."
                },
                {
                    "exercise": "Gentle Flexibility & Yoga",
                    "duration": "10 min",
                    "frequency": "Daily",
                    "notes": "Smooth relaxed stretches. Avoid inverted head-down postures.",
                    "beginnerInstructions": "Perform gentle standing stretches with continuous easy breathing."
                }
            ],
            "safetyPrecautions": [
                "Always include a gentle 5-minute warm-up and cool-down to allow heart rate and pressure to adapt gradually.",
                "Breathe continuously throughout all movements — never hold your breath (avoid the Valsalva maneuver).",
                "Cease activity immediately if you feel acute dizziness, chest tightness, or severe shortness of breath."
            ],
            "exercisesToAvoid": [
                "Heavy maximal weightlifting with breath-holding that spikes acute intra-thoracic blood pressure.",
                "Inverted yoga poses (such as headstands or shoulder stands) where the head is held significantly below the heart.",
                "High-intensity sprint intervals without prior cardiologist assessment."
            ],
            "whenToStop": "Stop immediately if you experience chest pain, palpitations, severe headache, or sudden lightheadedness.",
            "whenToConsultDoctor": "Check with your physician before beginning weight training if systolic BP exceeds 160 mmHg."
        }
    },
    "ANEMIA": {
        "condition_key": "ANEMIA",
        "condition_title": "Mild Anemia / Borderline Hemoglobin",
        "risk_level": "Review / Mild to Moderate",
        "explanation": (
            "The report demonstrates Hemoglobin levels (e.g. < 12.0 g/dL) below standard healthy adult reference intervals. "
            "This indicates reduced red blood cell oxygen transport capacity, frequently associated with dietary iron, folate, or vitamin B12 availability."
        ),
        "diet": {
            "medicalGuidanceNotice": EXPERT_DIET_NOTICE,
            "recommendedFoods": [
                "Iron-rich plant sources: baby spinach, Swiss chard, moringa leaves, black beans, chickpeas, and brown lentils.",
                "Vitamin C rich co-factors (critical to maximize non-heme iron absorption): fresh lemon juice, bell peppers, oranges, and strawberries.",
                "Naturally iron-rich dried fruits and seeds: dates, black raisins, dried figs, and pumpkin seeds.",
                "Heme-iron options (if non-vegetarian): lean cuts of poultry, eggs, and freshwater fish.",
                "Fortified whole-grain cereals and unpolished whole grains."
            ],
            "foodsToLimit": [
                "Tannin-rich black tea and strong coffee consumed directly with or within 1 hour of main meals (tannins inhibit iron absorption).",
                "Excessive dairy or high-dose calcium supplements taken at the exact same time as iron-rich meals (calcium competes with iron uptake).",
                "Unsoaked raw bran with excessive phytate content."
            ],
            "sampleMealPlan": {
                "breakfast": "Iron-fortified oatmeal with sliced strawberries and pumpkin seeds, or poached eggs on whole wheat toast with sautéed spinach.",
                "lunch": "Warm brown lentil dal seasoned with cumin, garlic, and fresh squeezed lemon juice, steamed brown rice, and a bell pepper salad.",
                "dinner": "Grilled chicken or pan-seared tofu stir-fry with broccoli, red bell peppers, and carrots, served over a small portion of quinoa.",
                "snacks": "3–4 dried figs or seedless dates, a handful of roasted pumpkin seeds, or a fresh orange with walnuts."
            },
            "hydrationGuidance": "Drink 2 liters of water daily. Avoid consuming black tea or espresso within 1 hour before or after your primary meals."
        },
        "exercise": {
            "medicalGuidanceNotice": EXPERT_EXERCISE_NOTICE,
            "exercisesTable": [
                {
                    "exercise": "Low-Intensity Walking",
                    "duration": "15–20 min",
                    "frequency": "4–5 days/week",
                    "notes": "Short comfortable walks at an easy pace. Take seated rest breaks whenever you sense physical fatigue.",
                    "beginnerInstructions": "Walk on flat terrain and listen closely to your energy levels."
                },
                {
                    "exercise": "Restorative Gentle Yoga",
                    "duration": "15 min",
                    "frequency": "3 days/week",
                    "notes": "Seated spinal twists, child's pose, and gentle pelvic tilts to stimulate circulation without depleting cellular energy.",
                    "beginnerInstructions": "Move slowly between poses and rest in comfortable positions."
                },
                {
                    "exercise": "Diaphragmatic Breathing",
                    "duration": "10 min",
                    "frequency": "Daily",
                    "notes": "Deep belly breathing supports pulmonary ventilation and promotes oxygenation.",
                    "beginnerInstructions": "Breathe gently into your abdomen while seated comfortably."
                },
                {
                    "exercise": "Light Mobility Stretching",
                    "duration": "5–10 min",
                    "frequency": "Daily",
                    "notes": "Ankle circles, wrist stretches, and neck rolls to maintain joint flexibility.",
                    "beginnerInstructions": "Perform gentle joint circles without straining."
                }
            ],
            "safetyPrecautions": [
                "Listen closely to your body's signals; do not push through severe fatigue or weakness.",
                "Pause immediately and sit down if you experience lightheadedness, pale skin, or heart palpitations.",
                "Avoid exercising outdoors in excessively hot weather."
            ],
            "exercisesToAvoid": [
                "High-intensity interval training (HIIT) or exhaustive endurance runs while hemoglobin is recovering.",
                "Heavy resistance training that leads to prolonged breathlessness."
            ],
            "whenToStop": "Stop immediately if you feel dizzy, breathless upon minimal exertion, or unusually fatigued.",
            "whenToConsultDoctor": "Consult your clinician if fatigue persists despite dietary modifications."
        }
    },
    "OBESITY": {
        "condition_key": "OBESITY",
        "condition_title": "Weight Management / Elevated BMI Risk Factor",
        "risk_level": "Moderate",
        "explanation": (
            "The findings or parameters reflect elevated weight or body mass indicators that increase metabolic strain on joints and cardiovascular pathways. "
            "A structured calorie-mindful, high-satiety, whole-food dietary approach coupled with low-impact joint-sparing regular exercise provides sustained metabolic improvement."
        ),
        "diet": {
            "medicalGuidanceNotice": EXPERT_DIET_NOTICE,
            "recommendedFoods": [
                "High-satiety, high-fiber vegetables: leafy greens, broccoli, cucumbers, celery, bell peppers, and green beans.",
                "Lean proteins: egg whites, skinless chicken breast, lentils, chickpeas, and firm tofu.",
                "Complex low-glycemic carbohydrates: steel-cut oats, quinoa, and small sweet potatoes.",
                "Healthy fats in measured portions: avocado slices, extra virgin olive oil, and raw almonds."
            ],
            "foodsToLimit": [
                "Liquid sugar calories: regular sodas, sweetened iced teas, fruit nectars, and sweetened coffee drinks.",
                "Ultra-processed snack foods: potato chips, confectionery, pastries, and fried finger foods.",
                "Heavy refined sauces, cream-based dressings, and commercial mayonnaise."
            ],
            "sampleMealPlan": {
                "breakfast": "Veggie scramble with 2 egg whites + 1 whole egg, spinach, tomatoes, and 1 slice of 100% whole grain toast.",
                "lunch": "Voluminous salad bowl with baby greens, grilled chicken breast or chickpeas, cucumbers, and olive oil/lemon dressing.",
                "dinner": "Pan-seared white fish or tofu with generous steamed broccoli and 1/2 cup brown rice.",
                "snacks": "Sliced cucumber and bell peppers with 2 tbsp hummus, or a small handful of raw almonds."
            },
            "hydrationGuidance": "Drink 2.5 to 3.0 liters of water daily. Drink a full glass of water 15 minutes before main meals to naturally enhance satiety."
        },
        "exercise": {
            "medicalGuidanceNotice": EXPERT_EXERCISE_NOTICE,
            "exercisesTable": [
                {
                    "exercise": "Low-Impact Brisk Walking",
                    "duration": "30–40 min",
                    "frequency": "5–6 days/week",
                    "notes": "Low joint impact aerobic walking is the single most sustainable modality for fat oxidation.",
                    "beginnerInstructions": "Break into two 15–20 minute sessions daily if continuous duration is strenuous."
                },
                {
                    "exercise": "Stationary Cycling / Recumbent Bike",
                    "duration": "20–25 min",
                    "frequency": "3–4 days/week",
                    "notes": "Relieves compressive knee load while building lower body cardiovascular fitness.",
                    "beginnerInstructions": "Adjust seat height so knees have a slight bend at the bottom of the stroke."
                },
                {
                    "exercise": "Water Aerobics or Swimming",
                    "duration": "25 min",
                    "frequency": "2–3 days/week",
                    "notes": "Hydrostatic buoyancy eliminates weight pressure on knees and lower back.",
                    "beginnerInstructions": "Perform water walking or gentle swimming laps in shallow pool."
                },
                {
                    "exercise": "Beginner Seated / Standing Strength",
                    "duration": "20 min",
                    "frequency": "2–3 days/week",
                    "notes": "Chair stands, wall push-ups, and light dumbbells to build metabolically active muscle.",
                    "beginnerInstructions": "Perform 2 sets of 10 controlled chair rises with back upright."
                }
            ],
            "safetyPrecautions": [
                "Wear cushioned, supportive footwear to protect feet and ankle joints.",
                "Start with 10-minute intervals if 30 continuous minutes feels strenuous, then gradually build up.",
                "Stay well-hydrated to support thermoregulation during movement."
            ],
            "exercisesToAvoid": [
                "High-impact jumping, plyometrics, or hard-surface running that imposes high peak impact forces on knee and ankle cartilage."
            ],
            "whenToStop": "Stop if you feel joint pain, sharp knee soreness, or acute shortness of breath.",
            "whenToConsultDoctor": "Consult a physiotherapist or doctor if chronic joint arthritis is present."
        }
    },
    "THYROID": {
        "condition_key": "THYROID",
        "condition_title": "Hypothyroidism / Thyroid-Related Metabolic Indicator",
        "risk_level": "Review / Mild",
        "explanation": (
            "The clinical findings or report context suggest thyroid-related metabolic factors. "
            "Thyroid hormones regulate basal metabolic rate, energy expenditure, and thermoregulation. "
            "Nutritional support with selenium and zinc combined with low-impact physical activity supports endocrine and metabolic balance."
        ),
        "diet": {
            "medicalGuidanceNotice": EXPERT_DIET_NOTICE,
            "recommendedFoods": [
                "Selenium and zinc rich foods: Brazil nuts (1–2 daily), pumpkin seeds, chia seeds, and sunflower seeds.",
                "Cooked cruciferous vegetables (cooking deactivates goitrogens): steamed broccoli, cauliflower, and carrots.",
                "Balanced iodine sources: iodized sea salt, cranberries, and freshwater seafood.",
                "Lean quality proteins: lentils, skinless poultry, boiled eggs, and sprouted legumes.",
                "High-fiber unrefined complex carbohydrates: oats, quinoa, and brown rice."
            ],
            "foodsToLimit": [
                "Excessive raw uncooked goitrogens (raw kale, raw cabbage, raw turnips) consumed in large daily quantities.",
                "Soy protein isolates and concentrated soy supplements consumed within 4 hours of thyroid medications.",
                "Refined sugars and processed pastries that tax a sluggish basal metabolic rate.",
                "Excessive saturated or trans fats that interfere with thyroid hormone uptake."
            ],
            "sampleMealPlan": {
                "breakfast": "Warm oatmeal with 1 crushed Brazil nut, chia seeds, and blueberries, taken at least 1 hour after prescribed thyroid medication.",
                "lunch": "Steamed quinoa bowl with thoroughly cooked mixed vegetables, grilled chicken or seasoned chickpeas, and extra virgin olive oil dressing.",
                "dinner": "Baked white fish or warm yellow lentil soup with steamed zucchini, carrots, and sweet potato.",
                "snacks": "A handful of roasted pumpkin seeds, a sliced pear, or plain unsweetened yogurt."
            },
            "hydrationGuidance": "Drink 2.0 to 2.5 liters of clean water daily to assist sluggish bowel motility and support thermoregulation."
        },
        "exercise": {
            "medicalGuidanceNotice": EXPERT_EXERCISE_NOTICE,
            "exercisesTable": [
                {
                    "exercise": "Brisk Walking",
                    "duration": "25–30 min",
                    "frequency": "5 days/week",
                    "notes": "Low-impact aerobic movement helps stimulate resting metabolic rate without overtaxing adrenal pathways.",
                    "beginnerInstructions": "Walk at a steady, enjoyable pace outdoors or on a treadmill."
                },
                {
                    "exercise": "Light Resistance Training",
                    "duration": "20 min",
                    "frequency": "2–3 days/week",
                    "notes": "Bodyweight squats, light dumbbells, and resistance bands to maintain lean metabolically active muscle mass.",
                    "beginnerInstructions": "Focus on controlled movements with 10–12 repetitions."
                },
                {
                    "exercise": "Gentle Yoga & Stretching",
                    "duration": "15 min",
                    "frequency": "Daily",
                    "notes": "Restorative yoga poses relieve muscle stiffness and joint achiness common with thyroid sluggishness.",
                    "beginnerInstructions": "Practice seated twists and gentle hamstring stretches."
                },
                {
                    "exercise": "Low-Impact Swimming / Water Aerobics",
                    "duration": "20 min",
                    "frequency": "2 days/week",
                    "notes": "Hydrostatic buoyancy eases joint stress while providing gentle cardiovascular conditioning.",
                    "beginnerInstructions": "Swim or water walk in warm water to soothe joint stiffness."
                }
            ],
            "safetyPrecautions": [
                "Allow adequate warm-up since joint stiffness is common with thyroid hormone sluggishness.",
                "Avoid sudden high-intensity bouts that trigger prolonged exhaustion; prioritize gradual endurance.",
                "Maintain a steady schedule and avoid exercising late in the evening if sleep is disrupted."
            ],
            "exercisesToAvoid": [
                "Exhaustive endurance marathons or high-intensity CrossFit workouts without prior endocrine stabilization."
            ],
            "whenToStop": "Stop if you feel extreme exhaustion, muscle cramps, or joint pain.",
            "whenToConsultDoctor": "Review with your endocrinologist if medication dose adjustments are underway."
        }
    },
    "GENERAL_WELLNESS": {
        "condition_key": "GENERAL_WELLNESS",
        "condition_title": "Overall Health & Metabolic Balance",
        "risk_level": "Normal / Healthy Baseline",
        "explanation": (
            "The report parameters demonstrate stable baseline physiological markers with no acute abnormalities detected. "
            "Maintaining a balanced whole-food dietary pattern and consistent physical activity helps preserve long-term vitality and immune resilience."
        ),
        "diet": {
            "medicalGuidanceNotice": EXPERT_DIET_NOTICE,
            "recommendedFoods": [
                "Diverse seasonal vegetables and fresh whole fruits representing a rainbow of phytonutrients.",
                "Wholesome legumes, pulses, chickpeas, and unprocessed whole grains.",
                "Heart-supportive fats from olive oil, avocados, chia seeds, and walnuts.",
                "Lean quality proteins supporting muscle mass and immune resilience."
            ],
            "foodsToLimit": [
                "Ultra-processed snacks, hydrogenated trans fats, and artificial additives.",
                "Excess added table sugar and sweetened carbonated beverages.",
                "Excessive sodium in commercial packaged convenience meals."
            ],
            "sampleMealPlan": {
                "breakfast": "Whole-grain porridge with crushed nuts and berries, or two scrambled eggs with sautéed mushrooms and whole-grain toast.",
                "lunch": "Quinoa and chickpea salad with fresh tomatoes, cucumbers, extra virgin olive oil, and lemon dressing.",
                "dinner": "Baked fish or lentil stew served with roasted seasonal vegetables and a small sweet potato.",
                "snacks": "A crisp green apple with 10–12 almonds, or raw carrot and celery sticks with hummus."
            },
            "hydrationGuidance": "Drink 2.0 to 2.5 liters of clean water daily; adjust upward during intense exercise or warm weather."
        },
        "exercise": {
            "medicalGuidanceNotice": EXPERT_EXERCISE_NOTICE,
            "exercisesTable": [
                {
                    "exercise": "Brisk Walking or Jogging",
                    "duration": "30 min",
                    "frequency": "5 days/week",
                    "notes": "Standard cardiovascular maintenance supporting endothelial health and longevity.",
                    "beginnerInstructions": "Walk briskly for 20 minutes, then increase to 30 minutes over 2 weeks."
                },
                {
                    "exercise": "Full-Body Resistance Training",
                    "duration": "25 min",
                    "frequency": "2–3 days/week",
                    "notes": "Bodyweight squats, push-ups, lunges, and light dumbbells to preserve lean muscle tissue.",
                    "beginnerInstructions": "Complete 2 sets of 10 repetitions per major muscle group."
                },
                {
                    "exercise": "Flexibility & Core Training",
                    "duration": "15 min",
                    "frequency": "3 days/week",
                    "notes": "Planks, bird-dogs, and yoga postures to maintain spinal stability and balance.",
                    "beginnerInstructions": "Hold planks for 20–30 seconds with a straight spine."
                }
            ],
            "safetyPrecautions": [
                "Warm up for 5 minutes prior to exercise and cool down adequately.",
                "Maintain consistent hydration throughout workout sessions."
            ],
            "exercisesToAvoid": [
                "Attempting unconditioned heavy lifts without proper warm-up or form supervision."
            ],
            "whenToStop": "Stop if you feel sudden sharp pain, dizziness, or chest discomfort.",
            "whenToConsultDoctor": "Check with a doctor before beginning intense fitness regimens if over 45 with inactive history."
        }
    }
}

class HealthGuidanceService:
    def get_guidance(self, condition_key: str) -> dict[str, Any]:
        """Retrieves structured clinical diet and exercise guidance for a condition."""
        normalized_key = condition_key.upper().strip()
        return DISEASE_GUIDANCE_DB.get(normalized_key, DISEASE_GUIDANCE_DB["GENERAL_WELLNESS"])

    def get_diet_model(self, condition_key: str) -> DietGuidance:
        """Returns typed DietGuidance Pydantic model."""
        data = self.get_guidance(condition_key)["diet"]
        meal_plan = MealPlan(**data["sampleMealPlan"])
        return DietGuidance(
            medicalGuidanceNotice=data["medicalGuidanceNotice"],
            recommendedFoods=data["recommendedFoods"],
            foodsToLimit=data["foodsToLimit"],
            sampleMealPlan=meal_plan,
            hydrationGuidance=data["hydrationGuidance"]
        )

    def get_exercise_model(self, condition_key: str) -> ExerciseGuidance:
        """Returns typed ExerciseGuidance Pydantic model."""
        data = self.get_guidance(condition_key)["exercise"]
        table = [ExerciseItem(**item) for item in data["exercisesTable"]]
        return ExerciseGuidance(
            medicalGuidanceNotice=data["medicalGuidanceNotice"],
            exercisesTable=table,
            safetyPrecautions=data["safetyPrecautions"],
            exercisesToAvoid=data["exercisesToAvoid"],
            whenToStop=data.get("whenToStop"),
            whenToConsultDoctor=data.get("whenToConsultDoctor")
        )

health_guidance_service = HealthGuidanceService()
