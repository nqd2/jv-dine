import type { ReactNode } from "react";

export type CardProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function Card({ children, className, id }: CardProps) {
  return (
    <section
      id={id}
      className={[
        "rounded-lg bg-white shadow-card",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </section>
  );
}
