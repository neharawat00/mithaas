import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrepTime, RatingPill, SpiceMeter, VegBadge } from "./badges";
import { foodImage } from "@/lib/images";
import { inr } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

export function FoodCard({ item, onOpen }: { item: MenuItem; onOpen: (item: MenuItem) => void }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group surface-card overflow-hidden shadow-[var(--shadow-lift)] transition-transform duration-300 hover:-translate-y-1"
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="block w-full text-left"
        aria-label={`View details for ${item.name}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={foodImage(item.image_key)}
            alt={item.name}
            loading="lazy"
            width={900}
            height={700}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/70 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {item.is_bestseller && (
              <span className="gradient-warm rounded-full px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                Bestseller
              </span>
            )}
            {item.is_chef_special && (
              <span className="rounded-full bg-card/90 px-2 py-0.5 text-[11px] font-bold text-foreground">
                Chef's Special
              </span>
            )}
          </div>
          <div className="absolute right-3 top-3 rounded-md bg-card/90 p-1">
            <VegBadge isVeg={item.is_veg} />
          </div>
        </div>
      </button>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 font-display text-lg leading-tight">{item.name}</h3>
          <RatingPill rating={item.rating} />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <PrepTime minutes={item.prep_minutes} />
          <SpiceMeter level={item.spice_level} />
          {item.calories ? (
            <span className="text-xs text-muted-foreground">{item.calories} kcal</span>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="font-display text-xl">{inr(item.price)}</span>
          <Button size="sm" className="rounded-full" onClick={() => onOpen(item)}>
            Add <Plus className="ml-1 h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
