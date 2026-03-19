"use client";

import { getCurrentUser } from "@/actions/auth";
import { User } from "@/models/user.model";

export const getClientCurrentUser = async (): Promise<User | null> => {
  return await getCurrentUser();
}
