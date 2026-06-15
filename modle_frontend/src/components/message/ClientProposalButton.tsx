"use client";

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";

type ClientProposalButtonProps = {
  recipientUserId: number;
};

export function ClientProposalButton({
  recipientUserId,
}: ClientProposalButtonProps) {
  const { user, isLoading } = useAuth();

  if (isLoading || user?.role !== "CLIENT") {
    return null;
  }

  return (
    <Link
      href={`/messages?recipientId=${recipientUserId}`}
      className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover"
    >
      제안하기
    </Link>
  );
}
