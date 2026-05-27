import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const KEY = "madni:sound-enabled";

type Ctx = AudioContext & { _madniGain?: GainNode };

let _ctx: Ctx | null = null;
function ctx(): Ctx | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    _ctx = new C() as Ctx;
    const g = _ctx.createGain();
    g.gain.value = 0.08;
    g.connect(_ctx.destination);
    _ctx._madniGain = g;
  }
  return _ctx;
}

let enabled = false;

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 1) {
  if (!enabled) return;
  const c = ctx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  osc.connect(g);
  g.connect(c._madniGain!);
  osc.start();
  osc.stop(c.currentTime + dur + 0.05);
}

function whoosh() {
  if (!enabled) return;
  const c = ctx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const buffer = c.createBuffer(1, c.sampleRate * 0.4, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length;
    data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.6;
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(400, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(1800, c.currentTime + 0.4);
  filter.Q.value = 4;
  const g = c.createGain();
  g.gain.value = 0.5;
  src.connect(filter);
  filter.connect(g);
  g.connect(c._madniGain!);
  src.start();
}

function welcome() {
  // A short cinematic ascending chord
  tone(523.25, 0.6, "sine", 0.6); // C5
  setTimeout(() => tone(659.25, 0.7, "sine", 0.5), 120); // E5
  setTimeout(() => tone(783.99, 0.9, "sine", 0.5), 260); // G5
  setTimeout(() => tone(1046.5, 1.1, "triangle", 0.35), 420); // C6
}

function hover() {
  tone(1200, 0.05, "sine", 0.18);
}
function click() {
  tone(880, 0.08, "triangle", 0.3);
  setTimeout(() => tone(1320, 0.06, "sine", 0.18), 30);
}

export function SoundEffects() {
  const [on, setOn] = useState(false);
  const welcomed = useRef(false);

  // Init from storage
  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    const isOn = stored === "1";
    setOn(isOn);
    enabled = isOn;
  }, []);

  // Attach global interaction sounds
  useEffect(() => {
    if (!on) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const el = t.closest("a, button, [role=button]");
      if (el) click();
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const el = t.closest("a, button, [role=button]");
      if (el && !el.hasAttribute("data-hovered")) {
        el.setAttribute("data-hovered", "1");
        hover();
        setTimeout(() => el.removeAttribute("data-hovered"), 250);
      }
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("mouseover", onOver, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mouseover", onOver, true);
    };
  }, [on]);

  // Transition whoosh on route / scroll-section change
  useEffect(() => {
    if (!on) return;
    let lastSection = "";
    const onScroll = () => {
      const sections = document.querySelectorAll("section");
      const y = window.scrollY + window.innerHeight / 2;
      let current = "";
      sections.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const top = r.top + window.scrollY;
        if (y >= top && y < top + r.height) current = `s${i}`;
      });
      if (current && current !== lastSection) {
        if (lastSection) whoosh();
        lastSection = current;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [on]);

  const toggle = () => {
    const next = !on;
    setOn(next);
    enabled = next;
    localStorage.setItem(KEY, next ? "1" : "0");
    if (next && !welcomed.current) {
      welcomed.current = true;
      // Need user gesture to resume
      const c = ctx();
      if (c && c.state === "suspended") void c.resume();
      setTimeout(welcome, 100);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={on ? "كتم الصوت" : "تشغيل المؤثرات الصوتية"}
      title={on ? "كتم الصوت" : "تشغيل المؤثرات الصوتية"}
      className="fixed bottom-24 left-6 lg:bottom-6 lg:left-24 z-40 grid place-content-center h-12 w-12 rounded-full glass-strong text-foreground/85 hover:text-gold transition"
    >
      {on ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}