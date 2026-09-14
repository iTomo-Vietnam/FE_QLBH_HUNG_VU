import React, { useEffect } from "react";
import { Form, FormProps, Input, Modal, TimePicker } from "antd";
import dayjs from "dayjs";
import { Store } from "@/shared/base/entity";
import { SubmitButton } from "@/shared/components";
import {
  AvatarUpload,
  Label,
  ProvinceSelect,
  WardSelect,
} from "@/shared/components";
import { EntityType, FileCategory } from "@/shared/constants";
import { getMainFile, parseFormDataDates, randomId, setFormErrors } from "@/shared/utils";
import { useAddressSelector } from "@/shared/hooks";
import { AddUpdateModalProps } from "@/shared/interfaces";

export const StoreAddUpdateModal: React.FC<AddUpdateModalProps<Store>> = ({
  open,
  editData,
  loading,
  errors,
  onClose,
  onAdd,
  onEdit,
}) => {
  const [form] = Form.useForm();
  const id = editData?.id || randomId();
  const state = Form.useWatch(["address", "state"], form);

  const { provinceOptions, wardOptions } = useAddressSelector(state);

  useEffect(() => {
    if (!errors) return;
    setFormErrors(form, errors);
  }, [errors, form]);

  const onFinish: FormProps<Store>["onFinish"] = async (values: Store) => {
    const formattedData = {
      ...values,
      workEndTime: (values as any).workEndTime?.format("HH:mm") || null,
      id,
      tempId: id,
    };

    if (editData) {
      onEdit?.(formattedData);
    } else {
      onAdd?.(formattedData);
    }
  };

  const handleCancel = () => {
    onClose?.();
    form.resetFields();
  };

  return (
    <Modal
      title={editData ? "Chỉnh sửa thông tin cửa hàng" : "Thêm cửa hàng"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      maskClosable={false}
      centered
      width={"600px"}
      afterOpenChange={(open) => {
        if (!open) {
          form.resetFields();
          return;
        }
        if (!editData) {
          return;
        }
        const formattedData = {
          ...parseFormDataDates(editData),
          workEndTime: editData.workEndTime ? dayjs(`2000-01-01T${editData.workEndTime}`) : null,
        };
        form.setFieldsValue(formattedData);
      }}
      destroyOnClose
    >
      <Form className="flex flex-col" form={form} onFinish={onFinish}>
        <div className="flex flex-col md:gap-2">
          <div className="flex flex-col md:flex-row-reverse gap-6">
            <div style={{ width: 100, height: 100 }} className="ml-auto mr-auto select-none mb-4">
              <AvatarUpload
                shape="square"
                size={100}
                limit={50}
                entity={EntityType.STORE}
                category={FileCategory.IMAGE}
                defaultFile={getMainFile(editData?.image)}
                oId={id}
              />
            </div>
            <div className="flex flex-col md:gap-2 flex-1">
              <Form.Item
                name="code"
                label={<Label title="Mã cửa hàng" required />}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mã cửa hàng",
                  },
                ]}
                className="w-full z-0"
              >
                <Input placeholder="Nhập mã cửa hàng" />
              </Form.Item>

              <Form.Item
                name="name"
                label={<Label title="Tên cửa hàng" required />}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên cửa hàng",
                  },
                ]}
              >
                <Input placeholder="Nhập tên cửa hàng" />
              </Form.Item>
            </div>
          </div>
          <Form.Item
            name="phone"
            label={<Label title="Số điện thoại" required />}
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số điện thoại",
              },
              {
                pattern: /^[0-9]{10,15}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <div className="flex flex-col md:flex-row gap-2.5">
            <Label title="Địa chỉ" required />
            <div className="flex flex-col flex-1">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <Form.Item name={["address", "state"]} rules={[{ required: true, message: "" }]}>
                  <ProvinceSelect
                    options={provinceOptions}
                    onChange={(value) => {
                      form.setFieldValue(["address", "state"], value);
                      form.setFieldValue(["address", "ward"], undefined);
                    }}
                  />
                </Form.Item>
                <Form.Item name={["address", "ward"]} rules={[{ required: true, message: "" }]}>
                  <WardSelect options={wardOptions} />
                </Form.Item>
              </div>
              <Form.Item name={["address", "detail"]}>
                <Input placeholder="Địa chỉ cụ thể" />
              </Form.Item>
            </div>
          </div>
          <Form.Item
            name="email"
            label={<Label title="Email" />}
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item name="taxCode" label={<Label title="Mã số thuế" />}>
            <Input placeholder="Nhập mã số thuế" />
          </Form.Item>

          <Form.Item
            name="workEndTime"
            label={<Label title="Giờ kết thúc làm việc" />}
            extra="Sau giờ này 1 tiếng, các phiếu nháp chưa hoàn thành sẽ được tự động hủy."
          >
            <TimePicker format="HH:mm" minuteStep={5} className="w-full" placeholder="Chọn giờ kết thúc" />
          </Form.Item>

          <Form.Item name="note" label={<Label title="Ghi chú" />}>
            <Input.TextArea
              placeholder="Ghi chú"
              autoSize={{ minRows: 2, maxRows: 6 }}
              count={{
                max: 250,
                show: true,
              }}
            />
          </Form.Item>
        </div>

        <div className="flex w-full justify-center mt-4 action-sticky-bottom">
          <SubmitButton loading={loading} onCancel={handleCancel} />
        </div>
      </Form>
    </Modal>
  );
};
