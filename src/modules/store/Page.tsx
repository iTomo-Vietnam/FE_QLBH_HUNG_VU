import { AddButton } from "@/shared/components";
import { SortOrder } from "@/shared/constants/enum";
import { useStoreStore } from "./store.store";
import { usePageState } from "@/shared/hooks/usePageState";
import { Store } from "@/shared/base/entity";
import { StoreAddUpdateModal, StoreList } from "./components";
import { useAuth } from "@/shared/hooks/useAuth";
import { useStoreHandlers } from "./store.handlers";

export const StorePage: React.FC = () => {
  const {
    filter,
    reload,

    open,
    setOpen,
    rowData,
    setRowData,

    pageAction,
  } = usePageState<Store>();
  const { getInfo } = useAuth();

  const { data, errors, loading, creating, updating, pagination, create, update, remove, getById } =
    useStoreStore(
      {
        page: 1,
        size: 999,
        reload,
        sortBy: "sortOrder",
        sortOrder: SortOrder.ASC,
        ...filter,
      },
      () => {
        pageAction.handleClose();
        getInfo?.();
      },
    );

  const { handleOpenAdd, handleOpenUpdate, handleDelete } = useStoreHandlers({
    update,
    remove,
    getById,
    setOpen,
    setRowData,
  });

  return (
    <div className="flex flex-col h-full w-full gap-6 sm:gap-10 lg:gap-16 py-3 px-3 sm:px-4 lg:px-6">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-medium text-blue-800 dark:text-blue-200 dark:text-blue-300 mb-1 sm:mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M4.923 4.5h14.154q.212 0 .356.144t.144.357t-.144.356t-.356.143H4.923q-.213 0-.356-.144t-.144-.357t.144-.356t.356-.143m.385 15q-.343 0-.576-.232t-.232-.576V13.5h-.444q-.379 0-.631-.305t-.152-.684l1-4.384q.062-.274.288-.45q.226-.177.514-.177h13.85q.288 0 .514.176q.226.177.288.451l1 4.384q.1.38-.152.684t-.63.305H19.5V19q0 .213-.144.356t-.357.144t-.356-.144T18.5 19v-5.5h-5v5.192q0 .344-.232.576t-.576.232zm.192-1h7v-5h-7zm-1.22-6h15.44zm0 0h15.44l-.928-4H5.208z"
              />
            </svg>
            Danh sách cửa hàng
          </h2>
          <p className="text-sm text-[#64748B] dark:text-gray-400">
            Quản lý thông tin cửa hàng, bao gồm tên, địa chỉ, số điện thoại, email và các thông tin
            khác liên quan đến cửa hàng.
          </p>
        </div>
        <AddButton onOpenAdd={create ? handleOpenAdd : undefined} />
      </div>

      <StoreList
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onEdit={handleOpenUpdate}
        onDelete={handleDelete}
      />

      <StoreAddUpdateModal
        open={open}
        errors={errors}
        loading={creating || updating}
        editData={rowData}
        onAdd={create}
        onEdit={update}
        onClose={pageAction.handleClose}
      />
    </div>
  );
};
