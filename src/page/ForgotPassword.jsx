import React, { useState } from "react";
import { useNavigate } from "react-router";
import axiosInst from "../libs/axiosInst";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { isValidEmail } from "../utils/validators";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: "success" | "error", text: "" }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        if (email.trim() === "") {
            setMessage({ type: "error", text: "Please enter your email address." });
            setLoading(false);
            return;
        }

        if (!isValidEmail(email.trim())) {
            setMessage({ type: "error", text: "Please enter a vaild email address." });
            setLoading(false);
            return;
        }

        const apiURL = import.meta.env.VITE_API_URL + "/api/user"

        try {
            await axiosInst.post(apiURL + "/forget-password", { email });

            toast.success(`A Verification Code is sent to ${email}`);

            setTimeout(() => {
                navigate('/auth/verify-code');
            }, 1000)

            localStorage.setItem("mode", "forgot-password");

        } catch (error) {
            if (error instanceof AxiosError) {
                setMessage({
                    type: "error",
                    text: error?.response?.data?.message ?? "Something goes wrong",
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
                        Forgot Password
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        Enter your email and we will send you a reset code.
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
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl bg-white border border-slate-700 px-4 py-3 text-gray-700 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2.5 rounded-md font-semibold shadow-md"
                    >
                        {
                            loading ? (
                                <span className="loading loading-spinner"></span>
                            ) : "Send Code"
                        }
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-400">
                        Back to{" "}
                        <a
                            onClick={() => navigate("/auth/login")}
                            className="text-blue-600 hover:underline font-semibold transition cursor-pointer"
                        >
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
