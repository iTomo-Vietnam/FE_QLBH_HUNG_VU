import { MenuProps } from "antd";
import { Link } from "react-router-dom";
import { privateRoutesName } from "@/shared/constants/routerName";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { checkModule, checkPermission } from "@/shared/utils/permission.util";
import { CubeIcon, DocumentTextIcon, TruckIcon } from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";

type MenuItem = Required<MenuProps>["items"][number];
type IconNode = React.ReactNode;

const item = (key: string, label: string, icon?: IconNode): MenuItem => ({
  key,
  icon,
  label: <Link to={key}>{label}</Link>,
});

const subgroup = (
  key: string,
  label: string,
  icon: IconNode,
  children: MenuItem[],
): MenuItem | null =>
  children.length ? ({ key, type: "submenu", icon, label, children } as MenuItem) : null;

const group = (key: string, label: string, children: MenuItem[]): MenuItem | null =>
  children.length ? ({ key, type: "group", label, children } as MenuItem) : null;

export const SideBarMenuItems = (): MenuItem[] => {
  const { permissions } = useGlobalData();
  const can = (module: Parameters<typeof checkPermission>[1]) => checkModule(permissions, module);

  const overview = group("overview", "Tổng quan", [
    item(
      privateRoutesName.dashboard,
      "Tổng quan",
      <Icon icon="material-symbols:dashboard-outline-rounded" />,
    ),
  ]);

  const orders = subgroup(
    "orders",
    "Đơn hàng",
    <DocumentTextIcon />,
    [
      can("sale") && item(privateRoutesName.sale, "Hóa đơn"),
      can("saleReturn") && item(privateRoutesName.saleReturn, "Trả hàng"),
    ].filter(Boolean) as MenuItem[],
  );

  const products = subgroup(
    "products",
    "Hàng hóa",
    <CubeIcon />,
    [
      can("product") && item(privateRoutesName.product, "Danh sách hàng hóa"),
      can("storeTransfer") && item(privateRoutesName.storeTransfer, "Chuyển kho"),
      can("inventoryAdjustment") && item(privateRoutesName.inventoryAdjustment, "Kiểm kho"),
      can("internalExport") && item(privateRoutesName.internalExport, "Xuất nội bộ"),
    ].filter(Boolean) as MenuItem[],
  );

  const purchases = subgroup(
    "purchases",
    "Mua hàng",
    <TruckIcon />,
    [
      can("supplier") && item(privateRoutesName.supplier, "Nhà cung cấp"),
      can("purchase") && item(privateRoutesName.purchase, "Nhập hàng"),
      can("purchaseReturn") && item(privateRoutesName.purchaseReturn, "Trả hàng nhập"),
    ].filter(Boolean) as MenuItem[],
  );

  const accounting = subgroup(
    "accounting",
    "Kế toán",
    <Icon icon="material-symbols:account-balance-wallet-outline" />,
    [
      can("incomeExpense") && item(privateRoutesName.incomeExpense, "Sổ quỹ"),
      can("transferNote") && item(privateRoutesName.transferNote, "Ghi chú chuyển khoản"),
      // can("fundTransfer") && item(privateRoutesName.fundTransfer, "Chuyển quỹ"),
      // can("fundAdjustment") && item(privateRoutesName.fundAdjustment, "Điều chỉnh số dư"),
      can("debtAdjustment") && item(privateRoutesName.debtAdjustment, "Điều chỉnh công nợ"),
      can("vatAdjustment") && item(privateRoutesName.vatAdjustment, "Điều chỉnh VAT"),
    ].filter(Boolean) as MenuItem[],
  );

  const operations = group(
    "operations",
    "Nghiệp vụ",
    [
      orders,
      products,
      purchases,
      can("customer") &&
        item(privateRoutesName.customer, "Khách hàng", <Icon icon="lucide:users" />),
      accounting,
    ].filter(Boolean) as MenuItem[],
  );

  const analysisAndReports = group(
    "analysis-reports",
    "Phân tích & báo cáo",
    [
      can("analysis") &&
        subgroup("analysis", "Phân tích", <Icon icon="solar:chart-bold" />, [
          item(privateRoutesName.analysis.sale, "Kinh doanh"),
          item(privateRoutesName.analysis.product, "Hàng hóa"),
          item(privateRoutesName.analysis.customer, "Khách hàng"),
          item(privateRoutesName.analysis.effectiveness, "Hiệu quả"),
        ]),
      can("dailyReport") &&
        item(privateRoutesName.dailyReport, "Báo cáo hằng ngày", <Icon icon="solar:chart-2-outline" />),
      can("reports") &&
        ({
          key: "reports-empty",
          label: "Đang hoàn thiện",
          disabled: true,
          icon: <Icon icon="solar:pie-chart-outline" />,
        } as MenuItem),
    ].filter(Boolean) as MenuItem[],
  );

  const setup = subgroup(
    "setup",
    "Thiết lập",
    <Icon icon="material-symbols:rule-settings-rounded" />,
    [
      can("store") && item(privateRoutesName.setup.store, "Cửa hàng"),
      can("attribute") && item(privateRoutesName.setup.attribute, "Danh mục"),
      can("fund") && item(privateRoutesName.fund, "Danh sách quỹ"),
      can("shipper") && item(privateRoutesName.setup.shipper, "Đơn vị vận chuyển"),
      can("user") && item(privateRoutesName.setup.user, "Người dùng"),
      can("role") && item(privateRoutesName.setup.role, "Vai trò hệ thống"),
      can("log") && item(privateRoutesName.setup.log, "Nhật ký thao tác"),
    ].filter(Boolean) as MenuItem[],
  );

  const extensions = group("extensions", "Mở rộng", [setup].filter(Boolean) as MenuItem[]);
  return [overview, operations, analysisAndReports, extensions].filter(Boolean) as MenuItem[];
};
