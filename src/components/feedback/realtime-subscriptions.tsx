import { useRealtimeAppointments } from "@/hooks/use-realtime";
import { useRealtimeStock } from "@/hooks/use-realtime";
import { useRealtimeInvoices } from "@/hooks/use-realtime";

export function RealtimeSubscriptions() {
  useRealtimeAppointments();
  useRealtimeStock();
  useRealtimeInvoices();

  return null;
}
