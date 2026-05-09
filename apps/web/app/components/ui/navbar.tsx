import type { ReactNode } from "react";

export type NavbarProps = {
  start?: ReactNode;
  end?: ReactNode;
  /** Extra classes on the inner content row (already `max-w-7xl mx-auto`, aligned with main). */
  className?: string;
};

/**
 * Outer bar is full viewport width (border/shadow bleed); inner row matches pages using `max-w-7xl` + horizontal padding.
 */
export function Navbar({ start, end, className }: NavbarProps) {
  return (
    <header className="w-full shrink-0 border-b border-border-navbar bg-white shadow-nav">
      <div
        className={[
          "mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-2.5 sm:flex-nowrap sm:gap-4 sm:px-8 lg:gap-8",
          className ?? "",
        ].join(" ")}
      >
        {start !== undefined ? (
          <div className="flex min-w-0 shrink-0 items-center gap-4 sm:gap-6 md:gap-8">
            {start}
          </div>
        ) : null}
        {end !== undefined ? (
          <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-2 sm:flex-nowrap sm:gap-3">
            {end}
          </div>
        ) : null}
      </div>
    </header>
  );
}
