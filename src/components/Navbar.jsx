import React from 'react'
import { CryptoSavvyLogo } from './Logo'
import { MdNotifications } from 'react-icons/md'
import { FaUser } from 'react-icons/fa6'
import { useNavigate } from 'react-router'

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <div style={{ animation: "animate-navbar ease-in 1 0.5s" }} className='w-full px-3 py-4 border-b border-subtle flex items-center justify-between relative'>
            {/** logo section */}
            <CryptoSavvyLogo large={false} />

            {/** action buttons section */}
            <div className='flex gap-3 items-center'>
                <div className='w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-800 transition-all duration-150' onClick={() => navigate("/notification")}>
                    <MdNotifications className='text-[#E5E7EB] hover:text-white cursor-pointer' />
                </div>
                <div className='w-7 h-7 bg-[#3B82F6] flex items-center justify-center rounded-full cursor-pointer' onClick={() => navigate("/profile")}>
                    <FaUser className='w-3 h-3 text-white' />
                </div>
            </div>
        </div>
    )
}

export default Navbar