// 80mm thermal-style receipt generator + printer.
// Works with any printer via the browser print dialog; on a thermal printer
// set paper size to 80mm (or use the driver default) with no margins.
//
// Usage:
//   printOrderReceipt(order, { businessName, variant: "bill" })      → waiter guest bill
//   printOrderReceipt(order, { businessName, variant: "receipt" })   → paid receipt

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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

const PAYMENT_LABELS = { cash: "CASH", mpesa: "M-PESA" };

const buildReceiptHtml = (order, opts) => {
  const {
    businessName = "Business",
    businessTagline = "",
    variant = "bill", // "bill" | "receipt"
    footerNote = "",
  } = opts;

  const isPaid = variant === "receipt";
  const items = order.items || [];
  const subtotal = items.reduce(
    (s, it) => s + Number(it.price || 0) * Number(it.quantity || 1),
    0
  );
  const total = Number(order.total) || subtotal;

  const itemRows = items
    .map((it) => {
      const qty = Number(it.quantity) || 1;
      const price = Number(it.price) || 0;
      const unitLine =
        qty > 1
          ? `<div class="unit">${qty} × ${money(price)}</div>`
          : "";
      return `
        <tr>
          <td class="qty">${qty}</td>
          <td class="item">${esc(it.name)}${unitLine}</td>
          <td class="amt">${money(price * qty)}</td>
        </tr>`;
    })
    .join("");

  const metaRow = (label, value) => `
    <div class="meta-row">
      <span class="meta-label">${label}</span>
      <span class="meta-value">${esc(value)}</span>
    </div>`;

  const paymentBlock = isPaid
    ? `
      <div class="divider"></div>
      <div class="pay-block">
        <div class="paid-badge">✔ PAID — ${
          PAYMENT_LABELS[order.paymentMethod] || esc(String(order.paymentMethod || "").toUpperCase()) || "PAID"
        }</div>
        ${
          order.amountPaid
            ? `
        <div class="meta-row"><span class="meta-label">Amount paid</span><span class="meta-value">KSh ${money(order.amountPaid)}</span></div>
        <div class="meta-row"><span class="meta-label">Change</span><span class="meta-value">KSh ${money(order.change)}</span></div>`
            : ""
        }
      </div>`
    : `
      <div class="divider"></div>
      <div class="pay-note">Please pay at the cashier</div>
      <div class="pay-note-sub">This is a guest bill — not proof of payment</div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${isPaid ? "Receipt" : "Bill"} ${esc(order.id)}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body {
    width: 80mm;
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    color: #000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .receipt { padding: 6mm 4.5mm 8mm; font-size: 12px; line-height: 1.45; }

  .brand { text-align: center; }
  .brand-name {
    font-size: 17px; font-weight: 800; letter-spacing: 2px;
    text-transform: uppercase; margin: 0;
  }
  .brand-tagline {
    font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
    color: #333; margin-top: 2px;
  }

  .doc-type {
    margin: 10px 0 8px; text-align: center;
    border-top: 2px solid #000; border-bottom: 2px solid #000;
    padding: 4px 0; font-size: 13px; font-weight: 700; letter-spacing: 4px;
  }

  .meta { margin: 8px 0; }
  .meta-row { display: flex; justify-content: space-between; gap: 8px; margin: 1.5px 0; }
  .meta-label { color: #444; }
  .meta-value { font-weight: 600; text-align: right; }

  .divider { border-top: 1px dashed #000; margin: 8px 0; }

  table.items { width: 100%; border-collapse: collapse; }
  table.items th {
    font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
    text-align: left; padding: 0 0 4px; border-bottom: 1px solid #000;
  }
  table.items th.amt, table.items td.amt { text-align: right; white-space: nowrap; }
  table.items td { padding: 4px 0; vertical-align: top; }
  td.qty { width: 22px; font-weight: 700; }
  td.item { padding-right: 6px; }
  td.item .unit { font-size: 10px; color: #444; }

  .totals { margin-top: 6px; }
  .totals .meta-row { font-size: 12px; }
  .grand {
    display: flex; justify-content: space-between; align-items: center;
    border-top: 2px solid #000; border-bottom: 2px solid #000;
    margin-top: 6px; padding: 6px 0;
    font-size: 16px; font-weight: 800;
  }

  .pay-block { text-align: left; }
  .paid-badge {
    display: block; text-align: center;
    border: 2px solid #000; border-radius: 4px;
    padding: 4px 0; margin-bottom: 6px;
    font-weight: 800; letter-spacing: 2px; font-size: 13px;
  }
  .pay-note { text-align: center; font-weight: 800; letter-spacing: 1px; font-size: 13px; }
  .pay-note-sub { text-align: center; font-size: 10px; color: #333; margin-top: 2px; }

  .note {
    margin-top: 8px; font-size: 11px;
    border: 1px dashed #000; border-radius: 4px; padding: 4px 6px;
  }

  .footer { text-align: center; margin-top: 12px; }
  .thanks { font-size: 13px; font-weight: 700; }
  .karibu { font-size: 11px; color: #333; margin-top: 1px; }
  .powered { font-size: 9px; color: #555; margin-top: 8px; letter-spacing: 1px; text-transform: uppercase; }
  .printed-at { font-size: 9px; color: #555; margin-top: 2px; }
  .tear { text-align: center; color: #666; font-size: 10px; margin-top: 10px; letter-spacing: 2px; }
</style>
</head>
<body>
  <div class="receipt">
    <div class="brand">
      <p class="brand-name">${esc(businessName)}</p>
      ${businessTagline ? `<div class="brand-tagline">${esc(businessTagline)}</div>` : ""}
    </div>

    <div class="doc-type">${isPaid ? "OFFICIAL RECEIPT" : "GUEST BILL"}</div>

    <div class="meta">
      ${metaRow("Order No.", order.id)}
      ${metaRow("Table", order.tableNumber || "—")}
      ${order.waiter ? metaRow("Served by", order.waiter) : ""}
      ${metaRow("Date", fullDateTime(order.createdAt))}
    </div>

    <table class="items">
      <thead>
        <tr><th>Qty</th><th>Item</th><th class="amt">Amount</th></tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="totals">
      <div class="meta-row">
        <span class="meta-label">Items</span>
        <span class="meta-value">${items.reduce((s, it) => s + (Number(it.quantity) || 1), 0)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Subtotal</span>
        <span class="meta-value">KSh ${money(subtotal)}</span>
      </div>
      <div class="grand"><span>TOTAL</span><span>KSh ${money(total)}</span></div>
    </div>

    ${paymentBlock}

    ${order.note ? `<div class="note">📝 ${esc(order.note)}</div>` : ""}

    <div class="footer">
      <div class="thanks">Thank you!</div>
      <div class="karibu">Karibu tena — we hope to see you again</div>
      ${footerNote ? `<div class="karibu">${esc(footerNote)}</div>` : ""}
      <div class="powered">Powered by BizTrack</div>
      <div class="printed-at">Printed ${fullDateTime()}</div>
      <div class="tear">✂ ------------------------------------</div>
    </div>
  </div>
</body>
</html>`;
};

// Print via a hidden iframe — avoids popup blockers and leaves the app untouched.
const printHtml = (html) => {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(frame);

  const cleanup = () => {
    if (frame.parentNode) frame.parentNode.removeChild(frame);
  };

  const win = frame.contentWindow;
  const doc = win.document;
  doc.open();
  doc.write(html);
  doc.close();

  win.onafterprint = cleanup;
  // Give the iframe a moment to lay out before opening the print dialog
  setTimeout(() => {
    try {
      win.focus();
      win.print();
    } catch (_) {
      cleanup();
    }
    // Fallback cleanup for browsers that never fire afterprint
    setTimeout(cleanup, 60000);
  }, 300);
};

/**
 * Print an order as an 80mm receipt.
 * @param {object} order  Redux order shape: { id, tableNumber, waiter, items, total, note, paymentMethod, amountPaid, change, createdAt }
 * @param {object} opts   { businessName, businessTagline, variant: "bill" | "receipt", footerNote }
 */
export const printOrderReceipt = (order, opts = {}) => {
  if (!order) return;
  printHtml(buildReceiptHtml(order, opts));
};

export default printOrderReceipt;
