import createClient from "openapi-fetch";

import type { paths } from "./schema";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const client = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: "include",
});
