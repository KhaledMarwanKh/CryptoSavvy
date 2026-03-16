import React, { useState } from "react";
import { useNavigate } from "react-router";
import axiosInst from "../libs/axiosInst";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { isValidEmail } from "../utils/validators";

export default function ResetPassword() {
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
            setMessage({ type: "error", text: "Please enter your email address." });
            setLoading(false);
            return;
        }

        if (!isValidEmail(form.email.trim())) {
            setMessage({ type: "error", text: "Please enter a valid email address." });
            setLoading(false);
            return;
        }

        if (form.password.trim() === "") {
            setMessage({ type: "error", text: "Please enter your password." });
            setLoading(false);
            return;
        }

        if (form.password.length < 8) {
            setMessage({ type: "error", text: "Password must be at least 8 characters" });
            setLoading(false);
            return;
        }

        if (form.passwordConfirm.trim() === "") {
            setMessage({ type: "error", text: "Please enter confirm password." });
            setLoading(false);
            return;
        }

        const apiURL = import.meta.env.VITE_API_URL + "/api/user"

        try {
            await axiosInst.patch(apiURL + "/resetPassword", form);

            setTimeout(() => {
                navigate("/auth/login");
            }, 2000);

            toast.success("Password has been changed successfully");

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
                        Reset Password
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        Enter your email and choose a new secure password.
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
                            Email Address
                        </label>
                        <input
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
                            New Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter new password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-white border border-slate-700 px-4 py-3 text-gray-700 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Must be at least 8 characters.
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="passwordConfirm"
                            placeholder="Re-enter password"
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
                        ) : "Reset Password"}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        Remember your password?{" "}
                        <a
                            onClick={() => navigate("/auth/login")}
                            className="text-blue-600 hover:underline cursor-pointer font-semibold transition"
                        >
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
