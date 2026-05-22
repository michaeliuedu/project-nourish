export const DietList = [
  "Mediterranean",
  "Keto",
  "Low-Carb",
  "High-Protein",
  "Low-Fat",
  "Low-Calorie",
  "Gluten-Free",
  "Dairy-Free",
  "Vegetarian",
  "Vegan",
  "Plant-Based",
  "Pescatarian",
  "Paleo",
  "Whole30",
  "DASH",
  "Anti-Inflammatory",
  "Low-Sodium",
  "Low-Sugar",
  "High-Fiber",
  "Heart-Healthy",
  "Diabetic-Friendly",
  "Nut-Free",
  "Soy-Free",
  "Egg-Free",
  "Whole Grain",
  "Clean Eating",
  "Intermittent Fasting",
  "Quick Meals",
  "Meal Prep",
  "Family-Friendly",
] as const;
export type Diet = (typeof DietList)[number];

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  preferences: Diet[];
};
