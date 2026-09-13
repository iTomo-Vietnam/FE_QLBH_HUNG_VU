import React, { useEffect } from "react";
import { Col, Empty, Form, Input, Modal, Row } from "antd";
import { SortableItem, SubmitButton, Title } from "@/shared/components";
import { Label } from "@/shared/components";
import { AddUpdateModalProps } from "@/shared/interfaces/common";
import { setFormErrors } from "@/shared/utils/form.util";
import { handleCloseWithPendingFiles, randomId } from "@/shared/utils/common.util";
import { formatFormData, makeFormListEnterHandler, parseFormDataDates } from "@/shared/utils";
import { useAppMessage, useAutoResetItem } from "@/shared/hooks";
import { RoleSelect } from "@/modules/role/components/Select";
import { User } from "../user.model";
import { Store } from "@/shared/base/entity";
import { StoreMultipleSelect } from "@/modules/store/components/Select";
import { MagnifyingGlassIcon, TrashIcon } from "@/shared/icons";
import { ReactSortable } from "react-sortablejs";

export const AddUpdateModal: React.FC<AddUpdateModalProps<User>> = ({
  open,
  editData,
  loading,
  errors,
  onAdd,
  onEdit,
  onClose,
}) => {
  const [form] = Form.useForm<User>();
  const [defaultValue, setDefaultValue] = useAutoResetItem<Store>();
  const id = editData?.id || randomId();
  const storeUsers = Form.useWatch("storeUsers", form) || [];
  const hideStores = storeUsers
    .map((storeUser) => storeUser.store)
    .filter((store): store is Store => Boolean(store));

  const { message, showFormErrorMessages } = useAppMessage();

  useEffect(() => {
    if (errors) setFormErrors(form, errors);
  }, [errors, form]);

  const submit = async (values: User) => {
    const payload = formatFormData({ ...values, id, tempId: id });
    editData ? onEdit?.(payload) : onAdd?.(payload);
  };

  const colgroupWidthConfig = [undefined, 220, 32];
  return (
    <Modal
      open={open}
      title={editData ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
      footer={null}
      destroyOnClose
      width={680}
      centered
      maskClosable={false}
      className="fullscreen-modal"
      onCancel={() => handleCloseWithPendingFiles(id, onClose)}
      afterOpenChange={(isOpen) => {
        if (!isOpen) {
          form.resetFields();
          return;
        }

        if (!editData) {
          form.resetFields();
          return;
        }

        form.setFieldsValue(parseFormDataDates({ ...editData, password: "********" }));
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={submit}
        onFinishFailed={showFormErrorMessages}
        className="flex flex-col h-full"
        initialValues={{
          isActive: true,
        }}
      >
        <Row gutter={[32, 0]}>
          <Col xs={24} lg={12}>
            <Form.Item
              name="name"
              label={<Label title="Tên người dùng" required />}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item name="code" label={<Label title="Mã người dùng" />}>
              <Input placeholder="Tự động" />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item
              name="username"
              label={<Label title="Tên đăng nhập" required />}
              rules={[{ required: true }]}
            >
              <Input autoComplete="new-username" placeholder="VD: hungvu" />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item
              name="password"
              label={<Label title="Mật khẩu" required />}
              rules={[{ required: true }]}
            >
              <Input.Password autoComplete="new-password" disabled={!!editData} />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item name="email" label="Email">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item name="phone" label="Số điện thoại">
              <Input />
            </Form.Item>
          </Col>
          {/* <Col xs={24} lg={12}>
            <Form.Item name="roleId" label="Vai trò">
              <RoleSelect
                defaultData={role}
                onChangeData={(data) => form.setFieldValue("role", data)}
              />
            </Form.Item>
            <Form.Item name="role" hidden />
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item name="isActive" label="Đang hoạt động" valuePropName="checked">
              <AppSwitch label="Cho phép truy cập hệ thống" />
            </Form.Item>
          </Col> */}
          <Col xs={24}>
            <Form.List name="storeUsers">
              {(fields, { add, remove }) => (
                <div
                  className={`flex flex-col w-full min-h-56 mt-4`}
                  onKeyDown={makeFormListEnterHandler(
                    {
                      type: "select",
                      message: "Vui lòng chọn khách hàng ở ô tìm kiếm để thêm vào danh sách",
                    },
                    { messageApi: message },
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Title content="Danh sách cửa hàng" />

                    <div className="w-96">
                      <StoreMultipleSelect
                        defaultData={defaultValue ? [defaultValue] : undefined}
                        value={defaultValue ? [defaultValue.id] : undefined}
                        onChangeData={(values) => {
                          const value = values?.[0];
                          if (!value) return;
                          setDefaultValue(value);
                          add({
                            storeId: value.id,
                            store: value,
                            roleId: null,
                            tempId: randomId(),
                          });
                        }}
                        hideOptions={hideStores}
                        prefix={<MagnifyingGlassIcon className="w-6 h-6 text-secondary" />}
                        suffixIcon={false}
                        placeholder="Chọn cửa hàng được phép truy cập"
                      />
                    </div>
                  </div>

                  <ReactSortable
                    list={storeUsers.map((v: any) => ({
                      ...v,
                      id: v.tempId,
                    }))}
                    setList={(newState) => {
                      form.setFieldValue(
                        "storeUsers",
                        newState.map(({ id, ...rest }) => rest),
                      );
                    }}
                    animation={200}
                    handle=".drag-handle"
                  >
                    {fields.map(({ key: fieldKey, name }) => {
                      const store = storeUsers?.[name]?.store;

                      return (
                        <SortableItem key={fieldKey} colgroupWidthConfig={colgroupWidthConfig}>
                          <tr className="border-b">
                            <td>
                              <div className="flex items-center gap-2 p-2">
                                <span className="block truncate">{store?.name}</span>
                              </div>
                            </td>

                            <td className="px-2">
                              <Form.Item
                                name={[name, "roleId"]}
                                className="mb-0"
                                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                              >
                                <RoleSelect
                                  defaultData={storeUsers?.[name]?.role}
                                  query={{ storeId: store?.id }}
                                  onChangeData={(selectedRole) =>
                                    form.setFieldValue(["storeUsers", name, "role"], selectedRole)
                                  }
                                />
                              </Form.Item>
                            </td>

                            <td className="pr-2">
                              <div className="flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={() => remove(name)}
                                  className="text-red-400 hover:text-red-500"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </SortableItem>
                      );
                    })}
                  </ReactSortable>

                  {fields.length === 0 && (
                    <div className="flex flex-col w-full justify-center items-center text-gray-400">
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Hãy thêm dữ liệu vào danh sách"
                      />
                    </div>
                  )}
                </div>
              )}
            </Form.List>
          </Col>
        </Row>

        <div className="flex w-full justify-center mt-auto mb-0 action-sticky-bottom">
          <SubmitButton
            loading={loading}
            onCancel={() => handleCloseWithPendingFiles(id, onClose)}
          />
        </div>
      </Form>
    </Modal>
  );
};
