import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify"
import axiosInst from "../libs/axiosInst";
import { AxiosError } from "axios";

const AlertMessage = ({ type, message }) => {
  const styles =
    type === "success"
      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : "border border-red-500/30 bg-red-500/10 text-red-400";

  return (
    <div className={`rounded-xl px-4 py-3 text-sm ${styles}`}>
      {message}
    </div>
  );
};

const ToggleItem = ({ title, description, enabled, onToggle }) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={enabled}
        aria-label={title}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${enabled ? "bg-blue-600" : "bg-slate-700"
          }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${enabled ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );
};

const getInitials = (name) => {
  const initials = name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return initials || "U";
};

export default function Profile() {
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    image: "",
  });

  const [settings, setSettings] = useState({
    twoStepVerification: true,
    notifications: true,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileMessage, setProfileMessage] = useState(null);
  const [settingsMessage, setSettingsMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);

  const handleImageUpload = (e) => {
    const input = e.target;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileMessage({
        type: "error",
        message: "Please upload a valid image file.",
      });
      input.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({
        type: "error",
        message: "Image size must be less than 5MB.",
      });
      input.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        image: reader.result,
      }));

      setProfileMessage({
        type: "success",
        message: "Profile image uploaded successfully.",
      });
    };

    reader.readAsDataURL(file);
    input.value = "";
  };

  const handleProfileSave = (e) => {
    e.preventDefault();

    const trimmedName = profile.name.trim();

    if (!trimmedName) {
      setProfileMessage({
        type: "error",
        message: "Name is required.",
      });
      return;
    }

    setProfile((prev) => ({
      ...prev,
      name: trimmedName,
    }));

    try {
      axiosInst.get("/api/user/get-profile").then(() => {
        setProfile((prev) => ({
          ...prev,
          name: trimmedName,
        }));
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        setProfileMessage({
          type: "error",
          message: error?.response?.data?.message ?? "Something goes wrong",
        });
      }
    }
  };

  const handleSettingsSave = () => {
    setSettingsMessage({
      type: "success",
      message: "Settings updated successfully.",
    });

    // Replace this with your API call
    // console.log("Updated settings:", settings);
  };

  const getProfile = () => {
    try {
      axiosInst.get("/api/user/get-profile").then(res => {
        console.log(res);
        setProfile(res);
      })

    } catch (error) {
      toast.error("something goes wrong");
      console.log(error);
    }
  }

  const handlePasswordUpdate = (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({
        type: "error",
        message: "Please fill in all password fields.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        message: "New password must be at least 8 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        message: "New password and confirm password do not match.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage({
        type: "error",
        message: "New password must be different from current password.",
      });
      return;
    }

    setPasswordMessage({
      type: "success",
      message: "Password changed successfully.",
    });

    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    // Replace this with your API call
    // console.log("Password updated");
  };

  const removeImage = () => {
    setProfile((prev) => ({
      ...prev,
      image: "",
    }));

    setProfileMessage({
      type: "success",
      message: "Profile image removed.",
    });
  };

  useEffect(() => {
    getProfile();
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/70 shadow-md backdrop-blur-xl">
          <div className="border-b border-slate-700/50 px-6 py-6 sm:px-8">
            <span className="inline-flex rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-600">
              Account Settings
            </span>

            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Profile Page
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Manage your profile information, security settings, and
              notifications in one place.
            </p>
          </div>

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-3">
            {/* Left Side */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                <div className="rounded-3xl border border-slate-700/50 bg-slate-950/40 p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-slate-700/60 bg-slate-800">
                        {profile.image ? (
                          <img
                            src={profile.image}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                            {getInitials(profile.name)}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-700"
                        aria-label="Upload profile image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5V18a2 2 0 002 2h14a2 2 0 002-2v-1.5M16 8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <h2 className="mt-5 text-xl font-semibold text-white">
                      {profile.name || "Your Name"}
                    </h2>

                    <p className="mt-1 break-all text-sm text-slate-400">
                      {profile.email || "your@email.com"}
                    </p>

                    <div className="mt-6 flex w-full flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        Upload New Image
                      </button>

                      <button
                        type="button"
                        onClick={removeImage}
                        className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                      >
                        Remove Image
                      </button>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                      Supported formats: JPG, PNG, WEBP — Max 5MB
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Side */}
            <div className="space-y-6 lg:col-span-2">
              {/* Profile Information */}
              <section className="rounded-3xl border border-slate-700/50 bg-slate-950/40 p-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Personal Information
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Update your basic account details.
                  </p>
                </div>

                {profileMessage && (
                  <div className="mt-5">
                    <AlertMessage
                      type={profileMessage.type}
                      message={profileMessage.message}
                    />
                  </div>
                )}

                <form
                  onSubmit={handleProfileSave}
                  className="mt-6 grid gap-5 md:grid-cols-2"
                >
                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Full Name
                    </label>
                    <div className="mt-2 rounded-xl border border-slate-700 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-500">
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter your full name"
                        autoComplete="name"
                        className="w-full bg-slate-950/60 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Email Address
                    </label>
                    <div className="mt-2 rounded-xl border border-slate-700 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-500">
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Enter your email"
                        autoComplete="email"
                        className="w-full bg-slate-950/60 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              </section>

              {/* Settings */}
              <section className="rounded-3xl border border-slate-700/50 bg-slate-950/40 p-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Configurations
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Control your security and notification preferences.
                  </p>
                </div>

                {settingsMessage && (
                  <div className="mt-5">
                    <AlertMessage
                      type={settingsMessage.type}
                      message={settingsMessage.message}
                    />
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  <ToggleItem
                    title="Two-Step Verification"
                    description="Add an extra layer of security to your account."
                    enabled={settings.twoStepVerification}
                    onToggle={() =>
                      setSettings((prev) => ({
                        ...prev,
                        twoStepVerification: !prev.twoStepVerification,
                      }))
                    }
                  />

                  <ToggleItem
                    title="Notification Activation"
                    description="Receive email and app notifications for account activity."
                    enabled={settings.notifications}
                    onToggle={() =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: !prev.notifications,
                      }))
                    }
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSettingsSave}
                    className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto"
                  >
                    Save Settings
                  </button>
                </div>
              </section>

              {/* Change Password */}
              <section className="rounded-3xl border border-slate-700/50 bg-slate-950/40 p-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Change Password
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Update your password to keep your account secure.
                  </p>
                </div>

                {passwordMessage && (
                  <div className="mt-5">
                    <AlertMessage
                      type={passwordMessage.type}
                      message={passwordMessage.message}
                    />
                  </div>
                )}

                <form
                  onSubmit={handlePasswordUpdate}
                  className="mt-6 grid gap-5 md:grid-cols-3"
                >
                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Current Password
                    </label>
                    <div className="mt-2 rounded-xl border border-slate-700 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-500">
                      <input
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="Current password"
                        autoComplete="current-password"
                        className="w-full bg-slate-950/60 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      New Password
                    </label>
                    <div className="mt-2 rounded-xl border border-slate-700 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-500">
                      <input
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="New password"
                        autoComplete="new-password"
                        className="w-full bg-slate-950/60 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Confirm Password
                    </label>
                    <div className="mt-2 rounded-xl border border-slate-70 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-500">
                      <input
                        type="password"
                        value={passwords.confirmPassword}
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        className="w-full bg-slate-950/60 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}