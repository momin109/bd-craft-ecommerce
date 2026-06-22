export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta?: PaginationMeta;
}

export type EntityStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
