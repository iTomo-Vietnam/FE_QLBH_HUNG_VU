import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { Order } from "@/modules/order/order.model";
import { OrderMultipleSelect } from "@/modules/order/components/Select";
import { PartialFilterProps } from "@/shared/interfaces/common";
import { GenericFilter } from "./GenericFilter";
import { formatDate } from "@/shared/utils/date.util";

export const OrderFilter: React.FC<PartialFilterProps<Order>> = ({ data, setData }) => {
  const value = data.map((item) => item.id);

  return (
    <GenericFilter<Order>
      data={data}
      selectComponent={
        <OrderMultipleSelect
          value={value}
          defaultData={data}
          prefix={<MagnifyingGlassIcon className="h-4" />}
          suffixIcon={null}
          placeholder=""
          onChangeData={setData}
        />
      }
      renderItem={(item) => (
        <div className="flex min-w-0 flex-col w-[calc(100%-36px)]">
          <span className="truncate">{item.code}</span>
          <span className="truncate text-xs text-[#909090]">{formatDate(item.orderAt)}</span>
        </div>
      )}
      onRemove={(id) => setData(data.filter((item) => item.id !== id))}
    />
  );
};
