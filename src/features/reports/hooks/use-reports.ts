import { useQuery } from "@tanstack/react-query";
import {
  getRevenueReport,
  getProfitLossReport,
  getInventoryValuationReport,
} from "../services/report.service";

export function useRevenueReport(
  startDate: string,
  endDate: string,
  groupBy: "day" | "week" | "month",
  callerUserId: string
) {
  return useQuery({
    queryKey: ["reports", "revenue", startDate, endDate, groupBy],
    queryFn: async () => getRevenueReport(startDate, endDate, groupBy, callerUserId),
    enabled: !!startDate && !!endDate && !!callerUserId,
  });
}

export function useProfitLossReport(startDate: string, endDate: string, callerUserId: string) {
  return useQuery({
    queryKey: ["reports", "profit-loss", startDate, endDate],
    queryFn: async () => getProfitLossReport(startDate, endDate, callerUserId),
    enabled: !!startDate && !!endDate && !!callerUserId,
  });
}

export function useInventoryValuationReport(asOfDate: string, callerUserId: string) {
  return useQuery({
    queryKey: ["reports", "inventory", asOfDate],
    queryFn: async () => getInventoryValuationReport(asOfDate, callerUserId),
    enabled: !!asOfDate && !!callerUserId,
  });
}
