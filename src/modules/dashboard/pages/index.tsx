import React, { useMemo, useState } from "react";
import { Button, Radio, Tooltip } from "antd";
import { ChartBarIcon, ChartPieIcon } from "@heroicons/react/24/outline";
import { formatMoney } from "@/shared/utils/number.util";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { MetricsCards, RevenueChart, TopHorizontalBarChart } from "../components";
import { useDashboardStore } from "../dashboard.store";
import {
  DashboardChartType,
  DashboardTimeView,
  DashboardProductTypeCal,
  DashboardTypeCal,
  DashboardTypeView,
  dashboardTimeOptions,
  getDashboardDefaultTimeView,
} from "../dashboard.model";
import { AppSelect } from "@/shared/components";
import { StoreUncontrolledMultipleSelect } from "@/modules/store/components";

const timeOptions = dashboardTimeOptions.map((item) => ({
  value: item.value,
  label: item.label,
}));

const calculationOptions = [
  { value: DashboardTypeCal.BEFORE_TAX, label: "Trước thuế" },
  { value: DashboardTypeCal.AFTER_TAX, label: "Sau thuế" },
];

export const DashboardPage: React.FC = () => {
  const { getAvailableStores } = useGlobalData();
  const availableStores = getAvailableStores("report");
  const defaultTimeView = getDashboardDefaultTimeView();
  const [revenueTimeView, setRevenueTimeView] = useState(defaultTimeView);
  const [revenueTypeView, setRevenueTypeView] = useState(DashboardTypeView.DAY);
  const [revenueTypeCal, setRevenueTypeCal] = useState(DashboardTypeCal.AFTER_TAX);
  const [chartType, setChartType] = useState<DashboardChartType>("bar");
  const [productTimeView, setProductTimeView] = useState(defaultTimeView);
  const [productTypeCal, setProductTypeCal] = useState(DashboardProductTypeCal.REVENUE);
  const [customerTimeView, setCustomerTimeView] = useState(defaultTimeView);
  const [storeIds, setStoreIds] = useState<string[]>([]);

  const store = useDashboardStore({
    revenueTimeView,
    revenueTypeView,
    revenueTypeCal,
    productTimeView,
    productTypeCal,
    customerTimeView,
    storeIds,
  });

  const isSystemWide = true;
  const activeChartType = isSystemWide ? chartType : "bar";
  const totalRevenue = useMemo(
    () =>
      (store.revenue.data || []).reduce(
        (total, branch) =>
          total +
          branch.data.reduce((branchTotal, item) => branchTotal + Number(item.value || 0), 0),
        0,
      ),
    [store.revenue.data],
  );

  const productData = (store.products.data || []).map((item) => ({
    id: item.productId,
    label: item.productName,
    value: productTypeCal === DashboardProductTypeCal.REVENUE ? item.revenue : item.quantity,
  }));
  const customerData = (store.customers.data || []).map((item) => ({
    id: item.customerId,
    label: item.customerName,
    value: item.revenue,
  }));

  return (
    <div className="min-h-full h-fit w-full">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="flex justify-end">
          <StoreUncontrolledMultipleSelect
            value={storeIds}
            options={availableStores}
            onChange={setStoreIds}
            placeholder="Tất cả chi nhánh"
            className="min-w-[240px]"
            maxTagCount="responsive"
          />
        </div>
        <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-gray-900">Kết quả bán hàng hôm nay</h2>
          <MetricsCards data={store.metrics.data} loading={store.metrics.isLoading} />
        </section>

        <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Doanh thu thuần</h2>
              <span className="rounded-md bg-blue-50 px-2 py-1 text-base font-bold text-primary">
                {formatMoney(totalRevenue) || "0"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isSystemWide && (
                <div className="flex items-center gap-1">
                  <button
                    className={`${activeChartType === "bar" ? "text-primary" : "text-gray-500"} p-1 hover:bg-gray-50 rounded-md`}
                    onClick={() => setChartType("bar")}
                  >
                    <ChartBarIcon className="h-6 w-6" />
                  </button>
                  <button
                    className={`${activeChartType === "pie" ? "text-primary" : "text-gray-500"} p-1 hover:bg-gray-50 rounded-md`}
                    onClick={() => setChartType("pie")}
                  >
                    <ChartPieIcon className="h-6 w-6" />
                  </button>
                </div>
              )}
              <Radio.Group
                value={revenueTypeCal}
                options={calculationOptions}
                optionType="button"
                buttonStyle="solid"
                onChange={(event) => setRevenueTypeCal(event.target.value)}
              />
              <div>
                <AppSelect
                  value={revenueTimeView}
                  options={timeOptions}
                  onChange={setRevenueTimeView}
                  className="min-w-[125px]"
                />
              </div>
            </div>
          </div>

          {activeChartType !== "pie" && (
            <div className="mt-4 flex flex-wrap gap-5 border-b border-gray-100 px-1">
              {[
                [DashboardTypeView.DAY, "Theo ngày"],
                [DashboardTypeView.HOUR, "Theo giờ"],
                [DashboardTypeView.WEEKDAY, "Theo thứ"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`border-b-2 px-1 pb-2 text-sm ${
                    revenueTypeView === value
                      ? "border-pritext-primary font-semibold text-primary"
                      : "border-transparent text-gray-500"
                  }`}
                  onClick={() => setRevenueTypeView(value as DashboardTypeView)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <RevenueChart
            data={store.revenue.data}
            typeView={revenueTypeView}
            chartType={activeChartType}
            loading={store.revenue.isLoading}
          />
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <TopHorizontalBarChart
            title="Top 10 hàng bán chạy"
            data={productData}
            valueType={productTypeCal === DashboardProductTypeCal.REVENUE ? "money" : "quantity"}
            loading={store.products.isLoading}
            actions={
              <div className="flex items-center gap-2">
                <div>
                  <AppSelect
                    size="small"
                    value={productTypeCal}
                    options={[
                      { value: DashboardProductTypeCal.REVENUE, label: "Theo doanh thu thuần" },
                      { value: DashboardProductTypeCal.QUANTITY, label: "Theo số lượng" },
                    ]}
                    onChange={setProductTypeCal}
                  />
                </div>
                <div>
                  <AppSelect
                    size="small"
                    value={productTimeView}
                    options={timeOptions}
                    onChange={setProductTimeView}
                  />
                </div>
              </div>
            }
          />
          <TopHorizontalBarChart
            title="Top 10 khách mua nhiều nhất"
            data={customerData}
            valueType="money"
            loading={store.customers.isLoading}
            actions={
              <div>
                <AppSelect
                  size="small"
                  value={customerTimeView}
                  options={timeOptions}
                  onChange={setCustomerTimeView}
                />
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};
