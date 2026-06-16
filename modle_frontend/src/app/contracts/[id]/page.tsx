import Link from "next/link";

type ContractDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    source?: string;
    applicationId?: string;
    contractType?: string;
    payType?: string;
    payment?: string;
    shootDate?: string;
    shootStartTime?: string;
    shootEndTime?: string;
    location?: string;
    usageScope?: string;
    memo?: string;
    pdfUrl?: string;
  }>;
};

const CONTRACT_TYPE_LABEL: Record<string, string> = {
  TEMPLATE: "템플릿 작성",
  FILE: "PDF 파일 첨부",
};

const PAY_TYPE_LABEL: Record<string, string> = {
  CASH: "현금",
  SERVICE: "서비스",
  FREE: "재능기부",
};

export default async function ContractDetailPage({
  params,
  searchParams,
}: ContractDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const isCreatedFromDraft = query.source === "draft-created";
  const paymentValue = Number(query.payment ?? "");
  const paymentText =
    query.payType === "FREE"
      ? "0원"
      : Number.isNaN(paymentValue)
        ? "-"
        : `${paymentValue.toLocaleString("ko-KR")}원`;
  const shootSchedule =
    query.shootDate && query.shootStartTime && query.shootEndTime
      ? `${query.shootDate} ${query.shootStartTime} - ${query.shootEndTime}`
      : "-";

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-hairline bg-surface p-6">
          <p className="font-mono text-xs leading-4 tracking-[0.4px] text-mute">
            CONTRACT / DETAIL
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-[28px] font-bold leading-9 text-ink">
                계약서 초안 상세
              </h1>
              <p className="text-[15px] leading-6 text-body">
                계약서 ID #{id}가 DRAFT 상태로 저장되었습니다.
              </p>
            </div>
            <span className="inline-flex h-8 w-fit items-center gap-2 rounded-full bg-canvas-soft px-3 text-[13px] font-semibold leading-5 text-body">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              DRAFT
            </span>
          </div>
          {isCreatedFromDraft ? (
            <div className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-[14px] leading-6 text-success">
              계약 작성 화면에서 입력한 정보를 기준으로 초안이 생성되었습니다.
              PDF 생성 API가 연결되면 이 화면에서 다음 단계로 바로 이동할 수 있습니다.
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-canvas-soft px-4 py-3 text-[14px] leading-6 text-body">
              상세 조회 API 연동 전 임시 상세 화면입니다. 저장 직후 진입하면 방금
              입력한 요약 정보를 함께 확인할 수 있습니다.
            </div>
          )}
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-hairline bg-surface p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <DetailRow
                label="지원 ID"
                value={query.applicationId ? `#${query.applicationId}` : "-"}
              />
              <DetailRow label="계약서 ID" value={`#${id}`} />
              <DetailRow
                label="계약 유형"
                value={CONTRACT_TYPE_LABEL[query.contractType ?? ""] ?? "-"}
              />
              <DetailRow
                label="보수 유형"
                value={PAY_TYPE_LABEL[query.payType ?? ""] ?? "-"}
              />
              <DetailRow label="보수 금액" value={paymentText} />
              <DetailRow label="촬영 일정" value={shootSchedule} />
              <DetailRow
                label="촬영 장소"
                value={query.location?.trim() || "-"}
                fullWidth
              />
              <DetailRow
                label="사용 범위"
                value={query.usageScope?.trim() || "-"}
                fullWidth
              />
              <DetailRow
                label="기타 조건"
                value={query.memo?.trim() || "없음"}
                fullWidth
              />
              <DetailRow
                label="PDF URL"
                value={query.pdfUrl?.trim() || "아직 생성되지 않았습니다."}
                fullWidth
              />
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-hairline bg-surface p-6">
              <h2 className="text-[18px] font-semibold leading-7 text-ink">
                다음 단계
              </h2>
              <ul className="mt-4 space-y-3 text-[14px] leading-6 text-body">
                <li>1. 계약서 PDF 생성 API를 연결해 초안 문서를 만듭니다.</li>
                <li>2. 생성된 PDF를 검토한 뒤 모델에게 발송합니다.</li>
                <li>3. 발송 이후 열람, 동의, 확정 플로우로 이어집니다.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-hairline bg-surface p-6">
              <h2 className="text-[18px] font-semibold leading-7 text-ink">
                빠른 이동
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                <ActionLink href="/contracts/new" label="새 계약서 다시 작성" />
                <ActionLink href={`/contracts/${id}`} label="현재 상세 주소 유지" />
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function DetailRow({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "space-y-1 md:col-span-2" : "space-y-1"}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.3px] text-mute">
        {label}
      </p>
      <p className="rounded-xl bg-canvas-soft px-4 py-3 text-[15px] leading-6 text-ink">
        {value}
      </p>
    </div>
  );
}

function ActionLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-md border border-hairline bg-canvas-soft px-4 text-[14px] font-semibold text-ink transition hover:border-hairline-strong"
    >
      {label}
    </Link>
  );
}
