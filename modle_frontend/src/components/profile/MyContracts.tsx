"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  formatContractStatus,
  getContracts,
  type ContractListItem,
  type ContractListStatus,
} from "@/lib/api/contract";

type MyContractsProps = {
  viewer: "MODEL" | "CLIENT";
};

const FILTERS: { value: ContractListStatus; label: string }[] = [
  { value: "ONGOING", label: "진행 중" },
  { value: "DONE", label: "완료" },
  { value: "CANCELLED", label: "취소" },
];

const CONTRACT_TYPE_LABELS: Record<ContractListItem["contractType"], string> = {
  TEMPLATE: "템플릿 작성",
  FILE: "파일 첨부",
};

const PAY_TYPE_LABELS: Record<ContractListItem["payType"], string> = {
  CASH: "현금",
  SERVICE: "서비스 제공",
  FREE: "무상",
};

export function MyContracts({ viewer }: MyContractsProps) {
  const [activeFilter, setActiveFilter] =
    useState<ContractListStatus>("ONGOING");
  const [items, setItems] = useState<ContractListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    setIsLoading(true);
    setError("");

    getContracts(activeFilter)
      .then((nextItems) => {
        if (!ignore) {
          setItems(nextItems);
        }
      })
      .catch((nextError: unknown) => {
        if (!ignore) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : "계약 내역을 불러오지 못했습니다.",
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [activeFilter]);

  const emptyMessage = useMemo(() => {
    switch (activeFilter) {
      case "ONGOING":
        return "진행 중인 계약이 없습니다.";
      case "DONE":
        return "완료된 계약이 없습니다.";
      case "CANCELLED":
        return "취소된 계약이 없습니다.";
      default:
        return "계약 내역이 없습니다.";
    }
  }, [activeFilter]);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b-2 border-black pb-3">
        <h2 className="mr-4 text-xl font-black tracking-widest text-black">
          계약 내역
        </h2>
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            className={`rounded border px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeFilter === filter.value
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-white text-gray-600 hover:border-black hover:text-black"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-sm text-gray-500">
          로딩 중...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="py-20 text-center text-sm text-red-500">{error}</div>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-500">
          {emptyMessage}
        </div>
      ) : null}

      {!isLoading && !error && items.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.contractId}
              className="border border-gray-200 bg-white p-5 transition-colors hover:border-black"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.3px] text-gray-400">
                    계약서 #{item.contractId}
                  </p>
                  <h3 className="mt-1 break-words text-[16px] font-bold text-black">
                    {item.partnerName}
                  </h3>
                </div>
                <span className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                  {formatContractStatus(item.contractStatus)}
                </span>
              </div>

              <dl className="space-y-2 text-[13px]">
                <InfoRow label="지원 ID" value={`#${item.applicationId}`} />
                <InfoRow
                  label="계약 유형"
                  value={CONTRACT_TYPE_LABELS[item.contractType]}
                />
                <InfoRow
                  label="보수 유형"
                  value={PAY_TYPE_LABELS[item.payType]}
                />
                <InfoRow label="보수 금액" value={formatPayment(item)} />
                <InfoRow
                  label="촬영 일정"
                  value={formatSchedule(item.shootStartAt, item.shootEndAt)}
                />
                <InfoRow label="촬영 장소" value={item.location || "-"} />
                <InfoRow
                  label={item.confirmedAt ? "확정일" : "생성일"}
                  value={formatDate(item.confirmedAt || item.createdDate)}
                />
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                {viewer === "MODEL" ? (
                  <Link
                    href={`/contracts/${item.contractId}`}
                    className="inline-flex h-9 items-center justify-center rounded border border-black px-4 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white"
                  >
                    상세 보기
                  </Link>
                ) : item.contractStatus === "DRAFT" ? (
                  <Link
                    href={`/contracts/new?applicationId=${item.applicationId}`}
                    className="inline-flex h-9 items-center justify-center rounded border border-black px-4 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white"
                  >
                    작성 이어가기
                  </Link>
                ) : null}

                {item.documentUrl ? (
                  <a
                    href={item.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition-colors hover:border-black hover:text-black"
                  >
                    계약서 보기
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-16 shrink-0 text-gray-400">{label}</dt>
      <dd className="min-w-0 break-words font-medium text-black">{value}</dd>
    </div>
  );
}

function formatPayment(item: Pick<ContractListItem, "payment" | "payType">) {
  if (item.payType === "FREE") {
    return "0원";
  }

  return `${item.payment.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("ko-KR");
}

function formatSchedule(shootStartAt: string, shootEndAt: string) {
  const start = new Date(shootStartAt);
  const end = new Date(shootEndAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "-";
  }

  const date = start.toLocaleDateString("ko-KR");
  const startTime = start.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endTime = end.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${date} ${startTime} - ${endTime}`;
}
