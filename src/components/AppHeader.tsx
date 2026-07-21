import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function AppHeader({
  left,
  actions,
  children,
  sticky = false,
  logoHref = "/",
}: {
  left?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  sticky?: boolean;
  logoHref?: string | null;
}) {
  return (
    <header
      className={`${sticky ? "z-20 sm:sticky sm:top-0" : ""} border-b border-line bg-header/95 backdrop-blur-[8px] backdrop-saturate-[1.2] print:hidden`}
    >
      <div className="mx-auto max-w-[1100px] px-4 sm:px-5">
        <div className="grid min-h-[68px] grid-cols-[1fr_auto_1fr] items-center gap-2 py-2 sm:min-h-[76px] sm:gap-4">
          <div className="flex min-w-0 items-center justify-self-start">
            {left}
          </div>
          <div className="flex items-center justify-center">
            <Logo href={logoHref} />
          </div>
          <div className="flex min-w-0 items-center justify-self-end">
            {actions}
          </div>
        </div>

        {children ? (
          <div className="border-t border-line-soft py-3">{children}</div>
        ) : null}
      </div>
    </header>
  );
}
