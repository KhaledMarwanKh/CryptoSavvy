import React from 'react'
import { Outlet } from 'react-router'

const MainLayout = () => {
    return (
        <div className='bg-primary w-full h-screen overflow-hidden'>
            <Outlet />
        </div>
    )
}

export default MainLayout