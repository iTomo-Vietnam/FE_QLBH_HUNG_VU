import { TableColumnConfig, ObjectTableProps } from "@/shared/components";
import { User } from "@/shared/base/entity";
import { UserImage } from "@/shared/components";
import { getMainFile } from "@/shared/utils/file.util";
import { ContentTooltip } from "@/shared/components";
import { UserActiveTag } from "./Tag";
import { useGlobalData } from "@/shared/hooks/useGlobalData";

export const UserTable: React.FC<ObjectTableProps> = ({ ...rest }) => {
  const { currentStore } = useGlobalData();
  const columns: any = [
    {
      title: "Mã ND",
      dataIndex: "code",
      className: "code-column",
      key: "code",
      width: 120,
    },
    {
      title: "Tên ND",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (name: string, record: User) => (
        <div className="flex items-center gap-2">
          <UserImage size={24} image={getMainFile(record.avatar || [])} />
          <span className="block truncate">{name}</span>
        </div>
      ),
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      width: 120,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 100,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 120,
    },
    {
      title: "Vai trò hệ thống",
      dataIndex: "storeUsers",
      key: "roleName",
      width: 150,
      render: (storeUsers: User["storeUsers"]) =>
        storeUsers?.find((membership) => membership.storeId === currentStore?.id)?.role?.name || "--",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 150,
      render: (note: string) => <ContentTooltip width={150} content={note} />,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 80,
      fixed: "right",
      render: (isActive: boolean) => <UserActiveTag value={isActive} />,
    },
  ];
  return (
    <TableColumnConfig
      columns={columns}
      itemName={"tài khoản người dùng"}
      tableKey={"user-table"}
      {...rest}
    />
  );
};
