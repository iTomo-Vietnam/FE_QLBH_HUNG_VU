import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "@/shared/services/socket";
import { SortOrder } from "@/shared/constants/enum";
import { getSessionEndDate, getSessionStartDate } from "@/shared/utils/date.util";
import { Filter, FilterKey, Ranger, Search, SortValue } from "@/shared/interfaces/common";
import useDebounce from "./useDebounce";
import { useGlobalData } from "./useGlobalData";
import { Form } from "antd";
import { Entity } from "../base/entity";

export type TypeShow = "view" | "edit";

interface UsePageStateProps {
  open?: boolean;
  openDetail?: boolean;
  openDelete?: boolean;
  typeShow?: TypeShow;
  page?: number;
  size?: number;
  keyword?: string;
  rowData?: any;
  sortBy?: string;
  sortOrder?: SortOrder;
  startAt?: string;
  endAt?: string;
  status?: string;
  filter?: Filter;

  filterUses?: FilterKey[];
}

export function usePageState<T extends Entity = any>(params?: UsePageStateProps) {
  const { filter, currentStore, handleSetFilter } = useGlobalData();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm<T>();
  const [storeIds, setStoreIds] = useState<string[]>(currentStore ? [currentStore.id] : []);

  useEffect(() => {
    if (currentStore?.id && storeIds.length === 0) {
      setStoreIds([currentStore.id]);
    }
  }, [currentStore?.id, storeIds.length]);
  const [open, setOpen] = useState<boolean>(params?.open || false);
  const [openDetail, setOpenDetail] = useState<boolean>(params?.openDetail || false);
  const [openDelete, setOpenDelete] = useState<boolean>(params?.openDelete || false);
  const [typeShow, setTypeShow] = useState<TypeShow>(params?.typeShow || "edit");
  const [page, setPage] = useState<number>(params?.page || 1);
  const [size, setSize] = useState<number>(params?.size || 20);
  const [keyword, setKeyword] = useState<string>(params?.keyword || "");
  const [rowData, setRowData] = useState<T | undefined>(params?.rowData || undefined);
  const [defaultData, setDefaultData] = useState<Partial<T> | undefined>(undefined);
  const [status, setStatus] = useState<string>(params?.status ?? "all");
  const [type, setType] = useState<string>("all");
  const [dataSource, setDataSource] = useState<T[]>([]);
  const [sortBy, setSortBy] = useState<string | undefined>(params?.sortBy || undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(params?.sortOrder || undefined);
  const [startAt, setStartAt] = useState<string | undefined>(
    params?.startAt || getSessionStartDate(),
  );
  const [endAt, setEndAt] = useState<string | undefined>(params?.endAt || getSessionEndDate());

  const [reload, setReload] = useState<boolean>(false);

  const [ranger, setRanger] = useState<Ranger>({});

  const [search, setSearch] = useState<Search>({});

  const containerRef = useRef<HTMLDivElement>(null);

  const __unCloseAfterSucess = Form.useWatch("__unCloseAfterSucess", form);

  const checkFilterActive = () => {
    // kiểm tra xem các biến filter, sortBy, sortOrder có giá trị khác mặc định hay không
    // ngoại trừ các biến keyword, page, size
    if (params?.filterUses?.length) {
      for (const key of params.filterUses) {
        const v = filter[key];
        if (v !== undefined && v.length > 0) {
          return true;
        }
      }
    }

    for (const key in ranger) {
      if (ranger[key as keyof Ranger]) return true;
    }

    // kiểm tra search
    for (const key in search) {
      if (search[key as keyof Search]) return true;
    }

    if (sortBy !== params?.sortBy) return true;
    if (sortOrder !== params?.sortOrder) return true;
    return false;
  };

  const isFilterActive = checkFilterActive();

  useEffect(() => {
    if (endAt) sessionStorage.setItem("dateRangeEnd", endAt);
    if (startAt) sessionStorage.setItem("dateRangeStart", startAt);
  }, [startAt, endAt]);

  useEffect(() => {
    sessionStorage.setItem("filter", JSON.stringify(filter));
  }, [filter]);

  useEffect(() => {
    socket.on("notification", () => setReload((prev) => !prev));

    return () => {
      socket.off("notification", () => setReload((prev) => !prev));
    };
  }, []);

  function handleSetStoreIds(newStoreIds: string[]) {
    setStoreIds(newStoreIds);
    setPage(1);
  }

  function updateDataSource(newData: T[], page?: number) {
    if (page === 1) {
      setDataSource(newData);
      return;
    }
    setDataSource((prevList) => {
      const updatedList = [...prevList];

      newData.forEach((item) => {
        const index = updatedList.findIndex((i) => i.id === item.id);
        if (index !== -1) updatedList[index] = item;
        else updatedList.push(item);
      });

      return updatedList;
    });
  }

  function handleSortChange(value: SortValue) {
    const isSame = sortBy === value.sortBy && sortOrder === value.sortOrder;
    if (isSame) return;
    setSortBy(value.sortBy);
    setSortOrder(value.sortOrder);
    setPage(1);
    setDataSource([]);
  }

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    setPage(1);
  }

  function handleTypeChange(newType: string) {
    setType(newType);
    setPage(1);
  }

  function handleFilterChange(newFilter?: Filter) {
    handleSetFilter(newFilter || {});
    setPage(1);
  }

  function handleRangerChange(newRanger: Ranger) {
    setRanger(newRanger);
    setPage(1);
  }

  function handleSearchChange(newSearch: Search) {
    setSearch(newSearch);
    setPage(1);
  }

  function handleSearch(value: string) {
    if (value === keyword) return;
    setKeyword(value);
    setPage(1);
  }

  function handleDateRangerChange(startDate?: string, endDate?: string) {
    const isSame = startAt === startDate && endAt === endDate;
    if (isSame) return;
    setStartAt(startDate);
    setEndAt(endDate);
    setPage(1);
  }

  function handleStartAtChange(date: string | undefined) {
    if (date === startAt) return;
    setStartAt(date);
    setPage(1);
  }

  function handleEndAtChange(date: string | undefined) {
    if (date === endAt) return;
    setEndAt(date);
    setPage(1);
  }

  function handleClose(closeDetail: boolean = true) {
    setOpen(false);
    setOpenDelete(false);
    setDefaultData(undefined);
    if (!closeDetail) return;
    setOpenDetail(false);
    setRowData(undefined);
  }

  function resetFilter() {
    handleSetFilter({});
    setRanger({});
    setSearch({});
    setSortBy(params?.sortBy || undefined);
    setSortOrder(params?.sortOrder || undefined);
    setPage(1);
  }

  function handleReload() {
    setReload((prev) => !prev);
  }

  const pageAction = {
    handleSetStoreIds,
    handleFilterChange,
    handleRangerChange,
    handleSearchChange,
    handleSearch,
    handleDateRangerChange,
    handleStartAtChange,
    handleEndAtChange,
    handleSortChange,
    handleStatusChange,
    handleTypeChange,
    handleClose,
    resetFilter,
    handleReload,
  };

  // debounce sort
  const debounceSortBy = useDebounce(sortBy, 500);
  const debounceSortOrder = useDebounce(sortOrder, 500);
  // debounce filter
  const debounceFilter = useDebounce(filter, 500);
  // debounce ranger
  const debounceRanger = useDebounce(ranger, 500);

  return {
    id,
    form,
    __unCloseAfterSucess,
    storeIds,
    open,
    setOpen,
    openDetail,
    setOpenDetail,
    openDelete,
    setOpenDelete,
    typeShow,
    setTypeShow,
    page,
    setPage,
    size,
    setSize,
    keyword,
    setKeyword,
    rowData,
    setRowData,
    defaultData,
    setDefaultData,
    status,
    setStatus,
    type,
    setType,
    dataSource,
    setDataSource,
    sortBy: debounceSortBy,
    setSortBy,
    sortOrder: debounceSortOrder,
    setSortOrder,
    handleSortChange,
    startAt,
    setStartAt,
    endAt,
    setEndAt,

    filter: debounceFilter,
    setFilter: handleSetFilter,

    ranger: debounceRanger,
    setRanger,

    search,
    setSearch,

    reload,
    setReload,

    containerRef,

    updateDataSource,
    isFilterActive,
    pageAction,
  };
}
