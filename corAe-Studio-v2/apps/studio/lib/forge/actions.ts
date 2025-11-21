// apps/studio/lib/forge/actions.ts
"use server";

import { revalidatePath } from "next/cache";

// Keep the signatures simple. Forms call them with FormData.
export async function enqueueSelfTest(_formData: FormData) {
  console.log("[forge] enqueueSelfTest");
  // TODO: enqueue a job or write a memory flag
  revalidatePath("/oms/forge");
}

export async function devPassChecks(_formData: FormData) {
  console.log("[forge] devPassChecks -> mark green");
  // TODO: set a “devChecks:pass” memory/flag
  revalidatePath("/oms/forge");
}

export async function builderConfirm(_formData: FormData) {
  console.log("[forge] builderConfirm -> confirm tag");
  // TODO: write a “builder:confirmed” memory/flag
  revalidatePath("/oms/forge");
}
