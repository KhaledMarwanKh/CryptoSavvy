import React from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router'

//layouts
import MainLayout from './Layout/MainLayout'
import AppLayout from './Layout/AppLayout'

//pages
import Dashboard from './pages/Dashboard'
import AIAnalysis from './pages/AIAnalysis'
import CoinDetail from './pages/CoinDetail'
import Login from './pages/Login'
import News from './pages/News'
import Profile from './pages/Profile'
import Register from './pages/Register'
import AIChat from './pages/AIChat'
import Notification from './pages/Notification'
import About from './pages/About'
import Contact from './pages/Contact'
import Settings from './pages/Settings'

const browserRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout />}>
      <Route path='/' element={<AppLayout />} >
        <Route index element={<Dashboard />} />
        <Route path='/ai-chat' element={<AIChat />} />
        <Route path='/ai-analysis' element={<AIAnalysis />} />
        <Route path='/coin/:coinId' element={<CoinDetail />} />
        <Route path='/News' element={<News />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/settings' element={<Settings />} />
      </Route>

      <Route path='/notification' element={<Notification />} />
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<Contact />} />

      <Route path='/auth/login' element={<Login />} />
      <Route path='/auth/register' element={<Register />} />
    </Route>
  )
)

const App = () => {
  return (
    <RouterProvider router={browserRouter} />
  )
}

export default App