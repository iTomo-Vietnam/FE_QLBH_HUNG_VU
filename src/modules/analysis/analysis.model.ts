export type AnalysisSortBy = "revenue" | "returns" | "netRevenue" | "grossProfit" | "invoiceCount";

export type AnalysisPeriod = string;

export interface AnalysisQuery {
  period: AnalysisPeriod;
  storeId?: string;
  storeIds?: string[];
  sortBy?: AnalysisSortBy;
  timezone?: string;
}

export interface AnalysisRange {
  token: string;
  startAt: string;
  endAt: string;
  endExclusive: string;
  days: number;
  granularity: "day" | "week" | "month";
  labels: string[];
}

export interface AnalysisMetric {
  value: number;
  averagePerDay: number;
  growth: number;
}

export interface AnalysisTopRow {
  id: string;
  name: string;
  revenue: number;
  returns: number;
  netRevenue: number;
  grossProfit: number;
  invoiceCount: number;
  returnQuantity: number;
  returnRatio: number;
  averageOrder: number;
  margin: number;
  growth: number;
}

export interface AnalysisBranchRow {
  branch: string;
  revenue: number;
  returns: number;
  netRevenue: number;
  totalCost: number;
  grossProfit: number;
  invoiceCount: number;
}

export interface SaleOverviewData {
  range: AnalysisRange;
  metrics: Record<"invoiceCount" | "revenue" | "paymentValue" | "netRevenue" | "totalCost" | "grossProfit", AnalysisMetric>;
  chart: { labels: string[]; series: { name: string; data: number[] }[] };
  branches: AnalysisBranchRow[];
  sortBy: AnalysisSortBy;
  topProductGroups: AnalysisTopRow[];
  topProducts: AnalysisTopRow[];
  topCustomerGroups: AnalysisTopRow[];
}

export interface SaleOverviewMetricsData {
  range: AnalysisRange;
  metrics: SaleOverviewData["metrics"];
}

export interface SaleBusinessIndicatorData {
  range: AnalysisRange;
  businessIndicator: SaleOverviewData["chart"];
  branches: AnalysisBranchRow[];
}

export interface AnalysisTopData {
  range: AnalysisRange;
  sortBy: AnalysisSortBy;
  rows: AnalysisTopRow[];
}

export interface CostStructureRow {
  name: string;
  total: number;
  percent: number;
  branchData: { branch: string; value: number }[];
}

export interface ProfitDetailRow {
  key: string;
  name: string;
  total: number;
  branchData?: { branch: string; value: number }[];
}

export interface SaleProfitData {
  range: AnalysisRange;
  metrics: Record<string, AnalysisMetric>;
  costStructure: CostStructureRow[];
  effectiveness: ProfitDetailRow[];
}

export interface SaleProfitMetricsData {
  range: AnalysisRange;
  metrics: SaleProfitData["metrics"];
}

export interface SaleProfitCostStructureData {
  range: AnalysisRange;
  costStructure: CostStructureRow[];
}

export interface SaleProfitEffectivenessData {
  range: AnalysisRange;
  effectiveness: ProfitDetailRow[];
}

export interface GenericAnalysisData {
  range: AnalysisRange;
  metrics: Record<string, AnalysisMetric>;
  rows: Record<string, unknown>[];
}
