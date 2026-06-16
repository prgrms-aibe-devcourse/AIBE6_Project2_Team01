"use client";

import { client } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import {
  defaultFormState,
  JobPostingForm,
  type JobPostingFormState,
} from "@/components/jobposting/JobPostingForm";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Template = components["schemas"]["JobPostingTemplateResponse"];

const CATEGORY_OPTIONS = [
  { value: "HAIR", label: "헤어" },
  { value: "MAKEUP", label: "메이크업" },
  { value: "CLOTHING", label: "의류" },
  { value: "FITTING", label: "피팅" },
  { value: "HAND", label: "핸드" },
  { value: "FOOD", label: "음식" },
  { value: "PRODUCT", label: "제품" },
  { value: "ETC", label: "기타" },
];

export default function NewJobPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [templateCategory, setTemplateCategory] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [formKey, setFormKey] = useState(0);
  const [initialValues, setInitialValues] =
    useState<Partial<JobPostingFormState>>(defaultFormState);

  useEffect(() => {
    if (!isLoading && user?.role !== "CLIENT") {
      router.replace("/jobs");
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== "CLIENT") {
    return <main className="min-h-screen bg-canvas" />;
  }

  const loadTemplates = async (category: string) => {
    setTemplateCategory(category);
    if (!category) {
      setTemplates([]);
      return;
    }
    const { data } = await client.GET("/api/v1/jobs/templates", {
      params: { query: { category } },
    });
    setTemplates(data?.data ?? []);
  };

  const applyTemplate = (template: Template) => {
    setInitialValues((cur) => ({
      ...cur,
      title: template.title ?? "",
      content: template.content ?? "",
    }));
    setFormKey((k) => k + 1);
  };

  const handleSubmit = async (formData: JobPostingFormState) => {
    const { response, data } = await client.POST("/api/v1/jobs", {
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
      throw new Error("공고 등록에 실패했습니다.");
    }

    const id = data?.data?.id;
    router.push(`/jobs/${id}`);
  };

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-hairline pb-6">
          <p className="font-mono text-xs leading-4 tracking-[0.4px] text-mute">
            JOBS / NEW
          </p>
          <div className="mt-3">
            <h1 className="text-[28px] font-bold leading-9 text-ink">
              공고 등록
            </h1>
            <p className="mt-2 max-w-[720px] text-[15px] leading-6 text-body">
              모집 공고를 작성하세요. 등록 즉시 모집 중 상태로 공개됩니다.
            </p>
          </div>
        </header>

        {/* 템플릿 선택 (선택 사항) */}
        <section className="rounded-xl border border-hairline bg-surface p-6">
          <h2 className="text-[15px] font-semibold leading-6 text-ink">
            템플릿 불러오기 (선택)
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => loadTemplates(o.value)}
                className={`rounded-full border px-4 py-2 text-[13px] font-semibold leading-5 transition ${
                  templateCategory === o.value
                    ? "border-primary bg-primary text-on-primary"
                    : "border-hairline bg-surface text-body hover:border-hairline-strong"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          {templates.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2">
              {templates.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="w-full rounded-md border border-hairline bg-canvas-soft px-4 py-3 text-left text-[14px] font-medium text-ink transition hover:border-hairline-strong"
                  >
                    {t.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <JobPostingForm
          key={formKey}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel="공고 등록"
        />
      </div>
    </main>
  );
}
