import { useEffect, useState } from "react";
import { Role } from "./role.model";
import { Card } from "antd";
import { RoleList, RolePermission } from "./partials";
import { useRoleStore } from "./role.store";
import { SortOrder } from "@/shared/constants/enum";
import { useGlobalData } from "@/shared/hooks";

export const RolePage: React.FC = () => {
  const { currentStore } = useGlobalData();
  const [selectedRow, setSelectedRow] = useState<Role | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const { loading, data, creating, updating, deleting, create, update, remove } = useRoleStore({
    sortOrder: SortOrder.ASC,
    sortBy: "name",
    page: 1,
    size: 999,
    storeId: currentStore?.id,
  });

  useEffect(() => {
    if (data.length === 0) return;
    const newRow = data.find((item) => item.id === selectedRow?.id);

    if (newRow) return;

    setSelectedRow(data[0]);
  }, [data, selectedRow]);

  return (
    <div className="flex flex-row h-full gap-3">
      <Card className="w-72" classNames={{ body: "!p-3 h-full" }}>
        <RoleList
          dataSource={data}
          loading={loading || creating || updating || deleting}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          onAdd={create}
          onEdit={update}
          onDelete={remove}
        />
      </Card>

      <Card className="flex-1 flex flex-col" classNames={{ body: "!p-3 h-full" }}>
        <RolePermission
          loading={loading || creating || updating || deleting}
          selectedRow={selectedRow}
          onUpdateRolePermission={update}
          onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
        />
      </Card>
    </div>
  );
};
