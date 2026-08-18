import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeAppointments() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("appointments-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["appointments"] });
          if (payload.eventType === "UPDATE") {
            console.log("Appointment updated:", payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useRealtimeStock() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("stock-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          if (payload.eventType === "UPDATE") {
            const newStock = (payload.new as { stock?: number }).stock;
            if (typeof newStock === "number" && newStock <= 10) {
              console.warn("Low stock alert:", payload.new);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useRealtimeInvoices() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("invoices-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invoices",
        },
        (_payload) => {
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
