import type { ReactNode } from "react";

type AlertProps = {
  variant: "error" | "success";
  children: ReactNode;
};

export function Alert({ variant, children }: AlertProps) {
  return (
    <p
      className={`rounded-md px-3 py-2 text-[13px] leading-5 ${
        variant === "error" ? "bg-error-soft text-error" : "bg-success-soft text-success"
      }`}
      aria-live="polite"
    >
      {children}
    </p>
  );
}
