import type { ReactNode } from "react";

export const textFieldClasses =
  "h-[50px] w-full rounded-lg border border-border-input bg-white px-3 py-3 text-base font-normal text-foreground outline-none transition-[border-color,box-shadow] duration-150 ease-in-out placeholder:font-normal placeholder:text-placeholder focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]";

export type FormFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={[className ?? "", "block"].join(" ").trim()}>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-sm font-medium text-label"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export type InputWithLeadingProps = {
  leading: ReactNode;
  children: ReactNode;
  className?: string;
};

export function InputWithLeading({
  leading,
  children,
  className,
}: InputWithLeadingProps) {
  return (
    <div className={["relative", className ?? ""].join(" ").trim()}>
      <span className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-placeholder [&>svg]:size-full [&>svg]:shrink-0">
        {leading}
      </span>
      {children}
    </div>
  );
}

export type FormErrorAlertProps = {
  children: ReactNode;
  className?: string;
};

export function FormErrorAlert({ children, className }: FormErrorAlertProps) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className={[
        "rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </p>
  );
}
