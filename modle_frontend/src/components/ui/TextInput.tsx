import type { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className = "", ...props }: TextInputProps) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink ${className}`}
    />
  );
}
