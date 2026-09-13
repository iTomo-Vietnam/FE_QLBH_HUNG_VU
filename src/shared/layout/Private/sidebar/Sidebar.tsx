import React, { useEffect } from "react";
import { Button, Layout, MenuProps } from "antd";
import CustomMenu from "./Menu";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { Logo } from "@/shared/components";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { privateRoutesName } from "@/shared/constants";
import "./sidebar.css";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

export type SideBarProps = {
  items: MenuItem[];
};

const Sidebar: React.FC<SideBarProps> = ({ items }) => {
  const { collapsed, currentStore } = useGlobalData();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      const activeItem = document.querySelector(".ant-menu-item-selected") as HTMLElement | null;
      activeItem?.scrollIntoView({
        block: "center",
        behavior: "smooth", // hoặc bỏ luôn behavior
      });
    }, 200);
  }, []);

  return (
    <Sider
      theme="dark"
      collapsed={collapsed}
      style={{ background: "#0B2B1C" }}
      width={248}
      collapsedWidth={68}
      className="app-sidebar"
    >
      <div className="sidebar-shell">
        <Logo />
        <div className="px-3.5 pt-3.5 pb-1.5">
          <Button
            type="primary"
            htmlType="button"
            className="sidebar-pos-btn p-0"
            onClick={() => navigate(privateRoutesName.pos)}
          >
            <Icon icon={"material-symbols-light:point-of-sale-rounded"} className="h-5 w-5" />
            <span className="sidebar-pos-label">Bán hàng (POS)</span>
          </Button>
        </div>
        <div className="sidebar-scroll">
          <CustomMenu items={items} />
        </div>
        <div className="sidebar-foot">{currentStore?.name || "Chưa chọn cửa hàng"} · v1.0</div>
      </div>
    </Sider>
  );
};

export default Sidebar;
