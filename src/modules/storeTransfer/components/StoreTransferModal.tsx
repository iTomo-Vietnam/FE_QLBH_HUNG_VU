import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { App, Button, Form, Input, Modal, Upload, UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { AddUpdateModalProps } from "@/shared/interfaces/common";
import { AppDatePicker, AppSelect, InputQuantity, Label } from "@/shared/components";
import {
  Product,
  ProductFile,
  ProductAddSelect,
  buildProductSnapshot,
  collectUnits,
  getProductsByCodes,
  readProductExcel,
} from "@/modules/product";
import { StoreSelect } from "@/modules/store/components/Select";
import { useAutoResetItem } from "@/shared/hooks/useAutoResetItem";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { randomId } from "@/shared/utils/common.util";
import { formatFormData, parseFormDataDates } from "@/shared/utils/date.util";
import { setFormErrors } from "@/shared/utils/form.util";
import { StoreTransfer } from "../storeTransfer.model";
import { TrashIcon } from "@heroicons/react/24/outline";

interface StoreTransferModalProps extends AddUpdateModalProps<StoreTransfer> {
  onExportTransfer?: (id: string) => Promise<void>;
  onImportTransfer?: (id: string) => Promise<void>;
  onCancelTransfer?: (id: string) => Promise<void>;
  onAddAndExport?: (data: Partial<StoreTransfer>) => void;
  onEditAndExport?: (data: Partial<StoreTransfer>) => void;
}

const getConversionRate = (product: Product, unitId?: string) => {
  if (!unitId || unitId === product.baseUnitId) return 1;
  return Number(product.extraUnits?.find((item) => item.unitId === unitId)?.conversionRate) || 1;
};

export const StoreTransferModal: React.FC<StoreTransferModalProps> = ({
  open,
  editData,
  defaultData,
  errors,
  loading,
  onAdd,
  onEdit,
  onClose,
  onExportTransfer,
  onImportTransfer,
  onCancelTransfer,
  onAddAndExport,
  onEditAndExport,
}) => {
  const [form] = Form.useForm<any>();
  const { modal, message } = App.useApp();
  const { currentStore } = useGlobalData();
  const [actionLoading, setActionLoading] = useState(false);
  const submitAction = useRef<"save" | "export">("save");
  const [selectedProduct, setSelectedProduct] = useAutoResetItem<Product>();
  const id = editData?.id || randomId();
  const lines = Form.useWatch("lines", form) || [];
  const fromStoreId = Form.useWatch("fromStoreId", form);
  const toStoreId = Form.useWatch("toStoreId", form);
  const fromStore = Form.useWatch("fromStore", form);
  const toStore = Form.useWatch("toStore", form);

  useEffect(() => {
    if (errors) setFormErrors(form, errors);
  }, [errors, form]);

  const addProduct = (product?: Product | null) => {
    if (!product) return;
    setSelectedProduct(product);
    const existingLineIndex = lines.findIndex((line: any) => line.productId === product.id);
    if (existingLineIndex >= 0) {
      const existingQuantity = Number(lines[existingLineIndex]?.quantity || 0);
      form.setFieldValue(["lines", existingLineIndex, "quantity"], existingQuantity + 1);
      return;
    }

    const unit = product.baseUnit || collectUnits(product)[0];
    form.setFieldValue("lines", [
      {
        tempId: randomId(),
        productId: product.id,
        product,
        productSnapshot: buildProductSnapshot(product),
        unitId: unit?.id || product.baseUnitId,
        unit,
        unitSnapshot: unit,
        conversionRateAtTime: getConversionRate(
          product,
          unit?.id || product.baseUnitId || undefined,
        ),
        quantity: 1,
      },
      ...lines,
    ]);
  };

  const importExcel = async (file: File) => {
    try {
      const rows = await readProductExcel(file);
      if (!rows.length) {
        message.warning("File Excel chưa có dòng hàng hóa hợp lệ");
        return;
      }

      const products = await getProductsByCodes([...new Set(rows.map((row) => row.code))]);
      const productMap = new Map(
        products.map((product) => [product.code.trim().toLowerCase(), product]),
      );
      const missingRows = rows.filter((row) => !productMap.has(row.code.trim().toLowerCase()));
      const importedLines = rows
        .map((row) => {
          const product = productMap.get(row.code.trim().toLowerCase());
          if (!product) return null;

          const unit =
            collectUnits(product, product.baseUnit).find(
              (item) => item.name.toLowerCase() === row.unitName,
            ) ||
            product.baseUnit ||
            collectUnits(product)[0];

          return {
            tempId: randomId(),
            productId: product.id,
            product,
            productSnapshot: buildProductSnapshot(product),
            unitId: unit?.id || product.baseUnitId,
            unit,
            unitSnapshot: unit,
            conversionRateAtTime: getConversionRate(
              product,
              unit?.id || product.baseUnitId || undefined,
            ),
            quantity: row.quantity,
          };
        })
        .filter(Boolean);

      form.setFieldValue("lines", [...(form.getFieldValue("lines") || []), ...importedLines]);

      if (missingRows.length) {
        modal.warning({
          title: "Không tìm thấy hàng hóa",
          content: (
            <div>
              Không tìm thấy hàng hóa có mã:
              <ul className="mt-2 list-disc pl-5">
                {missingRows.map((row, index) => (
                  <li key={row.code + "-" + index} className="font-mono">
                    {row.code}
                  </li>
                ))}
              </ul>
              <Button
                type="link"
                className="!px-0"
                onClick={() => void ProductFile.exportRows(missingRows.map((row) => row.cells))}
              >
                Tải file các dòng chưa thêm
              </Button>
            </div>
          ),
        });
      } else {
        message.success("Đã thêm " + importedLines.length + " hàng hóa từ Excel");
      }
    } catch {
      message.error("Không thể đọc file Excel. Vui lòng dùng đúng biểu mẫu hàng hóa.");
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    accept: ".xlsx,.xls",
    multiple: false,
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => {
      void importExcel(file as unknown as File);
      return Upload.LIST_IGNORE;
    },
  };

  const finish = (values: any) => {
    const payload = {
      ...values,
      id,
      tempId: id,
      occurredAt: values.occurredAt?.toISOString?.() || values.occurredAt,
      lines: (values.lines || []).map(({ product, unit, ...line }: any) => line),
    };
    const formatted = formatFormData(payload as any);
    if (submitAction.current === "export") {
      if (editData) {
        if (onEditAndExport) onEditAndExport(formatted);
        else void runTransition(onExportTransfer);
      } else onAddAndExport?.(formatted);
    } else if (editData) onEdit?.(formatted);
    else onAdd?.(formatted);
    submitAction.current = "save";
  };

  const runTransition = async (action?: (id: string) => Promise<void>) => {
    if (!editData || !action) return;
    setActionLoading(true);
    try {
      await action(editData.id);
    } finally {
      setActionLoading(false);
    }
  };

  const submitForm = (action: "save" | "export") => {
    submitAction.current = action;
    form.submit();
  };

  const status = editData?.status;
  const isSourceStore = !currentStore || currentStore.id === fromStoreId;
  const isDestinationStore = !currentStore || currentStore.id === toStoreId;
  const canSaveDraft = isSourceStore && (editData ? status === "planned" && !!onEdit : !!onAdd);
  const canExport =
    isSourceStore &&
    status !== "exported" &&
    status !== "imported" &&
    status !== "canceled" &&
    (editData ? !!onEditAndExport || !!onExportTransfer : !!onAddAndExport);
  const canImport = !!editData && status === "exported" && isDestinationStore && !!onImportTransfer;
  const canCancel =
    !!editData &&
    status !== "canceled" &&
    (isSourceStore || isDestinationStore) &&
    !!onCancelTransfer;

  const close = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      centered
      destroyOnClose
      maskClosable={false}
      footer={null}
      width={1580}
      title={`${editData ? "Sửa" : "Thêm"} phiếu chuyển kho`}
      onCancel={close}
      afterOpenChange={(isOpen) => {
        if (!isOpen) {
          form.resetFields();
          return;
        }
        if (!editData) return;
        form.setFieldsValue(parseFormDataDates(editData));
      }}
    >
      <Form
        form={form}
        onFinish={finish}
        className="flex flex-col h-[70vh]"
        initialValues={{
          ...defaultData,
          occurredAt: dayjs(),
          fromStoreId: defaultData?.fromStoreId || currentStore?.id,
          fromStore: defaultData?.fromStore || currentStore,
        }}
      >
        <div className="flex h-full w-full gap-4">
          <div className="flex h-full w-[calc(100%-496px)] flex-col">
            <Form.List name="lines">
              {(fields, { remove }) => (
                <div className="flex h-full flex-col">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="w-[650px]">
                      <ProductAddSelect
                        value={selectedProduct?.id}
                        className="w-[650px]"
                        query={{ storeId: fromStoreId }}
                        placeholder={
                          fromStoreId
                            ? "Tìm mã hoặc tên hàng để thêm"
                            : "Vui lòng chọn kho chuyển đi trước"
                        }
                        onChangeData={addProduct}
                        showCostPrice
                        showStock
                        disabled={!fromStoreId}
                      />
                    </div>
                    <Upload {...uploadProps} disabled={!fromStoreId}>
                      <Button icon={<Icon icon="bytesize:import" />}>Thêm từ Excel</Button>
                    </Upload>
                  </div>
                  <div className="min-h-0 flex-1 overflow-auto rounded-md border">
                    <table className="min-w-[964px] w-full border-collapse text-sm">
                      <colgroup>
                        <col style={{ width: 55 }} />
                        <col style={{ width: 160 }} />
                        <col />
                        <col style={{ width: 150 }} />
                        <col style={{ width: 140 }} />
                        <col style={{ width: 55 }} />
                      </colgroup>
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr className="border-b">
                          {["STT", "Mã hàng", "Tên hàng", "Đơn vị tính", "Số lượng", ""].map(
                            (title, index) => (
                              <th
                                key={`${title}-${index}`}
                                className={`border-r last:border-r-0 px-3 py-1 font-semibold ${
                                  index === 0
                                    ? "text-center"
                                    : index === 4
                                      ? "text-right"
                                      : "text-left"
                                }`}
                              >
                                {title}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {!fields.length ? (
                          <tr>
                            <td colSpan={6} className="h-[280px] p-6">
                              <Upload.Dragger
                                {...uploadProps}
                                disabled={!fromStoreId}
                                className="!border-0 !bg-transparent"
                              >
                                <p className="ant-upload-drag-icon">
                                  <InboxOutlined className="text-4xl text-primary" />
                                </p>
                                <p className="font-semibold text-gray-800">
                                  Thêm sản phẩm từ file Excel
                                </p>
                                <p className="text-sm text-slate-500">
                                  Kéo thả file Excel vào đây hoặc chọn file dữ liệu
                                </p>
                                <button
                                  type="button"
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void ProductFile.downloadTemplate();
                                  }}
                                >
                                  Tải biểu mẫu
                                </button>
                                <p className="mt-3 text-primary">
                                  {fromStoreId
                                    ? "Chọn file dữ liệu"
                                    : "Vui lòng chọn kho chuyển đi trước"}
                                </p>
                              </Upload.Dragger>
                            </td>
                          </tr>
                        ) : (
                          fields.map(({ key, name, ...restField }) => {
                            const line = lines[name] || {};
                            const product = line.product as Product | undefined;
                            const units = product ? collectUnits(product, line.unit) : [];
                            return (
                              <tr key={key} className="border-b">
                                <td className="border-r px-3 py-1 text-center">{name + 1}</td>
                                <td className="border-r px-3 py-1 font-mono">
                                  {line.product?.code || line.productSnapshot?.code || "--"}
                                </td>
                                <td className="border-r px-3 py-1">
                                  {line.product?.name || line.productSnapshot?.name || "--"}
                                </td>
                                <td className="border-r p-0">
                                  <Form.Item
                                    {...restField}
                                    name={[name, "unitId"]}
                                    rules={[{ required: true, message: "Chọn đơn vị tính" }]}
                                    noStyle
                                  >
                                    <AppSelect
                                      className="w-full"
                                      variant="borderless"
                                      options={units.map((unit) => ({
                                        value: unit.id,
                                        label: unit.name,
                                      }))}
                                      allowClear={false}
                                      onChange={(unitId) => {
                                        const unit = units.find((item) => item.id === unitId);
                                        form.setFieldValue(["lines", name, "unit"], unit);
                                        form.setFieldValue(["lines", name, "unitSnapshot"], unit);
                                        form.setFieldValue(
                                          ["lines", name, "conversionRateAtTime"],
                                          product ? getConversionRate(product, unitId) : 1,
                                        );
                                      }}
                                    />
                                  </Form.Item>
                                </td>
                                <td className="border-r p-0">
                                  <Form.Item
                                    {...restField}
                                    name={[name, "quantity"]}
                                    rules={[
                                      {
                                        required: true,
                                        type: "number",
                                        min: 0.000001,
                                        message: "Nhập số lượng lớn hơn 0",
                                      },
                                    ]}
                                    noStyle
                                  >
                                    <InputQuantity min={0} variant="borderless" />
                                  </Form.Item>
                                </td>
                                <td className="px-1 text-center">
                                  <Button
                                    type="text"
                                    danger
                                    htmlType="button"
                                    onClick={() => remove(name)}
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Form.List>
          </div>
          <div className="h-full w-[480px] shrink-0 overflow-y-auto rounded-md border border-gray-200 bg-white">
            <div className="p-4 flex flex-col min-h-full">
              <Form.Item name="code" label={<Label title="Số phiếu" />}>
                <Input placeholder="Tự động nếu để trống" />
              </Form.Item>
              <Form.Item
                name="occurredAt"
                label={<Label title="Ngày chuyển" required />}
                rules={[{ required: true, message: "Vui lòng chọn ngày chuyển" }]}
              >
                <AppDatePicker />
              </Form.Item>
              <Form.Item
                name="fromStoreId"
                label={<Label title="Kho chuyển đi" required />}
                rules={[{ required: true, message: "Vui lòng chọn kho chuyển đi" }]}
              >
                <StoreSelect
                  defaultData={fromStore}
                  disabled={!!currentStore}
                  hideOptions={toStore ? [toStore] : undefined}
                  onChangeData={(value) => form.setFieldValue("fromStore", value || null)}
                />
              </Form.Item>
              <Form.Item name="fromStore" hidden />
              <Form.Item
                name="toStoreId"
                label={<Label title="Kho nhận" required />}
                rules={[
                  { required: true, message: "Vui lòng chọn kho nhận" },
                  {
                    validator: (_, value) =>
                      value && value === form.getFieldValue("fromStoreId")
                        ? Promise.reject(new Error("Kho nhận phải khác kho chuyển đi"))
                        : Promise.resolve(),
                  },
                ]}
              >
                <StoreSelect
                  defaultData={toStore}
                  hideOptions={fromStore ? [fromStore] : undefined}
                  onChangeData={(value) => form.setFieldValue("toStore", value || null)}
                />
              </Form.Item>
              <Form.Item name="toStore" hidden />
              <Form.Item name="reason" label={<Label title="Lý do chuyển hàng" />}>
                <Input.TextArea placeholder="Nhập lý do chuyển hàng" />
              </Form.Item>
              <Form.Item name="note">
                <Input.TextArea placeholder="Ghi chú" />
              </Form.Item>

              <div className="mt-auto mb-0 flex flex-wrap justify-end gap-2 border-t pt-4">
                {canCancel && (
                  <Button
                    danger
                    htmlType="button"
                    disabled={loading || actionLoading}
                    onClick={() => {
                      modal.confirm({
                        title: "Hủy phiếu chuyển hàng",
                        content: `Bạn có chắc muốn hủy phiếu ${editData?.code || ""}?`,
                        okText: "Hủy phiếu",
                        okButtonProps: { danger: true },
                        cancelText: "Đóng",
                        onOk: () => runTransition(onCancelTransfer),
                      });
                    }}
                  >
                    Hủy
                  </Button>
                )}
                {canSaveDraft && (
                  <Button
                    htmlType="button"
                    disabled={loading || actionLoading}
                    onClick={() => submitForm("save")}
                  >
                    Lưu tạm
                  </Button>
                )}
                {canExport && (
                  <Button
                    type="primary"
                    htmlType="button"
                    disabled={loading || actionLoading}
                    onClick={() => submitForm("export")}
                  >
                    Xuất kho
                  </Button>
                )}
                {canImport && (
                  <Button
                    type="primary"
                    htmlType="button"
                    disabled={loading || actionLoading}
                    onClick={() => void runTransition(onImportTransfer)}
                  >
                    Hoàn thành
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};
