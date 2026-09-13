import { App, Form, Input, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { CheckIcon, XMarkIcon, LockClosedIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Role } from "../role.model";
import { ActionButtons } from "@/shared/components";

const { Title, Text } = Typography;

interface RoleListProps {
  loading: boolean;
  dataSource: Role[];
  selectedRow: Role | null;
  setSelectedRow: (record: Role) => void;
  onAdd?: (record: Role) => void;
  onEdit?: (record: Role) => void;
  onDelete?: (id: string) => void;
}

export const RoleList: React.FC<RoleListProps> = ({
  loading,
  dataSource,
  selectedRow,
  setSelectedRow,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { modal } = App.useApp();

  useEffect(() => {
    if (!adding) form.resetFields();
  }, [adding, form]);

  const handleDelete = (role: Role) => {
    modal.confirm({
      title: "Xóa vai trò",
      content: `Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`,
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => onDelete?.(role.id),
    });
  };

  return (
    <div className="flex flex-col w-full h-full rounded-lg overflow-hidden">
      <Title level={5} className="!mb-4 !font-bold text-slate-800 dark:!text-gray-100">
        Vai trò
      </Title>
      <div className="flex-1 overflow-y-auto custom-scrollbar scrollbar-hide">
        {loading ? (
          <div className="flex justify-center py-10"><Spin /></div>
        ) : (
          <>
            {dataSource.map((item) => {
              if (editingId === item.id) {
                return (
                  <Form
                    key={item.id}
                    form={editForm}
                    initialValues={{ name: item.name }}
                    onFinish={(values) => {
                      onEdit?.({ ...item, ...values });
                      setEditingId(null);
                    }}
                    className="mb-3"
                  >
                    <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-blue-400">
                      <Form.Item name="name" noStyle rules={[{ required: true }]}>
                        <Input autoFocus />
                      </Form.Item>
                      <button type="submit" className="text-green-500"><CheckIcon className="h-5 w-5" /></button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-red-400"><XMarkIcon className="h-5 w-5" /></button>
                    </div>
                  </Form>
                );
              }

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedRow(item)}
                  className={`relative group flex items-center p-3 mb-3 cursor-pointer rounded-xl border-2 transition-all ${
                    selectedRow?.id === item.id
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <Text className="font-bold text-[14px] truncate" title={item.name}>{item.name}</Text>
                      {item.isDefault && <LockClosedIcon className="h-3.5 w-3.5 text-gray-400" />}
                    </div>
                    <Text className="text-gray-400 text-[12px] block">{item.userCount ?? 0} người dùng</Text>
                  </div>
                  {!item.isDefault && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <ActionButtons
                        onEdit={onEdit ? () => { editForm.setFieldsValue(item); setEditingId(item.id); } : undefined}
                        onDelete={onDelete ? () => handleDelete(item) : undefined}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {onAdd && (adding ? (
              <Form form={form} onFinish={(values) => { onAdd(values as Role); setAdding(false); }} className="mt-2">
                <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-blue-400">
                  <Form.Item name="name" noStyle rules={[{ required: true, message: "Nhập tên vai trò" }]}>
                    <Input autoFocus placeholder="Nhập tên vai trò..." />
                  </Form.Item>
                  <button type="submit" className="text-green-500"><CheckIcon className="h-6 w-6" /></button>
                  <button type="button" onClick={() => setAdding(false)} className="text-red-400"><XMarkIcon className="h-6 w-6" /></button>
                </div>
              </Form>
            ) : (
              <button type="button" onClick={() => setAdding(true)} className="w-full h-12 border-2 border-dashed rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2">
                <PlusIcon className="h-5 w-5" /> Tạo vai trò
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
