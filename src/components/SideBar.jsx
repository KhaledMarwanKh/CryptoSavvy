import React from 'react'
import navigationRoutes from '../routes/navigationRoutes'
import { Link, useLocation } from 'react-router'
import { LogOut, Settings } from 'lucide-react';

const SideBar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path

    return (
        <div style={{ animation: "animate-sidebar 0.5s 1 ease-in" }} className='w-[70px] h-[90%] absolute z-50 bg-[#0f121a] px-3 py-4 flex flex-col justify-between sidebar hover:w-[250px] transition-all duration-150'>
            <div className='w-full'>
                {
                    navigationRoutes.map(
                        ({ path, iconName: Icon, name }) => (
                            <Link to={path} className={`w-full flex justify-center items-center rounded-lg text-nowrap mt-2 gap-3 px-3 py-3 text-[#9CA3AF] ${isActive(path) ? "bg-[#3B82F6] text-white font-bold" : ""} ${!isActive(path) ? "hover:bg-slate-700 " : "cursor-default"} transition-all duration-300`}>
                                <Icon />
                                <span className='hidden'>{name}</span>
                            </Link>
                        )
                    )
                }
            </div>


            <div className='w-full'>
                <Link to="/settings" className={`w-full flex justify-center items-center rounded-lg text-nowrap gap-3 mt-2 px-3 py-3 text-[#9CA3AF] ${isActive("/settings") ? "bg-[#3B82F6] text-white font-bold" : ""} ${!isActive("/settings") ? "hover:bg-slate-700 " : "cursor-default"} transition-all duration-300`}>
                    <Settings />
                    <span className='hidden'>Settings</span>
                </Link>

                <Link to="/auth/login" className={`w-full flex justify-center items-center rounded-lg text-nowrap gap-3 mt-2 px-3 py-3 text-[#9CA3AF] ${!isActive("login") ? "hover:bg-slate-700 " : "cursor-default"} transition-all duration-300`}>
                    <LogOut />
                    <span className='hidden'>Logout</span>
                </Link>
            </div>

        </div>
    )
}

export default SideBar