"use client";

import { useState, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SagaResult {
  orderId: string;
  status: string;
  message: string;
}

interface OrderResult {
  orderId: string;
  customerId: string;
  status: string;
  totalAmount: number;
}

type RequestState<T> = { ok: true; data: T } | { ok: false; error: string } | null;

// ── Menu Data ─────────────────────────────────────────────────────────────────

const MENU = [
  {
    id: "couscous",
    name: "Couscous Gafsi",
    sub: "Signature of the House",
    price: 28,
    emoji: "🫕",
    desc: "Slow-cooked lamb shoulder over hand-rolled couscous with seven vegetables",
    tag: "Signature",
  },
  {
    id: "lablabi",
    name: "Lablabi du Marche",
    sub: "Street Market Classic",
    price: 12,
    emoji: "🍲",
    desc: "Spiced chickpea broth, harissa rouge, torn bread and a crispy egg",
    tag: "Popular",
  },
  {
    id: "brik",
    name: "Brik a l'Oeuf",
    sub: "Crispy Pastry Starter",
    price: 9,
    emoji: "🥐",
    desc: "Golden pastry filled with egg, tuna, capers and fresh parsley",
    tag: null,
  },
  {
    id: "mechoui",
    name: "Mechoui d'Agneau",
    sub: "Clay Oven Roasted",
    price: 45,
    emoji: "🍖",
    desc: "Half-leg of lamb slow-roasted in a Gafsa clay oven with cumin rub",
    tag: "Chef's Pick",
  },
  {
    id: "tajine",
    name: "Tajine Oasien",
    sub: "The Oasis Tajine",
    price: 32,
    emoji: "🥘",
    desc: "Merguez, seasonal vegetables, eggs and herbs in traditional clay",
    tag: null,
  },
  {
    id: "feast",
    name: "Grand Festin Gafsi",
    sub: "Feast for 4 — Requires Approval",
    price: 120,
    emoji: "🎊",
    desc: "The full experience — all dishes, mint tea and makroudh for a table of four",
    tag: "Feast for 4",
  },
] as const;

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8083";

// ── Shared components ─────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "APPROVED"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : status === "REJECTED"
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-amber-100 text-amber-800 border-amber-200";
  const icon = status === "APPROVED" ? "✓" : status === "REJECTED" ? "✕" : "⏳";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-bold tracking-wide ${cls}`}>
      {icon} {status}
    </span>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav({ onOrder }: { onOrder: () => void }) {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
      style={{ background: "rgba(30,16,8,0.97)", borderBottom: "1px solid #4A2A18" }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">🌴</span>
        <div>
          <p className="text-sm font-black leading-none" style={{ color: "#E8C870" }}>
            Dar Gafsa
          </p>
          <p className="text-[10px] leading-none mt-0.5" style={{ color: "rgba(232,200,112,0.45)" }}>
            Cuisine du Sud Tunisien
          </p>
        </div>
      </div>
      <button
        onClick={onOrder}
        className="rounded-full px-5 py-2 text-xs font-bold transition-all hover:brightness-110 active:scale-95"
        style={{ background: "linear-gradient(135deg,#C9A84C,#E8C870)", color: "#2C1810" }}
      >
        Order Now
      </button>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero({ onOrder }: { onOrder: () => void }) {
  return (
    <section
      className="relative overflow-hidden py-28 text-center text-white"
      style={{
        background: "linear-gradient(150deg,#1E0E04 0%,#6B2D10 35%,#C2571A 70%,#C9A84C 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.35em]"
          style={{ color: "#E8C870" }}
        >
          Authentic Southern Tunisian Cuisine — Gafsa, Tunisia
        </p>

        <h1
          className="mb-4 font-black leading-none"
          style={{
            fontSize: "clamp(3.5rem,10vw,7rem)",
            fontFamily: "Georgia,'Times New Roman',serif",
            textShadow: "0 6px 32px rgba(0,0,0,0.5)",
            color: "#FFF8EE",
          }}
        >
          Dar Gafsa
        </h1>

        <p
          className="mb-6 text-lg font-light italic"
          style={{ color: "rgba(232,200,112,0.85)" }}
        >
          House of Gafsa · Est. in the heart of the Tunisian Sahara
        </p>

        <p
          className="mx-auto mb-10 max-w-lg text-sm leading-relaxed"
          style={{ color: "rgba(255,245,220,0.75)" }}
        >
          From the ancient Roman baths of Gafsa to your table — the flavours of the
          Tunisian Sahara, slow-cooked the way grandmothers still do it.
        </p>

        <button
          onClick={onOrder}
          className="rounded-full px-10 py-4 text-base font-bold transition-all hover:scale-105 hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg,#C9A84C,#E8C870)", color: "#2C1810" }}
        >
          Explore Our Menu
        </button>

        <div className="mt-14 flex items-center justify-center gap-6 text-3xl opacity-40">
          <span>🌴</span>
          <span className="text-xl" style={{ color: "#C9A84C" }}>✦</span>
          <span>🫕</span>
          <span className="text-xl" style={{ color: "#C9A84C" }}>✦</span>
          <span>🏜️</span>
          <span className="text-xl" style={{ color: "#C9A84C" }}>✦</span>
          <span>🍵</span>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{ background: "linear-gradient(to bottom,transparent,#FFFAF4)" }}
      />
    </section>
  );
}

// ── Menu card ─────────────────────────────────────────────────────────────────

function MenuCard({
  item,
  selected,
  onSelect,
}: {
  item: (typeof MENU)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="relative w-full rounded-2xl border-2 p-5 text-left transition-all duration-200 hover:shadow-xl"
      style={{
        borderColor: selected ? "#C2571A" : "#E8D5C0",
        background: selected ? "#FFF1E8" : "white",
        boxShadow: selected ? "0 4px 24px rgba(194,87,26,0.18)" : undefined,
      }}
    >
      {item.tag && (
        <span
          className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ background: item.tag === "Feast for 4" ? "#C2571A" : "#C9A84C" }}
        >
          {item.tag}
        </span>
      )}

      <div className="mb-3 text-4xl">{item.emoji}</div>
      <p className="mb-0.5 text-xs font-medium" style={{ color: "#C9A84C" }}>
        {item.sub}
      </p>
      <p className="font-bold leading-tight" style={{ color: "#2C1810" }}>
        {item.name}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#8B6347" }}>
        {item.desc}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-black" style={{ color: "#C2571A" }}>
          {item.price} DT
        </span>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
          style={
            selected
              ? { background: "#C2571A", color: "white" }
              : { background: "#F5EFE6", color: "#8B6347" }
          }
        >
          {selected ? "✓ Selected" : "Select"}
        </span>
      </div>
    </button>
  );
}

// ── Order section ─────────────────────────────────────────────────────────────

function OrderSection({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RequestState<SagaResult>>(null);

  const selectedItem = MENU.find((m) => m.id === selectedId);
  const amount = selectedItem?.price ?? 0;
  const canSubmit = !!selectedId && guestName.trim() !== "" && address.trim() !== "" && !loading;

  async function placeOrder() {
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: guestName.trim(),
          amount,
          deliveryAddress: address.trim(),
        }),
      });
      const data: SagaResult = await res.json();
      setResult({ ok: true, data });
    } catch (e) {
      setResult({ ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section ref={sectionRef} style={{ background: "#FFFAF4" }} className="py-20">
      <div className="mx-auto max-w-5xl px-4">

        <p className="mb-1 text-center text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#C9A84C" }}>
          Today's Selection
        </p>
        <h2
          className="mb-2 text-center text-4xl font-black"
          style={{ color: "#2C1810", fontFamily: "Georgia,serif" }}
        >
          Our Menu
        </h2>
        <p className="mb-10 text-center text-sm" style={{ color: "#8B6347" }}>
          Select a dish to place your order — Grand Festin (120 DT) requires kitchen approval
        </p>

        <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MENU.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              onSelect={() => setSelectedId(selectedId === item.id ? null : item.id)}
            />
          ))}
        </div>

        {/* Order form */}
        <div
          className="rounded-3xl border p-8 shadow-2xl"
          style={{
            borderColor: "#E8D5C0",
            background: "linear-gradient(135deg,#FFFAF4 0%,#FFF1E8 100%)",
          }}
        >
          <div className="mb-7 flex items-center gap-4">
            <span className="text-4xl">🌴</span>
            <div>
              <h3
                className="text-2xl font-black"
                style={{ color: "#2C1810", fontFamily: "Georgia,serif" }}
              >
                Confirm Your Order
              </h3>
              <p className="text-xs" style={{ color: "#8B6347" }}>
                We will deliver straight to your oasis
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#8B6347" }}>
                Your Name
              </span>
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Ahmed Ben Salah"
                className="rounded-xl border px-4 py-3 text-sm outline-none transition-all"
                style={{ borderColor: "#E8D5C0", background: "white", color: "#2C1810" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C2571A")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E8D5C0")}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#8B6347" }}>
                Delivery Address
              </span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Avenue Habib Bourguiba, Gafsa"
                className="rounded-xl border px-4 py-3 text-sm outline-none transition-all"
                style={{ borderColor: "#E8D5C0", background: "white", color: "#2C1810" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C2571A")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E8D5C0")}
              />
            </label>

            {selectedItem ? (
              <div
                className="flex items-center justify-between rounded-2xl border px-5 py-4"
                style={{ borderColor: "#C9A84C", background: "rgba(201,168,76,0.08)" }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{selectedItem.emoji}</span>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#2C1810" }}>
                      {selectedItem.name}
                    </p>
                    <p className="text-xs" style={{ color: "#C9A84C" }}>
                      {selectedItem.sub}
                    </p>
                  </div>
                </div>
                <span className="text-xl font-black" style={{ color: "#C2571A" }}>
                  {selectedItem.price} DT
                </span>
              </div>
            ) : (
              <div
                className="rounded-2xl border border-dashed px-5 py-4 text-center text-sm"
                style={{ borderColor: "#E8D5C0", color: "#C4A882" }}
              >
                Select a dish from the menu above
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={!canSubmit}
              className="mt-1 flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: canSubmit ? "linear-gradient(135deg,#C2571A,#7B3A1E)" : "#D4B8A8",
              }}
            >
              {loading ? (
                <><Spinner /> Preparing your order...</>
              ) : (
                <>Place Order{amount > 0 ? ` — ${amount} DT` : ""}</>
              )}
            </button>
          </div>

          {result && (
            <div className="mt-6">
              {result.ok ? (
                <div
                  className="rounded-2xl border p-5"
                  style={
                    result.data.status === "APPROVED"
                      ? { borderColor: "#6EE7B7", background: "#F0FDF9" }
                      : { borderColor: "#FECACA", background: "#FFF5F5" }
                  }
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-3xl">
                      {result.data.status === "APPROVED" ? "🎉" : "❌"}
                    </span>
                    <div>
                      <StatusBadge status={result.data.status} />
                      <p className="mt-1 text-sm font-medium" style={{ color: "#374151" }}>
                        {result.data.message}
                      </p>
                    </div>
                  </div>
                  <div
                    className="rounded-xl px-3 py-2 font-mono text-xs break-all"
                    style={{ background: "rgba(0,0,0,0.04)", color: "#6B7280" }}
                  >
                    Order ID: {result.data.orderId}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {result.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Order Tracker ─────────────────────────────────────────────────────────────

function TrackerSection() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RequestState<OrderResult>>(null);

  async function track() {
    if (!orderId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/orders/${orderId.trim()}`);
      if (!res.ok) {
        setResult({ ok: false, error: `Order not found (HTTP ${res.status})` });
      } else {
        const data: OrderResult = await res.json();
        setResult({ ok: true, data });
      }
    } catch (e) {
      setResult({ ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ background: "#F5EFE6", borderTop: "1px solid #E8D5C0" }} className="py-20">
      <div className="mx-auto max-w-2xl px-4">
        <p className="mb-1 text-center text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "#C9A84C" }}>
          Order Status
        </p>
        <h2
          className="mb-2 text-center text-4xl font-black"
          style={{ color: "#2C1810", fontFamily: "Georgia,serif" }}
        >
          Track Your Order
        </h2>
        <p className="mb-10 text-center text-sm" style={{ color: "#8B6347" }}>
          Paste the Order ID returned after placing your order
        </p>

        <div
          className="rounded-3xl border p-8 shadow-sm"
          style={{ borderColor: "#E8D5C0", background: "white" }}
        >
          <div className="flex gap-3">
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && track()}
              placeholder="Paste your Order ID here..."
              className="flex-1 rounded-xl border px-4 py-3 font-mono text-xs outline-none transition-all"
              style={{ borderColor: "#E8D5C0", color: "#2C1810" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#C2571A")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E8D5C0")}
            />
            <button
              onClick={track}
              disabled={loading || !orderId.trim()}
              className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#C2571A,#7B3A1E)" }}
            >
              {loading ? <Spinner /> : "Track"}
            </button>
          </div>

          {result && (
            <div className="mt-6">
              {result.ok ? (
                <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "#E8D5C0" }}>
                  <div
                    className="flex items-center justify-between px-5 py-3"
                    style={{ background: "linear-gradient(135deg,#FFF4ED,#F5EFE6)" }}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B6347" }}>
                      Order Details
                    </span>
                    <StatusBadge status={result.data.status} />
                  </div>

                  <dl className="grid grid-cols-2 gap-px" style={{ background: "#E8D5C0" }}>
                    {(
                      [
                        { label: "Order ID", value: result.data.orderId, mono: true },
                        { label: "Guest Name", value: result.data.customerId, mono: false },
                        { label: "Status", value: <StatusBadge status={result.data.status} />, mono: false },
                        { label: "Total", value: `${result.data.totalAmount.toFixed(2)} DT`, mono: false },
                      ] as const
                    ).map(({ label, value, mono }) => (
                      <div key={label} className="bg-white px-5 py-3">
                        <dt className="mb-1 text-xs" style={{ color: "#C4A882" }}>{label}</dt>
                        <dd
                          className={`text-sm font-semibold ${mono ? "break-all font-mono text-xs" : ""}`}
                          style={{ color: "#2C1810" }}
                        >
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {result.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      className="py-16 text-center"
      style={{ background: "#1E0E04", borderTop: "1px solid #3A1A0A" }}
    >
      <p className="mb-3 text-4xl">🌴</p>
      <p className="mb-1 text-xl font-black" style={{ color: "#E8C870", fontFamily: "Georgia,serif" }}>
        Dar Gafsa
      </p>
      <p className="mb-1 text-xs" style={{ color: "rgba(232,200,112,0.5)" }}>
        Inspired by the oases, Roman baths, and ancient traditions of Gafsa, Tunisia
      </p>
      <p className="mb-8 text-xs italic" style={{ color: "rgba(232,200,112,0.35)" }}>
        Gafsa — city of phosphates, dates, and timeless hospitality
      </p>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs" style={{ color: "rgba(232,200,112,0.4)" }}>
        <span>📍 Gafsa, Tunisia</span>
        <span>✦</span>
        <span>Open daily 11:00 – 23:00</span>
        <span>✦</span>
        <span>🍵 Mint tea always free</span>
        <span>✦</span>
        <span>🌴 Free delivery in the oasis</span>
      </div>

      <p className="mt-10 text-[10px]" style={{ color: "rgba(232,200,112,0.15)" }}>
        order-service :50051 · kitchen-service :50052 · accounting-service :50053 · orchestrator :8083
      </p>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const orderRef = useRef<HTMLElement>(null);

  function scrollToOrder() {
    orderRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "system-ui,sans-serif" }}>
      <Nav onOrder={scrollToOrder} />
      <Hero onOrder={scrollToOrder} />
      <OrderSection sectionRef={orderRef} />
      <TrackerSection />
      <Footer />
    </div>
  );
}
