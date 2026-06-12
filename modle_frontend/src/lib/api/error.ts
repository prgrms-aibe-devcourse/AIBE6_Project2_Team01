type ApiErrorBody = {
  resultCode?: string
  msg?: string
}

export function getErrorMessage(error: unknown, fallback: string): string {
  const body = error as ApiErrorBody | undefined
  return body?.msg ?? fallback
}
