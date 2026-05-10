import { useMemo, useState } from "react";
import {
  Calculator,
  Minus,
  Plus,
  ArrowLeftRight,
  ArrowDown,
  RotateCcw,
} from "lucide-react";

// Roll a (over, ball) pair so ball stays in 0..5 and over increments naturally.
function normalize(over, ball) {
  if (ball > 5) {
    over += Math.floor(ball / 6);
    ball = ball % 6;
  } else if (ball < 0) {
    const carry = Math.ceil(-ball / 6);
    over -= carry;
    ball += carry * 6;
  }
  if (over < 0) {
    over = 0;
    ball = 0;
  }
  if (over > 20) over = 20;
  return [over, ball];
}

function ballsTotal(over, ball) {
  return (Number(over) || 0) * 6 + (Number(ball) || 0);
}

function Stepper({ label, value, onChange, min = 0, max, step = 1, hint }) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () =>
    onChange(max != null ? Math.min(max, value + step) : value + step);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {hint && <span className="text-[10px] text-slate-600">{hint}</span>}
      </div>
      <div className="flex h-14 items-stretch overflow-hidden rounded-xl border border-slate-700 bg-slate-900 sm:h-16">
        <button
          type="button"
          onClick={dec}
          className="flex w-12 shrink-0 items-center justify-center text-slate-300 transition active:bg-slate-800 disabled:text-slate-700 sm:w-14"
          disabled={value <= min}
        >
          <Minus size={22} />
        </button>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => {
            const v = e.target.value === "" ? 0 : +e.target.value;
            if (Number.isNaN(v)) return;
            let clamped = Math.max(min, v);
            if (max != null) clamped = Math.min(max, clamped);
            onChange(clamped);
          }}
          className="stepper-input w-full min-w-0 border-0 bg-slate-900 text-center text-2xl font-bold text-slate-100 focus:outline-none focus:ring-0 sm:text-3xl"
        />
        <button
          type="button"
          onClick={inc}
          className="flex w-12 shrink-0 items-center justify-center text-slate-300 transition active:bg-slate-800 disabled:text-slate-700 sm:w-14"
          disabled={max != null && value >= max}
        >
          <Plus size={22} />
        </button>
      </div>
    </div>
  );
}

function PointEditor({
  title,
  accent,
  over,
  ball,
  runs,
  setOver,
  setBall,
  setRuns,
  maxOver,
}) {
  const accentBar = accent === "sky" ? "bg-sky-500" : "bg-emerald-500";
  const accentText = accent === "sky" ? "text-sky-400" : "text-emerald-400";

  const setBallSmart = (b) => {
    const [no, nb] = normalize(over, b);
    setOver(no);
    setBall(nb);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${accentBar}`}></span>
        <span
          className={`text-xs font-bold uppercase tracking-wider ${accentText}`}
        >
          {title}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stepper
          label="Over"
          value={over}
          onChange={setOver}
          min={0}
          max={maxOver}
        />
        <Stepper
          label="Ball"
          value={ball}
          onChange={setBallSmart}
          min={0}
          max={5}
          hint="0–5"
        />
        <Stepper label="Runs" value={runs} onChange={setRuns} min={0} />
      </div>
    </div>
  );
}

const PRESETS = [
  { label: "Over 6", over: 6, ball: 0 },
  { label: "Over 10", over: 10, ball: 0 },
  { label: "Over 12", over: 12, ball: 0 },
  { label: "Over 15", over: 15, ball: 0 },
  { label: "Over 20", over: 20, ball: 0 },
];

export default function App() {
  const [startOver, setStartOver] = useState(4);
  const [startBall, setStartBall] = useState(5);
  const [startRuns, setStartRuns] = useState(50);
  const [endOver, setEndOver] = useState(10);
  const [endBall, setEndBall] = useState(0);
  const [endRuns, setEndRuns] = useState(91);

  const result = useMemo(() => {
    const sBalls = ballsTotal(startOver, startBall);
    const eBalls = ballsTotal(endOver, endBall);
    if (eBalls < sBalls)
      return { error: "End point must be at or after start." };
    if (Number(endRuns) < Number(startRuns))
      return { error: "End runs cannot be less than start runs." };
    const runsGap = Number(endRuns) - Number(startRuns);
    const ballsGap = eBalls - sBalls;
    const oversWhole = Math.floor(ballsGap / 6);
    const ballsRem = ballsGap % 6;
    const rr = ballsGap > 0 ? (runsGap / ballsGap) * 6 : 0;
    return { runsGap, ballsGap, oversWhole, ballsRem, rr };
  }, [startOver, startBall, startRuns, endOver, endBall, endRuns]);

  const swap = () => {
    setStartOver(endOver);
    setStartBall(endBall);
    setStartRuns(endRuns);
    setEndOver(startOver);
    setEndBall(startBall);
    setEndRuns(startRuns);
  };

  const continueFromEnd = () => {
    setStartOver(endOver);
    setStartBall(endBall);
    setStartRuns(endRuns);
  };

  const reset = () => {
    setStartOver(0);
    setStartBall(0);
    setStartRuns(0);
    setEndOver(6);
    setEndBall(0);
    setEndRuns(0);
  };

  const applyEndPreset = (p) => {
    setEndOver(p.over);
    setEndBall(p.ball);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Sticky results bar (mobile-friendly) */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/75">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          {result.error ? (
            <div className="text-sm text-rose-400">{result.error}</div>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">
                  Runs
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  +{result.runsGap}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">
                  Balls
                </div>
                <div className="text-2xl font-bold text-slate-100">
                  {result.ballsGap}
                </div>
                <div className="text-[10px] text-slate-500">
                  {result.oversWhole}.{result.ballsRem} ov
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">
                  Req RR
                </div>
                <div className="text-2xl font-bold text-amber-400">
                  {result.ballsGap > 0 ? result.rr.toFixed(2) : "—"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-5 sm:px-6">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
              <Calculator size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                Run Gap Calculator
              </h1>
              <p className="text-[11px] text-slate-500 sm:text-xs">
                Quick T20 over-range math
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-slate-400 transition active:bg-slate-800"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </header>

        <PointEditor
          title="Start"
          accent="emerald"
          over={startOver}
          ball={startBall}
          runs={startRuns}
          setOver={setStartOver}
          setBall={setStartBall}
          setRuns={setStartRuns}
          maxOver={20}
        />

        <div className="my-2 flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-slate-800"></div>
          <button
            type="button"
            onClick={swap}
            aria-label="Swap start and end"
            className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-300 transition active:bg-slate-800"
          >
            <ArrowLeftRight size={12} /> Swap
          </button>
          <div className="h-px flex-1 bg-slate-800"></div>
        </div>

        <PointEditor
          title="End"
          accent="sky"
          over={endOver}
          ball={endBall}
          runs={endRuns}
          setOver={setEndOver}
          setBall={setEndBall}
          setRuns={setEndRuns}
          maxOver={20}
        />

        {/* Quick End presets */}
        <div className="mt-3">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Quick set END to
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const active = endOver === p.over && endBall === p.ball;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyEndPreset(p)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
                    active
                      ? "border-sky-500 bg-sky-500/10 text-sky-400"
                      : "border-slate-700 bg-slate-900 text-slate-300"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Continue button — mobile-handy for live tracking */}
        <button
          type="button"
          onClick={continueFromEnd}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm font-medium text-emerald-300 transition active:bg-emerald-500/10"
        >
          <ArrowDown size={14} /> Continue: use END as new START
        </button>

        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/30 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">
          <strong className="text-slate-400">How:</strong> Over = completed
          overs (0–20). "After 4 overs and 5 balls" → over{" "}
          <span className="text-slate-300">4</span>, ball{" "}
          <span className="text-slate-300">5</span>. The Ball stepper auto-rolls
          into the next over after 6.
        </div>
      </div>
    </div>
  );
}
