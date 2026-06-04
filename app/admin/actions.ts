"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

function generateTicketNumber(index: number) {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  const indexPart = String(index + 1).padStart(2, "0");

  return `NW-${randomPart}-${indexPart}`;
}

export async function closeCompetition(formData: FormData) {
  const competitionId = String(formData.get("competitionId") || "");

  if (!competitionId) {
    throw new Error("Competition ID is required.");
  }

  const { error } = await supabase
    .from("competitions")
    .update({ status: "closed" })
    .eq("id", competitionId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/competitions");
  revalidatePath("/");
}

export async function reopenCompetition(formData: FormData) {
  const competitionId = String(formData.get("competitionId") || "");

  if (!competitionId) {
    throw new Error("Competition ID is required.");
  }

  const { error } = await supabase
    .from("competitions")
    .update({ status: "active" })
    .eq("id", competitionId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/competitions");
  revalidatePath("/");
}

export async function markOrderAsPaid(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");

  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, competition_id, quantity, payment_status")
    .eq("id", orderId)
    .single();

  if (orderError) {
    throw new Error(orderError.message);
  }

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.payment_status === "paid") {
    revalidatePath("/admin");
    revalidatePath("/my-entries");
    return;
  }

  const { data: existingEntries, error: existingEntriesError } = await supabase
    .from("entries")
    .select("id")
    .eq("order_id", order.id);

  if (existingEntriesError) {
    throw new Error(existingEntriesError.message);
  }

  if (existingEntries && existingEntries.length > 0) {
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateOrderError) {
      throw new Error(updateOrderError.message);
    }

    revalidatePath("/admin");
    revalidatePath("/my-entries");
    return;
  }

  const entriesToCreate = Array.from({ length: order.quantity }).map(
    (_, index) => ({
      user_id: order.user_id,
      competition_id: order.competition_id,
      order_id: order.id,
      ticket_number: generateTicketNumber(index),
      status: "confirmed",
    })
  );

  const { error: insertEntriesError } = await supabase
    .from("entries")
    .insert(entriesToCreate);

  if (insertEntriesError) {
    throw new Error(insertEntriesError.message);
  }

  const { error: updateOrderError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (updateOrderError) {
    throw new Error(updateOrderError.message);
  }

  revalidatePath("/admin");
  revalidatePath("/my-entries");
}