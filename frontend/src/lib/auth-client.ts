"use client";

import { getCurrentUser } from "@/actions/auth";
import { User } from "@/interfaces/auth.interface";

export const getClientCurrentUser = async (): Promise<User | null> => {
  return await getCurrentUser();
}
