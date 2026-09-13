import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const Input = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(24),
});

interface MenuItemData {
  name: string;
  category: string;
  price: number;
  description: string;
  is_veg: boolean;
  spice_level: number;
  rating: number;
  tags: string[];
  calories?: number;
  is_bestseller?: boolean;
  is_chef_special?: boolean;
}

const FALLBACK_MENU: MenuItemData[] = [
  { name: "Paneer Tikka", category: "starters", price: 299, spice_level: 2, rating: 4.8, is_bestseller: true, is_chef_special: true, is_veg: true, calories: 320, tags: ["paneer", "grilled", "tandoori", "vegetarian"], description: "Char-grilled cottage cheese marinated in yoghurt and aromatic spices." },
  { name: "Hara Bhara Kebab", category: "starters", price: 249, spice_level: 1, rating: 4.6, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 260, tags: ["healthy", "spinach", "vegetarian"], description: "Spinach, green peas and paneer patties, pan-seared till golden." },
  { name: "Veg Seekh Kebab", category: "starters", price: 269, spice_level: 2, rating: 4.5, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 290, tags: ["grilled", "smoky"], description: "Smoky minced vegetable skewers finished over charcoal." },
  { name: "Dahi Ke Kebab", category: "starters", price: 279, spice_level: 1, rating: 4.7, is_bestseller: false, is_chef_special: true, is_veg: true, calories: 310, tags: ["creamy", "mild"], description: "Melt-in-mouth hung curd kebabs with cardamom and cashew." },
  { name: "Tandoori Mushroom", category: "starters", price: 259, spice_level: 2, rating: 4.4, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 180, tags: ["mushroom", "grilled"], description: "Button mushrooms in a bell pepper and mint marinade." },
  { name: "Dahi Puri", category: "chaat", price: 149, spice_level: 1, rating: 4.7, is_bestseller: true, is_chef_special: false, is_veg: true, calories: 220, tags: ["street food", "sweet", "tangy"], description: "Crisp puris filled with sweet yoghurt, tamarind and pomegranate." },
  { name: "Samosa Chaat", category: "chaat", price: 169, spice_level: 2, rating: 4.6, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 380, tags: ["street food", "spicy"], description: "Crushed samosas layered with chole, chutneys and sev." },
  { name: "Aloo Tikki Chaat", category: "chaat", price: 159, spice_level: 2, rating: 4.5, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 340, tags: ["street food"], description: "Golden potato tikkis with yoghurt and mint chutney." },
  { name: "Pani Puri", category: "chaat", price: 129, spice_level: 3, rating: 4.8, is_bestseller: true, is_chef_special: false, is_veg: true, calories: 180, tags: ["spicy", "street food"], description: "Six puris with spiced mint water and tangy tamarind." },
  { name: "Paneer Butter Masala", category: "north-indian", price: 349, spice_level: 1, rating: 4.9, is_bestseller: true, is_chef_special: true, is_veg: true, calories: 520, tags: ["paneer", "creamy", "mild", "bestseller"], description: "Cottage cheese in a silky tomato-cashew gravy with a hint of honey." },
  { name: "Dal Makhani", category: "north-indian", price: 299, spice_level: 1, rating: 4.8, is_bestseller: true, is_chef_special: false, is_veg: true, calories: 430, tags: ["dal", "creamy", "slow cooked"], description: "Black lentils simmered overnight with butter and cream." },
  { name: "Shahi Paneer", category: "north-indian", price: 359, spice_level: 1, rating: 4.7, is_bestseller: false, is_chef_special: true, is_veg: true, calories: 540, tags: ["paneer", "rich"], description: "Royal Mughlai gravy of cashew, saffron and cardamom." },
  { name: "Kadhai Paneer", category: "north-indian", price: 339, spice_level: 3, rating: 4.6, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 470, tags: ["paneer", "spicy"], description: "Paneer tossed with peppers and freshly pounded kadhai masala." },
  { name: "Chole Bhature", category: "north-indian", price: 269, spice_level: 2, rating: 4.7, is_bestseller: true, is_chef_special: false, is_veg: true, calories: 690, tags: ["punjabi", "filling"], description: "Punjabi spiced chickpeas with two fluffy bhature." },
  { name: "Malai Kofta", category: "north-indian", price: 369, spice_level: 1, rating: 4.6, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 560, tags: ["creamy", "mild"], description: "Paneer dumplings in a delicate white gravy." },
  { name: "Bhindi Do Pyaza", category: "north-indian", price: 259, spice_level: 2, rating: 4.4, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 240, tags: ["dry", "homestyle"], description: "Crisp okra with onions and roasted spices." },
  { name: "Masala Dosa", category: "south-indian", price: 219, spice_level: 1, rating: 4.8, is_bestseller: true, is_chef_special: false, is_veg: true, calories: 410, tags: ["dosa", "breakfast"], description: "Crisp rice crepe with spiced potato, sambar and chutneys." },
  { name: "Idli Sambar", category: "south-indian", price: 159, spice_level: 1, rating: 4.6, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 280, tags: ["healthy", "steamed"], description: "Steamed rice cakes with lentil sambar and coconut chutney." },
  { name: "Medu Vada", category: "south-indian", price: 149, spice_level: 2, rating: 4.5, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 300, tags: ["fried"], description: "Crisp lentil doughnuts served hot with chutney." },
  { name: "Onion Uttapam", category: "south-indian", price: 199, spice_level: 2, rating: 4.5, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 350, tags: ["breakfast"], description: "Thick savoury pancake with onion, chilli and coriander." },
  { name: "Veg Dum Biryani", category: "biryani-rice", price: 329, spice_level: 2, rating: 4.8, is_bestseller: true, is_chef_special: true, is_veg: true, calories: 610, tags: ["biryani", "dum", "aromatic"], description: "Long-grain basmati layered with vegetables and sealed with dough." },
  { name: "Mithaas Special Biryani", category: "biryani-rice", price: 399, spice_level: 3, rating: 4.9, is_bestseller: true, is_chef_special: true, is_veg: true, calories: 720, tags: ["biryani", "signature", "spicy"], description: "Our signature biryani with paneer, nuts, saffron and aroma spices." },
  { name: "Jeera Rice", category: "biryani-rice", price: 179, spice_level: 1, rating: 4.5, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 320, tags: ["light"], description: "Basmati tempered with cumin and ghee." },
  { name: "Curd Rice", category: "biryani-rice", price: 169, spice_level: 1, rating: 4.4, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 290, tags: ["cooling", "mild"], description: "Comforting South Indian curd rice with tempering." },
  { name: "Butter Naan", category: "breads", price: 69, spice_level: 1, rating: 4.8, is_bestseller: true, is_chef_special: false, is_veg: true, calories: 220, tags: ["naan"], description: "Tandoor-baked naan brushed with white butter." },
  { name: "Garlic Naan", category: "breads", price: 89, spice_level: 1, rating: 4.8, is_bestseller: true, is_chef_special: false, is_veg: true, calories: 240, tags: ["naan", "garlic"], description: "Naan studded with garlic and coriander." },
  { name: "Tandoori Roti", category: "breads", price: 49, spice_level: 1, rating: 4.5, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 160, tags: ["healthy"], description: "Whole-wheat roti straight off the clay oven." },
  { name: "Lachha Paratha", category: "breads", price: 79, spice_level: 1, rating: 4.7, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 280, tags: ["flaky"], description: "Flaky layered paratha with ghee." },
  { name: "Veg Manchurian", category: "chinese", price: 279, spice_level: 3, rating: 4.5, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 400, tags: ["spicy", "indo-chinese"], description: "Vegetable dumplings in a glossy garlic-chilli sauce." },
  { name: "Hakka Noodles", category: "chinese", price: 249, spice_level: 2, rating: 4.6, is_bestseller: true, is_chef_special: false, is_veg: true, calories: 470, tags: ["noodles", "indo-chinese"], description: "Wok-tossed noodles with julienned vegetables." },
  { name: "Chilli Paneer", category: "chinese", price: 299, spice_level: 4, rating: 4.6, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 430, tags: ["spicy", "paneer"], description: "Paneer tossed with peppers in a hot garlic sauce." },
  { name: "Schezwan Fried Rice", category: "chinese", price: 239, spice_level: 4, rating: 4.4, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 450, tags: ["spicy", "rice"], description: "Fiery schezwan fried rice with crunchy vegetables." },
  { name: "Gulab Jamun", category: "desserts", price: 129, spice_level: 1, rating: 4.9, is_bestseller: true, is_chef_special: true, is_veg: true, calories: 320, tags: ["sweet", "warm", "dessert"], description: "Two warm khoya dumplings soaked in rose cardamom syrup." },
  { name: "Rasmalai", category: "desserts", price: 149, spice_level: 1, rating: 4.8, is_bestseller: true, is_chef_special: false, is_veg: true, calories: 290, tags: ["sweet", "chilled", "dessert"], description: "Soft chenna discs in saffron-pistachio milk." },
  { name: "Gajar Ka Halwa", category: "desserts", price: 159, spice_level: 1, rating: 4.7, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 380, tags: ["sweet", "warm", "winter"], description: "Slow-cooked carrot halwa with ghee and almonds." },
  { name: "Malai Kulfi", category: "desserts", price: 119, spice_level: 1, rating: 4.6, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 260, tags: ["sweet", "chilled"], description: "Dense hand-churned kulfi with pistachio." },
  { name: "Jalebi with Rabri", category: "desserts", price: 179, spice_level: 1, rating: 4.8, is_bestseller: false, is_chef_special: true, is_veg: true, calories: 450, tags: ["sweet", "festive"], description: "Crisp jalebi paired with thickened saffron rabri." },
  { name: "Kaju Katli (250g)", category: "mithai", price: 449, spice_level: 1, rating: 4.9, is_bestseller: true, is_chef_special: false, is_veg: true, calories: 600, tags: ["mithai", "gifting"], description: "Diamond-cut cashew fudge with edible silver." },
  { name: "Motichoor Ladoo (250g)", category: "mithai", price: 329, spice_level: 1, rating: 4.7, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 580, tags: ["mithai", "festive"], description: "Fine boondi ladoos with cardamom and melon seeds." },
  { name: "Soan Papdi (250g)", category: "mithai", price: 249, spice_level: 1, rating: 4.5, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 520, tags: ["mithai"], description: "Feather-light flaky sweet with pistachio." },
  { name: "Besan Barfi (250g)", category: "mithai", price: 369, spice_level: 1, rating: 4.6, is_bestseller: false, is_chef_special: true, is_veg: true, calories: 610, tags: ["mithai"], description: "Roasted gram flour barfi rich with ghee." },
  { name: "Sweet Lassi", category: "beverages", price: 119, spice_level: 1, rating: 4.7, is_bestseller: true, is_chef_special: false, is_veg: true, calories: 240, tags: ["cooling", "drink"], description: "Thick chilled yoghurt drink with a saffron swirl." },
  { name: "Masala Chai", category: "beverages", price: 79, spice_level: 2, rating: 4.8, is_bestseller: true, is_chef_special: false, is_veg: true, calories: 110, tags: ["hot", "drink"], description: "Slow-brewed chai with ginger, cardamom and clove." },
  { name: "Cold Coffee", category: "beverages", price: 159, spice_level: 1, rating: 4.6, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 280, tags: ["cold", "drink"], description: "Frothy cold coffee with a scoop of vanilla." },
  { name: "Fresh Lime Soda", category: "beverages", price: 89, spice_level: 1, rating: 4.5, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 90, tags: ["refreshing", "drink"], description: "Sweet or salted, freshly squeezed lime with soda." },
  { name: "Jaljeera Cooler", category: "beverages", price: 99, spice_level: 2, rating: 4.4, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 70, tags: ["tangy", "drink"], description: "Tangy cumin cooler with mint and black salt." },
  { name: "Mithaas Royal Thali", category: "combos", price: 649, spice_level: 2, rating: 4.9, is_bestseller: true, is_chef_special: true, is_veg: true, calories: 1180, tags: ["thali", "family", "value"], description: "Paneer butter masala, dal makhani, biryani, two breads, salad, gulab jamun." },
  { name: "Date Night Duo", category: "combos", price: 999, spice_level: 2, rating: 4.8, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 1600, tags: ["couple", "value"], description: "Two starters, two mains, breads, one dessert to share." },
  { name: "Family Feast (4)", category: "combos", price: 1899, spice_level: 2, rating: 4.8, is_bestseller: false, is_chef_special: true, is_veg: true, calories: 3200, tags: ["family", "value"], description: "A complete four-person spread of starters, mains, rice and sweets." },
  { name: "Student Saver Combo", category: "combos", price: 299, spice_level: 2, rating: 4.6, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 880, tags: ["student", "value"], description: "Chole bhature with lassi at a friendly price." },
  { name: "Mini Paneer Wrap", category: "kids", price: 179, spice_level: 0, rating: 4.6, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 340, tags: ["kids", "mild"], description: "Soft wrap with mild paneer filling, no chilli." },
  { name: "Cheese Grill Toast", category: "kids", price: 149, spice_level: 0, rating: 4.5, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 320, tags: ["kids", "mild"], description: "Buttery grilled toast oozing with cheese." },
  { name: "Choco Shake", category: "kids", price: 159, spice_level: 0, rating: 4.7, is_bestseller: false, is_chef_special: false, is_veg: true, calories: 380, tags: ["kids", "sweet"], description: "Thick chocolate milkshake with sprinkles." },
];

function generateLocalAiReply(messages: { role: "user" | "assistant"; content: string }[], menuItems: MenuItemData[]): string {
  const lastMsg = (messages[messages.length - 1]?.content || "").trim();
  const q = lastMsg.toLowerCase();

  // 1. Greetings
  if (/^(hi|hello|hey|namaste|good\s*(morning|evening|afternoon)|sup|yo|greetings)\b/i.test(q)) {
    return `Namaste! Welcome to Mithaas — Where Every Bite Feels Like Home.\n\nI'm your personal food concierge. Tell me your mood, budget, or group size, and I'll recommend the ideal feast for you!`;
  }

  // 2. Opening Hours & Timings
  if (/hours?|timings?|schedule|when do you (open|close)|are you open/i.test(q)) {
    return `Mithaas Opening Hours:\n• Mon – Thu: 11:00 AM – 11:00 PM\n• Fri – Sun: 10:00 AM – 12:00 Midnight\n\nVisit us at Sector 29, Gurugram. Call +91 98100 00000 for reservations!`;
  }

  // 3. Location / Address
  if (/where are you|location|address|directions|where is (the restaurant|mithaas)/i.test(q)) {
    return `Mithaas is located at:\nSector 29, Gurugram, Haryana.\n\nWe offer fine dine-in, terrace seating, and prompt doorstep delivery.`;
  }

  // 4. Reservations / Table booking
  if (/reserv|book a table|table booking|dine in/i.test(q)) {
    return `You can reserve a table anytime through our Reservations tab! Choose your date, preferred dining slot, and seating area (indoor or terrace). We'll confirm immediately.`;
  }

  // 5. Coupons & Offers
  if (/coupon|offer|discount|promo|deal|voucher/i.test(q)) {
    return `Active offers today at Mithaas:\n• FIRSTBITE — ₹150 off first order above ₹599\n• MITHAAS10 — Flat 10% off on orders above ₹499\n• STUDENT15 — 15% student discount above ₹299\n• FAMILY300 — ₹300 off family feasts above ₹1799\n• MITHAI50 — ₹50 off on mithai boxes above ₹299\n\nApply these during checkout!`;
  }

  // 6. Bestsellers
  if (/bestseller|popular|top dishes|most ordered|signature/i.test(q)) {
    const bests = menuItems.filter((m) => m.is_bestseller).slice(0, 5);
    return (
      `Here are our crowd-favorite bestsellers this week:\n` +
      bests.map((b) => `• ${b.name} (₹${b.price}) — ⭐${b.rating} · ${b.description}`).join("\n") +
      `\n\nWould you like me to pair these with hot breads or a chilled drink?`
    );
  }

  // 7. Healthy / Low Calorie / Diet
  if (/healthy|diet|low cal|calorie|light|salad|weight|steamed|gym|protein/i.test(q)) {
    return `Here are our top wholesome, guilt-free picks:\n• Idli Sambar (₹159, 280 kcal) — Steamed fluffy cakes with lentil sambar\n• Hara Bhara Kebab (₹249, 260 kcal) — Spinach, green peas & paneer\n• Curd Rice (₹169, 290 kcal) — Cooling probiotic rice with mustard tempering\n• Tandoori Roti (₹49, 160 kcal) — 100% whole-wheat clay oven bread\n• Fresh Lime Soda (₹89, 90 kcal) — Zero guilt sparkling refreshment`;
  }

  // 8. Dessert recommendations / Mithai
  if (/dessert|sweet|mithai|halwa|kulfi|jamun|rasmalai|ladoo|barfi/i.test(q)) {
    return `Indulge in our authentic handcrafted sweets:\n• Gulab Jamun (₹129) — Warm khoya dumplings in rose-cardamom syrup\n• Rasmalai (₹149) — Soft chenna discs in saffron-pistachio milk\n• Jalebi with Rabri (₹179) — Crispy jalebis with slow-simmered rabri\n• Kaju Katli 250g (₹449) — Pure cashew fudge with silver foil\n• Gajar Ka Halwa (₹159) — Slow-cooked in desi ghee with roasted almonds`;
  }

  // 9. Budget matching (e.g. "under 300", "under ₹400", "budget 500")
  const budgetMatch =
    q.match(/(?:under|below|budget|within|less than)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) ||
    q.match(/(?:₹|rs\.?)\s*(\d+)\s*(?:budget|under|below|max)/i);
  if (budgetMatch) {
    const max = parseInt(budgetMatch[1], 10);
    const affordable = menuItems.filter((m) => m.price <= max && m.category !== "combos").sort((a, b) => b.rating - a.rating);

    if (/spicy|teekha|hot/i.test(q)) {
      const spicy = affordable.filter((m) => m.spice_level >= 3);
      if (spicy.length) {
        return (
          `Fiery spicy picks under ₹${max}:\n` +
          spicy.slice(0, 4).map((s) => `• ${s.name} (₹${s.price}, spice ${s.spice_level}/4) — ${s.description}`).join("\n") +
          `\n\nPair with a chilled Sweet Lassi (₹119) to balance the spice!`
        );
      }
    }

    if (max >= 600) {
      return `For a ₹${max} budget, enjoy this complete feast:\n• Starter: Paneer Tikka (₹299)\n• Main: Dal Makhani (₹299) with Garlic Naan (₹89)\n• Sweet: Gulab Jamun (₹129)\nTotal: ~₹716 (Apply code MITHAAS10 for 10% off!).`;
    } else if (max >= 350) {
      return `Satisfying meals under ₹${max}:\n• Paneer Butter Masala (₹349) — Silky tomato-cashew curry\n• Veg Dum Biryani (₹329) — Slow dum sealed basmati with raita\n• Chole Bhature (₹269) — Spiced chickpeas with fluffy bhature\n• Student Saver Combo (₹299) — Chole bhature + sweet lassi!`;
    } else {
      const meals = affordable.filter((m) => ["north-indian", "south-indian", "chinese", "starters"].includes(m.category));
      return (
        `Delicious choices under ₹${max}:\n` +
        (meals.length ? meals : affordable).slice(0, 4).map((m) => `• ${m.name} (₹${m.price}) — ${m.description}`).join("\n")
      );
    }
  }

  // 10. Group sizes (family / 4 people / couple / 2 people)
  if (/4\s*(people|persons|members|friends)?|family/i.test(q)) {
    return `For a group of 4, I recommend our Family Feast (4) combo (₹1899) or this spread:\n• Starters: Paneer Tikka (₹299) + Hara Bhara Kebab (₹249)\n• Mains: Paneer Butter Masala (₹349) + Dal Makhani (₹299)\n• Breads & Rice: 4 Garlic Naans (₹356) + Veg Dum Biryani (₹329)\n• Dessert: Gulab Jamun (₹129)\nTotal: ~₹2,010. Use coupon FAMILY300 for ₹300 off!`;
  }

  if (/2\s*(people|persons|members)?|couple|date night|duo/i.test(q)) {
    return `For 2 people, try our Date Night Duo (₹999) or this handpicked combination:\n• Starter: Paneer Tikka (₹299)\n• Main: Paneer Butter Masala (₹349) with 2 Butter Naans (₹138)\n• Dessert: Rasmalai (₹149)\nTotal: ~₹935. Perfectly balanced and delicious!`;
  }

  // 11. Spicy / Hot cravings
  if (/spicy|teekha|chilli|hot/i.test(q)) {
    return `Here are our spiciest dishes packed with authentic heat:\n• Chilli Paneer (₹299, spice 4/4) — Fiery Indo-Chinese classic\n• Schezwan Fried Rice (₹239, spice 4/4) — Wok-tossed red chilli rice\n• Kadhai Paneer (₹339, spice 3/4) — Paneer tossed in whole roasted spices\n• Pani Puri (₹129, spice 3/4) — Tangy spicy mint water puris\n• Mithaas Special Biryani (₹399, spice 3/4) — Rich, aromatic and spicy`;
  }

  // 12. Mild / Kids
  if (/mild|not spicy|no spice|kids?|children/i.test(q)) {
    return `Gentle, flavorful dishes with zero or mild spice:\n• Malai Kofta (₹369, spice 1/4) — Velvety white cashew-cream gravy\n• Paneer Butter Masala (₹349, spice 1/4) — Mild and creamy\n• Mini Paneer Wrap (₹179, spice 0/4) — Kid-friendly soft wrap\n• Cheese Grill Toast (₹149, spice 0/4) — Melted cheese on grilled bread\n• Choco Shake (₹159) — Thick chocolate shake with sprinkles`;
  }

  // 13. Pairings (e.g. "after paneer tikka", "pair with biryani")
  if (/after|pair with|along with/i.test(q)) {
    return `For the perfect culinary pairing:\n• Main Course: Dal Makhani (₹299) or Paneer Butter Masala (₹349)\n• Breads & Rice: Garlic Naan (₹89) and Veg Dum Biryani (₹329)\n• Sweet finish: Warm Gulab Jamun (₹129) or chilled Rasmalai (₹149)\n• Drink: Sweet Lassi (₹119) with saffron`;
  }

  // 14. Non-menu item inquiries (pizza, burger, chicken, meat, etc.)
  if (/pizza|burger|pasta|sandwich|chicken|mutton|fish|meat|egg|beef|pork/i.test(q)) {
    return `Mithaas is an authentic 100% vegetarian Indian restaurant, so we specialize in tandoor kebabs, North & South Indian curries, Delhi chaat, and traditional mithai.\n\nFor a similar satisfying bite, try our Paneer Tikka (₹299), Samosa Chaat (₹169), or Chole Bhature (₹269)!`;
  }

  // 15. Specific dish search
  const found = menuItems.find((m) => q.includes(m.name.toLowerCase()));
  if (found) {
    const pairText =
      found.category === "north-indian"
        ? `Pairs wonderfully with our crisp Garlic Naan (₹89) and Sweet Lassi (₹119).`
        : found.category === "starters"
        ? `Follow this up with our signature Dal Makhani (₹299) or Veg Dum Biryani (₹329).`
        : found.category === "desserts"
        ? `The ultimate sweet conclusion to any Mithaas meal.`
        : `A perennial favorite crafted fresh in our kitchen.`;
    return `${found.name} (₹${found.price}) — ⭐${found.rating}/5\n${found.description}\n\n${pairText}`;
  }

  // 16. Categories (biryani, chaat, north indian, south indian, chinese, drinks)
  if (/biryani|rice/i.test(q)) {
    return `Our Biryani & Rice selections:\n• Veg Dum Biryani (₹329, ⭐4.8) — Sealed dough dum biryani with raita\n• Mithaas Special Biryani (₹399, ⭐4.9) — Saffron, paneer & dry fruits\n• Jeera Rice (₹179) — Basmati tempered with pure ghee & cumin\n• Curd Rice (₹169) — Cooling South Indian style`;
  }

  if (/chaat|street food|samosa|pani puri|dahi puri/i.test(q)) {
    return `Delhi-style street chaats:\n• Pani Puri (₹129) — 6 crisp puris with spiced mint water & tamarind\n• Dahi Puri (₹149) — Sweet curd, pomegranate & sev\n• Samosa Chaat (₹169) — Crushed samosas with spiced chole\n• Aloo Tikki Chaat (₹159) — Crisp potato patties with fresh chutneys`;
  }

  if (/drink|beverage|chai|tea|coffee|lassi|shake/i.test(q)) {
    return `Refreshing sips from our beverage bar:\n• Sweet Lassi (₹119) — Thick churned yoghurt with saffron swirl\n• Masala Chai (₹79) — Brewed with ginger, cardamom and clove\n• Cold Coffee (₹159) — Frothy and chilled with vanilla\n• Fresh Lime Soda (₹89) — Sweet or salted\n• Jaljeera Cooler (₹99) — Cumin, mint & black salt cooler`;
  }

  // 17. Default Chef Recommendation
  return `Here is a chef-curated feast to get you started:\n• Starter: Paneer Tikka (₹299) — Char-grilled in our clay tandoor\n• Main: Dal Makhani (₹299) with hot Garlic Naan (₹89)\n• Sweet finish: Gulab Jamun (₹129)\n\nTell me if you prefer something spicy, a quick solo meal, or dining with family!`;
}

export const askMithaasAi = createServerFn({ method: "POST" })
  .validator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    let menuItems = FALLBACK_MENU;
    const url = process.env["SUPABASE_URL"];
    const publishable = process.env["SUPABASE_PUBLISHABLE_KEY"];

    // Try fetching live menu items if Supabase is reachable
    if (url && publishable) {
      try {
        const client = createClient(url, publishable, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (publishable.startsWith("sb_") && h.get("Authorization") === `Bearer ${publishable}`) {
                h.delete("Authorization");
              }
              h.set("apikey", publishable);
              return fetch(input, { ...init, headers: h });
            },
          },
        });
        const { data: items, error } = await client
          .from("menu_items")
          .select("name, price, description, is_veg, spice_level, tags, rating")
          .eq("is_available", true);
        if (!error && items && items.length > 0) {
          menuItems = items.map((i) => ({
            name: i.name,
            category: "general",
            price: Number(i.price),
            description: i.description || "",
            is_veg: Boolean(i.is_veg),
            spice_level: Number(i.spice_level || 1),
            rating: Number(i.rating || 4.5),
            tags: i.tags || [],
            is_bestseller: true,
          }));
        }
      } catch {
        // Use fallback menu
      }
    }

    const menuText = menuItems
      .map(
        (i) =>
          `${i.name} — ₹${i.price} — ${i.is_veg ? "veg" : "non-veg"}, spice ${i.spice_level}/4, ⭐${i.rating}, tags: ${(i.tags ?? []).join(", ")} — ${i.description}`,
      )
      .join("\n");

    const system = `You are "Mithaas AI", the friendly food concierge for MITHAAS, a premium Indian restaurant whose tagline is "Where Every Bite Feels Like Home."
Recommend only dishes from the menu below. Always mention dish names exactly as written and their prices in ₹.
Be warm, concise and confident. Use short paragraphs or compact bullet lists (max ~120 words).
When asked for a meal for N people or a budget, propose a balanced spread (starter, main, bread/rice, dessert, drink) and give a rough total.
If something is not on the menu, say so and suggest the closest match. Never invent dishes, prices or delivery promises.

MENU:
${menuText}`;

    // 1. Check for Gemini API Key
    const geminiKey = process.env["GEMINI_API_KEY"] || process.env["VITE_GEMINI_API_KEY"];
    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${system}\n\nUser Conversation:\n${data.messages.map((m) => `${m.role}: ${m.content}`).join("\n")}`,
                    },
                  ],
                },
              ],
            }),
          },
        );
        if (res.ok) {
          const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
          const reply = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (reply) return { reply, ok: true };
        }
      } catch (err) {
        console.warn("Gemini API error, falling back to culinary engine:", err);
      }
    }

    // 2. Check for OpenAI API Key
    const openaiKey = process.env["OPENAI_API_KEY"];
    if (openaiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: system }, ...data.messages],
          }),
        });
        if (res.ok) {
          const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          const reply = json.choices?.[0]?.message?.content?.trim();
          if (reply) return { reply, ok: true };
        }
      } catch (err) {
        console.warn("OpenAI API error, falling back to culinary engine:", err);
      }
    }

    // 3. Check for Lovable API Key
    const lovableKey = process.env["LOVABLE_API_KEY"];
    if (lovableKey) {
      try {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": lovableKey },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "system", content: system }, ...data.messages],
          }),
        });
        if (res.ok) {
          const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          const reply = json.choices?.[0]?.message?.content?.trim();
          if (reply) return { reply, ok: true };
        }
      } catch (err) {
        console.warn("Lovable gateway error, falling back to culinary engine:", err);
      }
    }

    // 4. Built-in Mithaas Culinary Intelligence Engine (Works 100% reliably out-of-the-box!)
    const localReply = generateLocalAiReply(data.messages, menuItems);
    return {
      reply: localReply,
      ok: true,
    };
  });
