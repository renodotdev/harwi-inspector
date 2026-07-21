import type { ComponentPropsWithRef, ReactNode } from "react";
import { Icon } from "./Icon";

const CARD =
  "bg-surface border border-line rounded-2xl px-4 py-5 sm:px-6 sm:py-[22px] shadow-[0_1px_2px_oklch(0.2_0.01_260/0.03)]";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`${CARD} ${className}`}>{children}</section>;
}

export function CardHeading({
  icon,
  title,
  trailing,
  tight = false,
}: {
  icon: string;
  title: string;
  trailing?: ReactNode;
  /** Checklist cards sit closer to their first row than the plain form cards. */
  tight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-[11px] ${tight ? "mb-1.5" : "mb-[18px]"}`}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-brand-soft text-brand-ink">
        <Icon name={icon} className="size-[17px]" />
      </div>
      <h2 className="m-0 text-[15px] font-bold">{title}</h2>
      {trailing ? <div className="ml-auto">{trailing}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "lg";

// `primary` pairs brand orange with charcoal text: white on this orange only
// reaches ~2.1:1, whereas ink on it clears 5.5:1 and matches the logo.
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-ink shadow-[0_1px_2px_oklch(0.68_0.16_60/0.45)] hover:bg-brand-strong",
  secondary:
    "border border-line-strong bg-surface text-ink-label hover:bg-surface-sunken",
  ghost:
    "border border-line-strong bg-surface text-ink-label hover:bg-surface-sunken",
  danger: "bg-fail text-white hover:brightness-110",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-3.5 py-2.5 text-[13px] rounded-[9px]",
  lg: "px-5 py-[15px] text-[15px] rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type="button"
      {...props}
      className={`cursor-pointer font-bold transition-all duration-[120ms] disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    />
  );
}

// ---------------------------------------------------------------------------

const INPUT =
  "min-h-11 px-3 py-2.5 border border-line-strong rounded-[9px] text-sm bg-surface-subtle text-ink-body";

export function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  options,
  listId,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: string[];
  listId?: string;
  type?: "text" | "date";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-bold text-ink-label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list={options?.length ? listId : undefined}
        className={INPUT}
      />
      {options?.length ? (
        <datalist id={listId}>
          {options.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      ) : null}
    </label>
  );
}
