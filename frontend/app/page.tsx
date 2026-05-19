"use client";

import { useState } from "react";

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

// ── Constants ─────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8083";

// ── Sub-components ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

function StatusBadge({ status }: { status: string }) {
  const approved = status === "APPROVED";
  const base = "inline-block rounded px-2 py-0.5 text-xs font-semibold tracking-wide";
  const color = approved
    ? "bg-green-100 text-green-800"
    : status === "REJECTED"
    ? "bg-red-100 text-red-800"
    : "bg-yellow-100 text-yellow-800";
  return <span className={`${base} ${color}`}>{status}</span>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-zinc-800">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                   placeholder:text-zinc-400"
      />
    </label>
  );
}

// ── Section 1: Run the Saga ───────────────────────────────────────────────────

function SagaSection() {
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<RequestState<SagaResult>>(null);

  async function submit() {
    if (!orderId.trim() || !amount.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), amount: parseFloat(amount) }),
      });
      const data: SagaResult = await res.json();
      if (res.ok) {
        setResult({ ok: true, data });
      } else {
        setResult({ ok: false, error: data.message ?? "Request failed" });
      }
    } catch (e) {
      setResult({ ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Submit Order for Approval">
      <p className="mb-4 text-sm text-zinc-500">
        Triggers the saga: kitchen ticket → payment authorization (auto-approved
        when amount&nbsp;&lt;&nbsp;100).
      </p>

      <div className="flex flex-col gap-3">
        <Field
          label="Order ID"
          value={orderId}
          onChange={setOrderId}
          placeholder="Paste the order ID from order-service"
        />
        <Field
          label="Amount (€)"
          value={amount}
          onChange={setAmount}
          placeholder="e.g. 49.99 — use ≥ 100 to trigger rejection"
          type="number"
        />

        <button
          onClick={submit}
          disabled={loading || !orderId.trim() || !amount.trim()}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600
                     px-4 py-2.5 text-sm font-semibold text-white transition
                     hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <><Spinner /> Running saga…</> : "Submit Order"}
        </button>
      </div>

      {result && (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm ${
            result.ok
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          {result.ok ? (
            <>
              <div className="flex items-center gap-2">
                <StatusBadge status={result.data.status} />
                <span className="font-medium text-zinc-800">{result.data.message}</span>
              </div>
              <p className="mt-1 font-mono text-xs text-zinc-500">
                orderId: {result.data.orderId}
              </p>
            </>
          ) : (
            <p className="text-red-700">{result.error}</p>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Section 2: Order Lookup ───────────────────────────────────────────────────

function LookupSection() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<RequestState<OrderResult>>(null);

  async function lookup() {
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
    <Card title="Look Up Order Status">
      <p className="mb-4 text-sm text-zinc-500">
        Reads the current state of an order directly from order-service via the
        orchestrator.
      </p>

      <div className="flex gap-2">
        <div className="flex-1">
          <Field
            label="Order ID"
            value={orderId}
            onChange={setOrderId}
            placeholder="Enter order ID"
          />
        </div>
        <button
          onClick={lookup}
          disabled={loading || !orderId.trim()}
          className="mt-6 flex items-center gap-2 rounded-lg border border-zinc-300
                     bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700
                     transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Spinner /> : "Fetch"}
        </button>
      </div>

      {result && (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
          {result.ok ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs">
              <dt className="text-zinc-500">orderId</dt>
              <dd className="truncate text-zinc-800">{result.data.orderId}</dd>
              <dt className="text-zinc-500">customerId</dt>
              <dd className="text-zinc-800">{result.data.customerId}</dd>
              <dt className="text-zinc-500">status</dt>
              <dd><StatusBadge status={result.data.status} /></dd>
              <dt className="text-zinc-500">totalAmount</dt>
              <dd className="text-zinc-800">€ {result.data.totalAmount.toFixed(2)}</dd>
            </dl>
          ) : (
            <p className="text-red-600">{result.error}</p>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">🍽 Gourmet Go</h1>
            <p className="text-xs text-zinc-400">Distributed Order System — gRPC + Saga</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Orchestrator → {API}
          </span>
        </div>
      </header>

      {/* Info banner */}
      <div className="border-b border-yellow-200 bg-yellow-50 px-6 py-2 text-center text-xs text-yellow-800">
        First create an order with{" "}
        <code className="rounded bg-yellow-100 px-1">grpcurl</code> on port 50051,
        then paste its ID here to run the saga.
      </div>

      {/* Main content */}
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
        <SagaSection />
        <LookupSection />
      </main>

      <footer className="py-4 text-center text-xs text-zinc-400">
        order-service :50051 · kitchen-service :50052 · accounting-service :50053 · orchestrator :8083
      </footer>
    </div>
  );
}
