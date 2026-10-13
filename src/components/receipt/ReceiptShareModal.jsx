import React, { useEffect, useRef, useState } from "react";
import { X, MessageCircle, Printer, CheckCircle } from "lucide-react";
import TextInput from "../Input/TextInput";
import ReceiptCard from "./ReceiptCard";
import {
  captureReceiptImage,
  shareReceiptImage,
  openWhatsAppChat,
  buildWhatsAppText,
  sendReceiptImageDirect,
  isValidKePhone,
} from "../../utilities/receiptShare";

// Shown right after the cashier completes payment.
// Preview of the receipt + actions: send the receipt straight to the
// customer's WhatsApp (direct, nothing opens), share the receipt as an
// image (share sheet on mobile, download on desktop), or print the copy.
export default function ReceiptShareModal({
  open,
  onClose,
  order,
  businessName = "Business",
  businessTagline = "Restaurant",
  businessLogo = "",
  accent = "#4F46E5",
  businessId = "",
  initialPhone = "",
  onPrint,
}) {
  const cardRef = useRef(null);
  const [phone, setPhone] = useState(initialPhone || "");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [busy, setBusy] = useState(null); // "image" | "whatsapp" | null
  const [notice, setNotice] = useState(null); // { ok, text }

  // M-Pesa payments already know the customer number — prefill it each
  // time the sheet opens so the cashier just taps Send.
  useEffect(() => {
    if (open) {
      setPhone(initialPhone || "");
      setPhoneTouched(false);
      setNotice(null);
      setBusy(null);
    }
  }, [open, initialPhone]);

  if (!open || !order) return null;

  const showPhoneError = phoneTouched && phone.trim() !== "" && !isValidKePhone(phone);

  // ALWAYS sends the receipt as an IMAGE of the card above.
  // 1) Captures the PNG. 2) If the server has WhatsApp API configured,
  // delivers it straight to the customer number. 3) Otherwise falls back
  // to the OS share sheet (pick WhatsApp there) or a download on desktop.
  const handleSendWhatsApp = async () => {
    setPhoneTouched(true);
    if (!isValidKePhone(phone)) {
      setNotice({ ok: false, text: "Enter a valid customer number, e.g. 0712345678." });
      return;
    }
    setBusy("whatsapp");
    setNotice(null);
    let file = null;
    try {
      file = await captureReceiptImage(cardRef.current, order.id);
    } catch (err) {
      setNotice({ ok: false, text: err?.message || "Could not create the receipt image." });
      setBusy(null);
      return;
    }
    try {
      // Direct image delivery via the backend WhatsApp API.
      await sendReceiptImageDirect({
        file,
        transactionBackendId: order?.backendId,
        orderNumber: order?.id,
        phone,
        businessId,
      });
      setNotice({ ok: true, text: "Receipt image sent to the customer's WhatsApp." });
    } catch (err) {
      if (err?.code === "WHATSAPP_NOT_CONFIGURED") {
        // No API yet — share the image sheet so the cashier picks
        // WhatsApp + the contact there. Nothing else to set up.
        try {
          const result = await shareReceiptImage(file);
          setNotice({
            ok: true,
            text:
              result === "shared"
                ? "Pick WhatsApp in the share options to send the receipt image."
                : "Receipt image downloaded — attach it in the customer's WhatsApp chat.",
          });
        } catch (shareErr) {
          if (shareErr?.name !== "AbortError") {
            setNotice({ ok: false, text: "Could not share the receipt image." });
          }
        }
      } else {
        setNotice({
          ok: false,
          text: err?.message || "Could not send the receipt image.",
          manualFallback: true,
        });
      }
    } finally {
      setBusy(null);
    }
  };

  const handleManualWhatsApp = () => {
    openWhatsAppChat(phone, buildWhatsAppText(order, { businessName }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle size={18} className="text-green-600 shrink-0" />
            <h2 className="font-bold text-gray-800 truncate">Payment complete</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-2"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto">
          <p className="text-sm text-gray-500 mb-3 text-center">
            Receipt for order <span className="font-mono font-semibold text-gray-800">{order.id}</span> —
            share it with the customer below.
          </p>

          {/* Receipt preview (this exact card is captured as the image) */}
          <div className="flex justify-center rounded-xl bg-gray-100 border border-gray-200 p-4 mb-4 overflow-x-auto">
            <div className="shadow-lg rounded-[14px] shrink-0">
              <ReceiptCard
                ref={cardRef}
                order={order}
                businessName={businessName}
                businessTagline={businessTagline}
                businessLogo={businessLogo}
                accent={accent}
              />
            </div>
          </div>

          {/* Customer WhatsApp number */}
          <TextInput
            id="receipt-whatsapp-phone"
            label="Customer WhatsApp number"
            placeholder="e.g. 0712345678"
            input={phone}
            handleInput={(e) => setPhone(e.target.value)}
            handleBlur={() => setPhoneTouched(true)}
            error={showPhoneError}
            errorMessage="Invalid Kenyan number (e.g. 0712345678)"
            type="tel"
          />

          {notice && (
            <div
              className={`mt-2 text-xs font-medium rounded-lg px-3 py-2 ${
                notice.ok
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <p>{notice.text}</p>
              {notice.manualFallback && isValidKePhone(phone) && (
                <button
                  type="button"
                  onClick={handleManualWhatsApp}
                  className="mt-1 underline font-semibold hover:opacity-80"
                >
                  Open WhatsApp manually instead
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 shrink-0 space-y-2.5">
          <button
            type="button"
            onClick={handleSendWhatsApp}
            disabled={busy !== null}
            className="w-full py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <MessageCircle size={16} />
            {busy === "whatsapp" ? "Sending image…" : "Send receipt image on WhatsApp"}
          </button>
          <button
            type="button"
            onClick={() => onPrint && onPrint(order)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Printer size={15} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}
