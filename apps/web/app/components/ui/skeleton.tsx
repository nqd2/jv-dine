import { HTMLAttributes } from "react";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "animate-pulse rounded-[10px] bg-neutral-200/70",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
