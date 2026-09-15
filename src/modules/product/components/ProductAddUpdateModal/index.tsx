import React, { useEffect, useRef } from "react";
import { Form, Input, Modal, Row, Col, Tabs } from "antd";
import type { FormInstance, FormProps } from "antd";

import {
  AppSelect,
  InputQuantity,
  InputMoney,
  Label,
  SubmitButton,
  TextEditor,
  FormSection,
} from "@/shared/components";
import { AddUpdateModalProps } from "@/shared/interfaces/common";
import { Product } from "../../product.model";
import { handleCloseWithPendingFiles, randomId } from "@/shared/utils/common.util";
import { setFormErrors } from "@/shared/utils/form.util";
import { parseFormDataDates } from "@/shared/utils/date.util";
import { useAppMessage } from "@/shared/hooks/useAppMessage";
import { AttributeManagerSelect, ProductGroupSelect } from "@/modules/attribute/components/Select";
import { AttributeType } from "@/modules/attribute/attribute.enum";
import { WeightUnit, weightUnitOptions } from "@/shared/constants";
import { File as StoredFile } from "@/shared/interfaces/file";

import { ExtraUnitList } from "./ExtraUnitList";
import { StoreProductList } from "./StoreProductList";
import { ProductImageUploadBox } from "../ProductImageUploadBox";

export interface PartialProps {
  form: FormInstance<Product>;
  editData?: Product;
}

const tabs = [
  { key: "info", label: "Thông tin" },
  { key: "description", label: "Mô tả & Ghi chú" },
  { key: "stores", label: "Chi nhánh kinh doanh" },
];

export const ProductAddUpdateModal: React.FC<AddUpdateModalProps<Product>> = ({
  open,
  editData,
  loading,
  errors,
  onAdd,
  onEdit,
  onClose,
}) => {
  const { showFormErrorMessages } = useAppMessage();
  const [form] = Form.useForm<Product>();
  const createIdRef = useRef(randomId());
  const id = editData?.id || createIdRef.current;
  const [activeTab, setActiveTab] = React.useState("info");
  const group = Form.useWatch("group", form);
  const brand = Form.useWatch("brand", form);
  const baseUnit = Form.useWatch("baseUnit", form);
  const extraUnits = Form.useWatch("extraUnits", form) || [];

  useEffect(() => {
    if (errors) setFormErrors(form, errors);
  }, [errors, form]);

  const onFinish: FormProps<Product>["onFinish"] = async (values) => {
    const formattedData = { ...values, id, tempId: id };
    if (editData) onEdit?.(formattedData);
    else onAdd?.(formattedData);
  };

  const moveImageToTrash = (file: StoredFile) => {
    const current = (form.getFieldValue("__trashFileIds") as string[] | undefined) || [];
    form.setFieldValue("__trashFileIds", Array.from(new Set([...current, file.id])));
  };

  return (
    <Modal
      title={`${editData ? "Chỉnh sửa thông tin" : "Thêm"} hàng hóa`}
      open={open}
      onCancel={() => handleCloseWithPendingFiles(id, onClose)}
      footer={null}
      maskClosable={false}
      centered
      width={1280}
      className="fullscreen-modal"
      destroyOnClose
      afterOpenChange={(isOpen) => {
        if (!isOpen) {
          form.resetFields();
          setActiveTab("info");
          return;
        }

        if (editData) {
          const storeProducts = editData.storeProducts?.map((sp) => ({
            ...sp,
            locationIds:
              (sp.locations?.map((loc) => loc.locationId)?.filter(Boolean) as string[]) || [],
          }));
          form.setFieldsValue({
            ...editData,
            storeProducts,
          });
        }
      }}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        onFinishFailed={showFormErrorMessages}
        className="flex h-full w-full flex-col"
        
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabs}
          className="shrink-0 custom-tabs"
          tabBarStyle={{ marginBottom: 16 }}
        />
        <div className="flex flex-col h-[calc(100%-72px)] py-6 overflow-y-auto scrollbar-hide">
          {/* Các panel luôn được render; chỉ ẩn panel không active để Form.List/Form.Item giữ nguyên DOM. */}
          <div className={activeTab === "info" ? "" : "hidden"}>
            <div className="flex flex-col gap-2">
              <FormSection title="Thông tin hàng hóa">
                <div className="flex gap-8">
                  <div className="min-w-0 flex-1">
                    <Row gutter={[32, 0]}>
                      <Col xs={12}>
                        <Form.Item name="code" label={<Label title="Mã hàng" />}>
                          <Input placeholder="Tự động tạo nếu để trống khi lưu" />
                        </Form.Item>
                      </Col>
                      <Col xs={12}>
                        <Form.Item name="barcode" label={<Label title="Mã vạch" />}>
                          <Input placeholder="Nhập mã vạch, tự động tạo nếu để trống" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          name="name"
                          label={<Label title="Tên hàng" required />}
                          rules={[{ required: true, message: "Vui lòng nhập tên hàng hóa" }]}
                        >
                          <Input placeholder="Nhập tên hàng hóa" />
                        </Form.Item>
                      </Col>
                      <Col xs={12}>
                        <Form.Item name="groupId" label={<Label title="Nhóm" />}>
                          <ProductGroupSelect
                            defaultData={group}
                            onChangeData={(value) => form.setFieldValue("group", value)}
                          />
                        </Form.Item>
                        <Form.Item name="group" hidden />
                      </Col>
                      <Col xs={12}>
                        <Form.Item name="brandId" label={<Label title="Thương hiệu" />}>
                          <AttributeManagerSelect
                            type={AttributeType.BRAND}
                            defaultData={brand}
                            onChangeData={(value) => form.setFieldValue("brand", value)}
                          />
                        </Form.Item>
                        <Form.Item name="brand" hidden />
                      </Col>
                    </Row>
                  </div>

                  <ProductImageUploadBox
                    defaultFiles={editData?.image}
                    oId={id}
                    isActive={false}
                    onChange={(files) => form.setFieldValue("image", files)}
                    onMoveToTrash={moveImageToTrash}
                  />
                </div>

                <Row gutter={[32, 0]}>
                  <Col xs={8}>
                    <Form.Item name="baseUnitId" label={<Label title="ĐVT cơ bản" />}>
                      <AttributeManagerSelect
                        type={AttributeType.UNIT}
                        defaultData={baseUnit}
                        onChangeData={(v) => {
                          form.setFieldValue("baseUnit", v);
                          const filteredExtraUnits = extraUnits.filter(
                            (unit) => unit.unitId !== v?.id,
                          );
                          form.setFieldValue("extraUnits", filteredExtraUnits);
                        }}
                      />
                    </Form.Item>
                    <Form.Item name="baseUnit" hidden />
                  </Col>
                  <Col xs={8}>
                    <Form.Item name="salePrice" label={<Label title="Giá bán" required />}>
                      <InputMoney
                        notRightAlign
                        placeholder="Đơn giá theo ĐVT cơ bản"
                        suffix={
                          <span className="text-xs italic text-gray-400">
                            VNĐ/{baseUnit?.name || "ĐVT"}
                          </span>
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={8}>
                    <div className="flex w-full items-end">
                      <Form.Item
                        name="weight"
                        className="w-[calc(100%-64px)]"
                        label={<Label title="Trọng lượng" />}
                      >
                        <InputQuantity
                          notRightAlign
                          className="rounded-e-none"
                          placeholder="Trọng lượng theo ĐVT"
                        />
                      </Form.Item>
                      <Form.Item name="weightUnit" className="w-16">
                        <AppSelect
                          options={weightUnitOptions}
                          className="!w-full [&_.ant-select-selector]:rounded-s-none"
                          suffixIcon={null}
                          allowClear={false}
                        />
                      </Form.Item>
                    </div>
                  </Col>
                </Row>
              </FormSection>

              <ExtraUnitList form={form} />
            </div>
          </div>

          <div className={activeTab === "description" ? "" : "hidden"}>
            <Form.Item name="description" label={<Label title="Mô tả" />}>
              <TextEditor placeholder="Nhập mô tả chi tiết hàng hóa..." minHeight={240} />
            </Form.Item>
            <Form.Item name="note" label={<Label title="Ghi chú" />}>
              <Input.TextArea
                placeholder="Ghi chú"
                autoSize={{ minRows: 4, maxRows: 10 }}
                showCount
                maxLength={2000}
              />
            </Form.Item>
          </div>

          <div className={activeTab === "stores" ? "" : "hidden"}>
            <StoreProductList form={form} />
          </div>
        </div>

        <div className="flex w-full justify-center">
          <SubmitButton
            loading={loading}
            onCancel={() => handleCloseWithPendingFiles(id, onClose)}
          />
        </div>
      </Form>
    </Modal>
  );
};
