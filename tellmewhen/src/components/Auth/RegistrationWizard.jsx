"use client";
import { useState } from "react";
import { Button, Stepper, Step, StepIndicator } from "@mui/joy";
import { Register, Login, ClearCookies } from "@/scripts/login";
import StepBusinessName from "./steps/StepBusinessName";
import StepBusinessInfo from "./steps/StepBusinessInfo";
import StepPassword from "./steps/StepPassword";
import StepTermsOfService from "./steps/StepTermsOfService";

const STEP_LABELS = ["Business Name", "Business Info", "Password", "Terms of Service"];

const initialValues = {
    businessName: "",
    subdomain: "",
    subdomainTouched: false,
    subdomainStatus: "idle", // idle | checking | available | taken | invalid
    subdomainMessage: "",
    address: "",
    locationLink: "",
    phone: "",
    email: "",
    openingHours: "",
    password: "",
    confirmPassword: "",
    tosAccepted: false,
};

// Props:
//  - onRegistered: () => void — called once registration + auto-login both
//    succeed (the parent auth page redirects to /dashboard from here).
function RegistrationWizard({ onRegistered }) {
    const [step, setStep] = useState(0);
    const [values, setValues] = useState(initialValues);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [fieldError, setFieldError] = useState(""); // 'name' | 'subdomain' | ''

    // All field values + step index live here, never in the step
    // components themselves — this is what guarantees Back navigation
    // never loses anything already entered.
    const update = (patch) => {
        setValues((prev) => ({ ...prev, ...patch }));
        // A stale 409 "already taken" message shouldn't keep showing once
        // the user has actually edited the field it was about.
        if ("businessName" in patch || "subdomain" in patch) {
            setFieldError("");
        }
    };

    const goNext = () => setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    const goBack = () => setStep((s) => Math.max(s - 1, 0));

    const canProceed = {
        0: values.businessName.trim() !== "" && values.subdomainStatus === "available",
        1: true, // optional — Skip and Next both just advance
        2: values.password.length >= 8 && values.password === values.confirmPassword,
        3: values.tosAccepted,
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setSubmitError("");
        setFieldError("");

        try {
            await Register({
                businessName: values.businessName,
                subdomain: values.subdomain,
                password: values.password,
                address: values.address,
                locationLink: values.locationLink,
                phone: values.phone,
                email: values.email,
                openingHours: values.openingHours,
                tosAccepted: values.tosAccepted,
            });
        } catch (err) {
            setSubmitting(false);
            const response = err?.response;
            if (response?.status === 409 && response?.data?.field) {
                // The rare final-submit-time TOCTOU catch — the live check
                // said available a moment ago; another registration won the
                // race since. Should look identical to the live check
                // having found it taken, not a separate error state.
                setFieldError(response.data.field);
                setStep(0);
                if (response.data.field === "subdomain") {
                    update({ subdomainStatus: "taken", subdomainMessage: "That subdomain is already taken." });
                }
                setSubmitError(response.data.error || "That's already taken.");
            } else if (response?.status === 400) {
                setSubmitError("Please check the form and try again.");
            } else {
                setSubmitError("An error occurred while connecting to the server.");
            }
            return;
        }

        // Registration succeeded — auto-login as the new admin, matching
        // the flow the single-page form used to do (ClearCookies first,
        // same as the login tab, in case a stale session is lingering).
        try {
            await ClearCookies();
            const loginRes = await Login("admin", values.businessName, values.password);
            setSubmitting(false);
            if (loginRes && loginRes.status === 200) {
                onRegistered && onRegistered();
            } else {
                setSubmitError("Your business was created — please log in.");
            }
        } catch (err) {
            setSubmitting(false);
            setSubmitError("Your business was created — please log in.");
        }
    };

    return (
        <div className="space-y-6">
            <Stepper sx={{ width: "100%" }}>
                {STEP_LABELS.map((label, index) => (
                    <Step
                        key={label}
                        active={index === step}
                        completed={index < step}
                        indicator={
                            <StepIndicator
                                variant={index <= step ? "solid" : "soft"}
                                color={index < step ? "success" : "primary"}
                            >
                                {index < step ? "✓" : index + 1}
                            </StepIndicator>
                        }
                    >
                        <span className="max-tablet620:hidden text-sm">{label}</span>
                    </Step>
                ))}
            </Stepper>

            {submitError && <p className="text-red-500 text-sm text-center">{submitError}</p>}

            {step === 0 && <StepBusinessName values={values} update={update} fieldError={fieldError} />}
            {step === 1 && <StepBusinessInfo values={values} update={update} />}
            {step === 2 && <StepPassword values={values} update={update} />}
            {step === 3 && <StepTermsOfService values={values} update={update} />}

            <div className="flex justify-between gap-4">
                <Button
                    onClick={goBack}
                    variant="soft"
                    color="neutral"
                    disabled={step === 0 || submitting}
                    className="min-w-[100px]"
                >
                    Back
                </Button>

                {step < STEP_LABELS.length - 1 ? (
                    step === 1 ? (
                        <div className="flex gap-2">
                            <Button onClick={goNext} variant="outlined" color="neutral" className="min-w-[100px]">
                                Skip for now
                            </Button>
                            <Button onClick={goNext} variant="solid" color="primary" className="min-w-[100px]">
                                Next
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={goNext}
                            variant="solid"
                            color="primary"
                            disabled={!canProceed[step]}
                            className="min-w-[100px]"
                        >
                            Next
                        </Button>
                    )
                ) : (
                    <Button
                        onClick={handleSubmit}
                        variant="solid"
                        color="primary"
                        disabled={!canProceed[3] || submitting}
                        className="min-w-[140px]"
                    >
                        {submitting ? "Creating..." : "Create Business"}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default RegistrationWizard;
