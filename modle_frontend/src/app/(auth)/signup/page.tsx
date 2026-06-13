import Link from 'next/link'

import { GOOGLE_OAUTH_URL } from '@/lib/auth/oauth'

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-canvas px-4 py-12 text-ink">
      <div className="w-full max-w-[480px]">
        <h1 className="text-[28px] font-bold leading-9 text-ink">회원가입</h1>
        <p className="mt-2 text-[15px] leading-6 text-body">
          가입 유형을 선택해주세요.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/signup/model"
            className="flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-6 transition hover:border-ink"
          >
            <span className="text-lg font-semibold leading-[26px] text-ink">
              모델로 가입
            </span>
            <span className="text-[13px] leading-5 text-body">
              촬영 모델로 활동하고 공고에 지원합니다.
            </span>
          </Link>

          <Link
            href="/signup/client"
            className="flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-6 transition hover:border-ink"
          >
            <span className="text-lg font-semibold leading-[26px] text-ink">
              의뢰인으로 가입
            </span>
            <span className="text-[13px] leading-5 text-body">
              촬영 공고를 등록하고 모델을 찾습니다.
            </span>
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-hairline" />
          <span className="text-[13px] leading-5 text-mute">또는</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <a
          href={GOOGLE_OAUTH_URL}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink"
        >
          Google 계정으로 시작하기
        </a>

        <p className="mt-6 text-center text-[13px] leading-5 text-mute">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-semibold text-ink underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  )
}
