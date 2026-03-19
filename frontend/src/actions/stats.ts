"use server";

import { Stats } from "@/models/stats.model";
import { apiRequest } from "@/lib/api.server";

export async function fetchStats() {
  const response = await apiRequest<Stats>({
    method: "get",
    endpoint: "todos/stats",
  })

  return response.data;
}