import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
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
import RecommandationsPage from './pages/RecommandationsPage.jsx'
import CreationOffre from './pages/creationoffre.jsx'
import BordEnterprise from './pages/bordenterprise.jsx'
import ListeCandidateurs from './pages/listecondidateurs.jsx'
import ProfileEntreprise from './pages/profileEntreprise.jsx'
import Navbar from './component/navbar.jsx'
import Messagerie from './pages/messagerie.jsx'
import GestionDesOffres from './pages/gestiondesoffres.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import OfferDetailsCompany from './pages/OfferDetailsCompany.jsx'
import ModificationOffre from './pages/ModificationOffre.jsx'
import CandidateDetailsPage from './pages/CandidateDetailsPage.jsx'

// Admin Panel Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminOffers from './pages/admin/AdminOffers.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'

function HomeRoute() {
  const { isStudent, isCompany, isAdmin, isAuthenticated, loading } = useAuth();

  if (loading) return null; // Or a spinner

  if (isAuthenticated) {
    if (isAdmin()) return <Navigate to="/admin" replace />;
    if (isStudent()) return <Navigate to="/dashboard-etudiant" replace />;
    if (isCompany()) return <Navigate to="/dashboard-entreprise" replace />;
  }

  return <Home />;
}

function Layout() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Don't show public navbar for admin pages
  const showNavbar = !location.pathname.startsWith('/admin') && !isAdmin();

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/offres" element={<OffresList />} />
        <Route path="/offre/:id" element={<DetailleOffer />} />
        <Route path="/entreprises" element={<EnterpriseFirst />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Routes Admin */}
        <Route path="/admin" element={
          <PrivateRoute role="ADMIN">
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute role="ADMIN">
            <AdminUsers />
          </PrivateRoute>
        } />
        <Route path="/admin/offers" element={
          <PrivateRoute role="ADMIN">
            <AdminOffers />
          </PrivateRoute>
        } />
        <Route path="/admin/settings" element={
          <PrivateRoute role="ADMIN">
            <AdminSettings />
          </PrivateRoute>
        } />

        {/* Routes privées - Étudiant */}
        <Route path="/profile-etudiant" element={
          <PrivateRoute role="STUDENT">
            <ProfileEtudient />
          </PrivateRoute>
        } />
        <Route path="/recommandations" element={
          <PrivateRoute role="STUDENT">
            <RecommandationsPage />
          </PrivateRoute>
        } />
        <Route path="/dashboard-etudiant" element={
          <PrivateRoute role="STUDENT">
            <TableBordEtudient />
          </PrivateRoute>
        } />

        {/* Routes privées - Entreprise */}
        <Route path="/creation-offre" element={
          <PrivateRoute role="COMPANY">
            <CreationOffre />
          </PrivateRoute>
        } />
        <Route path="/dashboard-entreprise" element={
          <PrivateRoute role="COMPANY">
            <BordEnterprise />
          </PrivateRoute>
        } />
        <Route path="/gestion-offres" element={
          <PrivateRoute role="COMPANY">
            <GestionDesOffres />
          </PrivateRoute>
        } />
        <Route path="/gestion-offres/:id" element={
          <PrivateRoute role="COMPANY">
            <OfferDetailsCompany />
          </PrivateRoute>
        } />
        <Route path="/modification-offre/:id" element={
          <PrivateRoute role="COMPANY">
            <ModificationOffre />
          </PrivateRoute>
        } />
        <Route path="/candidatures" element={
          <PrivateRoute role="COMPANY">
            <ListeCandidateurs />
          </PrivateRoute>
        } />
        <Route path="/liste-candidatures" element={
          <PrivateRoute role="COMPANY">
            <ListeCandidateurs />
          </PrivateRoute>
        } />
        <Route path="/candidature/:id" element={
          <PrivateRoute role="COMPANY">
            <CandidateDetailsPage />
          </PrivateRoute>
        } />
        <Route path="/profil-entreprise" element={
          <PrivateRoute role="COMPANY">
            <ProfileEntreprise />
          </PrivateRoute>
        } />

        {/* Routes privées - Communes */}
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        <Route path="/messagerie" element={
          <PrivateRoute>
            <Messagerie />
          </PrivateRoute>
        } />
      </Routes>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
