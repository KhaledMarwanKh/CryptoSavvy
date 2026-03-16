import { useState } from "react";
import {
    Menu,
    X,
    Bell,
    User,
    Globe,
} from "lucide-react";
import navigationRoutes from "../routes/routes";
import { NavLink, useLocation, useNavigate } from "react-router";
import axiosInst from "../libs/axiosInst";
import { toast } from "react-toastify";

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (pathname) => location.pathname === pathname;

    const handleNaviagtion = (route) => {
        navigate(route);
        setSidebarOpen(false);
        window.scrollTo(0, 0);
    }

    const apiURL = import.meta.env.VITE_API_URL + "/api/user"

    const handleLogout = async () => {
        try {
            await axiosInst.post(apiURL + "/logout");

            toast.success("Logout Successfully");

            setTimeout(() => {
                navigate("/");
            }, 1000)

            localStorage.setItem("isAuth", false);
        } catch (error) {
            console.error(error);
        }
        navigate("/");
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
            <nav className="w-full sticky top-0 z-[1000]  bg-slate-900 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex items-center justify-between">

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
                <div className="flex items-center gap-6">
                    <button className="text-slate-300 hover:text-white transition">
                        <Globe size={20} />
                    </button>

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
                                Login
                            </button>
                        )
                    }
                </div>
            </nav>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <div
                className={`fixed left-0 h-full w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-white text-lg font-semibold">Menu</h2>
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