import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PartialFilterProps } from "@/shared/interfaces";
import { GenericFilter } from "./GenericFilter";
import { Fund, FundType } from "@/modules/fund/fund.model";
import { FundMultipleSelect } from "@/modules/fund/components/Select";

export const FundFilter: React.FC<PartialFilterProps<Fund>> = ({ data, setData }) => {
  const value = data.map((item) => item.id);

  return (
    <GenericFilter<Fund>
      data={data}
      selectComponent={
        <FundMultipleSelect
          value={value}
          defaultData={data}
          prefix={<MagnifyingGlassIcon className="h-4" />}
          suffixIcon={null}
          placeholder="Tìm kiếm quỹ..."
          onChangeData={setData}
        />
      }
      renderItem={(item) => (
        <div className="flex min-w-0 flex-col w-[calc(100%-36px)]">
          <span className="truncate">{item.name}</span>
          <span className="truncate text-xs text-[#909090]">{item.code}</span>
        </div>
      )}
      onRemove={(id) => setData(data.filter((item) => item.id !== id))}
    />
  );
};

export const BankFilter: React.FC<PartialFilterProps<Fund>> = ({ data, setData }) => {
  const value = data.map((item) => item.id);

  return (
    <GenericFilter<Fund>
      data={data}
      selectComponent={
        <FundMultipleSelect
          value={value}
          defaultData={data}
          prefix={<MagnifyingGlassIcon className="h-4" />}
          suffixIcon={null}
          placeholder="Tìm kiếm tài khoản ..."
          onChangeData={setData}
          query={{ type: FundType.BANK }}
        />
      }
      renderItem={(item) => (
        <div className="flex min-w-0 flex-col w-[calc(100%-36px)]">
          <span className="truncate">{item.name}</span>
          <span className="truncate text-xs text-[#909090]">{item.code}</span>
        </div>
      )}
      onRemove={(id) => setData(data.filter((item) => item.id !== id))}
    />
  );
};
