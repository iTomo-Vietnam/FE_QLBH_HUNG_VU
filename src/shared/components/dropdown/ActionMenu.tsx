import React from "react";
import { Dropdown, Button, Tooltip } from "antd";
import { EllipsisHorizontalIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";

interface DropdownActionProps {
  size?: "small" | "middle";

  onCopy?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  onViewDetail?: () => void;
  onCancel?: () => void;
  onRestore?: () => void;
  onExportPdf?: () => void;
  onExportExcel?: () => void;
  onPrint?: () => void;
  onPrintBarcode?: () => void;

  onExport?: () => void;
  onImport?: () => void;

  onApprove?: () => void;
  onReject?: () => void;
  onCustomerApprove?: () => void;
  onCustomerReject?: () => void;
  onCreatePurchase?: () => void;
  onCreateQuotation?: () => void;
  onRestrict?: () => void;
  onUnrestrict?: () => void;
  onViewRestrictions?: () => void;
  onConfirm?: () => void;

  // Dispatch actions
  onAccept?: () => void;
  onStart?: () => void;
  onArrive?: () => void;
  onComplete?: () => void;

  type?: "vertical" | "horizontal";
  isSelected?: boolean;
}

const iconCls = "w-7 h-7 text-white rounded-md p-1";

export const DropdownAction: React.FC<DropdownActionProps> = ({
  size = "middle",

  onCopy,
  onEdit,
  onDelete,
  onSetDefault,
  onViewDetail,
  onCancel,
  onRestore,
  onExportPdf,
  onExportExcel,
  onPrint,
  onPrintBarcode,

  onExport,
  onImport,

  onApprove,
  onReject,
  onCustomerApprove,
  onCustomerReject,
  onCreatePurchase,
  onCreateQuotation,
  onRestrict,
  onUnrestrict,
  onViewRestrictions,
  onConfirm,

  onAccept,
  onStart,
  onArrive,
  onComplete,

  type = "vertical",
  isSelected = false,
}) => {
  const iconConfig = {
    viewDetails: {
      icon: "clarity:details-line",
      color: "bg-cyan-500",
      textColor: "text-cyan-500",
    },
    copy: {
      icon: "mdi:content-copy",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    },
    approve: {
      icon: "mdi:check-circle-outline",
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    reject: {
      icon: "mdi:close-circle-outline",
      color: "bg-red-500",
      textColor: "text-red-500",
    },
    customerApprove: {
      icon: "mdi:check-circle-outline",
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    customerReject: {
      icon: "healthicons:refused-outline",
      color: "bg-red-500",
      textColor: "text-red-500",
    },
    confirm: {
      icon: "mdi:check-circle-outline",
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    createPurchase: {
      icon: "icon-park-outline:doc-add",
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    createQuotation: {
      icon: "icon-park-outline:doc-add",
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    restrict: {
      icon: "mdi:lock-outline",
      color: "bg-amber-500",
      textColor: "text-amber-500",
    },
    unrestrict: {
      icon: "mdi:lock-open-outline",
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    viewRestrictions: {
      icon: "mdi:history",
      color: "bg-purple-500",
      textColor: "text-purple-500",
    },
    export: {
      icon: "lsicon:out-of-warehouse-outline",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    },
    import: {
      icon: "lsicon:warehouse-into-outline",
      color: "bg-purple-500",
      textColor: "text-purple-500",
    },
    exportPdf: {
      icon: "mdi:file-pdf-box",
      color: "bg-orange-500",
      textColor: "text-orange-500",
    },
    exportExcel: {
      icon: "mdi:file-excel-outline",
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    print: {
      icon: "mdi:printer-outline",
      color: "bg-sky-500",
      textColor: "text-sky-500",
    },
    printBarcode: {
      icon: "mdi:barcode",
      color: "bg-purple-500",
      textColor: "text-purple-500",
    },
    setDefault: {
      icon: "mdi:star-outline",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    },
    edit: {
      icon: "mdi:pencil-outline",
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    cancel: {
      icon: "mdi:close-circle-outline",
      color: "bg-red-500",
      textColor: "text-red-500",
    },
    restore: {
      icon: "mdi:restore",
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    delete: {
      icon: "mdi:delete-outline",
      color: "bg-red-500",
      textColor: "text-red-500",
    },
    accept: {
      icon: "mdi:check-circle-outline",
      color: "bg-green-500",
      textColor: "text-green-500",
    },
    start: {
      icon: "mdi:play-circle-outline",
      color: "bg-blue-500",
      textColor: "text-blue-500",
    },
    arrive: {
      icon: "mdi:map-marker-check-outline",
      color: "bg-teal-500",
      textColor: "text-teal-500",
    },
    complete: {
      icon: "mdi:check-all",
      color: "bg-green-600",
      textColor: "text-green-600",
    },
  };

  const items = [
    onViewDetail && {
      label: "Xem chi tiết",
      key: "viewDetails",
      icon: <Icon icon="clarity:details-line" className={`${iconCls} bg-cyan-500`} />,
      onClick: onViewDetail,
    },
    onCopy && {
      label: "Sao chép",
      key: "copy",
      icon: <Icon icon="mdi:content-copy" className={`${iconCls} bg-yellow-500`} />,
      onClick: onCopy,
    },
    onApprove && {
      label: "Duyệt",
      key: "approve",
      icon: <Icon icon="mdi:check-circle-outline" className={`${iconCls} bg-green-500`} />,
      onClick: onApprove,
    },
    onReject && {
      label: "Từ chối",
      key: "reject",
      icon: <Icon icon="healthicons:refused-outline" className={`${iconCls} bg-red-500`} />,
      onClick: onReject,
    },
    onCustomerApprove && {
      label: "Khách hàng duyệt",
      key: "customerApprove",
      icon: <Icon icon="mdi:check-circle-outline" className={`${iconCls} bg-green-500`} />,
      onClick: onCustomerApprove,
    },
    onCustomerReject && {
      label: "Khách hàng từ chối",
      key: "customerReject",
      icon: <Icon icon="healthicons:refused-outline" className={`${iconCls} bg-red-500`} />,
      onClick: onCustomerReject,
    },
    onCreatePurchase && {
      label: "Tạo phiếu mua hàng",
      key: "createPurchase",
      icon: <Icon icon="icon-park-outline:doc-add" className={`${iconCls} bg-blue-500`} />,
      onClick: onCreatePurchase,
    },
    onCreateQuotation && {
      label: "Tạo báo giá",
      key: "createQuotation",
      icon: <Icon icon="icon-park-outline:doc-add" className={`${iconCls} bg-blue-500`} />,
      onClick: onCreateQuotation,
    },
    onConfirm && {
      label: "Xác nhận",
      key: "confirm",
      icon: <Icon icon="mdi:check-circle-outline" className={`${iconCls} bg-green-500`} />,
      onClick: onConfirm,
    },
    onAccept && {
      label: "Nhận việc",
      key: "accept",
      icon: <Icon icon="mdi:check-circle-outline" className={`${iconCls} bg-green-500`} />,
      onClick: onAccept,
    },
    onStart && {
      label: "Bắt đầu",
      key: "start",
      icon: <Icon icon="mdi:play-circle-outline" className={`${iconCls} bg-blue-500`} />,
      onClick: onStart,
    },
    onArrive && {
      label: "Đã đến nơi",
      key: "arrive",
      icon: <Icon icon="mdi:map-marker-check-outline" className={`${iconCls} bg-teal-500`} />,
      onClick: onArrive,
    },
    onComplete && {
      label: "Hoàn thành",
      key: "complete",
      icon: <Icon icon="mdi:check-all" className={`${iconCls} bg-green-600`} />,
      onClick: onComplete,
    },
    onRestrict && {
      label: "Hạn chế đăng nhập",
      key: "restrict",
      icon: <Icon icon="mdi:lock-outline" className={`${iconCls} bg-amber-500`} />,
      onClick: onRestrict,
    },
    onUnrestrict && {
      label: "Mở khóa đăng nhập",
      key: "unrestrict",
      icon: <Icon icon="mdi:lock-open-outline" className={`${iconCls} bg-green-500`} />,
      onClick: onUnrestrict,
    },
    onViewRestrictions && {
      label: "Xem hạn chế",
      key: "viewRestrictions",
      icon: <Icon icon="mdi:history" className={`${iconCls} bg-purple-500`} />,
      onClick: onViewRestrictions,
    },
    onExport && {
      label: "Xuất kho",
      key: "export",
      icon: <Icon icon="lsicon:out-of-warehouse-outline" className={`${iconCls} bg-yellow-500`} />,
      onClick: onExport,
    },
    onImport && {
      label: "Nhập kho",
      key: "import",
      icon: <Icon icon="lsicon:warehouse-into-outline" className={`${iconCls} bg-purple-500`} />,
      onClick: onImport,
    },
    onExportPdf && {
      label: "Xuất PDF",
      key: "exportPdf",
      icon: <Icon icon="mdi:file-pdf-box" className={`${iconCls} bg-green-500`} />,
      onClick: onExportPdf,
    },
    onExportExcel && {
      label: "Xuất Excel",
      key: "exportExcel",
      icon: <Icon icon="mdi:file-excel-outline" className={`${iconCls} bg-green-500`} />,
      onClick: onExportExcel,
    },
    onPrint && {
      label: "In phiếu",
      key: "print",
      icon: <Icon icon="mdi:printer-outline" className={`${iconCls} bg-sky-500`} />,
      onClick: onPrint,
    },
    onPrintBarcode && {
      label: "In tem mã",
      key: "printBarcode",
      icon: <Icon icon="mdi:barcode" className={`${iconCls} bg-purple-500`} />,
      onClick: onPrintBarcode,
    },
    onSetDefault && {
      label: "Đặt làm mặc định",
      key: "setDefault",
      icon: <Icon icon="mdi:star-outline" className={`${iconCls} bg-yellow-500`} />,
      onClick: onSetDefault,
    },
    onEdit && {
      label: "Chỉnh sửa",
      key: "edit",
      icon: <Icon icon="mdi:pencil-outline" className={`${iconCls} bg-blue-500`} />,
      onClick: onEdit,
    },
    onCancel && {
      label: "Hủy",
      key: "cancel",
      icon: <Icon icon="mdi:close-circle-outline" className={`${iconCls} bg-red-500`} />,
      onClick: onCancel,
    },
    onRestore && {
      label: "Khôi phục",
      key: "restore",
      icon: <Icon icon="mdi:restore" className={`${iconCls} bg-green-500`} />,
      onClick: onRestore,
    },
    onDelete && {
      label: "Xóa",
      key: "delete",
      icon: <Icon icon="mdi:delete-outline" className={`${iconCls} bg-red-500`} />,
      onClick: onDelete,
    },
  ].filter((item) => item !== undefined);

  const buttonSize = size === "middle" ? "h-8 w-12" : "h-6 w-10";
  const icon = `${size === "middle" ? "w-5 h-5" : "w-4 h-4"} ${isSelected ? "text-white" : ""}`;

  if (items.length === 0) return null;

  if (items.length === 1) {
    const item = items[0];
    const iconConfigItem =
      iconConfig[item.key as keyof typeof iconConfig] || iconConfig.viewDetails;
    return (
      <div className="flex justify-center items-center w-[46px]">
        <Button
          htmlType="button"
          size={size}
          onClick={item.onClick}
          className="!p-0 border-0 mx-auto"
        >
          <Tooltip title={item.label}>
            <span className="inline-flex">
              <Icon
                icon={iconConfigItem.icon}
                className={`${iconCls.replace("text-white", "")} ${iconConfigItem.textColor}`}
              />
            </span>
          </Tooltip>
        </Button>
      </div>
    );
  }

  return (
    <Dropdown
      menu={{
        items: items.map((item) => {
          const iconConfigItem =
            iconConfig[item.key as keyof typeof iconConfig] || iconConfig.viewDetails;
          return {
            ...item,
            icon: (
              <Icon icon={iconConfigItem.icon} className={`${iconCls} ${iconConfigItem.color}`} />
            ),
          };
        }),
      }}
      placement="bottomRight"
      arrow
      trigger={["click"]}
    >
      <span
        className={`
          flex items-center justify-center ${buttonSize} hover:text-gray-800 rounded hover:bg-gray-100 cursor-pointer
        `}
      >
        {type === "vertical" ? (
          <EllipsisVerticalIcon className={icon} />
        ) : (
          <EllipsisHorizontalIcon className={icon} />
        )}
      </span>
    </Dropdown>
  );
};
