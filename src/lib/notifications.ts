import { supabase } from "./supabase/client";

export async function sendNotification(params: {
  user_id?: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "ALERT" | "REMINDER";
  data?: Record<string, unknown>;
}) {
  await supabase.from("notifications").insert({
    ...params,
    is_read: false,
    created_at: new Date().toISOString(),
  });
}
