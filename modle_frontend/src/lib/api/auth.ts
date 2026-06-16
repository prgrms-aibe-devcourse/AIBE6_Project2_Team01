import { client } from "./client";
import { getErrorMessage } from "./error";
import { components } from "./schema";

export type UserDto = components["schemas"]["UserDto"];

export async function sendPasswordResetCode(email: string): Promise<string> {
  const { data, error } = await client.POST("/api/v1/auth/password/reset/send", {
    body: { email },
  });

  if (error) {
    throw new Error(getErrorMessage(error, "인증코드 발송에 실패했습니다."));
  }

  return data?.msg ?? "인증코드를 발송했습니다.";
}

export async function confirmPasswordResetCode(email: string, code: string): Promise<string> {
  const { data, error } = await client.POST("/api/v1/auth/password/reset/confirm", {
    body: { email, code },
  });

  if (error) {
    throw new Error(getErrorMessage(error, "인증코드가 올바르지 않습니다."));
  }

  const resetToken = data?.data?.resetToken;
  if (!resetToken) {
    throw new Error("서버에서 재설정 토큰을 받지 못했습니다.");
  }

  return resetToken;
}

export async function resetPassword(email: string, resetToken: string, newPassword: string): Promise<void> {
  const { error } = await client.POST("/api/v1/auth/password/reset", {
    body: { email, resetToken, newPassword },
  });

  if (error) {
    throw new Error(getErrorMessage(error, "비밀번호 재설정에 실패했습니다."));
  }
}

export async function getMe(customHeaders?: HeadersInit): Promise<UserDto> {
  const { data, error } = await client.GET("/api/v1/auth/me", {
    headers: customHeaders as never
  });
  
  if (error) {
    throw new Error(getErrorMessage(error, "사용자 정보를 불러오는데 실패했습니다."));
  }
  
  const user = data?.data;
  if (!user) {
    throw new Error("사용자 정보가 올바르지 않습니다.");
  }
  
  return user;
}
