"use client";

// Same rules as the original single-page register form: min 8 characters,
// live "don't match" feedback.
function StepPassword({ values, update }) {
    const mismatch = values.confirmPassword !== "" && values.password !== values.confirmPassword;
    const tooShort = values.password !== "" && values.password.length < 8;

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                    Password:
                </label>
                <input
                    type="password"
                    id="password"
                    placeholder="Enter a password"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={values.password}
                    onChange={(e) => update({ password: e.target.value })}
                />
                {tooShort && <p className="text-red-500 text-sm">Password must be at least 8 characters.</p>}
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                    Confirm password:
                </label>
                <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={values.confirmPassword}
                    onChange={(e) => update({ confirmPassword: e.target.value })}
                />
                {mismatch && <p className="text-red-500 text-sm">Passwords don't match!</p>}
            </div>
        </div>
    );
}

export default StepPassword;
