"use client";

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";

type ClientProposalButtonProps = {
  recipientUserId: number;
  className?: string;
};

export function ClientProposalButton({
  recipientUserId,
  className,
}: ClientProposalButtonProps) {
  const { user, isLoading } = useAuth();

  if (
    isLoading ||
    user?.role !== "CLIENT" ||
    !Number.isFinite(recipientUserId) ||
    recipientUserId <= 0
  ) {
    return null;
  }

  return (
    <Link
      href={`/messages?recipientId=${recipientUserId}`}
      className={className ?? "inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover"}
    >
      섭외 문의하기
    </Link>
  );
}
