import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { askMithaasAi } from "@/lib/ai.functions";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  "What should I eat?",
  "Bestsellers",
  "Under ₹300",
  "Family meal for 4",
  "Healthy options",
  "Dessert recommendations",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "Namaste! I'm **Mithaas AI**. Tell me your mood, budget or group size and I'll build the perfect order for you.",
};

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askMithaasAi);
  const endRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await ask({
        data: { messages: next.filter((m) => m !== GREETING).slice(-12) },
      });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Something went wrong reaching the assistant. Please try again." },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open Mithaas AI food assistant"
        className="gradient-warm fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-50 grid h-14 w-14 place-items-center rounded-full text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105 lg:bottom-6"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-label="Mithaas AI assistant"
            className="glass fixed bottom-[calc(9rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-[min(70vh,32rem)] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-3xl lg:bottom-24"
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="gradient-warm grid h-8 w-8 place-items-center rounded-xl text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-base leading-none">Mithaas AI</p>
                <p className="text-[11px] text-muted-foreground">Your personal food concierge</p>
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-3">
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                        : "w-fit max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-secondary px-3 py-2 text-sm text-secondary-foreground"
                    }
                  >
                    {m.content.replace(/\*\*/g, "")}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking about your order…
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </ScrollArea>

            <div className="hide-scrollbar flex gap-2 overflow-x-auto border-t border-border px-3 py-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  className="shrink-0 rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-medium"
                >
                  {p}
                </button>
              ))}
            </div>

            <form
              className="flex items-center gap-2 border-t border-border p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="I want something spicy under ₹400…"
                aria-label="Message Mithaas AI"
                className="rounded-full"
              />
              <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={loading}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
