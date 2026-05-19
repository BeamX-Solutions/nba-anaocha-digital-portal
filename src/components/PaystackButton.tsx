import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

declare global {
  interface Window { PaystackPop: any; }
}

const loadPaystackScript = (): Promise<void> =>
  new Promise((resolve) => {
    if (window.PaystackPop) { resolve(); return; }
    const existing = document.querySelector('script[src*="paystack"]');
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });

const generateRef = (prefix = "NBA") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

interface PaystackButtonProps {
  email: string;
  amountNaira: number;
  label?: string;
  prefix?: string;
  metadata?: Record<string, any>;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

const PaystackButton = ({
  email,
  amountNaira,
  label,
  prefix = "NBA",
  metadata = {},
  onSuccess,
  onClose,
  disabled,
  loading,
  className,
  variant = "default",
  size = "default",
}: PaystackButtonProps) => {
  const openingRef = useRef(false);

  const handleClick = useCallback(async () => {
    if (openingRef.current || disabled || loading) return;
    openingRef.current = true;
    try {
      await loadPaystackScript();
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email,
        amount: Math.round(amountNaira * 100), // kobo
        currency: "NGN",
        ref: generateRef(prefix),
        metadata: {
          ...metadata,
          custom_fields: [
            { display_name: "Portal", variable_name: "portal", value: prefix },
          ],
        },
        callback: (res: any) => { openingRef.current = false; onSuccess(res.reference); },
        onClose: () => { openingRef.current = false; onClose?.(); },
      });
      handler.openIframe();
    } catch {
      openingRef.current = false;
    }
  }, [email, amountNaira, prefix, metadata, onSuccess, onClose, disabled, loading]);

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading
        ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying payment...</>
        : <><CreditCard className="h-4 w-4 mr-2" />{label ?? `Pay ₦${amountNaira.toLocaleString("en-NG")}`}</>}
    </Button>
  );
};

export default PaystackButton;
