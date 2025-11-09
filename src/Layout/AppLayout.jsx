import React from 'react'
import { Outlet } from 'react-router'
import SideBar from '../components/SideBar'
import Navbar from '../components/Navbar'

const AppLayout = () => {
    return (
        <div className='h-full relative'>
            <Navbar />
            <SideBar />
            <main className='h-[90%] ml-[70px] p-5 overflow-y-scroll body'>
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout