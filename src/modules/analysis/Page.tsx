import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { useHashTabs } from "@/shared/hooks";
import {
  AnalysisFilterProps,
  CustomerClassificationAnalysis,
  CustomerOverviewAnalysis,
  ProductClassificationAnalysis,
  ProductInventoryAnalysis,
  ProductOverviewAnalysis,
  ReceivableAnalysis,
  SaleOverview,
  SaleProfit,
  TabBar,
} from "./components";
import { analysisTabGroups, AnalysisSection } from "./analysis.navigation";
import { AnalysisPeriod, AnalysisQuery } from "./analysis.model";
import { getDefaultAnalysisPeriod } from "./analysis.util";

const isAnalysisSection = (value?: string): value is AnalysisSection =>
  analysisTabGroups.some((group) => group.key === value);

export const AnalysisPage: React.FC = () => {
  const { getAvailableStores } = useGlobalData();
  const availableStores = getAvailableStores("analysis");
  const { section: sectionParam } = useParams<{ section?: string }>();
  const section: AnalysisSection = isAnalysisSection(sectionParam) ? sectionParam : "sale";
  const currentGroup =
    analysisTabGroups.find((group) => group.key === section) || analysisTabGroups[0];

  const tabItems = useMemo(
    () => currentGroup.tabs.map((tab) => ({ key: tab.key, label: tab.label })),
    [currentGroup],
  );
  const { activeTab, onTabChange } = useHashTabs({ items: tabItems });
  const selectedTab = activeTab || currentGroup.tabs[0].key;

  const [period, setPeriod] = useState<AnalysisPeriod>(getDefaultAnalysisPeriod);
  const [storeIds, setStoreIds] = useState<string[]>([]);

  const query = useMemo<AnalysisQuery>(
    () => ({
      period,
      ...(storeIds.length ? { storeIds } : {}),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
    [period, storeIds],
  );

  const filters: AnalysisFilterProps = {
    period,
    onPeriodChange: setPeriod,
    systemWide: true,
    storeIds,
    availableStores,
    onStoresChange: setStoreIds,
  };

  const renderContent = () => {
    if (section === "sale" && selectedTab === "overview") {
      return <SaleOverview query={query} {...filters} />;
    }

    if (section === "sale" && selectedTab === "profit") {
      return <SaleProfit query={query} {...filters} />;
    }

    if (section === "product" && selectedTab === "overview") {
      return <ProductOverviewAnalysis query={query} {...filters} />;
    }

    if (section === "product" && selectedTab === "inventory") {
      return <ProductInventoryAnalysis query={query} {...filters} />;
    }

    if (section === "product" && selectedTab === "classification") {
      return <ProductClassificationAnalysis query={query} {...filters} />;
    }

    if (section === "customer" && selectedTab === "overview") {
      return <CustomerOverviewAnalysis query={query} {...filters} />;
    }

    if (section === "customer" && selectedTab === "classification") {
      return <CustomerClassificationAnalysis query={query} {...filters} />;
    }

    return <ReceivableAnalysis query={query} {...filters} />;
  };

  return (
    <div className="flex min-h-full gap-4 w-full max-w-7xl mx-auto">
      <TabBar section={section} tabActive={selectedTab} onTabChange={onTabChange} />
      <main className="min-w-0 flex-1">{renderContent()}</main>
    </div>
  );
};
