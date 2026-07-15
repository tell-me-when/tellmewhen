import axios from "axios";
import { GetServerEndpoint } from "./script-settings";
const endpoint = GetServerEndpoint();

// Client-side-only convenience for auto-suggesting a subdomain from the
// typed business name. NOT the source of truth for validity — the
// backend's constants/subdomain.js owns the real format+blocklist rules;
// this only needs to produce something *likely* to pass, cheaply, as the
// user types.
export function slugify(input) {
    return (input || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 63);
}

// Debounced-friendly wrapper around GET /register/check-subdomain. Raw
// axios — no auth session exists yet during registration (same reason
// Login/Register/RefreshToken/ClearCookies in login.js all use raw axios
// instead of apiClient).
export async function checkSubdomainAvailability(subdomain) {
    try {
        const res = await axios.get(endpoint + "/register/check-subdomain", {
            params: { subdomain },
        });
        return { status: res.status, available: res.data.available };
    } catch (err) {
        if (err.response?.status === 400) {
            return {
                status: 400,
                available: false,
                invalid: true,
                message: err.response.data?.issues?.[0] || "Invalid subdomain",
            };
        }
        return { status: err.response?.status || null, available: false, error: true };
    }
}
