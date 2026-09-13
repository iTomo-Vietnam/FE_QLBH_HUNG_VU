import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getData } from "@/shared/api/apiClient";
import { apiEndpoint } from "@/shared/constants/apiEndpoint";
import { ApiResponse } from "@/shared/interfaces/api";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import {
  DashboardMetrics,
  DashboardRevenueBranch,
  DashboardTimeView,
  DashboardTopCustomer,
  DashboardTopProduct,
  DashboardProductTypeCal,
  DashboardTypeCal,
  DashboardTypeView,
} from "./dashboard.model";

const unwrap = <T,>(response: ApiResponse<T>): T => response.data as T;

export const useDashboardStore = ({
  revenueTimeView,
  revenueTypeView,
  revenueTypeCal,
  productTimeView,
  productTypeCal,
  customerTimeView,
  storeIds,
}: {
  revenueTimeView: DashboardTimeView;
  revenueTypeView: DashboardTypeView;
  revenueTypeCal: DashboardTypeCal;
  productTimeView: DashboardTimeView;
  productTypeCal: DashboardProductTypeCal;
  customerTimeView: DashboardTimeView;
  storeIds?: string[];
}) => {
  const { currentStore } = useGlobalData();
  const storeKey = currentStore?.id || "all-stores";

  const metrics = useQuery({
    queryKey: ["dashboard", "metrics", storeKey],
    queryFn: () =>
      getData<DashboardMetrics>(apiEndpoint.dashboard.metrics, storeIds?.length ? { storeIds } : undefined).then(unwrap),
    placeholderData: keepPreviousData,
  });

  const revenue = useQuery({
    queryKey: [
      "dashboard",
      "revenue",
      storeKey,
      revenueTimeView,
      revenueTypeView,
      revenueTypeCal,
    ],
    queryFn: () =>
      getData<DashboardRevenueBranch[]>(apiEndpoint.dashboard.revenueReport, {
        timeView: revenueTimeView,
        typeView: revenueTypeView,
        typeCal: revenueTypeCal,
        ...(storeIds?.length ? { storeIds } : {}),
      }).then(unwrap),
    placeholderData: keepPreviousData,
  });

  const products = useQuery({
    queryKey: ["dashboard", "top-products", storeKey, productTimeView, productTypeCal],
    queryFn: () =>
      getData<DashboardTopProduct[]>(apiEndpoint.dashboard.topProducts, {
        timeView: productTimeView,
        typeCal: productTypeCal,
        ...(storeIds?.length ? { storeIds } : {}),
      }).then(unwrap),
    placeholderData: keepPreviousData,
  });

  const customers = useQuery({
    queryKey: ["dashboard", "top-customers", storeKey, customerTimeView],
    queryFn: () =>
      getData<DashboardTopCustomer[]>(apiEndpoint.dashboard.topCustomers, {
        timeView: customerTimeView,
        ...(storeIds?.length ? { storeIds } : {}),
      }).then(unwrap),
    placeholderData: keepPreviousData,
  });

  return { metrics, revenue, products, customers };
};
