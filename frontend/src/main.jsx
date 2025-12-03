import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import OffresList from './pages/OffresList.jsx'
import EnterpriseFirst from './pages/EnterpriseFirst.jsx'
import Contact from './pages/contact.jsx'
import Navbar from './component/navbar.jsx'

function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/signup' || location.pathname === '/signin';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/offres" element={<OffresList />} />
        <Route path="/entreprises" element={<EnterpriseFirst />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </StrictMode>,
)
