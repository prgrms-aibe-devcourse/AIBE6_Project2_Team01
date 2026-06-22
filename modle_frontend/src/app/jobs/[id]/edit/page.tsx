"use client";

import { useAuth } from "@/hooks/useAuth";
import { client } from "@/lib/api/client";
import {
  JobPostingForm,
  type JobPostingFormState,
} from "@/components/jobposting/JobPostingForm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { Toast, type ToastState } from "@/components/ui/Toast";

export default function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const postingId = Number(id);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const alertedRef = useRef(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user && !alertedRef.current) {
      alertedRef.current = true;
      setToast({ type: "error", message: "로그인이 필요한 서비스입니다." });
      setTimeout(() => router.replace("/login"), 1000);
      return;
    }
    if (user && user.role !== "CLIENT") {
      router.replace(`/jobs/${postingId}`);
    }
  }, [user, authLoading, router, postingId]);

  const [initialValues, setInitialValues] =
    useState<Partial<JobPostingFormState> | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (authLoading || !user || user.role !== "CLIENT") return;
    client
      .GET("/api/v1/jobs/{id}", {
        params: { path: { id: postingId } },
      })
      .then(({ data, response }) => {
        if (!response.ok) {
          setLoadError("공고 데이터를 불러오지 못했습니다.");
          return;
        }
        const d = data?.data as Record<string, unknown> | undefined;
        if (!d) {
          setLoadError("공고 데이터를 찾을 수 없습니다.");
          return;
        }
        setInitialValues({
          title: (d.title as string) ?? "",
          content: (d.content as string) ?? "",
          category: (d.category as JobPostingFormState["category"]) ?? "",
          region: (d.region as JobPostingFormState["region"]) ?? "",
          requiredSex:
            (d.requiredSex as "M" | "F" | "ANY" | undefined) ?? "ANY",
          requiredCount: d.requiredCount != null ? String(d.requiredCount) : "",
          ageMin: d.ageMin != null ? String(d.ageMin) : "",
          ageMax: d.ageMax != null ? String(d.ageMax) : "",
          heightMin: d.heightMin != null ? String(d.heightMin) : "",
          heightMax: d.heightMax != null ? String(d.heightMax) : "",
          weightMin: d.weightMin != null ? String(d.weightMin) : "",
          weightMax: d.weightMax != null ? String(d.weightMax) : "",
          minCareerMonths:
            d.minCareerMonths != null ? String(d.minCareerMonths) : "",
          payment: d.payment != null ? String(d.payment) : "",
          payType:
            (d.payType as "CASH" | "SERVICE" | "FREE" | undefined) ?? "",
          shootDate:
            typeof d.shootDate === "string"
              ? d.shootDate.substring(0, 10)
              : "",
        });
      })
      .catch(() => {
        setLoadError("공고 데이터를 불러오지 못했습니다.");
      });
  }, [postingId, authLoading, user]);

  const handleSubmit = async (formData: JobPostingFormState) => {
    const { response } = await client.PATCH("/api/v1/jobs/{id}", {
      params: { path: { id: postingId } },
      body: {
        title: formData.title,
        content: formData.content,
        category: formData.category as
          | "HAIR"
          | "MAKEUP"
          | "CLOTHING"
          | "FITTING"
          | "HAND"
          | "FOOD"
          | "PRODUCT"
          | "ETC",
        region: formData.region as
          | "SEOUL"
          | "BUSAN"
          | "DAEGU"
          | "INCHEON"
          | "GWANGJU"
          | "DAEJEON"
          | "ULSAN"
          | "SEJONG"
          | "GYEONGGI"
          | "GANGWON"
          | "CHUNGBUK"
          | "CHUNGNAM"
          | "JEONBUK"
          | "JEONNAM"
          | "GYEONGBUK"
          | "GYEONGNAM"
          | "JEJU",
        requiredSex: formData.requiredSex,
        requiredCount: formData.requiredCount
          ? Number(formData.requiredCount)
          : undefined,
        ageMin: formData.ageMin ? Number(formData.ageMin) : undefined,
        ageMax: formData.ageMax ? Number(formData.ageMax) : undefined,
        heightMin: formData.heightMin ? Number(formData.heightMin) : undefined,
        heightMax: formData.heightMax ? Number(formData.heightMax) : undefined,
        weightMin: formData.weightMin ? Number(formData.weightMin) : undefined,
        weightMax: formData.weightMax ? Number(formData.weightMax) : undefined,
        minCareerMonths: formData.minCareerMonths
          ? Number(formData.minCareerMonths)
          : undefined,
        payment: formData.payment ? Number(formData.payment) : undefined,
        payType: formData.payType || undefined,
        shootDate: formData.shootDate
          ? `${formData.shootDate}T00:00:00`
          : undefined,
      },
    });

    if (!response.ok) {
      throw new Error("공고 수정에 실패했습니다.");
    }

    router.push(`/jobs/${postingId}`);
  };

  if (authLoading || !user || user.role !== "CLIENT") {
    return <main className="min-h-screen bg-canvas" />;
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-canvas">
        <p className="py-20 text-center text-[15px] text-error">{loadError}</p>
      </main>
    );
  }

  if (!initialValues) {
    return (
      <main className="min-h-screen bg-canvas">
        <p className="py-20 text-center text-[15px] text-mute">로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-hairline pb-6">
          <p className="font-mono text-xs leading-4 tracking-[0.4px] text-mute">
            JOBS / EDIT
          </p>
          <div className="mt-3">
            <h1 className="text-[28px] font-bold leading-9 text-ink">
              공고 수정
            </h1>
            <p className="mt-2 max-w-[720px] text-[15px] leading-6 text-body">
              모집 중 상태의 공고만 수정할 수 있습니다.
            </p>
          </div>
        </header>

        <div className="flex justify-end">
          <Link
            href={`/jobs/${postingId}`}
            className="inline-flex h-10 items-center rounded-lg border border-hairline bg-surface px-5 text-[14px] font-semibold text-ink transition hover:border-hairline-strong"
          >
            취소
          </Link>
        </div>

        <JobPostingForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel="수정 저장"
        />
      </div>
      {toast && <Toast toast={toast} />}
    </main>
  );
}
