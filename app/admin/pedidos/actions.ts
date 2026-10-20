"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orderStatusHistory, orders, payments } from "@/db/schema";
import { exigirEquipe } from "@/lib/admin";
import { proximosStatus } from "@/lib/admin-orders";

const statusSchema = z.enum([
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export async function mudarStatus(orderId: string, novoStatus: string, _formData?: FormData) {
  const { user } = await exigirEquipe();

  const id = z.uuid().safeParse(orderId);
  const status = statusSchema.safeParse(novoStatus);
  if (!id.success || !status.success) return;

  await db.transaction(async (tx) => {
    const [pedido] = await tx
      .select({ status: orders.status, fulfillmentType: orders.fulfillmentType })
      .from(orders)
      .where(eq(orders.id, id.data))
      .for("update") // dois atendentes clicando ao mesmo tempo não se atropelam
      .limit(1);
    if (!pedido) return;

    const [pag] = await tx
      .select({ id: payments.id, method: payments.method, status: payments.status })
      .from(payments)
      .where(eq(payments.orderId, id.data))
      .limit(1);

    const permitidos = proximosStatus({
      status: pedido.status,
      fulfillmentType: pedido.fulfillmentType,
      paymentMethod: pag?.method ?? null,
      paymentStatus: pag?.status ?? null,
    });
    if (!permitidos.includes(status.data)) return;

    await tx.update(orders).set({ status: status.data }).where(eq(orders.id, id.data));
    await tx.insert(orderStatusHistory).values({
      orderId: id.data,
      status: status.data,
      changedBy: user.id,
    });

    if (pag) {
      // pagou ao receber ou retirar
      if (status.data === "delivered" && pag.method !== "online" && pag.status === "pending") {
        await tx
          .update(payments)
          .set({ status: "paid", paidAt: new Date() })
          .where(eq(payments.id, pag.id));
      }
      // cancelado sem ter sido pago
      if (status.data === "cancelled" && pag.status === "pending") {
        await tx.update(payments).set({ status: "failed" }).where(eq(payments.id, pag.id));
      }
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id.data}`);
}