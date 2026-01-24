import navigationRoutes from '../routes/navigationRoutes'
import { Link, useLocation } from 'react-router'
import { LogOut, Settings } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { BiPhoneCall, BiQuestionMark } from 'react-icons/bi';

const SideBar = ({ open, setOpen }) => {
    const location = useLocation();
    const ref = useRef(null);

    const isActive = (path) => location.pathname === path;

    const handleClickOutSide = ({ target }) => {

        if (ref.current && !ref.current.contains(target)) {
            setOpen(false);
        }

    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutSide);

        return () => document.removeEventListener('mousedown', handleClickOutSide);
    }, []);

    return (
        <div ref={ref} className={`w-[250px] h-[90%] absolute z-50 bg-[#0f1115] px-3 py-4 flex flex-col justify-between sidebar ${open ? 'left-0' : 'left-[-250px]'} transition-all duration-150 rounded`}>
            <div className='w-full'>
                {
                    navigationRoutes.map(
                        ({ path, iconName: Icon, name }) => (
                            <Link onClick={() => {
                                setOpen(!open);
                            }} to={path} className={`w-full flex items-center rounded-lg text-nowrap mt-2 gap-3 px-3 py-3 text-[#9CA3AF] ${isActive(path) ? "bg-[#3B82F6] text-white font-bold" : ""} ${!isActive(path) ? "hover:bg-slate-700 " : "cursor-default"} transition-all duration-300`}>
                                <Icon />
                                <span>{name}</span>
                            </Link>
                        )
                    )
                }
            </div>


            <div className='w-full'>
                <Link onClick={() => {
                    setOpen(!open);
                }} to="/about" className={`w-full flex items-center rounded-lg text-nowrap gap-3 mt-2 px-3 py-3 text-[#9CA3AF] ${isActive("/about") ? "bg-[#3B82F6] text-white font-bold" : ""} ${!isActive("/about") ? "hover:bg-slate-700 " : "cursor-default"} transition-all duration-300`}>
                    <BiQuestionMark />
                    <span>About</span>
                </Link>

                <Link onClick={() => {
                    setOpen(!open);
                }} to="/contact" className={`w-full flex items-center rounded-lg text-nowrap gap-3 mt-2 px-3 py-3 text-[#9CA3AF] ${isActive("/contact") ? "bg-[#3B82F6] text-white font-bold" : ""} ${!isActive("/contact") ? "hover:bg-slate-700 " : "cursor-default"} transition-all duration-300`}>
                    <BiPhoneCall />
                    <span>Contact Us</span>
                </Link>

                <Link onClick={() => {
                    setOpen(!open);
                }} to="/settings" className={`w-full flex items-center rounded-lg text-nowrap gap-3 mt-2 px-3 py-3 text-[#9CA3AF] ${isActive("/settings") ? "bg-[#3B82F6] text-white font-bold" : ""} ${!isActive("/settings") ? "hover:bg-slate-700 " : "cursor-default"} transition-all duration-300`}>
                    <Settings className='w-5 h-5' />
                    <span>Settings</span>
                </Link>

                <Link onClick={() => {
                    setOpen(!open);
                }} to="/auth/login" className={`w-full flex items-center rounded-lg text-nowrap gap-3 mt-2 px-3 py-3 text-[#9CA3AF] ${!isActive("login") ? "hover:bg-slate-700 " : "cursor-default"} transition-all duration-300`}>
                    <LogOut className='w-5 h-5' />
                    <span>Logout</span>
                </Link>
            </div>

        </div>
    )
}

export default SideBar