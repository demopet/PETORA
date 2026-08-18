import { supabase } from "@/lib/supabase/client";

const DEFAULT_LIMIT = 20;

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export async function fetchPaginated<T>(
  table: string,
  options: {
    page?: number;
    limit?: number;
    filter?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    select?: string;
  } = {}
): Promise<PaginatedResult<T>> {
  const page = options.page ?? 1;
  const limit = options.limit ?? DEFAULT_LIMIT;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = supabase.from(table).select(options.select ?? "*");

  if (options.filter) {
    for (const [key, value] of Object.entries(options.filter)) {
      if (value !== undefined && value !== null && value !== "") {
        query = query.eq(key, value);
      }
    }
  }

  if (options.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true,
    });
  }

  const { data, error, count } = await query.range(start, end);

  if (error) throw error;
  const total = count ?? data?.length ?? 0;

  return {
    data: (data ?? []) as T[],
    page,
    limit,
    total,
    hasMore: data?.length === limit,
  };
}
