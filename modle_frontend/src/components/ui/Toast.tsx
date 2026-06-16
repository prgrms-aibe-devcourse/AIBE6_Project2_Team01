export type ToastState = {
  type: "success" | "error";
  message: string;
};

export function Toast({ toast }: { toast: ToastState }) {
  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 rounded-md border px-4 py-3 text-[15px] font-semibold leading-6 shadow-lg ${
        toast.type === "success"
          ? "border-success bg-success-soft text-success"
          : "border-error bg-error-soft text-error"
      }`}
    >
      {toast.message}
    </div>
  );
}
