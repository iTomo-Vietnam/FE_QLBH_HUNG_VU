import { FilterKey, RangerItem, SortItem } from "@/shared/interfaces/common";

export const sortItems: SortItem[] = [
  { label: "Thời gian", value: "occurredAt", ascLabel: "Cũ nhất", descLabel: "Mới nhất" },
  { label: "Số phiếu", value: "referenceCode", ascLabel: "A → Z", descLabel: "Z → A" },
  { label: "Số tiền", value: "amount", ascLabel: "Thấp nhất", descLabel: "Cao nhất" },
];
export const rangerItems: RangerItem[] = [{ label: "Số tiền", key: "amount" }];
export const filterUses: FilterKey[] = ["fundIds", "creatorIds"];
