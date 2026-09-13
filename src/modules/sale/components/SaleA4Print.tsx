import React from "react";
import { Sale } from "../model";
import { formatDateTimeDDMMYYYY, formatVietNamDate } from "@/shared/utils/date.util";
import { formatMoney, formatQuantity, numberToVietnameseWords } from "@/shared/utils/number.util";

type PrintLine = Sale["lines"][number];

const getAddress = (address: unknown) => {
  const value = address as Record<string, unknown> | null | undefined;
  if (!value) return "";
  return [value.detail, value.street, value.ward, value.district, value.province, value.state]
    .filter(Boolean)
    .join(", ");
};

const getStoreAddress = (sale: Sale) => getAddress(sale.store?.address);

const getLineName = (line: PrintLine) => line.productSnapshot?.name || line.product?.name || "";

const getLineCode = (line: PrintLine) => line.productSnapshot?.code || line.product?.code || "";

const getLineUnit = (line: PrintLine) =>
  line.unitSnapshot?.name || line.unit?.name || line.product?.baseUnit?.name || "";

const paidAmount = (sale: Sale) =>
  Number(
    sale.paidAmount ??
      (sale.incomeExpenses || []).reduce((total, item) => total + Number(item.amount || 0), 0),
  );

interface SaleA4PrintProps {
  data: Sale;
  index?: number;
  length?: number;
}
export const SaleA4Print: React.FC<SaleA4PrintProps> = ({ data, index = 1, length = 1 }) => {
  const lines = data.lines || [];
  const totalQuantity = lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  const totalTaxAmount = data.taxAmount || 0;
  const total = Number(data.totalAmount || 0);
  const paid = paidAmount(data);
  const remaining = total - paid;

  return (
    <article className="sale-a4-print">
      <style>{`
        @page { size: A4; margin: 0; }
        .sale-a4-print { box-sizing: border-box; width: 210mm; min-height: 297mm; padding: 12mm 12mm 10mm; color: #111; background: #fff; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.35; }
        .sale-a4-print * { box-sizing: border-box; }
        .sale-a4-print table { width: 100%; border-collapse: collapse; }
        .sale-a4-print th, .sale-a4-print td { border: 1px solid #111; padding: 3px 5px; }
        .sale-a4-print .no-border td { border: 0; padding: 1px 0; }
        .sale-a4-print .text-right { text-align: right; }
        .sale-a4-print .text-center { text-align: center; }
        .sale-a4-print .muted { color: #555; }
        .sale-a4-print .signature { height: 75px; vertical-align: top; }
        .sale-a4-print .page-footer { position: absolute; bottom: 7mm; left: 12mm; right: 12mm; font-size: 9px; display: flex; justify-content: space-between; }
        @media screen { .sale-a4-print { margin: 12px auto; box-shadow: 0 0 4px #bbb; } }
      `}</style>

      <header>
        <div className="muted">{formatDateTimeDDMMYYYY(data.orderAt)}</div>
        <div className="text-center" style={{ fontSize: 14, fontWeight: 700 }}>
          {data.store?.name || "Cửa hàng"}
        </div>
        <div className="text-center">
          {getStoreAddress(data) || "Địa chỉ cửa hàng"}
          {data.store?.phone ? ` - Điện thoại: ${data.store.phone}` : ""}
        </div>
        <div className="text-center" style={{ fontSize: 16, fontWeight: 700, marginTop: 7 }}>
          HÓA ĐƠN BÁN HÀNG
        </div>
        <div className="text-center">Số hóa đơn: {data.code}</div>
        <div className="text-center">Ngày {formatVietNamDate(data.orderAt)}</div>
      </header>

      <table className="no-border" style={{ marginTop: 10 }}>
        <tbody>
          <tr>
            <td>Khách hàng: {data.partner?.name || data.partnerSnapshot?.name || "Khách lẻ"}</td>
            <td>SĐT: {data.partner?.phone || data.partnerSnapshot?.phone || ""}</td>
          </tr>
          <tr>
            <td>Địa chỉ: {getAddress(data.partner?.address) || ""}</td>
            <td>Thanh toán: {data.incomeExpenses?.[0]?.fundSnapshot?.name || ""}</td>
          </tr>
          <tr>
            <td>Khu vực:</td>
            <td>NV bán: {data.completerSnapshot?.name || ""}</td>
          </tr>
        </tbody>
      </table>

      <table style={{ marginTop: 8 }}>
        <thead>
          <tr>
            <th style={{ width: 34 }}>STT</th>
            <th style={{ width: 100 }}>Mã hàng</th>
            <th>Tên hàng</th>
            <th style={{ width: 50 }}>ĐVT</th>
            <th style={{ width: 62 }}>Số lượng</th>
            <th style={{ width: 95 }}>Đơn giá</th>
            <th style={{ width: 105 }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={line.id || `${getLineCode(line)}-${index}`}>
              <td className="text-center">{index + 1}</td>
              <td>{getLineCode(line)}</td>
              <td>{getLineName(line)}</td>
              <td className="text-center">{getLineUnit(line)}</td>
              <td className="text-right">{formatQuantity(line.quantity) || "0"}</td>
              <td className="text-right">{formatMoney(line.unitPrice) || "0"}</td>
              <td className="text-right">{formatMoney(line.subTotal) || "0"}</td>
            </tr>
          ))}

          <tr>
            <td colSpan={4} className="text-center font-semibold">
              Tổng cộng
            </td>
            <td className="text-right font-semibold">{formatQuantity(totalQuantity) || "0"}</td>
            <td />
            <td className="text-right font-semibold">{formatMoney(data.grossAmount) || "0"}</td>
          </tr>
        </tbody>
      </table>

      <table className="no-border" style={{ marginTop: 12 }}>
        <tbody>
          <tr>
            <td>Tổng tiền hàng:</td>
            <td className="text-right">{formatMoney(data.grossAmount) || "0"}</td>
          </tr>
          <tr>
            <td>Chiết khấu hóa đơn:</td>
            <td className="text-right">{formatMoney(data.discountAmount) || "0"}</td>
          </tr>
          {totalTaxAmount > 0 && (
            <tr>
              <td>Thuế GTGT:</td>
              <td className="text-right">{formatMoney(totalTaxAmount) || "0"}</td>
            </tr>
          )}
          <tr>
            <td>Tổng thanh toán:</td>
            <td className="text-right">{formatMoney(total) || "0"}</td>
          </tr>
          <tr>
            <td>Khách hàng thanh toán:</td>
            <td className="text-right">{formatMoney(paid) || "0"}</td>
          </tr>
          <tr>
            <td>Còn lại:</td>
            <td className="text-right">{formatMoney(remaining)}</td>
          </tr>
        </tbody>
      </table>

      <div className="text-right" style={{ fontStyle: "italic", marginTop: 5 }}>
        Tổng thanh toán bằng chữ: {numberToVietnameseWords(total)}
      </div>
      <table className="no-border" style={{ marginTop: 25 }}>
        <tbody>
          <tr>
            <td className="text-center signature">Người mua hàng</td>
            <td className="text-center signature">Người bán hàng</td>
          </tr>
        </tbody>
      </table>
      <div className="page-footer">
        <span>{data.store?.name || ""}</span>
        <span>
          {index}/{length}
        </span>
      </div>
    </article>
  );
};

export const SaleA4PrintDocument: React.FC<{ data: Sale[] }> = ({ data }) => (
  <div>
    {data.map((sale, i) => (
      <SaleA4Print key={sale.id} data={sale} index={i + 1} length={data.length} />
    ))}
  </div>
);
