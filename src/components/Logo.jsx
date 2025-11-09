import React from "react";
import { useNavigate } from "react-router";

const SavvyIcon = ({ colorClass = 'text-yellow-400', size = 'h-5 w-5' }) => (
    <svg
        className={`${size} ${colorClass} inline-block mr-1`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Simplified Data/Chart Icon */}
        <path d="M12 20V10" />
        <path d="M18 20V4" />
        <path d="M6 20v-4" />
    </svg>
);

export const CryptoSavvyLogo = ({ large = false }) => {
    const navigate = useNavigate();
    // Dynamically adjust size based on 'large' prop
    const textSize = large ? 'text-3xl' : 'text-xl';

    return (
        <div className={`flex items-center space-x-0 font-sans ${textSize} font-extrabold tracking-tight cursor-pointer`} onClick={() => navigate("/")} >
            {/* The "Crypto" part in the primary text color (off-white) */}
            <span className="text-gray-100">
                Crypto
            </span>

            {/* The "Savvy" part with the blue accent color */}
            <span className="text-blue-500 flex items-center">
                Savvy
            </span>

            {/* Icon, stylized with the gold/yellow accent color */}
            <SavvyIcon
                colorClass="text-yellow-400"
                size={large ? 'h-7 w-7' : 'h-5 w-5'}
            />
        </div>
    );
};