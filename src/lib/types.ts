export type MenuCategory = {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  sort_order: number;
};

export type MenuItem = {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image_key: string;
  rating: number;
  review_count: number;
  is_veg: boolean;
  spice_level: number;
  prep_minutes: number;
  calories: number | null;
  is_bestseller: boolean;
  is_chef_special: boolean;
  is_available: boolean;
  tags: string[];
};

export type Coupon = {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_order: number;
  max_discount: number | null;
  expires_at: string | null;
};

export type OrderType = "delivery" | "takeaway" | "dinein";

export type CartLine = {
  lineId: string;
  itemId: string;
  slug: string;
  name: string;
  imageKey: string;
  unitPrice: number;
  quantity: number;
  spice: string;
  addons: string[];
  instructions: string;
};
