import { PRIORITY } from "@/enums/priority.enum";
import { STATUS } from "@/enums/status.enum";

export interface Todo {
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  status: STATUS;
  priority: PRIORITY | null;
  due_date: string | null;
  id: string;
  owner_id: string;
}