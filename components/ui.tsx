import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import Link from "next/link";

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type CardProps = {
  children: ReactNode;
  className?: string;
  scanlines?: boolean;
};

export function Card({ children, className, scanlines = false }: CardProps) {
  return <section className={joinClasses("card chrome", scanlines && "fx-scanlines", className)}>{children}</section>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return <button className={joinClasses("btn", `btn-${variant}`, className)} type={type} {...props} />;
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
};

export function ButtonLink({ href, children, className, variant = "primary" }: ButtonLinkProps) {
  return (
    <Link className={joinClasses("btn", `btn-${variant}`, className)} href={href}>
      {children}
    </Link>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={joinClasses("input", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={joinClasses("textarea", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={joinClasses("select", className)} {...props}>
      {children}
    </select>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
