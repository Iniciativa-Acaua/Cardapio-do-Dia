// lib/queries/store.ts
import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { businessHours, deliveryZones } from "@/db/schema";

const TZ = "America/Sao_Paulo"; // fuso do restaurante

function nowInStore() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")),
    time: `${get("hour")}:${get("minute")}:${get("second")}`,
  };
}

// Não usa cache: o resultado depende da hora atual.
export async function getOpenStatus() {
  const { weekday, time } = nowInStore();
  const rows = await db
    .select()
    .from(businessHours)
    .where(eq(businessHours.weekday, weekday));

  const open = rows.some((r) => !r.isClosed && r.opensAt <= time && time < r.closesAt);
  const today = rows.find((r) => !r.isClosed);

  return {
    open,
    todayLabel: today
      ? `${today.opensAt.slice(0, 5)} às ${today.closesAt.slice(0, 5)}`
      : null,
  };
}

export async function getDeliveryZones() {
  return db
    .select({
      id: deliveryZones.id,
      name: deliveryZones.name,
      feeCents: deliveryZones.feeCents,
      minOrderCents: deliveryZones.minOrderCents,
    })
    .from(deliveryZones)
    .where(eq(deliveryZones.active, true))
    .orderBy(asc(deliveryZones.name));
}