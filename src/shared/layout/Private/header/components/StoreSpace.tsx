import { Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { privateRoutesName } from "../../../../constants/routerName";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { StoreImage } from "@/shared/components";
import { CSS } from "@/shared/constants/ui";
import { getMainFile } from "@/shared/utils/file.util";
import { checkModule } from "@/shared/utils/permission.util";
import { CheckIcon, ServerStackIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CaretDownFilled } from "@ant-design/icons";

export const StoreSpace: React.FC = () => {
  const [showStores, setShowStores] = useState(false);
  const storeIconRef = useRef<HTMLDivElement>(null);
  const storeTableRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { allStores, permissions, currentStore, isMobile, horizontal, handleSetCurrentStore } =
    useGlobalData();

  useEffect(() => {
    if (isMobile) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        storeIconRef.current &&
        !storeIconRef.current.contains(event.target as Node) &&
        storeTableRef.current &&
        !storeTableRef.current.contains(event.target as Node)
      ) {
        setShowStores(false);
      }
    };
    if (showStores) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showStores, isMobile]);

  return (
    <div className="flex gap-2 items-center w-56">
      <div className="rounded-full flex h-7 w-7 justify-center items-center overflow-hidden bg-gray-100">
        {currentStore ? (
          <StoreImage image={getMainFile(currentStore.image)} size={28} shape="circle" />
        ) : (
          <ServerStackIcon className="h-4 w-4 text-gray-500" />
        )}
      </div>
      <section
        className={`flex items-center cursor-pointer relative select-none h-8 p-1 pr-3 rounded-lg ${
          horizontal ? "hover:bg-[#b9d1e4]" : "hover:bg-gray-100"
        } transition-all ease-in-out`}
        style={{ width: "calc(100% - 40px)" }}
        ref={storeIconRef}
        onClick={() => setShowStores((prev) => !prev)}
      >
        <Typography.Text className="flex w-full justify-between gap-2 font-medium text-sm text-[#333] truncate">
          <span
            className="truncate min-w-[56px] max-w-[140px]"
            title={currentStore?.name || "Chưa chọn cửa hàng"}
          >
            {currentStore?.name || "Chưa chọn cửa hàng"}
          </span>
          <CaretDownFilled className="text-[#666]" />
        </Typography.Text>

        {showStores && (
          <div
            className="absolute flex flex-col min-w-[342px] gap-4 -left-10 xl:left-auto xl:right-0 p-3 top-12 sm:right-0 -mt-2 bg-white drop-shadow-2xl !rounded-xl z-50 store__table w-28"
            ref={storeTableRef}
            onClick={(event) => event.stopPropagation()}
            style={CSS.container}
          >
            <div className="flex justify-between items-center h-8 text-[#333]">
              <span className="font-medium">Chuyển cửa hàng</span>
              <button
                className="h-8 w-8 p-[6px] bg-slate-100 rounded text-gray-400 hover:text-gray-500"
                onClick={() => setShowStores(false)}
              >
                <XMarkIcon />
              </button>
            </div>
            <div className="flex flex-col gap-1 h-[200px] overflow-y-auto">
              {allStores.map((store) => (
                <div
                  key={store.id}
                  className="flex gap-2 h-10 px-2 py-[6px] items-center transition-all ease-in-out hover:bg-gray-100 rounded-normal"
                  onClick={() => {
                    setShowStores(false);
                    if (currentStore?.id !== store.id) handleSetCurrentStore(store);
                  }}
                >
                  <div className="flex items-center justify-center h-6 w-6">
                    {currentStore?.id === store.id && <CheckIcon className="text-gray-500 h-4 w-4" />}
                  </div>
                  <div className="rounded-full flex gap-2 h-7 w-7 justify-center items-center overflow-hidden">
                    <StoreImage image={getMainFile(store.image)} size={28} shape="circle" />
                  </div>
                  <span className="w-[calc(100%-68px)] truncate" title={store.name}>
                    {store.name}
                  </span>
                </div>
              ))}
            </div>
            {checkModule(permissions, "store") && (
              <button
                className="flex h-10 justify-center items-center bg-gray-50 border hover:bg-gray-100 transition-all ease-in-out font-medium gap-2 rounded-md text-[#666]"
                onClick={() => {
                  navigate(privateRoutesName.setup.store);
                  setShowStores(false);
                }}
              >
                <ServerStackIcon className="h-6 w-6" /> Quản lý cửa hàng
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
