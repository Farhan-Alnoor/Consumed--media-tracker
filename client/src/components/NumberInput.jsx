import { useEffect, useRef } from "react";

export default function NumberInput({
  value,
  onChange,
  onCommit,
  min = 0,
  max,
  step = 1,
  ...rest
}) {
  const timer = useRef(null);
  const decimals = (String(step).split(".")[1] || "").length;

  useEffect(() => () => clearTimeout(timer.current), []);

  const numeric = value === "" ? null : Number(value);
  const atMin = numeric !== null && numeric <= min;
  const atMax = max !== undefined && numeric !== null && numeric >= max;

  function nudge(direction) {
    const current = numeric === null || Number.isNaN(numeric) ? min : numeric;
    let next = Math.max(min, current + direction * step);
    if (max !== undefined) next = Math.min(max, next);

    const nextValue = String(Number(next.toFixed(decimals))); // avoids 0.1 + 0.2 style drift
    onChange(nextValue);

    // For fields that save themselves (My List), save shortly after the last click
    if (onCommit) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => onCommit(nextValue), 500);
    }
  }

  function handleBlur(e) {
    clearTimeout(timer.current);
    onCommit?.(e.target.value);
  }

  return (
    <div className="stepper">
      <button type="button" tabIndex={-1} aria-label="Decrease" disabled={atMin} onClick={() => nudge(-1)}>
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        {...rest}
      />
      <button type="button" tabIndex={-1} aria-label="Increase" disabled={atMax} onClick={() => nudge(1)}>
        +
      </button>
    </div>
  );
}