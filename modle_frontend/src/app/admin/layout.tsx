import type { ReactNode } from "react";

import { AdminOnly } from "@/components/auth/AdminOnly";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}
