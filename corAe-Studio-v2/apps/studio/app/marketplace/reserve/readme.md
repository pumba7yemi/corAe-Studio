// apps/studio/app/marketplace/reserve/readme.md
# 🕓 corAe Reserve™

**Hub of BDO • Staging Post for BTDO**

---

## 🌍 Overview
**corAe Reserve™** is the central booking and brokerage hub of the corAe ecosystem.  
It governs the flow of **Book → (Trade) → Deal → Order**, acting as the active broker layer
between customers, vendors, Workflow Partners™, and other corAe engines.

Reserve underpins the **Marketplace Core**, enabling structured transactions
for products, services, repairs, logistics, salon appointments, and more.

---

## 🧠 Core Principles

| Principle | Description |
|------------|--------------|
| **BDO Hub** | Default simple flow for Book → Deal → Order |
| **BTDO Staging Post** | Extended flow with Trade & Pricelock Chain™ |
| **The Deal is Sovereign** | All transactions culminate in corAe Confirmed™ |
| **Broker Everything** | Reserve brokers not only tables or slots — but any resource or service |
| **CIMS Integration** | Auto-messages confirmations and updates |
| **OBARI Link** | Produces and manages Orders → Invoices |
| **Work OS Link** | Assigns tasks to Workflow Partners™ in real time |

---

## 🧩 Directory Layout

apps/studio/app/marketplace/reserve/ │ ├── api/                    # Next.js API routes │   ├── create.ts           # POST: new reservation │   ├── elevate.ts          # POST: elevate to BTDO │   ├── pricelock.ts        # POST: link Pricelock Chain™ │   ├── confirm.ts          # POST: confirm Deal │   ├── dispatch.ts         # POST: dispatch Order to Work OS │   ├── timeline.ts         # GET: combined BDO/BTDO timeline │   ├── deals.ts            # GET: list Deals │   ├── orders.ts           # GET: list Orders │   ├── trades.ts           # GET: list BTDO reservations │   └── reservations.ts     # GET: list Reservations │ ├── dashboard/              # React dashboard UI │   ├── components/         # BookQueue, DealDesk, OrderBoard, BtdoRail │   └── page.tsx            # Hub view │ ├── hooks/                  # Custom React hooks │   └── useReserveFlow.ts   # Unified flow controller │ ├── laws/                   # Constitutional logic for transitions │   └── btdo.law.ts │ ├── tests/                  # Vitest suites │   └── reserve.test.ts │ ├── manifest.ts             # Engine registration ├── types.ts                # Shared DTOs ├── utils.ts                # Helper functions ├── middleware.ts           # API guards and logging └── index.ts                # Unified export layer

---

## ⚙️ Integration Hooks

| System | Purpose |
|---------|----------|
| **CIMS™** | Handles event messages and confirmations |
| **OBARI™** | Converts confirmed Deals → Orders → Invoices |
| **Finance** | Reconciliation and commission settlement |
| **Work OS** | Task allocation for active Orders |
| **Unwind™** | Feeds customer discovery into Reserve |

---

## 🚀 Events Emitted
| Event | Description |
|--------|-------------|
| `reserve.booked` | new reservation created |
| `reserve.trade.opened` | elevated to BTDO |
| `reserve.pricelocked` | price locked under Pricelock Chain™ |
| `reserve.deal.confirmed` | Deal finalized under corAe Confirmed™ |
| `reserve.order.dispatched` | Work OS dispatch initiated |

---

## 🧪 Testing
Run tests via:
```bash
npx vitest run apps/studio/app/marketplace/reserve/tests


---

📚 References

BTDO Law — /laws/btdo.law.ts

CIMS Messaging Adapter — /api/cims.ts

Unified Schema — /app/prisma/schema.prisma



---

© corAe OS² — The Operating System for a New Kind of Life™
---

## ⚙️ Integration Hooks

| System | Purpose |
|---------|----------|
| **CIMS™** | Handles event messages and confirmations |
| **OBARI™** | Converts confirmed Deals → Orders → Invoices |
| **Finance** | Reconciliation and commission settlement |
| **Work OS** | Task allocation for active Orders |
| **Unwind™** | Feeds customer discovery into Reserve |

---

## 🚀 Events Emitted
| Event | Description |
|--------|-------------|
| `reserve.booked` | new reservation created |
| `reserve.trade.opened` | elevated to BTDO |
| `reserve.pricelocked` | price locked under Pricelock Chain™ |
| `reserve.deal.confirmed` | Deal finalized under corAe Confirmed™ |
| `reserve.order.dispatched` | Work OS dispatch initiated |

---

## 🧪 Testing
Run tests via:
```bash
npx vitest run apps/studio/app/marketplace/reserve/tests