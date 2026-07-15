"use client";

// TODO: replace with real Terms of Service copy before public launch —
// everything in the scrollable block below is placeholder text. The
// acceptance checkbox is still functionally required (gates the "Create
// Business" button in RegistrationWizard), and the acceptance timestamp
// is set server-side on submit — never trust a client-supplied one.
function StepTermsOfService({ values, update }) {
    return (
        <div className="space-y-4">
            <div className="max-h-64 overflow-y-scroll border rounded-lg p-4 text-sm text-gray-600 bg-gray-50">
                <p className="font-semibold mb-2">Terms of Service (placeholder)</p>
                <p className="mb-2">
                    This is placeholder Terms of Service text. By creating a business account
                    with TellMeWhen, you agree to use the service responsibly and in
                    accordance with applicable law. Real legal terms will replace this text
                    before public launch.
                </p>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                    commodo consequat.
                </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={values.tosAccepted}
                    onChange={(e) => update({ tosAccepted: e.target.checked })}
                    className="w-4 h-4"
                />
                <span className="text-gray-700">I accept the Terms of Service</span>
            </label>
        </div>
    );
}

export default StepTermsOfService;
