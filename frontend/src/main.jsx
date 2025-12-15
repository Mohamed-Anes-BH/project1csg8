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
import DetailleOffer from './pages/detailleoffer.jsx'
import ProfileEtudient from './pages/profileEtudient.jsx'
import TableBordEtudient from './pages/tablebordEtudient.jsx'
import CreationOffre from './pages/creationoffre.jsx'
import BordEnterprise from './pages/bordenterprise.jsx'
import ListeCandidateurs from './pages/listecondidateurs.jsx'
import ProfileEntreprise from './pages/profileEntreprise.jsx'
import Navbar from './component/navbar.jsx'

function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/signup' ||
    location.pathname === '/signin' ||
    location.pathname === '/dashboard-entreprise';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/offres" element={<OffresList />} />
        <Route path="/offre/:id" element={<DetailleOffer />} />
        <Route path="/entreprises" element={<EnterpriseFirst />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile-etudiant" element={<ProfileEtudient />} />
        <Route path="/dashboard-etudiant" element={<TableBordEtudient />} />
        <Route path="/creation-offre" element={<CreationOffre />} />
        <Route path="/dashboard-entreprise" element={<BordEnterprise />} />
        <Route path="/candidatures" element={<ListeCandidateurs />} />
        <Route path="/profil-entreprise" element={<ProfileEntreprise />} />
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
