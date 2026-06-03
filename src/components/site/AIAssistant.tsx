import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAssistant } from "@/lib/ai.functions";

type Msg = { role: "user" | "assistant"; content: string };

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "أهلاً بك في مدني العقارية 👋 — أنا مساعدك الذكي. كيف أقدر أساعدك في إيجاد عقارك المناسب في مغاغة والمنيا؟",
    },
  ]);
  const callAi = useServerFn(chatWithAssistant);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await callAi({ data: { messages: next } });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: e instanceof Error ? e.message : "حدث خطأ." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="المساعد الذكي"
        className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-40 grid place-content-center h-14 w-14 rounded-full text-accent-foreground border-2 border-background"
        style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-44 lg:bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 rounded-3xl bg-card luxe-shadow border-2 border-gold/40 overflow-hidden flex flex-col"
            style={{ maxHeight: "min(70vh, 600px)" }}
          >
            <div
              className="px-5 py-4 border-b border-gold/15 flex items-center gap-3"
              style={{ background: "var(--gradient-emerald)" }}
            >
              <div
                className="h-9 w-9 grid place-content-center rounded-full text-accent-foreground"
                style={{ background: "var(--gradient-gold)" }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <div className="font-display text-lg text-gold-gradient leading-none">مساعد مدني</div>
                <div className="text-[10px] tracking-[0.3em] text-muted-foreground mt-1">AI · INSTANT</div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-gold/15 text-foreground"
                      : "mr-auto glass text-foreground/90"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {busy && (
                <div className="mr-auto glass rounded-2xl px-4 py-2.5 text-sm inline-flex items-center gap-2 text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" /> يكتب...
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="p-3 border-t border-gold/15 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اسأل عن أي عقار..."
                className="flex-1 rounded-full bg-background/60 border border-gold/20 px-4 py-2.5 text-sm focus:outline-none focus:border-gold/60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="h-10 w-10 grid place-content-center rounded-full text-accent-foreground disabled:opacity-50"
                style={{ background: "var(--gradient-gold)" }}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}