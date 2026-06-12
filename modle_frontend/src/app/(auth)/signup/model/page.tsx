'use client'

import { useEmailVerification } from '@/hooks/useEmailVerification'
import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

import Link from 'next/link'

import { client } from '@/lib/api/client'
import { getErrorMessage } from '@/lib/api/error'
import { GENDER_OPTIONS } from '@/lib/constants/gender'

type FormState = {
  email: string
  password: string
  region: string
  name: string
  height: string
  weight: string
  age: string
  gender: boolean
}

const initialForm: FormState = {
  email: '',
  password: '',
  region: '',
  name: '',
  height: '',
  weight: '',
  age: '',
  gender: true,
}

export default function ModelSignupPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle')
  const [message, setMessage] = useState('')

  const emailVerification = useEmailVerification()
  const isEmailVerified =
    form.email !== '' && emailVerification.verifiedEmail === form.email

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('submitting')
    setMessage('')

    const { data, error } = await client.POST('/api/v1/auth/signup/model', {
      body: {
        email: form.email,
        password: form.password,
        region: form.region,
        name: form.name,
        height: Number(form.height),
        weight: Number(form.weight),
        age: Number(form.age),
        gender: form.gender,
      },
    })

    if (error) {
      setStatus('error')
      setMessage(getErrorMessage(error, '회원가입에 실패했습니다.'))
      return
    }

    setStatus('success')
    setMessage(data?.msg ?? '회원가입이 완료되었습니다.')
  }

  if (status === 'success') {
    return (
      <main className="flex flex-1 items-center justify-center bg-canvas px-4 py-12 text-ink">
        <div className="w-full max-w-[420px] rounded-lg border border-hairline bg-surface p-8 text-center">
          <h1 className="text-lg font-semibold leading-[26px] text-ink">
            가입이 완료되었습니다
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-body">{message}</p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover"
          >
            로그인하기
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-1 justify-center bg-canvas px-4 py-12 text-ink">
      <div className="w-full max-w-[480px]">
        <h1 className="text-[28px] font-bold leading-9 text-ink">
          모델 회원가입
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-body">
          모델 정보를 입력하고 이메일 인증을 완료해주세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Field label="이메일" required>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
              />
              <button
                type="button"
                disabled={
                  !form.email ||
                  emailVerification.status === 'sending' ||
                  isEmailVerified
                }
                onClick={() => emailVerification.sendCode(form.email)}
                className="h-11 shrink-0 rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink disabled:text-mute"
              >
                {isEmailVerified ? '인증완료' : '인증코드 발송'}
              </button>
            </div>
          </Field>

          {!isEmailVerified && emailVerification.status !== 'idle' ? (
            <Field label="인증코드" required>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={emailVerification.code}
                  onChange={(event) =>
                    emailVerification.setCode(event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                />
                <button
                  type="button"
                  disabled={emailVerification.status === 'confirming'}
                  onClick={() => emailVerification.confirmCode(form.email)}
                  className="h-11 shrink-0 rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink disabled:text-mute"
                >
                  확인
                </button>
              </div>
            </Field>
          ) : null}

          {emailVerification.message ? (
            <p
              className={`text-[13px] leading-5 ${
                emailVerification.status === 'verified'
                  ? 'text-success'
                  : 'text-mute'
              }`}
            >
              {emailVerification.message}
            </p>
          ) : null}

          <Field label="비밀번호" required>
            <input
              type="password"
              required
              minLength={5}
              maxLength={50}
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
            />
          </Field>

          <Field label="이름" required>
            <input
              type="text"
              required
              maxLength={50}
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
            />
          </Field>

          <Field label="활동 지역" required>
            <input
              type="text"
              required
              maxLength={50}
              value={form.region}
              onChange={(event) => updateField('region', event.target.value)}
              className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="키(cm)" required>
              <input
                type="number"
                required
                min={1}
                value={form.height}
                onChange={(event) => updateField('height', event.target.value)}
                className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
              />
            </Field>
            <Field label="몸무게(kg)" required>
              <input
                type="number"
                required
                min={1}
                value={form.weight}
                onChange={(event) => updateField('weight', event.target.value)}
                className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
              />
            </Field>
            <Field label="나이" required>
              <input
                type="number"
                required
                min={1}
                value={form.age}
                onChange={(event) => updateField('age', event.target.value)}
                className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
              />
            </Field>
          </div>

          <Field label="성별" required>
            <div className="grid grid-cols-2 gap-2">
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => updateField('gender', option.value)}
                  className={`h-11 rounded-md border px-4 text-[15px] font-semibold leading-6 transition ${
                    form.gender === option.value
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-hairline bg-surface text-body hover:border-hairline-strong'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Field>

          <button
            type="submit"
            disabled={status === 'submitting' || !isEmailVerified}
            className="mt-2 h-11 w-full rounded-md bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
          >
            {status === 'submitting' ? '가입 중' : '가입하기'}
          </button>

          {message ? (
            <p
              className="rounded-md bg-error-soft px-3 py-2 text-[13px] leading-5 text-error"
              aria-live="polite"
            >
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </main>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold leading-5 text-ink">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </span>
      {children}
    </label>
  )
}
