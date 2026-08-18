import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["global-search", query],
    queryFn: async () => {
      if (!query || query.length < 2)
        return { customers: [], pets: [], appointments: [], invoices: [], products: [] };

      const [customersResult, petsResult, appointmentsResult, invoicesResult, productsResult] =
        await Promise.all([
          supabase.from("customers").select("*").ilike("name", `%${query}%`).limit(5),
          supabase.from("pets").select("*").ilike("name", `%${query}%`).limit(5),
          supabase.from("appointments").select("*").ilike("customer_id", `%${query}%`).limit(5),
          supabase.from("invoices").select("*").ilike("invoice_number", `%${query}%`).limit(5),
          supabase
            .from("products")
            .select("*")
            .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
            .limit(5),
        ]);

      return {
        customers: customersResult.data || [],
        pets: petsResult.data || [],
        appointments: appointmentsResult.data || [],
        invoices: invoicesResult.data || [],
        products: productsResult.data || [],
      };
    },
    enabled: query.length >= 2,
  });
}
