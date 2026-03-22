import React, { useState } from "react";
import { useNavigate } from "react-router";
import axiosInst from "../libs/axiosInst";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { isValidEmail } from "../utils/validators";
import { useTranslation } from "react-i18next"

export default function ResetPassword() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
        passwordConfirm: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // {type: "success" | "error", text: ""}

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        if (form.email.trim() === "") {
            setMessage({ type: "error", text: t("resetPassword.errorMessages.m1") });
            setLoading(false);
            return;
        }

        if (!isValidEmail(form.email.trim())) {
            setMessage({ type: "error", text: t("login.errorMessags.m4") });
            setLoading(false);
            return;
        }

        if (form.password.trim() === "") {
            setMessage({ type: "error", text: t("resetPassword.errorMessages.m2") });
            setLoading(false);
            return;
        }

        if (form.password.length < 8) {
            setMessage({ type: "error", text: t("resetPassword.errorMessages.m3") });
            setLoading(false);
            return;
        }

        if (form.passwordConfirm.trim() === "") {
            setMessage({ type: "error", text: t("resetPassword.errorMessages.m4") });
            setLoading(false);
            return;
        }

        const apiURL = import.meta.env.VITE_API_URL + "/api/user"

        try {
            await axiosInst.patch(apiURL + "/resetPassword", form);

            setTimeout(() => {
                navigate("/auth/login");
            }, 2000);

            toast.success(t("resetPassword.successMessages.s1"));

        } catch (error) {
            if (error instanceof AxiosError) {
                setMessage({
                    type: "error",
                    text: error?.response?.data?.message ?? t("login.error"),
                });
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
            <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white tracking-wide">
                        {t("resetPassword.title")}
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        {t("resetPassword.subTitle")}
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium border ${message.type === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            {t("register.labels.email")}
                        </label>
                        <input
                            dir="ltr"
                            type="email"
                            name="email"
                            placeholder="example@email.com"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-white border border-slate-700 px-4 py-3 text-gray-700 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            {t("register.labels.password")}
                        </label>
                        <input
                            dir="ltr"
                            type="password"
                            name="password"
                            placeholder="*********"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-white border border-slate-700 px-4 py-3 text-gray-700 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            {t("resetPassword.errorMessages.m3")}
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            {t("register.labels.confirm")}
                        </label>
                        <input
                            dir="ltr"
                            type="password"
                            name="passwordConfirm"
                            placeholder="*********"
                            value={form.passwordConfirm}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-white border border-slate-700 px-4 py-3 text-gray-700 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition duration-200 shadow-md"
                    >
                        {loading ? (
                            <span className="loading loading-spinner"></span>
                        ) : t("resetPassword.title")}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        {t("resetPassword.remPass")}{" "}
                        <a
                            onClick={() => navigate("/auth/login")}
                            className="text-blue-600 hover:underline cursor-pointer font-semibold transition"
                        >
                            {t("resetPassword.signIn")}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
