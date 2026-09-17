import { useQuery } from "@tanstack/react-query";
import { activities, dashboardSummary, gear, goals, runnerProfile } from "../data/sample-data";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => ({ summary: dashboardSummary, profile: runnerProfile }),
  });
}

export function useActivities() {
  return useQuery({
    queryKey: ["activities"],
    queryFn: async () => activities,
  });
}

export function useGear() {
  return useQuery({
    queryKey: ["gear"],
    queryFn: async () => gear,
  });
}

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => goals,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => runnerProfile,
  });
}
