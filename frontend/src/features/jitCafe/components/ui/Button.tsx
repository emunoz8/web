import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../utils/cn";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
  }
>;

const variants = {
  primary: "app-button-primary",
  secondary: "app-button-secondary",
  ghost: "app-button-ghost",
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "app-button",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
