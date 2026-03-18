export interface User {
  id: string;
  username: string;
  email?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}