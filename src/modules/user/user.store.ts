import { createBaseStore } from "@/shared/base/createBaseStore";
import { User } from "@/shared/base/entity";
import { UserQuery } from "./user.model";
import { postData } from "@/shared/api/apiClient";
import { apiEndpoint } from "@/shared/constants/apiEndpoint";

export const useUserStore = createBaseStore<
  User,
  UserQuery,
  { banUser?: (id: string) => void }
>({
  key: "users",
  apiUrl: apiEndpoint.user.base,
  permissionModule: "user",
  extend: () => ({
    banUser: async (id: string) => {
      await postData(`/users/${id}/ban`, {});
    },
  }),
});
