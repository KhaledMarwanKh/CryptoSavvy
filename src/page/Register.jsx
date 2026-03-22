import React, { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router";
import axiosInst from "../libs/axiosInst";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { isValidEmail } from "../utils/validators";
import { useTranslation } from "react-i18next"

function Register() {
    const { i18n, t } = useTranslation()
    const navigate = useNavigate();

    const [authData, setAuthData] = useState({
        name: "",
        email: "",
        password: "",
        passwordConfirm: ""
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSignUp = async (e) => {
        e.preventDefault();

        setIsLoading(true);

        if (authData.name.trim() === "") {
            setMessage({ type: "error", text: t("register.errorMessags.m1") });
            setIsLoading(false);
            return;
        }

        if (authData.email.trim() === "") {
            setMessage({ type: "error", text: t("register.errorMessages.m2") });
            setIsLoading(false);
            return;
        }


        if (!isValidEmail(authData.email.trim())) {
            setMessage({ type: "error", text: t("register.errorMessages.m7") });
            setIsLoading(false);
            return;
        }

        if (authData.password.trim() === "") {
            setMessage({ type: "error", text: t("register.errorMessages.m3") });
            setIsLoading(false);
            return;
        }

        if (authData.passwordConfirm.trim() === "") {
            setMessage({ type: "error", text: t("register.errorMessages.m4") });
            setIsLoading(false);
            return;
        }

        if (authData.password.length < 8) {
            setMessage({ type: "error", text: t("register.errorMessages.m5") });
            setIsLoading(false);
            return;
        }

        if (authData.password !== authData.passwordConfirm) {
            setMessage({ type: "error", text: t("register.errorMessages.m6") });
            setIsLoading(false);
            return;
        }

        const apiURL = import.meta.env.VITE_API_URL + "/api/user"

        try {

            await axiosInst.post(apiURL + "/register", authData);

            toast.success(`${t("register.sent")}${authData.email}`);

            setTimeout(() => {
                navigate("/auth/verify-code");
            }, 1000);

            localStorage.setItem("mode", "verify-signup");

        } catch (error) {
            if (error instanceof AxiosError) {
                setMessage({
                    type: "error",
                    text: error?.response?.data?.message ?? t("login.error"),
                });
            }
        }

        setIsLoading(false);

    }

    return (
        <div className="py-5 h-full overflow-scroll w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
            <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 px-8 py-4 rounded">
                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">
                        {t("register.title")}
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">{t("register.greet")}</p>
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
                <form onSubmit={handleSignUp} className="space-y-5">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            {t("register.labels.name")}
                        </label>
                        <div dir="ltr" className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="John Doe"
                                onChange={(e) => {
                                    setAuthData((prev) => ({
                                        ...prev,
                                        name: e.target.value
                                    }))
                                }}
                                className="w-full border border-gray-300 pr-4 pl-10 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            {t("register.labels.email")}
                        </label>
                        <div dir="ltr" className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="email"
                                placeholder="your@email.com"
                                onChange={(e) => {
                                    setAuthData((prev) => ({
                                        ...prev,
                                        email: e.target.value
                                    }))
                                }}
                                className="w-full border border-gray-300 pr-4 pl-10 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            {t("register.labels.password")}
                        </label>
                        <div dir="ltr" className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                onChange={(e) => {
                                    setAuthData((prev) => ({
                                        ...prev,
                                        password: e.target.value
                                    }))
                                }}
                                className="w-full border border-gray-300 pr-4 pl-10 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            {t("register.labels.confirm")}
                        </label>
                        <div dir="ltr" className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="password"
                                onChange={(e) => {
                                    setAuthData((prev) => ({
                                        ...prev,
                                        passwordConfirm: e.target.value
                                    }))
                                }}
                                placeholder="••••••••"
                                className="w-full border border-gray-300 pr-4 pl-10 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            {t("register.errorMessages.m5")}
                        </p>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition duration-200 shadow-md"
                    >
                        {
                            isLoading ? (
                                <span className="loading loading-spinner"></span>
                            ) : t("register.create")
                        }
                    </button>

                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    {t("register.haveAcc")}{" "}
                    <a onClick={() => navigate("/auth/login")} className="text-blue-600 font-semibold hover:underline cursor-pointer">
                        {t("register.login")}
                    </a>
                </p>
            </div>
        </div>
    );
}

export default Register;