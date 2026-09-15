import React, { useEffect } from "react";
import dayjs from "dayjs";
import { Form, Input, Modal, Select } from "antd";
import { AddUpdateModalProps } from "@/shared/interfaces/common";
import { DatePickerCustom, InputMoney, Label, SubmitButton } from "@/shared/components";
import { FundSelect } from "@/modules/fund/components";
import { FundType } from "@/modules/fund/fund.model";
import { formatFormData, parseFormDataDates } from "@/shared/utils/date.util";
import { setFormErrors } from "@/shared/utils/form.util";
import { randomId } from "@/shared/utils/common.util";
import { TransferNote, TransferNoteStatus } from "../transferNote.model";

export const TransferNoteAddUpdateModal: React.FC<AddUpdateModalProps<TransferNote>> = ({
  open,
  editData,
  errors,
  loading,
  onAdd,
  onEdit,
  onClose,
}) => {
  const [form] = Form.useForm<TransferNote>();
  const fund = Form.useWatch("fund", form);
  const status = Form.useWatch("status", form);
  const id = editData?.id || randomId();

  useEffect(() => {
    if (errors) setFormErrors(form, errors);
  }, [errors, form]);

  const handleFinish = (values: TransferNote & { fund?: unknown }) => {
    const { fund: _fund, ...payload } = values;
    const data = formatFormData({ ...payload, id, tempId: id } as TransferNote);
    if (editData) onEdit?.(data);
    else onAdd?.(data);
  };

  return (
    <Modal
      open={open}
      centered
      destroyOnClose
      footer={null}
      title={`${editData ? "Cập nhật" : "Thêm"} ghi chú chuyển khoản`}
      onCancel={onClose}
      afterOpenChange={(isOpen) => {
        if (!isOpen) form.resetFields();
        else
          form.setFieldsValue(
            editData
              ? parseFormDataDates(editData)
              : ({
                  id,
                  tempId: id,
                  occurredAt: dayjs(),
                  amount: 0,
                  status: TransferNoteStatus.VALID,
                } as any),
          );
      }}
    >
      <Form form={form} onFinish={handleFinish} className="mt-4">
        <Form.Item
          name="occurredAt"
          label={<Label title="Thời gian" required />}
          rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
        >
          <DatePickerCustom showTime disabledDate={(value) => !value?.isSame(dayjs(), "day")} />
        </Form.Item>
        <Form.Item
          name="referenceCode"
          label={<Label title="Số phiếu đối soát" required />}
          rules={[{ required: true, message: "Vui lòng nhập số phiếu đối soát" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="fundId"
          label={<Label title="Tài khoản nhận" required />}
          rules={[{ required: true, message: "Vui lòng chọn tài khoản nhận" }]}
        >
          <FundSelect
            query={{ type: FundType.BANK }}
            defaultData={fund}
            onChangeData={(value) => form.setFieldValue("fund", value || null)}
          />
        </Form.Item>
        <Form.Item name="fund" hidden />
        <Form.Item
          name="amount"
          label={<Label title="Số tiền" required />}
          rules={[
            { required: true },
            { type: "number", min: 1, message: "Số tiền phải lớn hơn 0" },
          ]}
        >
          <InputMoney notRightAlign min={1} />
        </Form.Item>
        <Form.Item name="note" label={<Label title="Ghi chú" />}>
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>
        <div className="flex justify-center">
          <SubmitButton loading={loading} onCancel={onClose} />
        </div>
      </Form>
    </Modal>
  );
};
