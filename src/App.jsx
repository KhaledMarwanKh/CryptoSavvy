import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router'

//pages
import Dashboard from './page/Dashboard'
import CoinDetails from './page/CoinDetails'
import News from './page/News'
import Verfication from './page/Verfication'
import Login from './page/Login'
import Register from './page/Register'
import ForgotPassword from './page/ForgotPassword'
import ResetPassword from './page/ResetPassword'
import ChartAnalyze from './page/ChartAnalyze'
import Profile from './page/Profile'
import About from './page/About'
import Contact from './page/Contact'
import AiChat from './page/AiChat'
import AiAnalyze from './page/AiAnalyze'
import CurrencyConverterAndRates from './page/CurrencyConverterAndRates'
import Notification from './page/Notification'
import RootNotFound from './Error/RootNotFound'
import { toast, ToastContainer } from 'react-toastify'
import NavBar from './components/NavBar'

const App = () => {

  const navigate = () => {
    toast.error("You are not authorized to access this page ,please login first and try again");
    return (
      <Navigate to={"/auth/login"} />
    )
  }

  return (
    <BrowserRouter>

      <div className='min-h-screen relative'>
        <NavBar />
        <main>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="/coin/info/:coinId" element={<CoinDetails />} />
            <Route path='/coin/analyze-chart/:coinId' element={localStorage.isAuth ? <ChartAnalyze /> : navigate()} />
            <Route path='/news' element={<News />} />
            <Route path='/auth/login' element={<Login />} />
            <Route path='/auth/register' element={<Register />} />
            <Route path='/auth/verify-code' element={<Verfication />} />
            <Route path='/auth/forgot-password' element={<ForgotPassword />} />
            <Route path='/auth/reset-password' element={<ResetPassword />} />
            <Route path='/auth/profile' element={localStorage.isAuth ? <Profile /> : navigate()} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/ai/chat' element={localStorage.isAuth ? <AiChat /> : navigate()} />
            <Route path='/ai/analyze' element={localStorage.isAuth ? <AiAnalyze /> : navigate()} />
            <Route path='/currency-market' element={<CurrencyConverterAndRates />} />
            <Route path='/notification' element={<Notification />} />
            <Route path='*' element={localStorage.isAuth ? <RootNotFound /> : navigate()} />
          </Routes>
        </main>

        <ToastContainer position='top-center' />
      </div>
    </BrowserRouter>

  )
}

export default App