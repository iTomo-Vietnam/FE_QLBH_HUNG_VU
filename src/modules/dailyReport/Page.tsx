import React from "react";
import { useNavigate } from "react-router-dom";
import { DailyReportModal } from "./components/DailyReportModal";

export const DailyReportPage: React.FC = () => {
  const navigate = useNavigate();
  return <DailyReportModal open onClose={() => navigate(-1)} />;
};
export default DailyReportPage;
