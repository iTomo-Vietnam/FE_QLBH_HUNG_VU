import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftStartOnRectangleIcon,
  LockClosedIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Typography, Dropdown, MenuProps, App } from "antd";
import AccountInformation from "./AccountInformation";
import ChangePassword from "./ChangePassword";
import { useAuth } from "@/shared/hooks/useAuth";
import { publicRoutesName } from "@/shared/constants/routerName";
import socket from "@/shared/services/socket";
import { UserImage } from "@/shared/components";
import { getMainFile } from "@/shared/utils/file.util";
import { useGlobalData } from "@/shared/hooks/useGlobalData";

type UserBarProps = {};

const { Text } = Typography;

const UserBar: React.FC<UserBarProps> = ({}) => {
  const navigate = useNavigate();

  const { modal } = App.useApp();
  const { info } = useGlobalData();
  const [openModalInfo, setOpenModalInfo] = useState(false);
  const [openModalChangePassword, setOpenModalChangePassword] = useState<boolean>(false);

  const { logout, getInfo } = useAuth();

  const handleLogout = () => {
    modal.confirm({
      title: "Đăng xuất",
      content: "Xác nhận đăng xuất",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => {
        logout();
        setTimeout(() => {
          navigate(publicRoutesName.login);
        }, 1000);
      },
    });
  };

  useEffect(() => {
    socket.on("role-update", getInfo);
    return () => {
      socket.off("role-update", getInfo);
    };
  }, []);

  const items: MenuProps["items"] = [
    {
      key: "info",
      label: "Thông tin tài khoản",
      icon: <UserCircleIcon className="w-5 h-5" />,
      onClick: () => setOpenModalInfo(true),
    },
    {
      key: "changePassword",
      label: "Đổi mật khẩu",
      icon: <LockClosedIcon className="w-5 h-5" />,
      onClick: () => setOpenModalChangePassword(true),
    },
    // {
    //   key: "settings",
    //   label: "Cài đặt",
    //   icon: <Cog6ToothIcon className="w-5 h-5" />,
    //   onClick: () => navigate(privateRoutesName.setting),
    // },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      onClick: () => {
        handleLogout();
        localStorage.clear();
        sessionStorage.clear();
      },
      icon: <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex justify-end">
      <Dropdown menu={{ items }} trigger={["click"]} className="cursor-pointer">
        <section className="flex flex-row items-center gap-2" onClick={(e) => e.preventDefault()}>
          <div className="flex h-8 w-8 justify-center items-center rounded-full overflow-hidden flex-shrink-0">
            <UserImage image={getMainFile(info?.avatar)} isHiddenPreview />
          </div>
          <div className="hidden md:flex flex-row items-center">
            <div className="flex flex-col select-none">
              <Text className="font-semibold leading-5">{info?.name}</Text>
              <Text className="text-gray-400 truncate leading-5">
                {info?.storeUsers?.find((membership) => membership.storeId === info.currentStore?.id)?.role
                  ?.name || info?.username || info?.code}
              </Text>
            </div>
          </div>
        </section>
      </Dropdown>
      <AccountInformation open={openModalInfo} onClose={() => setOpenModalInfo(false)} />
      <ChangePassword
        open={openModalChangePassword}
        onClose={() => setOpenModalChangePassword(false)}
      />
    </div>
  );
};

export default UserBar;
