import { useEffect, useState } from "react";
import {
    Menu,
    X,
    Bell,
    User,
    Globe,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router";
import axiosInst from "../libs/axiosInst";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { BarChart3, BotIcon, CircuitBoard, Contact2, DollarSign, LogOut, Newspaper } from "lucide-react"
import { GoQuestion } from "react-icons/go";

const supportedLanguages = [
    {
        key: "ar",
        label: "Arabic"
    },
    {
        key: "en",
        label: "English"
    }
];

function NavBar() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [activeLanguage, setActiveLanguage] = useState(localStorage.getItem("i18nextLng") ?? "en");

    const isActive = (pathname) => location.pathname === pathname;

    const handleNaviagtion = (route) => {
        navigate(route);
        setSidebarOpen(false);
        window.scrollTo(0, 0);
    }

    const navigationRoutes = [
        {
            name: t("navbar.tabs.dashboard"),
            route: "/",
            icon: CircuitBoard
        },
        {
            name: t("navbar.tabs.news"),
            route: "/news",
            icon: Newspaper
        },
        {
            name: t("navbar.tabs.aiChat"),
            route: "/ai/chat",
            icon: BotIcon
        },
        {
            name: t("navbar.tabs.aiAnalyze"),
            route: "/ai/analyze",
            icon: BarChart3
        },
        {
            name: t("navbar.tabs.currency"),
            route: "/currency-market",
            icon: DollarSign
        },
        {
            name: t("navbar.tabs.about"),
            route: "/about",
            icon: GoQuestion
        },
        {
            name: t("navbar.tabs.contact"),
            route: "/contact",
            icon: Contact2
        },
        {
            name: t("navbar.tabs.logout"),
            route: "/auth/login",
            icon: LogOut
        },
    ]

    useEffect(() => {
        localStorage.setItem("i18nextLng", activeLanguage)
    }, [activeLanguage])

    const apiURL = import.meta.env.VITE_API_URL + "/api/user"

    const handleLogout = async () => {
        try {
            await axiosInst.post(apiURL + "/logout", {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("userToken")}`
                }
            });

            toast.success(activeLanguage === "ar" ? "تم تسجيل الخروج بنجاح" : "Logout Successfully");

            localStorage.setItem("isAuth", false);

            localStorage.removeItem("userToken");

        } catch (error) {
            console.error(error);
        }
        navigate("/");
    }

    const handleLanguageChange = (lng) => {
        i18n.changeLanguage(lng.key);
        setActiveLanguage(lng.key);
        setShowLanguageMenu(false);
    }

    if (location.pathname.includes("auth")) {
        return (
            <>

            </>
        )
    }

    return (
        <>
            {/* NAVBAR */}
            <nav className="w-full sticky top-0 z-[1000]  bg-slate-900 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex items-center justify-between" style={{ direction: "ltr" }}>

                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Hamburger */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-slate-200 hover:text-white transition"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Logo */}
                    <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">
                        Crypto<span className="text-blue-600">Savvy</span>
                    </h1>
                </div>

                {/* Main Links (Desktop Only) */}
                <div className="hidden md:flex items-center gap-4">
                    {
                        navigationRoutes.slice(0, 4).map(nav => (
                            <NavLink onClick={() => handleNaviagtion(nav.route)} key={nav.name} className={`text-slate-200 p-2 rounded-lg w-[100px] text-center ${isActive(nav.route) ? "text-white font-bold bg-blue-600" : "bg-slate-600 hover:bg-slate-800/40 hover:font-semibold transition-all duration-300"}`} to={nav.route} title={nav.name} >
                                {nav.name}
                            </NavLink>
                        ))
                    }
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-6 relative">
                    <button onClick={() => setShowLanguageMenu((prev) => !prev)} className="text-slate-300 hover:text-white transition">
                        <Globe size={20} />
                    </button>

                    {
                        showLanguageMenu && (
                            <div className="flex flex-col gap-3 absolute z-50 top-11 translate-x-[-100px] w-[200px] px-2 py-3 rounded-lg bg-slate-950/70 text-slate-200">
                                {
                                    supportedLanguages.map((lng) => (
                                        <p key={lng.key} onClick={() => handleLanguageChange(lng)} className={`cursor-pointer flex items-center justify-between p-2 rounded-lg ${lng.key === activeLanguage ? "bg-blue-600 font-bold text-white" : ""} `}><span className={`text-sm flex items-center justify-center w-[30px] h-[30px] rounded-full  ${lng.key === activeLanguage ? "bg-slate-100 font-bold text-slate-900" : "bg-slate-900"}`}>{lng.key}</span> {lng.label}</p>
                                    ))
                                }
                            </div>
                        )
                    }

                    {
                        localStorage.isAuth ? (
                            <>
                                <button className="text-slate-300 hover:text-white transition relative">
                                    <Bell size={20} />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                </button>



                                <button onClick={() => navigate("/auth/profile")} className="text-slate-300 hover:text-white transition">
                                    <User size={20} />
                                </button>
                            </>
                        ) : (
                            <button onClick={() => navigate("/auth/login")} className="px-3 py-2 rounded-lg bg-blue-600 text-slate-200 hover:text-white hover:font-semibold active:bg-slate-500 transition-all duration-100">
                                {t("navbar.tabs.login")}
                            </button>
                        )
                    }
                </div>
            </nav >

            {/* Overlay */}
            {
                sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )
            }

            {/* SIDEBAR */}
            <div
                className={`fixed left-0 h-full w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-white text-lg font-semibold">{t("navbar.tabs.menu")}</h2>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-slate-400 hover:text-white transition"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Main Links (Mobile) */}
                <div className="py-2 px-3">
                    <div className="flex flex-col gap-4">
                        {
                            navigationRoutes.slice(0, 4).map(nav => (
                                <NavLink onClick={() => handleNaviagtion(nav.route)} key={nav.name} className={`flex gap-2 items-center md:hidden w-full text-slate-200 py-3 px-3 rounded-lg cursor-pointer ${isActive(nav.route) ? "text-white bg-blue-600 font-bold" : "hover:bg-slate-800/40 hover:font-semibold transition-all duration-300"}`} to={nav.route} title={nav.name} >
                                    <nav.icon className="w-5 h-5" />
                                    {nav.name}
                                </NavLink>
                            ))
                        }

                        {
                            navigationRoutes.slice(4, 7).map(nav => (
                                <NavLink onClick={() => handleNaviagtion(nav.route)} key={nav.name} className={`flex gap-2 items-center w-full text-slate-200 py-3 px-3 rounded-lg cursor-pointer ${isActive(nav.route) ? "text-white bg-blue-600 font-bold" : "hover:bg-slate-800/40 hover:font-semibold transition-all duration-300"}`} to={nav.route} title={nav.name} >
                                    <nav.icon className="w-5 h-5" />
                                    {nav.name}
                                </NavLink>
                            ))
                        }

                        {
                            localStorage.isAuth && navigationRoutes.slice(7).map(nav => (
                                <NavLink onClick={handleLogout} key={nav.name} className={`flex gap-2 items-center w-full text-slate-200 py-3 px-3 rounded-lg cursor-pointer ${isActive(nav.route) ? "text-white bg-blue-600 font-bold" : "hover:bg-slate-800/40 hover:font-semibold transition-all duration-300"}`} to={nav.route} title={nav.name} >
                                    <nav.icon className="w-5 h-5" />
                                    {nav.name}
                                </NavLink>
                            ))
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

export default NavBar;