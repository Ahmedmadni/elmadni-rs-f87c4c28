import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

function parsePrice(input: string): number {
  const digits = input.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(Math.round(n));
}

export function MortgageCalculator({ defaultPrice }: { defaultPrice: string }) {
  const initial = parsePrice(defaultPrice);
  const [price, setPrice] = useState(initial);
  const [downPct, setDownPct] = useState(20);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(18); // annual %

  const { monthly, principal, totalInterest, total } = useMemo(() => {
    const principal = price * (1 - downPct / 100);
    const r = rate / 100 / 12;
    const n = years * 12;
    const monthly = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
    const total = monthly * n;
    return {
      monthly: isFinite(monthly) ? monthly : 0,
      principal,
      totalInterest: total - principal,
      total,
    };
  }, [price, downPct, years, rate]);

  return (
    <div className="rounded-3xl glass p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="grid place-content-center h-9 w-9 rounded-full glass-strong text-gold">
          <Calculator size={16} />
        </span>
        <h2 className="font-display text-2xl text-gold-gradient">حاسبة القرض العقاري</h2>
      </div>

      <div className="space-y-5">
        <Field
          label="سعر العقار (ج.م)"
          value={fmt(price)}
          onChange={(v) => setPrice(parsePrice(v))}
        />
        <Slider
          label="المقدم"
          suffix="%"
          value={downPct}
          min={5}
          max={70}
          step={1}
          onChange={setDownPct}
        />
        <Slider
          label="مدة القرض"
          suffix=" سنة"
          value={years}
          min={3}
          max={25}
          step={1}
          onChange={setYears}
        />
        <Slider
          label="نسبة الفائدة السنوية"
          suffix="%"
          value={rate}
          min={5}
          max={28}
          step={0.5}
          onChange={setRate}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <Stat label="القسط الشهري" value={`${fmt(monthly)} ج.م`} highlight />
        <Stat label="إجمالي القرض" value={`${fmt(principal)} ج.م`} />
        <Stat label="إجمالي الفوائد" value={`${fmt(totalInterest)} ج.م`} />
        <Stat label="الإجمالي المدفوع" value={`${fmt(total)} ج.م`} />
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        * الأرقام تقديرية لأغراض إرشادية فقط.
      </p>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1.5">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
        className="w-full rounded-2xl glass px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-gold/50 transition"
      />
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-gold font-medium">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[oklch(0.80_0.135_84)]"
      />
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-3 ${
        highlight ? "glass-strong" : "glass"
      }`}
    >
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`mt-1 font-semibold ${highlight ? "text-gold-gradient text-lg font-display" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}