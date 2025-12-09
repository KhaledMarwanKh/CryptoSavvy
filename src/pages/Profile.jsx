import React, { useState, useEffect } from "react";
import { Bell, Shield, User } from "lucide-react";
const ToggleSwitch = ({ enabled, setEnabled }) => {
    return (
        <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${enabled ? "bg-blue-600" : "bg-gray-600"
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? "translate-x-5" : "translate-x-1"
                    }`}
            />
        </button>
    );
};
const Profile = () => {
    const [savedProfile, setSavedProfile] = useState({
        name: "John Doe",
        email: "john@example.com",
    });
    const [inputProfile, setInputProfile] = useState(savedProfile);
    const [savedMessage, setSavedMessage] = useState(false);
    const [priceAlerts, setPriceAlerts] = useState(true);
    const [weeklyReport, setWeeklyReport] = useState(true);
    const [marketNews, setMarketNews] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [twoFactor, setTwoFactor] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    useEffect(() => {
        const storedData = localStorage.getItem("profileData");
        if (storedData) {
            const parsed = JSON.parse(storedData);
            setSavedProfile(parsed);
            setInputProfile(parsed);
        }
        const storedNotifications = localStorage.getItem("notifications");
        if (storedNotifications) {
            const parsed = JSON.parse(storedNotifications);
            setPriceAlerts(parsed.priceAlerts);
            setWeeklyReport(parsed.weeklyReport);
            setMarketNews(parsed.marketNews);
        }
    }, []);
    useEffect(() => {
        localStorage.setItem(
            "notifications",
            JSON.stringify({
                priceAlerts,
                weeklyReport,
                marketNews,
            })
        );
    }, [priceAlerts, weeklyReport, marketNews]);
    const handleSave = () => {
        setSavedProfile(inputProfile);

        localStorage.setItem("profileData", JSON.stringify(inputProfile));

        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 2500);
    };
    {
        /*Change Password */
    }
    const handlePasswordSave = () => {
        setShowPasswordModal(false);
        setActionMessage("The password has been successfully changed ");
        setTimeout(() => setActionMessage(""), 2000);
    };
    {
        /*Enable Two-Factor Authentication  **للتعديل**/
    }
    const handle2FA = () => {
        const newState = !twoFactor;
        setTwoFactor(newState);
        localStorage.setItem("twoFactor", JSON.stringify(newState));

        setActionMessage(
            newState
                ? "Two-step verification has been enabled"
                : "Two-step verification has been disabled"
        );
        setTimeout(() => setActionMessage(""), 2000);
    };
    {
        /*Delete Account */
    }
    const handleDeleteAccount = () => {
        localStorage.clear();
        setDeleteConfirm(false);
        setActionMessage("The account has been permanently deleted");
        setTimeout(() => setActionMessage(""), 2500);
    };

    return (
        <div className="text-white p-8 bg-[#0f121a] min-h-screen fade-in animate-in rounded">
            {/* USER INFO CARD */}
            <div className="bg-[#0f1115] p-6 rounded-xl shadow mb-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <User size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{savedProfile.name}</h2>
                        <p className="text-gray-400">{savedProfile.email}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                            className="w-full mt-1 px-4 py-2 bg-[#0f1115] border border-gray-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            value={inputProfile.name}
                            onChange={(e) => {
                                setInputProfile({ ...inputProfile, name: e.target.value });
                            }}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                            className="w-full mt-1 px-4 py-2 bg-[#0f1115] border border-gray-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            value={inputProfile.email}
                            onChange={(e) => {
                                setInputProfile({ ...inputProfile, email: e.target.value });
                            }}
                        />
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    className="mt-6 bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Save Changes
                </button>
                {savedMessage && (
                    <p className="text-green-400 mt-4 font-medium">
                        Your information has been successfully saved✔
                    </p>
                )}
            </div>
            {/* ALERT SETTINGS */}
            <div className="bg-[#0f1115] p-6 rounded-xl shadow mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">
                        Alert Settings
                    </h2>
                </div>
                <div className="space-y-5">
                    <div className="flex justify-between items-center bg-[#0f1115] border border-gray-800 p-4 rounded-lg">
                        <div>
                            <h3 className="font-medium">Price Alerts</h3>
                            <p className="text-gray-400 text-sm">
                                Get notified when prices reach specified levels
                            </p>
                        </div>
                        <ToggleSwitch enabled={priceAlerts} setEnabled={setPriceAlerts} />
                    </div>
                    <div className="flex justify-between items-center bg-[#0f1115] border border-gray-800 p-4 rounded-lg">
                        <div>
                            <h3 className="font-medium">Weekly Report</h3>
                            <p className="text-gray-400 text-sm">
                                Weekly summary of your portfolio and market performance
                            </p>
                        </div>
                        <ToggleSwitch enabled={weeklyReport} setEnabled={setWeeklyReport} />
                    </div>
                    <div className="flex justify-between items-center bg-[#0f1115] border border-gray-800 p-4 rounded-lg">
                        <div>
                            <h3 className="font-medium">Market News</h3>
                            <p className="text-gray-400 text-sm">
                                Instant updates about important news and developments
                            </p>
                        </div>
                        <ToggleSwitch enabled={marketNews} setEnabled={setMarketNews} />
                    </div>
                </div>
            </div>

            {/* SECURITY */}
            <div className="bg-[#0f1115] p-6 rounded-xl shadow">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Security</h2>
                </div>
                <div className="space-y-4">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full bg-[#0f1115] border border-gray-800 p-3 rounded-lg text-left hover:bg-gray-600 transition"
                    >
                        Change Password
                    </button>

                    <button
                        onClick={handle2FA}
                        className="w-full bg-[#0f1115] border border-gray-800 p-3 rounded-lg text-left hover:bg-gray-600 transition"
                    >
                        Enable Two-Factor Authentication {twoFactor ? "(ON)" : "(OFF)"}
                    </button>

                    <button
                        onClick={() => setDeleteConfirm(true)}
                        className="w-full p-3 rounded-lg text-left text-red-500 hover:bg-red-500/10 transition"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
            {/*model for change password */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl w-80">
                        <h3 className="text-lg mb-4">Change Password</h3>

                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full px-3 py-2 bg-gray-700 rounded-md mb-4"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <button
                            className="bg-blue-600 px-4 py-2 rounded-md w-full mb-3"
                            onClick={handlePasswordSave}
                        >
                            Save
                        </button>

                        <button
                            className="text-gray-400 w-full"
                            onClick={() => setShowPasswordModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            {/*model for delet account */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl w-80">
                        <h3 className="text-lg mb-4 text-red-400">Delete Account?</h3>
                        <p className="text-gray-300 mb-4">
                            Are you sure you want to permanently delete the account?
                        </p>

                        <button
                            className="bg-red-600 px-4 py-2 rounded-md w-full mb-3"
                            onClick={handleDeleteAccount}
                        >
                            Yes, Delete
                        </button>

                        <button
                            className="text-gray-400 w-full"
                            onClick={() => setDeleteConfirm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            {/*  model for displaying a success message*/}
            {actionMessage && (
                <div className="fixed bottom-4 right-4 bg-green-600 px-4 py-2 rounded-lg shadow-lg animate-pulse">
                    {actionMessage}
                </div>
            )}
        </div>
    );
};

export default Profile;