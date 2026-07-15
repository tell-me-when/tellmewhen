"use client";
import { useEffect, useRef } from "react";
import { slugify, checkSubdomainAvailability } from "@/scripts/subdomain";

// Props:
//  - values: wizard state (businessName, subdomain, subdomainTouched, subdomainStatus, subdomainMessage)
//  - update: (patch) => void, merges into wizard state
//  - fieldError: 'name' | 'subdomain' | '' — set by the parent when the
//    final submit comes back 409 (the rare TOCTOU case where the live
//    check said available a moment ago but another registration won the
//    race since)
function StepBusinessName({ values, update, fieldError }) {
    const debounceRef = useRef(null);

    const handleNameChange = (e) => {
        const businessName = e.target.value;
        const patch = { businessName };
        // Only auto-derive the subdomain until the user edits it directly —
        // once they've touched it, further name edits stop overwriting it.
        if (!values.subdomainTouched) {
            patch.subdomain = slugify(businessName);
        }
        update(patch);
    };

    const handleSubdomainChange = (e) => {
        update({ subdomain: slugify(e.target.value), subdomainTouched: true });
    };

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const subdomain = values.subdomain;
        if (!subdomain || subdomain.length < 3) {
            update({
                subdomainStatus: "idle",
                subdomainMessage: subdomain ? "Subdomain must be at least 3 characters." : "",
            });
            return;
        }

        update({ subdomainStatus: "checking" });
        debounceRef.current = setTimeout(async () => {
            const result = await checkSubdomainAvailability(subdomain);
            if (result.invalid) {
                update({ subdomainStatus: "invalid", subdomainMessage: result.message });
            } else if (result.error) {
                update({ subdomainStatus: "idle", subdomainMessage: "Couldn't check availability — try again." });
            } else if (result.available) {
                update({ subdomainStatus: "available", subdomainMessage: "" });
            } else {
                update({ subdomainStatus: "taken", subdomainMessage: "That subdomain is already taken." });
            }
        }, 400);

        return () => clearTimeout(debounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.subdomain]);

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="businessName" className="block text-gray-700 font-medium mb-2">
                    Business name:
                </label>
                <input
                    type="text"
                    id="businessName"
                    placeholder="Enter your business name"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={values.businessName}
                    onChange={handleNameChange}
                />
                {values.businessName === "" && <p className="text-red-500 text-sm">Business name cannot be blank.</p>}
                {fieldError === "name" && <p className="text-red-500 text-sm">A business with that name already exists.</p>}
            </div>

            <div>
                <label htmlFor="subdomain" className="block text-gray-700 font-medium mb-2">
                    Your subdomain:
                </label>
                <div className="flex items-center gap-1">
                    <input
                        type="text"
                        id="subdomain"
                        placeholder="your-business"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={values.subdomain}
                        onChange={handleSubdomainChange}
                    />
                    <span className="text-gray-500 whitespace-nowrap text-sm">.tellmewhen.co.uk</span>
                </div>
                {values.subdomainStatus === "checking" && <p className="text-gray-500 text-sm">Checking availability...</p>}
                {values.subdomainStatus === "available" && <p className="text-green-600 text-sm">Available</p>}
                {values.subdomainStatus === "taken" && <p className="text-red-500 text-sm">{values.subdomainMessage || "That subdomain is already taken."}</p>}
                {values.subdomainStatus === "invalid" && <p className="text-red-500 text-sm">{values.subdomainMessage}</p>}
                {fieldError === "subdomain" && values.subdomainStatus !== "taken" && <p className="text-red-500 text-sm">That subdomain is already taken.</p>}
            </div>
        </div>
    );
}

export default StepBusinessName;
