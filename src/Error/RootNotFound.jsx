import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export default function RootNotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4`}
    >
      <div
        className={`max-w-lg w-full text-center rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-xl shadow-md p-8`}
      >
        {/* 404 Number */}
        <h1 className="text-7xl font-bold text-blue-600 mb-4">404</h1>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-slate-300 mb-3">
          {t("notFound.title")}
        </h2>

        {/* Subtitle */}
        <p className="text-slate-400 mb-6">{t("notFound.subtitle")}</p>

        {/* Button */}
        <button
          onClick={() => navigate("/")}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all"
        >
          {t("notFound.button")}
        </button>
      </div>
    </div>
  );
}
