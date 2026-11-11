import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
  }
>;

const variants: Record<ButtonVariant, string> = {
  primary: "app-button-primary",
  secondary: "app-button-secondary",
  ghost: "app-button-ghost",
};

export function getButtonClassName(
  variant: ButtonVariant = "primary",
  className?: string,
) {
  return cn("app-button", variants[variant], className);
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={getButtonClassName(variant, className)}
      {...props}
    >
      {children}
    </button>
  );
}
