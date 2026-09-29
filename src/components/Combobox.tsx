"use client";

import { ChevronDown } from "lucide-react";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { INPUT } from "./ui";

export function Combobox({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: string[];
}) {
  const inputId = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options;
    if (options.some((opt) => opt.toLowerCase() === q)) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, value]);

  function pick(opt: string) {
    onChange(opt);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(0);
        return;
      }
      setActive((i) => Math.min(i + 1, Math.max(matches.length - 1, 0)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(Math.max(matches.length - 1, 0));
        return;
      }
      setActive((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && open && matches[active]) {
      e.preventDefault();
      pick(matches[active]);
    }
  }

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-[11.5px] font-bold text-ink-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => {
            setOpen(true);
            setActive(0);
          }}
          onClick={() => {
            setOpen(true);
            setActive(0);
          }}
          onBlur={() => {
            window.setTimeout(() => {
              if (!rootRef.current?.contains(document.activeElement)) {
                setOpen(false);
              }
            }, 0);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`${INPUT} w-full pr-10`}
        />
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
        />
      </div>
      {open && matches.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full z-20 mt-1 max-h-52 w-full overflow-auto rounded-[9px] border border-line-strong bg-surface py-1 shadow-[0_8px_24px_oklch(0.2_0.01_260/0.12)]"
        >
          {matches.map((opt, i) => (
            <li key={opt} role="option" aria-selected={i === active}>
              <button
                type="button"
                tabIndex={-1}
                className={`block w-full cursor-pointer px-3 py-2 text-left text-sm ${
                  i === active ? "bg-brand-soft text-ink" : "text-ink-body"
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(opt)}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
