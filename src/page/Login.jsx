import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, Mail } from "lucide-react";
import axiosInst from "../libs/axiosInst";
import { toast } from "react-toastify";
import { isValidEmail } from "../utils/validators";
import { AxiosError } from "axios";

function Login() {
  const navigate = useNavigate();

  const [authData, setAuthData] = useState({
    email: "",
    password: ""
  });
  const [message, setMessage] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    if (authData.email.trim() === "") {
      setMessage({ type: "error", text: "Please enter your email address." });
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(authData.email.trim())) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      setIsLoading(false);
      return;
    }

    if (authData.password.trim() === "") {
      setMessage({ type: "error", text: "Please enter your password." });
      setIsLoading(false);
      return;
    }

    if (authData.password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      setIsLoading(false);
      return;
    }

    console.log(authData);

    const apiURL = import.meta.env.VITE_API_URL + "/api/user"

    try {
      await axiosInst.post(apiURL + "/login", authData);

      toast.success("Login Successfully");

      setTimeout(() => {
        navigate("/");
      }, 1000)

      localStorage.setItem("isAuth", true);

    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage({
          type: "error",
          text: error?.response?.data?.message ?? "Something goes wrong",
        });
      }
    }

    setIsLoading(false);

  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 p-8 rounded">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">
            <span className="text-white">Crypto</span>Savvy
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Welcome to the smart analysis platform
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
        <form onSubmit={login} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="flex items-center bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-blue-500">
              <Mail className="w-5 h-5" />
              <input
                type="email"
                onChange={(e) => setAuthData((prev) => ({
                  ...prev,
                  email: e.target.value
                }))}
                placeholder="your@email.com"
                className="w-full pl-3 outline-none bg-transparent text-sm text-gray-700"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="flex items-center bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-blue-500">
              <Lock className="w-5 h-5" />
              <input
                type="password"
                placeholder="••••••••"
                onChange={(e) => setAuthData((prev) => ({
                  ...prev,
                  password: e.target.value
                }))}
                className="w-full pl-3 outline-none bg-transparent text-sm text-gray-700"
              />
            </div>
            <p className="text-[0.7rem] text-slate-400 text-right mt-3" >Forgot Your Password ?  <span className="text-blue-600 font-bold cursor-pointer active:text-slate-300 hover:underline" onClick={() => navigate("/auth/forgot-password")}>Click Here</span></p>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2.5 rounded-md font-semibold shadow-md"
          >
            {
              isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : "Login"
            }
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{" "}
          <a onClick={() => navigate("/auth/register")} className="text-blue-600 font-semibold hover:underline cursor-pointer">
            Create new account
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;