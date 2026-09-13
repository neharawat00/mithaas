import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PrepTime, RatingPill, SpiceMeter, TagChip, VegBadge } from "./badges";
import { ADDONS, SPICE_OPTIONS, addonPrice } from "@/lib/customize";
import { foodImage } from "@/lib/images";
import { inr } from "@/lib/format";
import { useCart } from "@/lib/cart";
import type { MenuItem } from "@/lib/types";

export function ItemDialog({
  item,
  onClose,
}: {
  item: MenuItem | null;
  onClose: () => void;
}) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [spice, setSpice] = useState<string>("Medium");
  const [addons, setAddons] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (item) {
      setQty(1);
      setSpice(SPICE_OPTIONS[Math.min(Math.max(item.spice_level - 1, 0), 3)] ?? "Medium");
      setAddons([]);
      setInstructions("");
    }
  }, [item]);

  if (!item) return null;
  const unitPrice = item.price + addonPrice(addons);

  const submit = () => {
    cart.add({
      itemId: item.id,
      slug: item.slug,
      name: item.name,
      imageKey: item.image_key,
      unitPrice,
      quantity: qty,
      spice,
      addons,
      instructions,
    });
    toast.success(`${item.name} added to cart`, { description: `${qty} × ${inr(unitPrice)}` });
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0">
        <img
          src={foodImage(item.image_key)}
          alt={item.name}
          loading="lazy"
          width={900}
          height={700}
          className="h-48 w-full object-cover sm:h-64"
        />
        <div className="space-y-5 p-5 sm:p-6">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="min-w-0 font-display text-2xl">{item.name}</DialogTitle>
              <VegBadge isVeg={item.is_veg} />
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-3">
            <RatingPill rating={item.rating} count={item.review_count} />
            <PrepTime minutes={item.prep_minutes} />
            <SpiceMeter level={item.spice_level} />
            {item.calories ? (
              <span className="text-xs text-muted-foreground">{item.calories} kcal</span>
            ) : null}
            <span className="font-display text-xl">{inr(item.price)}</span>
          </div>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <TagChip key={t}>{t}</TagChip>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-display text-base">Spice level</h4>
            <div className="flex flex-wrap gap-2">
              {SPICE_OPTIONS.map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={spice === option ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setSpice(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display text-base">Add-ons</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {ADDONS.map((addon) => (
                <label
                  key={addon.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Checkbox
                      checked={addons.includes(addon.id)}
                      onCheckedChange={(checked) =>
                        setAddons((prev) =>
                          checked ? [...prev, addon.id] : prev.filter((a) => a !== addon.id),
                        )
                      }
                      aria-label={addon.label}
                    />
                    <span className="truncate text-sm">{addon.label}</span>
                  </span>
                  <span className="shrink-0 text-sm text-muted-foreground">+{inr(addon.price)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions" className="font-display text-base">
              Cooking instructions
            </Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value.slice(0, 300))}
              placeholder="Add cooking instructions… e.g. less oil, no onion"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-2 rounded-full border border-border p-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-6 text-center font-semibold">{qty}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button className="w-full rounded-full" onClick={submit}>
              <ShoppingBag className="mr-2 h-4 w-4" aria-hidden />
              Add to cart · {inr(unitPrice * qty)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
