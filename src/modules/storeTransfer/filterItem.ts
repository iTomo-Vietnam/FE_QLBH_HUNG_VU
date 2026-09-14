import { FilterKey, RangerItem, SortItem } from "@/shared/interfaces/common";

export const filterUses: FilterKey[] = ["productIds", "creatorIds", "exporterIds", "importerIds"];
export const rangerItems: RangerItem[] = [
  { label: "Ngày chuyển", key: "occurredAt", type: "date" },
];
export const sortItems: SortItem[] = [
  { label: "Ngày chuyển", value: "occurredAt", ascLabel: "Cũ nhất", descLabel: "Mới nhất" },
  { label: "Số phiếu", value: "code", ascLabel: "A → Z", descLabel: "Z → A" },
];
