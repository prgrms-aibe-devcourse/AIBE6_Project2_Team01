"use client";

import { useState } from "react";
import { ReportModal } from "./ReportModal";
import type { ReportTargetType } from "@/lib/api/report";

interface Props {
  targetType: ReportTargetType;
  targetId: number;
  className?: string;
}

export function ReportButton({ targetType, targetId, className }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        신고하기
      </button>
      {open && (
        <ReportModal
          targetType={targetType}
          targetId={targetId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
