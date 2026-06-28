import { Check, X } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/password";

/** Live checklist of the password rules; ticks each one green as it's met. */
export const PasswordRequirements = ({ password }: { password: string }) => (
  <ul className="mt-2 space-y-1">
    {PASSWORD_RULES.map((rule) => {
      const passed = rule.test(password);
      return (
        <li
          key={rule.label}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            passed ? "text-green-600" : "text-muted-foreground"
          }`}
        >
          {passed ? <Check className="h-3.5 w-3.5 flex-shrink-0" /> : <X className="h-3.5 w-3.5 flex-shrink-0" />}
          {rule.label}
        </li>
      );
    })}
  </ul>
);

export default PasswordRequirements;
