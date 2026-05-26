import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/madni-logo.jpg";

const STORAGE_KEY = "madni:intro-seen";

export function CinematicIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(STORAGE_KEY)) return;
    setShow(true);
    const t = setTimeout(() => {
      setShow(false);
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    }, 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] } }}
          className="fixed inset-0 z-[100] grid place-content-center"
          style={{ background: "var(--gradient-noir)" }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.40 0.12 162 / 0.5), transparent 70%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 text-center px-8"
          >
            <motion.img
              src={logo}
              alt="المدني العقارية"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="mx-auto h-20 w-20 rounded-full ring-2 ring-gold/40"
              style={{ boxShadow: "var(--shadow-gold-glow)" }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-6 text-[10px] tracking-[0.6em] text-gold/80"
            >
              ELMADNI · EST. CAIRO
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="font-display mt-3 text-4xl sm:text-6xl font-semibold text-gold-gradient"
            >
              المدني العقارية
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
              className="mx-auto mt-6 h-px w-48 origin-center"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.80 0.135 84 / 0.8), transparent)",
              }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mt-4 text-xs text-muted-foreground tracking-[0.3em]"
            >
              خبرة عقارية تثق بها
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.4 }}
            className="absolute bottom-10 inset-x-0 text-center text-[10px] tracking-[0.4em] text-muted-foreground"
          >
            LOADING EXPERIENCE
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}