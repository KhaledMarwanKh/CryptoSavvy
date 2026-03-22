import React, { useState } from "react";
import axiosInst from "../libs/axiosInst";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import { isValidEmail } from "../utils/validators";
import { useTranslation } from "react-i18next"

function Verfication() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    code: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // success / error message

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const { mode } = localStorage;

    if (!form.email) {
      setMessage({ type: "error", text: t("verification.errorMessages.m1") });
      setLoading(false);
      return;
    }

    if (!isValidEmail(form.email.trim())) {
      setMessage({ type: "error", text: t("login.errorMessags.m4") });
      setLoading(false);
      return;
    }

    if (!form.code) {
      setMessage({ type: "error", text: t("verification.errorMessages.m2") });
      setLoading(false);
      return;
    }

    const apiURL = import.meta.env.VITE_API_URL + "/api/user"

    if (mode === "verify-signup") {

      try {
        const response = (await axiosInst.post(apiURL + "/verify-singnup", form)).data;

        navigate("/");

        toast.success(t("verification.success"));

        localStorage.setItem("isAuth", true);

        localStorage.setItem("userToken", response.token);

        localStorage.removeItem("mode");

      } catch (error) {
        if (error instanceof AxiosError) {
          setMessage({
            type: "error",
            text: error?.response?.data?.message ?? t("login.error"),
          });
        }
      }

    } else {

      try {
        await axiosInst.post(apiURL + "/verify-resetcode", form);

        setTimeout(() => {
          navigate("/auth/reset-password");
        }, 1000)

        toast.success(t("verification.success"));

        localStorage.removeItem("mode");

      } catch (error) {
        if (error instanceof AxiosError) {
          setMessage({
            type: "error",
            text: error?.response?.data?.message ?? t("login.error"),
          });
        }
      }

    }

    setLoading(false);

  };

  const handleResend = async () => {
    const apiURL = import.meta.env.VITE_API_URL + "/api/user"

    if (form.email.trim() === "") {
      setMessage({ type: "error", text: t("login.errorMessags.m1") });
      setLoading(false);
      return;
    }

    if (!isValidEmail(form.email.trim())) {
      setMessage({ type: "error", text: t("login.errorMessags.m4") });
      setLoading(false);
      return;
    }

    try {
      await axiosInst.post(apiURL + "/forgot-password", { email: form.email });

      toast.success(`${t("register.sent")} ${form.email}`);

      setTimeout(() => {
        navigate('/auth/verify-code');
      }, 1000)

      localStorage.setItem("mode", "forgot-password");

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

          {
            localStorage.getItem("mode") === "verify-signup" ? (
              <h1 className="text-2xl font-bold text-white tracking-wide">
                {t("verification.verA")}
              </h1>
            ) : (
              <h1 className="text-2xl font-bold text-white tracking-wide">
                {t("verification.ver")}
              </h1>
            )
          }

          <p className="text-slate-400 mt-2 text-sm">
            {t("verification.enterCode")}
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
              {t("login.labels.email")}
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

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t("verification.verCode")}
            </label>
            <input
              dir="ltr"
              type="text"
              name="code"
              placeholder="(e.g. 123456)"
              value={form.code}
              onChange={handleChange}
              maxLength={6}
              className="w-full rounded-xl bg-white border border-slate-700 px-4 py-3 text-gray-700 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <p className="text-xs text-slate-500 mt-2 text-center">
              {t("verification.error")}
            </p>
          </div>

          {/* Buttons */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2.5 rounded-md font-semibold shadow-md"
          >
            {loading ? t("verification.verLoad") : t("verification.verL")}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleResend}
            className="w-full border hover:bg-blue-600 hover:text-white duration-400 border-blue-600 transition text-white/60 py-2.5 rounded-md font-semibold shadow-md"
          >
            {t("verification.resend")}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            {t("verification.foot")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Verfication;