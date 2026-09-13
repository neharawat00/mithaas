export const SPICE_OPTIONS = ["Mild", "Medium", "Spicy", "Extra Spicy"] as const;

export const ADDONS: { id: string; label: string; price: number }[] = [
  { id: "cheese", label: "Extra cheese", price: 60 },
  { id: "paneer", label: "Extra paneer", price: 90 },
  { id: "gravy", label: "Extra gravy", price: 50 },
  { id: "butter", label: "Extra butter", price: 30 },
  { id: "salad", label: "Green salad", price: 40 },
  { id: "raita", label: "Boondi raita", price: 70 },
];

export function addonPrice(ids: string[]) {
  return ids.reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price ?? 0), 0);
}

export function addonLabels(ids: string[]) {
  return ids.map((id) => ADDONS.find((a) => a.id === id)?.label ?? id);
}

export const SPICE_LABEL = ["No chilli", "Mild", "Medium", "Spicy", "Fiery"];
