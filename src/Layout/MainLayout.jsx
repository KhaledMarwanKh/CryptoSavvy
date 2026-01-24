import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Outlet } from 'react-router'

const MainLayout = () => {
    return (
        <div className='bg-primary w-full h-screen overflow-hidden'>
            <Outlet />
            <Toaster position='top-center' />
        </div>
    )
}

export default MainLayout