import html2canvas from "html2canvas";
import URLS from "./Endpoints";
import { POST } from "../services/DatabaseServiceImp";

const money = (n) => Number(n || 0).toLocaleString("en-KE");

// Kenyan mobile in any common format → 254XXXXXXXXX for wa.me links.
export const normalizeKePhone = (phone) => {
  let p = String(phone || "").trim().replace(/^\+/, "").replace(/[\s-]/g, "");
  if (p.startsWith("0")) p = "254" + p.slice(1);
  else if (/^[71]\d{8}$/.test(p)) p = "254" + p;
  return p;
};

export const isValidKePhone = (phone) => /^254(7|1)\d{8}$/.test(normalizeKePhone(phone));

// Render the receipt card node to a crisp PNG file (scale 3 ≈ print quality).
export const captureReceiptImage = async (node, orderId) => {
  if (!node) throw new Error("Receipt is not ready yet");
  const canvas = await html2canvas(node, {
    backgroundColor: "#ffffff",
    scale: 3,
    useCORS: true,
    logging: false,
  });
  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not render receipt image"))),
      "image/png"
    )
  );
  const safeId = String(orderId || "receipt").replace(/[^A-Za-z0-9-_]/g, "");
  return new File([blob], `receipt-${safeId || "order"}.png`, { type: "image/png" });
};

export const canNativeShareFiles = (file) =>
  typeof navigator !== "undefined" &&
  typeof navigator.canShare === "function" &&
  navigator.canShare({ files: [file] });

// Share the PNG via the OS share sheet (WhatsApp, etc.), or download it when
// native sharing is unavailable (desktop browsers).
export const shareReceiptImage = async (file) => {
  if (canNativeShareFiles(file)) {
    await navigator.share({
      files: [file],
      title: "Payment receipt",
      text: "Here is your receipt. Thank you!",
    });
    return "shared";
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "downloaded";
};

export const downloadReceiptImage = async (node, orderId) => {
  const file = await captureReceiptImage(node, orderId);
  return shareReceiptImage(file);
};

// Plain-text receipt for wa.me — delivers to the exact customer number.
export const buildWhatsAppText = (order, { businessName = "Business" } = {}) => {
  const items = order.items || [];
  const lines = items.map(
    (it) =>
      `▪ ${Number(it.quantity) || 1} x ${it.name} — KSh ${money(
        Number(it.price || 0) * (Number(it.quantity) || 1)
      )}`
  );
  const payLabel =
    order.paymentMethod === "mpesa"
      ? "M-PESA"
      : order.paymentMethod === "cash"
        ? "CASH"
        : String(order.paymentMethod || "").toUpperCase();
  return [
    `*${businessName}* — Payment Receipt 🧾`,
    `Order: ${order.id || ""} | Table: ${order.tableNumber || "—"}`,
    ...lines,
    `*TOTAL: KSh ${money(order.total)}*`,
    `Paid via ${payLabel} ✅`,
    `Thank you! Karibu tena 🙏`,
  ].join("\n");
};

export const openWhatsAppChat = (phone, text) => {
  const url = `https://wa.me/${normalizeKePhone(phone)}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

// Direct IMAGE send: backend delivers the receipt PNG via the WhatsApp
// Cloud API as an image message — nothing opens, no manual press needed.
export const sendReceiptImageDirect = async ({ file, transactionBackendId, orderNumber, phone, businessId }) => {
  const imageBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the receipt image."));
    reader.readAsDataURL(file);
  });
  const res = await POST(URLS.NOTIFICATIONS.SEND_RECEIPT_IMAGE, {
    transactionId: transactionBackendId || undefined,
    orderNumber: orderNumber || undefined,
    phone,
    businessId: businessId || undefined,
    imageBase64,
  });
  if (!res?.success) {
    const err = new Error(res?.message || "Could not send the WhatsApp receipt image.");
    err.code = res?.code;
    throw err;
  }
  return res.data;
};
