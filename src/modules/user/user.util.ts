import { User } from "@/shared/base/entity";

export const generateRoleContent = (user?: User | null): string => {
  if (!user) return "";

  return user.storeUsers?.find((membership) => membership.role)?.role?.name || "";
};
