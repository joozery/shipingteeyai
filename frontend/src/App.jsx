import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Services from './pages/Services'
import About from './pages/About'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import Contact from './pages/Contact'
import Tracking from './pages/Tracking'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import CustomerAccount from './pages/CustomerAccount'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminHome from './pages/admin/AdminHome'
import CustomerManagement from './pages/admin/CustomerManagement'
import TrackingManagement from './pages/admin/TrackingManagement'
import ContentManagement from './pages/admin/ContentManagement'
import AddEditArticle from './pages/admin/AddEditArticle'
import ActivityLog from './pages/admin/ActivityLog'
import Settings from './pages/admin/Settings'
import AdminUserManagement from './pages/admin/AdminUserManagement'

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="about" element={<About />} />
          <Route path="articles" element={<Articles />} />
          <Route path="articles/:id" element={<ArticleDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="tracking" element={<Tracking />} />
          
          {/* Customer Auth Routes with Layout */}
          <Route path="login" element={<Login />} />
          <Route path="account" element={<CustomerAccount />} />
        </Route>

        {/* Admin Login (No Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminHome />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="tracking" element={<TrackingManagement />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="content/new" element={<AddEditArticle />} />
          <Route path="content/edit/:id" element={<AddEditArticle />} />
          <Route path="activity-log" element={<ActivityLog />} />
          <Route path="admin-users" element={<AdminUserManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  )
}

export default App
