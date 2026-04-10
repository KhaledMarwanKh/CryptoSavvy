import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const AiAnalyze = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  useEffect(() => {
    let isAlive = true;

    if (isAlive) {
      if (localStorage.getItem("userToken") === null) {
        navigate("/");
        toast.error(
          i18n.language === "ar"
            ? "عليك تسجيل دخول اولا"
            : "Please login first!",
        );
      }
    }

    return () => {
      isAlive = false;
    };
  }, [i18n.language, navigate]);
  return <div>AiAnalyze</div>;
};

export default AiAnalyze;
