"use client";

import { useState } from "react";

import { client } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/error";

export type EmailVerificationStatus =
  | "idle"
  | "sending"
  | "sent"
  | "confirming"
  | "verified"
  | "error";

export function useEmailVerification() {
  const [status, setStatus] = useState<EmailVerificationStatus>("idle");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  const sendCode = async (email: string) => {
    setStatus("sending");
    setMessage("");

    const { error } = await client.POST("/api/v1/auth/email/verify/send", {
      body: { email },
    });

    if (error) {
      setStatus("error");
      setMessage(getErrorMessage(error, "인증코드 발송에 실패했습니다."));
      return;
    }

    setStatus("sent");
    setMessage("인증코드를 이메일로 발송했습니다.");
  };

  const confirmCode = async (email: string) => {
    setStatus("confirming");
    setMessage("");

    const { error } = await client.POST("/api/v1/auth/email/verify/confirm", {
      body: { email, code },
    });

    if (error) {
      setStatus("sent");
      setMessage(getErrorMessage(error, "인증코드가 올바르지 않습니다."));
      return;
    }

    setStatus("verified");
    setVerifiedEmail(email);
    setMessage("이메일 인증이 완료되었습니다.");
  };

  return { status, code, setCode, message, verifiedEmail, sendCode, confirmCode };
}
