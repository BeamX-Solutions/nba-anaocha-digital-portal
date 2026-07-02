import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initMonitoring, reportError } from "./lib/monitoring";
import "./index.css";

initMonitoring();

const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_PAYSTACK_PUBLIC_KEY',
] as const;

const missing = REQUIRED_ENV_VARS.filter(
  (key) => !import.meta.env[key]
);

if (missing.length > 0) {
  document.body.innerHTML = `<div style="font-family:sans-serif;padding:2rem;color:#c00">
    <h2>Missing environment variables</h2>
    <p>The following variables are required but not set:</p>
    <ul>${missing.map((k) => `<li><code>${k}</code></li>`).join('')}</ul>
    <p>Copy <code>.env.example</code> to <code>.env</code> and fill in the values.</p>
  </div>`;
  throw new Error(`Missing env vars: ${missing.join(', ')}`);
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
  reportError(event.reason, { source: 'unhandledrejection' });
});

createRoot(document.getElementById("root")!).render(<App />);
