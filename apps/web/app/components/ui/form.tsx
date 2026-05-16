"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState, type ChangeEventHandler, type ReactNode } from "react";

export const textFieldClasses =
  "h-[50px] w-full rounded-lg border border-border-input bg-white px-3 py-3 text-base font-normal text-foreground outline-none transition-[border-color,box-shadow] duration-150 ease-in-out placeholder:font-normal placeholder:text-placeholder focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]";

export const textareaFieldClasses =
  "min-h-[98px] w-full resize-y rounded-lg border border-border-input bg-white px-3 py-3 text-base font-normal text-foreground outline-none transition-[border-color,box-shadow] duration-150 ease-in-out placeholder:font-normal placeholder:text-placeholder focus:border-primary focus:shadow-[0_0_0_3px_var(--ring-primary-soft)]";

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

export type PasswordInputProps = {
  id: string;
  name: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
};

export function PasswordInput({
  id,
  name,
  value,
  onChange,
  autoComplete,
  required = true,
  minLength = 8,
  placeholder = "••••••••",
  showPasswordLabel,
  hidePasswordLabel,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <InputWithLeading
      leading={
        <Lock
          aria-hidden
          className="size-full shrink-0"
          strokeWidth={1.5}
        />
      }
    >
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className={`${textFieldClasses} pl-10 pr-10`}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 size-5 -translate-y-1/2 rounded-sm text-placeholder transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? hidePasswordLabel : showPasswordLabel}
      >
        {visible ? (
          <EyeOff
            aria-hidden
            className="size-full shrink-0"
            strokeWidth={1.5}
          />
        ) : (
          <Eye aria-hidden className="size-full shrink-0" strokeWidth={1.5} />
        )}
      </button>
    </InputWithLeading>
  );
}
