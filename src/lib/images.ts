import hero from "@/assets/hero.jpg";
import starter from "@/assets/food-starter.jpg";
import curry from "@/assets/food-curry.jpg";
import biryani from "@/assets/food-biryani.jpg";
import dessert from "@/assets/food-dessert.jpg";
import mithai from "@/assets/food-mithai.jpg";
import chaat from "@/assets/food-chaat.jpg";
import south from "@/assets/food-south.jpg";
import chinese from "@/assets/food-chinese.jpg";
import bread from "@/assets/food-bread.jpg";
import beverage from "@/assets/food-beverage.jpg";
import combo from "@/assets/food-combo.jpg";

export const heroImage = hero;

const map: Record<string, string> = {
  starter,
  curry,
  biryani,
  dessert,
  mithai,
  chaat,
  south,
  chinese,
  bread,
  beverage,
  combo,
  kids: combo,
  default: curry,
};

export function foodImage(key: string | null | undefined) {
  return map[key ?? "default"] ?? map["default"]!;
}
