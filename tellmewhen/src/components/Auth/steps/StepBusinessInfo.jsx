"use client";

// Optional, skippable — everything customer-facing. No field here is
// required to proceed (see RegistrationWizard's "Skip for now" button).
function StepBusinessInfo({ values, update }) {
    const handleChange = (field) => (e) => update({ [field]: e.target.value });

    return (
        <div className="space-y-4">
            <p className="text-gray-500 text-sm">
                Optional — this information is shown to your customers. You can skip this step and add it later.
            </p>

            <div>
                <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                    Address / location:
                </label>
                <input
                    type="text"
                    id="address"
                    placeholder="123 Main Street, Manchester"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={values.address}
                    onChange={handleChange("address")}
                />
            </div>

            <div>
                <label htmlFor="locationLink" className="block text-gray-700 font-medium mb-2">
                    Google Maps or what3words link:
                </label>
                <input
                    type="url"
                    id="locationLink"
                    placeholder="https://maps.google.com/..."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={values.locationLink}
                    onChange={handleChange("locationLink")}
                />
            </div>

            <div>
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Phone number:
                </label>
                <input
                    type="tel"
                    id="phone"
                    placeholder="01234 567890"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={values.phone}
                    onChange={handleChange("phone")}
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email address:
                </label>
                <input
                    type="email"
                    id="email"
                    placeholder="hello@yourbusiness.co.uk"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={values.email}
                    onChange={handleChange("email")}
                />
            </div>

            <div>
                <label htmlFor="openingHours" className="block text-gray-700 font-medium mb-2">
                    Opening hours:
                </label>
                {/* Free-text for now — structured per-day hours is a possible
                    future enhancement, not built as part of this wizard. */}
                <textarea
                    id="openingHours"
                    placeholder="Mon–Fri 9am–5pm, Sat 10am–2pm, Sun closed"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={values.openingHours}
                    onChange={handleChange("openingHours")}
                />
            </div>
        </div>
    );
}

export default StepBusinessInfo;
