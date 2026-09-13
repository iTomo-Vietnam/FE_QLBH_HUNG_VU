import { createBaseStore } from "@/shared/base/createBaseStore";
import { Role, RoleQuery } from "./role.model";
import { apiEndpoint } from "@/shared/constants/apiEndpoint";

export const useRoleStore = createBaseStore<Role, RoleQuery>({
  key: "roles",
  apiUrl: apiEndpoint.role.base,
  permissionModule: "role",
  storeScope: "none",
});
