import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff } from "lucide-react";
const Register = () => {
  const [input, setInput] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const isPasswordStrong =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(input.password);
  const isFormValid =
    input.fullName.trim() !== "" &&
    input.email.trim() !== "" &&
    input.password.trim() !== "" &&
    input.confirmPassword.trim() !== "" &&
    input.password === input.confirmPassword &&
    isPasswordStrong;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md mx-auto px-4 border border-gray-100">
        {/*Title */}
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
          Creat New Account
        </h1>
        <p className="text-center text-gray-500 mb-8">
          {" "}
          Join CryptoSavvy Today
        </p>
        {/*Form */}
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isFormValid) return;
            navigate("/");
          }}
        >
          {/*Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative ">
              <span className="absolute inset-y-0 left-0 flex item-center pl-3 text-gray-400">
                👤
              </span>
              <input
                value={input.fullName}
                onChange={(event) => {
                  setInput({ ...input, fullName: event.target.value });
                }}
                type="text"
                placeholder="John Doe"
                className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indiog-400"
              />
            </div>
          </div>
          {/*Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                ✉️
              </span>
              <input
                value={input.email}
                onChange={(event) => {
                  setInput({ ...input, email: event.target.value });
                }}
                type="email"
                placeholder="your@email.com"
                className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              ></input>
            </div>
          </div>
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                🔒
              </span>
              <input
                value={input.password}
                onChange={(event) => {
                  setInput({ ...input, password: event.target.value });
                }}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                title="Please Eter"
                className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {/* Eye icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {input.password && !isPasswordStrong && (
              <p className="text-red-500 text-sm mt-1">
                Please enter a strong password (at least 8 characters, with
                uppercase, lowercase, number, and symbol).
              </p>
            )}
          </div>
          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                🔒
              </span>
              <input
                value={input.confirmPassword}
                onChange={(event) => {
                  setInput({ ...input, confirmPassword: event.target.value });
                }}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {input.confirmPassword &&
              input.password !== input.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  Passwords do not match
                </p>
              )}
          </div>
          {/*Button */}
          <button
            disabled={!isFormValid}
            type="submit"
            className={`
            w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition  ${isFormValid ? "bg-green-500" : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            Create Account
          </button>
        </form>
        {/*Already have an account? */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;