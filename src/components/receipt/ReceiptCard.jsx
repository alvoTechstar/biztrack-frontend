import React, { forwardRef } from "react";

// Premium payment-receipt card — always rendered to a PNG image for sharing.
// IMPORTANT: styled ONLY with inline hex colors — no Tailwind color classes.
// html2canvas cannot parse the oklch() colors Tailwind v4 emits, so any
// Tailwind class with a color inside the captured node would break the image.

const money = (n) => Number(n || 0).toLocaleString("en-KE");

const fullDateTime = (iso) =>
  new Date(iso || Date.now()).toLocaleString("en-KE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// Keep only a 6-digit hex so canvas capture never chokes on odd formats.
const safeHex = (c, fallback = "#4F46E5") => {
  const m = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/.exec(String(c || "").trim());
  if (m) return `#${m[1]}`;
  const short = /^#([0-9a-fA-F]{3})$/.exec(String(c || "").trim());
  if (short) {
    const [r, g, b] = short[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return fallback;
};

const PAYMENT_LABELS = { cash: "CASH", mpesa: "M-PESA" };

const ReceiptCard = forwardRef(function ReceiptCard(
  {
    order = {},
    businessName = "Business",
    businessTagline = "Restaurant",
    businessLogo = "",
    accent = "#4F46E5",
    paid = true,
  },
  ref
) {
  const color = safeHex(accent);
  const items = order.items || [];
  const subtotal = items.reduce(
    (s, it) => s + Number(it.price || 0) * Number(it.quantity || 1),
    0
  );
  const total = Number(order.total) || subtotal;
  const itemCount = items.reduce((s, it) => s + (Number(it.quantity) || 1), 0);
  const payLabel =
    PAYMENT_LABELS[order.paymentMethod] ||
    String(order.paymentMethod || "").toUpperCase() ||
    "PAID";

  const row = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    margin: "3px 0",
  };
  const label = { color: "#6b7280", fontSize: "11px" };
  const value = { fontWeight: 700, fontSize: "12px", textAlign: "right" };

  return (
    <div
      ref={ref}
      style={{
        width: "360px",
        backgroundColor: "#ffffff",
        color: "#111827",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "13px",
        lineHeight: 1.5,
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Accent top strip */}
      <div style={{ height: "6px", backgroundColor: color }} />

      {/* Brand header with institution logo */}
      <div style={{ padding: "18px 20px 6px", textAlign: "center" }}>
        {businessLogo ? (
          <img
            src={businessLogo}
            alt={businessName}
            crossOrigin="anonymous"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              objectFit: "cover",
              border: `3px solid ${color}`,
              backgroundColor: "#ffffff",
              display: "block",
              margin: "0 auto 10px",
            }}
          />
        ) : null}
        <div
          style={{
            fontSize: "20px",
            fontWeight: 800,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#111827",
          }}
        >
          {businessName}
        </div>
        {businessTagline ? (
          <div
            style={{
              color: "#6b7280",
              fontSize: "10px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginTop: "4px",
            }}
          >
            {businessTagline}
          </div>
        ) : null}
      </div>

      {/* Doc title */}
      <div style={{ padding: "10px 20px 0", textAlign: "center" }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: "5px",
            color: color,
          }}
        >
          {paid ? "PAYMENT RECEIPT" : "BILL"}
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: "8px",
            border: paid ? "2px solid #15803d" : "2px solid #b45309",
            backgroundColor: paid ? "#f0fdf4" : "#fffbeb",
            color: paid ? "#15803d" : "#b45309",
            borderRadius: "999px",
            padding: "4px 18px",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "2px",
          }}
        >
          {paid ? `✓ PAID — ${payLabel}` : "UNPAID"}
        </div>
      </div>

      {/* Meta */}
      <div style={{ padding: "12px 20px 0" }}>
        <div style={row}>
          <span style={label}>Order No.</span>
          <span style={value}>{order.id || "—"}</span>
        </div>
        <div style={row}>
          <span style={label}>Table</span>
          <span style={value}>{order.tableNumber || "—"}</span>
        </div>
        {order.waiter ? (
          <div style={row}>
            <span style={label}>Served by</span>
            <span style={value}>{order.waiter}</span>
          </div>
        ) : null}
        <div style={row}>
          <span style={label}>Date</span>
          <span style={value}>{fullDateTime(order.createdAt)}</span>
        </div>
      </div>

      <div style={{ borderTop: "2px dashed #d1d5db", margin: "12px 20px 0" }} />

      {/* Items */}
      <div style={{ padding: "10px 20px 0" }}>
        <div
          style={{
            display: "flex",
            backgroundColor: color,
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "1px",
            textTransform: "uppercase",
            borderRadius: "8px",
            padding: "7px 10px",
            marginBottom: "4px",
          }}
        >
          <span style={{ width: "36px" }}>Qty</span>
          <span style={{ flex: 1 }}>Item</span>
          <span style={{ textAlign: "right" }}>Amount</span>
        </div>
        {items.length === 0 ? (
          <div style={{ color: "#9ca3af", padding: "6px 0" }}>No items</div>
        ) : (
          items.map((it, i) => {
            const qty = Number(it.quantity) || 1;
            const price = Number(it.price) || 0;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  padding: "6px 10px",
                  backgroundColor: i % 2 === 1 ? "#f9fafb" : "#ffffff",
                  borderRadius: "6px",
                }}
              >
                <span style={{ width: "36px", fontWeight: 800, color: color }}>{qty}</span>
                <span style={{ flex: 1, paddingRight: "8px" }}>
                  <span style={{ fontWeight: 600 }}>{it.name}</span>
                  {qty > 1 ? (
                    <span style={{ display: "block", fontSize: "11px", color: "#6b7280" }}>
                      {qty} × {money(price)}
                    </span>
                  ) : null}
                </span>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {money(price * qty)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div style={{ borderTop: "2px dashed #d1d5db", margin: "12px 20px 0" }} />

      {/* Totals */}
      <div style={{ padding: "10px 20px 0" }}>
        <div style={row}>
          <span style={label}>Items ({itemCount})</span>
          <span style={value}>KSh {money(subtotal)}</span>
        </div>
        {order.amountPaid ? (
          <div style={row}>
            <span style={label}>Amount paid</span>
            <span style={value}>KSh {money(order.amountPaid)}</span>
          </div>
        ) : null}
        {Number(order.change) > 0 ? (
          <div style={row}>
            <span style={label}>Change</span>
            <span style={value}>KSh {money(order.change)}</span>
          </div>
        ) : null}
      </div>

      <div style={{ padding: "10px 20px 0" }}>
        <div
          style={{
            backgroundColor: color,
            color: "#ffffff",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 800, letterSpacing: "2px", fontSize: "13px" }}>
            TOTAL
          </span>
          <span style={{ fontWeight: 800, fontSize: "21px" }}>
            KSh {money(total)}
          </span>
        </div>
        <div style={{ ...row, marginTop: "8px" }}>
          <span style={label}>Paid via</span>
          <span style={value}>{payLabel}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px 0", textAlign: "center" }}>
        <div style={{ fontSize: "15px", fontWeight: 800 }}>Thank you!</div>
        <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
          Karibu tena — we hope to see you again
        </div>
      </div>
      <div
        style={{
          margin: "12px 20px 0",
          borderTop: "1px solid #e5e7eb",
          padding: "8px 0 16px",
          textAlign: "center",
          fontSize: "9px",
          color: "#9ca3af",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        {order.id || "Receipt"} · Powered by BizTrack
      </div>
    </div>
  );
});

export default ReceiptCard;
