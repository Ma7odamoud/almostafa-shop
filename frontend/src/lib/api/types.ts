// Friendly aliases over the types generated from the backend OpenAPI document.
// Regenerate with `npm run gen:api` whenever backend DTOs change — never edit schema.d.ts by hand.
import type { components } from "./schema";

type Schemas = components["schemas"];

export type ProblemDetails = Schemas["ProblemDetails"] & {
  code?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
