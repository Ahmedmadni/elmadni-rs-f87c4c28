import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import madniLogo from "@/assets/madni-logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "madni:install-dismissed-at";
const DISMISS_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari
    window.navigator.standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 1500);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const onInstalled = () => {
      setShow(false);
      setDeferred(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari has no beforeinstallprompt; show manual hint.
    if (isIOS()) setTimeout(() => { setIosHint(true); setShow(true); }, 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="تثبيت تطبيق مدني العقارية"
      className="fixed bottom-24 lg:bottom-6 inset-x-3 lg:inset-x-auto lg:right-6 z-[60] max-w-md mx-auto lg:mx-0 rounded-2xl border-2 border-gold/40 bg-card luxe-shadow p-4 animate-in fade-in slide-in-from-bottom-4"
    >
      <button
        onClick={dismiss}
        aria-label="إغلاق"
        className="absolute top-2 left-2 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition"
      >
        <X size={16} />
      </button>
      <div className="flex items-start gap-3">
        <img
          src={madniLogo}
          alt=""
          className="h-14 w-14 rounded-xl object-cover ring-1 ring-gold/40 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-base">تثبيت مدني العقارية</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            أضف مدني العقارية إلى الشاشة الرئيسية للوصول الأسرع وتجربة تصفح أفضل.
          </p>
          {iosHint ? (
            <p className="text-xs text-foreground/80 mt-2">
              اضغط زر المشاركة <span className="mx-1">⎙</span> ثم اختر «إضافة إلى الشاشة الرئيسية».
            </p>
          ) : null}
          <div className="mt-3 flex items-center gap-2">
            {!iosHint && (
              <button
                onClick={install}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-accent-foreground transition hover:scale-[1.03]"
                style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}
              >
                <Download size={14} /> تثبيت
              </button>
            )}
            <button
              onClick={dismiss}
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 hover:text-gold border border-gold/30 hover:border-gold transition"
            >
              لاحقًا
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}