import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export const AuthService = {
  async getSession() {
    return auth.api.getSession({ headers: await headers() });
  },

  async requireAuth(): Promise<ServiceResult<{ userId: string; role: string }>> {
    const session = await AuthService.getSession();
    if (!session?.user) {
      return { data: null, error: "UNAUTHORIZED" };
    }
    return {
      data: { userId: session.user.id, role: (session.user as { role?: string }).role ?? "user" },
      error: null,
    };
  },

  async requireRole(role: string): Promise<ServiceResult<{ userId: string; role: string }>> {
    const result = await AuthService.requireAuth();
    if (result.error) return result;
    if (result.data!.role !== role) {
      return { data: null, error: "FORBIDDEN" };
    }
    return result;
  },
};
