import { ContractDetailContent } from "@/components/contract/ContractDetailContent";

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
    status?: string;
  }>;
};

export default async function ContractDetailPage({
  params,
  searchParams,
}: ContractDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;

  return <ContractDetailContent contractId={Number(id)} initialQuery={query} />;
}
