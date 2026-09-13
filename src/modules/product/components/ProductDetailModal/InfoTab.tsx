import React from "react";
import { Empty, Tag } from "antd";
import { CubeIcon } from "@heroicons/react/24/solid";
import { InfoField, ProductImage } from "@/shared/components";
import { formatDateTimeDDMMYYYY } from "@/shared/utils/date.util";
import { formatMoney, formatQuantity } from "@/shared/utils/number.util";
import { getMainFile } from "@/shared/utils/file.util";
import { Product } from "../../product.model";

const SummaryCard: React.FC<{
  label: string;
  value: string;
  color: string;
}> = ({ label, value, color }) => (
  <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="mt-1 text-xl font-bold" style={{ color }}>
      {value}
    </p>
  </div>
);

const ProductPriceHistoryList: React.FC<{ data: Product }> = ({ data }) => {
  const histories = data.priceHistories || [];

  if (!histories.length) return null;

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Lịch sử giá vốn</h3>
      <div className="flex flex-col divide-y divide-gray-100">
        {histories.map((history) => (
          <div key={history.id} className="grid grid-cols-2 gap-3 py-3 text-sm md:grid-cols-4">
            <div>
              <p className="text-xs text-gray-400">Ngày</p>
              <p className="font-medium text-gray-700">
                {formatDateTimeDDMMYYYY(history.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Chi nhánh</p>
              <p className="font-medium text-gray-700">
                {history.store?.name || history.storeId || "Không xác định"}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs text-gray-400">Giá vốn</p>
              <p className="font-medium text-gray-700">{formatMoney(history.costPrice) || "0"}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs text-gray-400">Chênh lệch</p>
              <p className={history.deltaCostPrice >= 0 ? "font-medium text-green-600" : "font-medium text-red-500"}>
                {history.deltaCostPrice >= 0 ? "+" : ""}
                {formatMoney(history.deltaCostPrice) || "0"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const InfoTab: React.FC<{ data: Product }> = ({ data }) => {
  const stockMetadata = data.stockMetadata;
  const stocksByStore = Object.entries(stockMetadata?.byStore || {});
  const storeNameById = new Map(
    (data.storeProducts || []).map((item) => [item.storeId, item.store?.name || item.storeId]),
  );

  return (
    <div className="flex flex-col gap-4 pt-2">
      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="flex shrink-0 flex-wrap gap-2 md:w-32 md:flex-col">
            {data.image?.length ? (
              data.image.map((image, index) => (
                <ProductImage
                  key={image.id || index}
                  image={image}
                  size={index === 0 ? 128 : 56}
                  shape="square"
                />
              ))
            ) : (
              <ProductImage image={getMainFile(data.image)} size={128} shape="square" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <CubeIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-gray-800">{data.name}</h3>
                <Tag color="blue" className="font-mono text-xs">
                  {data.code}
                </Tag>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <InfoField label="Mã hàng hóa">
                <span className="font-mono text-blue-600">{data.code}</span>
              </InfoField>
              <InfoField label="Mã vạch">
                <span className="font-mono">{data.barcode}</span>
              </InfoField>
              <InfoField label="Nhóm">{data.group?.name || data.groupId}</InfoField>
              <InfoField label="Thương hiệu">{data.brand?.name || data.brandId}</InfoField>
              <InfoField label="Đơn vị cơ bản">{data.baseUnit?.name || data.baseUnitId}</InfoField>
              <InfoField label="Giá bán">
                {formatMoney(data.salePrice) || "0"} / {data.baseUnit?.name || "ĐVT"}
              </InfoField>
              <InfoField label="Trọng lượng">
                {data.weight == null
                  ? undefined
                  : `${formatQuantity(data.weight) || "0"} ${data.weightUnit || ""}`}
              </InfoField>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Tồn kho hiện tại</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SummaryCard
            label="Tổng số lượng"
            value={formatQuantity(stockMetadata?.total?.quantity) || "0"}
            color="#2563eb"
          />
          <SummaryCard
            label="Tổng giá trị tồn"
            value={formatMoney(stockMetadata?.total?.value) || "0"}
            color="#059669"
          />
        </div>

        {stocksByStore.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-100">
            <div className="grid min-w-[520px] grid-cols-[minmax(180px,1fr)_160px_180px] bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
              <span>Chi nhánh</span>
              <span className="text-right">Số lượng</span>
              <span className="text-right">Giá trị tồn</span>
            </div>
            {stocksByStore.map(([storeId, stock]) => (
              <div
                key={storeId}
                className="grid min-w-[520px] grid-cols-[minmax(180px,1fr)_160px_180px] border-t border-gray-100 px-3 py-2 text-sm"
              >
                <span className="font-medium text-gray-700">
                  {storeNameById.get(storeId) || storeId}
                </span>
                <span className="text-right text-gray-700">
                  {formatQuantity(stock.quantity) || "0"}
                </span>
                <span className="text-right text-gray-700">
                  {formatMoney(stock.value) || "0"}
                </span>
              </div>
            ))}
          </div>
        )}
        {!stockMetadata && <Empty className="py-6" description="Chưa có dữ liệu tồn kho" />}
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Đơn vị quy đổi</h3>
        {data.extraUnits?.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.extraUnits.map((unit, index) => (
              <div key={unit.id || `${unit.unitId}-${index}`} className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-gray-800">
                    {unit.unit?.name || unit.unitId}
                  </span>
                  {unit.isPurchaseUnit && <Tag color="orange">ĐVT nhập</Tag>}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <InfoField label="Quy đổi">
                    1 {unit.unit?.name || "ĐVT"} = {formatQuantity(unit.conversionRate) || "0"}{" "}
                    {data.baseUnit?.name || "ĐVT"}
                  </InfoField>
                  <InfoField label="Giá bán">
                    {formatMoney(unit.salePrice) || "0"}
                  </InfoField>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-sm italic text-gray-400">Chưa cấu hình đơn vị quy đổi</span>
        )}
      </section>

      <ProductPriceHistoryList data={data} />
    </div>
  );
};
