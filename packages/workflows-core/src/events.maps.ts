import { on, queue } from "./events";

on("finance.po.issued",       async (inst) => {/* write PO → OBARI */});
on("finance.so.issued",       async (inst) => {/* write SO → OBARI */});
on("finance.po_so.issued",    async (inst) => { /* stage=BOOKING */ await queue("operations.obari.booking.v1", inst.ctx); });

on("obari.stage.active",      async (inst) => queue("operations.obari.active.v1",    inst.ctx));
on("obari.stage.reporting",   async (inst) => queue("operations.obari.reporting.v1", inst.ctx));
on("obari.reporting.approved",async (inst) => queue("finance.invoice.close.v1",      inst.ctx));
