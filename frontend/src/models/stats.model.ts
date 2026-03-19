import { PRIORITY } from "@/enums/priority.enum";

export interface Stats {
  total: number;
  completed: number;
  pending: number;
  by_priority: {
    [key in PRIORITY]: number;
  };
}