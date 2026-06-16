import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  required?: boolean;
  children: ReactNode;
};

export function Field({ label, required, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold leading-5 text-ink">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
