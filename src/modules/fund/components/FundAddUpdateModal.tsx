import React, { useEffect } from "react";
import { Col, Form, Input, Modal, Row } from "antd";
import { AddUpdateModalProps } from "@/shared/interfaces/common";
import {
  AppSwitch,
  BankSelect,
  FormSection,
  InputMoney,
  Label,
  SubmitButton,
} from "@/shared/components";
import { randomId } from "@/shared/utils/common.util";
import { setFormErrors } from "@/shared/utils/form.util";
import { Fund, FundType } from "../fund.model";

interface FundAddUpdateModalProps extends AddUpdateModalProps<Fund> {
  type: FundType;
  defaultStoreId?: string | null;
}

export const FundAddUpdateModal: React.FC<FundAddUpdateModalProps> = ({
  open,
  editData,
  errors,
  loading,
  onAdd,
  onEdit,
  onClose,
  type,
  defaultStoreId,
}) => {
  const [form] = Form.useForm<Fund>();
  const id = editData?.id || randomId();
  const formType = editData?.type || type;
  const isBank = formType === FundType.BANK;

  useEffect(() => {
    if (errors) setFormErrors(form, errors);
  }, [errors, form]);

  const handleFinish = (values: Fund) => {
    const payload: Partial<Fund> = {
      ...values,
      id,
      tempId: id,
      type: formType,
      isPersonal: isBank ? Boolean(values.isPersonal) : false,
    };

    // Phạm vi sử dụng được chọn ở action riêng, không chỉnh trong form cập nhật.
    if (editData) {
      delete payload.storeId;
      onEdit?.(payload);
      return;
    }

    payload.storeId = defaultStoreId ?? null;
    onAdd?.(payload);
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const title = editData
    ? "Cập nhật quỹ"
    : isBank
      ? "Thêm tài khoản ngân hàng"
      : "Thêm quỹ tiền mặt";

  return (
    <Modal
      open={open}
      centered
      destroyOnClose
      maskClosable={false}
      title={title}
      footer={null}
      onCancel={handleClose}
      width={680}
      afterOpenChange={(isOpen) => {
        if (!isOpen) {
          form.resetFields();
          return;
        }

        form.setFieldsValue(
          editData || {
            type: formType,
            isActive: true,
            name: isBank ? undefined : "Tiền mặt",
          },
        );
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
        <Form.Item name="type" hidden>
          <Input />
        </Form.Item>

        <FormSection title="Thông tin quỹ">
          <Row gutter={32}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label={<Label title="Tên quỹ" required />}
                rules={[{ required: true, message: "Vui lòng nhập tên quỹ" }]}
              >
                <Input maxLength={255} placeholder="Ví dụ: Tiền mặt" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="code" label={<Label title="Mã quỹ" />}>
                <Input placeholder="Tự động nếu để trống" maxLength={25} />
              </Form.Item>
            </Col>
            {!editData && (
              <Col xs={12}>
                <Form.Item name="initialBalance" label={<Label title="Số dư ban đầu" />}>
                  <InputMoney notRightAlign placeholder="Nhập số dư ban đầu" />
                </Form.Item>
              </Col>
            )}
            <Col xs={!editData ? 12 : 24}>
              <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                <AppSwitch label="Đang hoạt động" />
              </Form.Item>
            </Col>
            {isBank && (
              <Col xs={24} sm={12}>
                <Form.Item name="isPersonal" label="Loại tài khoản" valuePropName="checked">
                  <AppSwitch label="Tài khoản cá nhân" />
                </Form.Item>
              </Col>
            )}
            <Col xs={24}>
              <Form.Item name="note" label={<Label title="Ghi chú" />}>
                <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
              </Form.Item>
            </Col>
          </Row>
        </FormSection>

        {isBank && (
          <FormSection title="Thông tin tài khoản ngân hàng">
            <Row gutter={32}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="bank"
                  label={<Label title="Ngân hàng" required />}
                  rules={[{ required: true, message: "Vui lòng chọn  ngân hàng" }]}
                >
                  <BankSelect />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="accountNumber"
                  label={<Label title="Số tài khoản" required />}
                  rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
                >
                  <Input placeholder="Số tài khoản ngân hàng" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="accountHolderName"
                  label={<Label title="Chủ tài khoản" required />}
                  rules={[{ required: true, message: "Vui lòng nhập tên chủ tài khoản" }]}
                >
                  <Input placeholder="Tên chủ tài khoản" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="branch" label={<Label title="Chi nhánh" />}>
                  <Input placeholder="Tên chi nhánh mở thẻ" />
                </Form.Item>
              </Col>
            </Row>
          </FormSection>
        )}

        <div className="flex justify-center">
          <SubmitButton loading={loading} onCancel={handleClose} />
        </div>
      </Form>
    </Modal>
  );
};
