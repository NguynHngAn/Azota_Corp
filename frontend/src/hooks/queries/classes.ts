import { useQuery } from "@tanstack/react-query";
import { AUTH_TOKEN_KEY } from "@/utils/constants";
import { classesService } from "@/services/classes.service";
import type { ClassResponse } from "@/services/types";

export const classesKeys = {
  all: ["classes"] as const,
  list: () => [...classesKeys.all, "list"] as const,
  detail: (id: number) => [...classesKeys.all, "detail", id] as const,
};

function getToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function useClassesList() {
  const token = getToken();

  return useQuery({
    queryKey: classesKeys.list(),
    enabled: !!token,
    queryFn: async (): Promise<ClassResponse[]> => {
      if (!token) throw new Error("Missing token");
      const res = await classesService.list(token);
      if (!res.success || !res.data) throw new Error(res.message || "Failed");
      return res.data;
    },
  });
}

