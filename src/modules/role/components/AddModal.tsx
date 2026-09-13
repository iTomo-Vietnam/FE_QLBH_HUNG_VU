import React, { useEffect } from "react";
import { Input, Modal, Form } from "antd";
import { FormProps } from "antd/lib";
import { Label, SubmitButton } from "@/shared/components";
import { AddUpdateModalProps } from "@/shared/interfaces";
import { setFormErrors } from "@/shared/utils";
import { Role } from "../role.model";
import { Icon } from "@iconify/react";

export const AddRoleModal: React.FC<AddUpdateModalProps<Role>> = ({
  open,
  loading,
  errors,
  onAdd,
  onClose,
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    setFormErrors(form, errors);
  }, [errors, form]);

  const onFinish: FormProps<Role>["onFinish"] = async (values: Role) => {
    onAdd?.(values);
  };

  const handleCancel = () => {
    onClose?.();
    form.resetFields();
  };

  return (
    <Modal
      title={
        <div className="flex gap-2 items-center">
          <div className="p-1 bg-primary rounded-lg flex items-center justify-center w-9 h-9">
            <Icon icon="solar:role-outline" className="text-white w-5 h-5" />
          </div>
          <div>Thêm vai trò</div>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      maskClosable={false}
      centered
      afterOpenChange={(open) => {
        if (!open) {
          form.resetFields();
          return;
        }
      }}
      destroyOnClose
    >
      <Form
        className="flex flex-col mt-4 pt-4 px-4 text-slate-900 dark:text-slate-100"
        form={form}
        onFinish={onFinish}
        layout="vertical"
        initialValues={{}}
      >
        <div className="flex flex-col">
          <Form.Item
            name="name"
            label={<Label title="Tên vai trò" required />}
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên vai trò",
              },
            ]}
            className="w-full"
          >
            <Input placeholder="Nhập tên vai trò" className="h-9 w-full" />
          </Form.Item>
        </div>

        <div className="flex w-full justify-center mt-4">
          <SubmitButton loading={loading} onCancel={handleCancel} />
        </div>
      </Form>
    </Modal>
  );
};
