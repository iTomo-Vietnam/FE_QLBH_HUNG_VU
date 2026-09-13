import { ApiRequestQuery } from "@/shared/interfaces/api";
import { FilterKey, SortItem } from "@/shared/interfaces/common";

export type { User } from "@/shared/base/entity";

export interface UserQuery extends ApiRequestQuery {
  storeId?: string;
  isActive?: boolean;
}

export const sortItems: SortItem[] = [
  { label: "Ngày tạo", value: "createdAt", ascLabel: "Mới nhất", descLabel: "Cũ nhất" },
  { label: "Mã người dùng", value: "code", ascLabel: "A → Z", descLabel: "Z → A" },
  { label: "Tên người dùng", value: "name", ascLabel: "A → Z", descLabel: "Z → A" },
  { label: "Tên đăng nhập", value: "username", ascLabel: "A → Z", descLabel: "Z → A" },
];

export const filterUses: FilterKey[] = ["storeIds", "roleIds"];
