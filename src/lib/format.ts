export function inr(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function shortId(id: string) {
  return `MTH-${id.slice(0, 6).toUpperCase()}`;
}
