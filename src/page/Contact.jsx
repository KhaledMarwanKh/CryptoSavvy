import React, { useMemo, useState } from "react";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next"

export default function Contact() {
    const { t, i18n } = useTranslation();
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [status, setStatus] = useState({
        type: "", // "success" | "error" | ""
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const errors = useMemo(() => {
        const e = {};
        if (!form.name.trim()) e.name = t("contactUs.errorMessages.m1");
        if (!form.email.trim()) e.email = t("contactUs.errorMessages.m2");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
            e.email = t("contactUs.errorMessages.m3");
        if (!form.subject.trim()) e.subject = t("contactUs.errorMessages.m4");
        if (!form.message.trim()) e.message = t("contactUs.errorMessages.m5");
        return e;
    }, [form, t, i18n.language]);

    const hasErrors = Object.keys(errors).length > 0;

    const update = (key) => (e) => {
        setStatus({ type: "", message: "" });
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "", message: "" });

        if (hasErrors) {
            setStatus({
                type: "error",
                message: t("contactUs.errorMessages.m6"),
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate request
            await new Promise((r) => setTimeout(r, 700));

            setStatus({
                type: "success",
                message: t("contactUs.successMessages"),
            });
            setForm({ name: "", email: "", subject: "", message: "" });
        } catch {
            setStatus({
                type: "error",
                message: t("contactUs.errorMessages.m7"),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const Field = ({ label, error, children }) => (
        <label className="block">
            <div className="mb-2 text-sm font-medium text-slate-300">{label}</div>
            {children}
            {error ? <div className="mt-2 text-xs text-red-400">{error}</div> : null}
        </label>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-slate-100">
            <div className="mx-auto w-full max-w-6xl">
                {/* Status banner */}
                {status.type ? (
                    <div
                        className={[
                            "mb-6 rounded-2xl border p-4 backdrop-blur-xl",
                            status.type === "success"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-red-500/30 bg-red-500/10 text-red-400",
                        ].join(" ")}
                    >
                        <div className="flex items-start gap-2">
                            {status.type === "success" ? (
                                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                            ) : (
                                <AlertTriangle className="mt-0.5 h-5 w-5" />
                            )}
                            <div className="text-sm">{status.message}</div>
                        </div>
                    </div>
                ) : null}

                {/* Main content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Contact info */}
                    <div
                        className={[
                            "order-2 lg:order-1 lg:col-span-1",
                            "rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4 md:p-6",
                            "shadow-md backdrop-blur-xl",
                        ].join(" ")}
                    >

                        <div className="space-y-3">
                            <InfoRow
                                icon={<Mail className="h-4 w-4 text-blue-600" />}
                                title={t("contactUs.infoRows.r1.title")}
                                value="support@example.com"
                                hint={t("contactUs.infoRows.r1.hint")}
                            />
                            <InfoRow
                                icon={<Phone className="h-4 w-4 text-blue-600" />}
                                title={t("contactUs.infoRows.r2.title")}
                                value="+9639319391391"
                                hint={t("contactUs.infoRows.r2.hint")}
                            />
                            <InfoRow
                                icon={<MapPin className="h-4 w-4 text-blue-600" />}
                                title={t("contactUs.infoRows.r3.title")}
                                value={t("contactUs.infoRows.r3.value")}
                                hint={t("contactUs.infoRows.r3.hint")}
                            />
                            <InfoRow
                                icon={<Clock className="h-4 w-4 text-blue-600" />}
                                title={t("contactUs.infoRows.r4.title")}
                                value={t("contactUs.infoRows.r2.hint")}
                                hint={t("contactUs.infoRows.r4.hint")}
                            />
                        </div>
                    </div>

                    {/* Form */}
                    <div
                        className={[
                            "order-1 lg:order-2 lg:col-span-2",
                            "rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4 md:p-6",
                            "shadow-md backdrop-blur-xl",
                        ].join(" ")}
                    >
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <div className="text-lg font-semibold">{t("contactUs.form.send")}</div>
                                <div className="mt-1 text-sm text-slate-400">
                                    {t("contactUs.form.fill")}
                                </div>
                            </div>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field label={t("contactUs.form.inputs.in1.label")} error={errors.name}>
                                    <input
                                        value={form.name}
                                        onChange={update("name")}
                                        className={[
                                            "w-full p-2 text-gray-400 bg-slate-950/60 border border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ",
                                        ].join(" ")}
                                        placeholder={t("contactUs.form.inputs.in1.placeholder")}
                                        autoComplete="name"
                                    />
                                </Field>

                                <Field label={t("contactUs.form.inputs.in2.label")} error={errors.email}>
                                    <input
                                        value={form.email}
                                        onChange={update("email")}
                                        className="w-full p-2 text-gray-400 bg-slate-950/60 border border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 "
                                        placeholder="you@domain.com"
                                        autoComplete="email"
                                    />
                                </Field>
                            </div>

                            <Field label={t("contactUs.form.inputs.in3.label")} error={errors.subject}>
                                <input
                                    value={form.subject}
                                    onChange={update("subject")}
                                    className="w-full p-2 text-gray-400 bg-slate-950/60 border border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 "
                                    placeholder={t("contactUs.form.inputs.in3.placeholder")}
                                />
                            </Field>

                            <Field label={t("contactUs.form.inputs.in4.label")} error={errors.message}>
                                <textarea
                                    value={form.message}
                                    onChange={update("message")}
                                    rows={6}
                                    className="w-full p-2 text-gray-400 bg-slate-950/60 border border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 "
                                    placeholder={t("contactUs.form.inputs.in1.placeholder")}
                                />
                            </Field>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-xs text-slate-400">
                                    {t("contactUs.form.agree")}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={[
                                        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2",
                                        "bg-blue-600 text-white shadow-md transition hover:bg-blue-700",
                                        "disabled:opacity-60 disabled:cursor-not-allowed",
                                    ].join(" ")}
                                >
                                    <Send className="h-4 w-4" />
                                    {isSubmitting ? t("contactUs.form.sending") : t("contactUs.form.send")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, title, value, hint }) {
    return (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/60">
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-300">{title}</div>
                    <div className="mt-0.5 truncate font-semibold text-slate-100">{value}</div>
                    {hint ? <div className="mt-1 text-xs text-slate-400">{hint}</div> : null}
                </div>
            </div>
        </div>
    );
}

function SocialPill({ label }) {
    return (
        <button
            type="button"
            className="rounded-full border border-slate-700/50 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-900"
        >
            {label}
        </button>
    );
}