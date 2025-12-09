import React, { useState } from 'react'
import { Outlet } from 'react-router'
import SideBar from '../components/SideBar'
import Navbar from '../components/Navbar'

const AppLayout = () => {
    const [openSideBar, setOpenSideBar] = useState(false);

    return (
        <div className='h-full relative text-white'>
            <Navbar setOpenSideBar={setOpenSideBar} openSideBar={openSideBar} />
            <SideBar open={openSideBar} setOpen={setOpenSideBar} />

            <main className='h-[90%] overflow-y-scroll body'>
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout