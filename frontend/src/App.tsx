import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import AdminLayout from './admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Public pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Experience = lazy(() => import('./pages/Experience'));
const Projects = lazy(() => import('./pages/Projects'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const CaseStudyDetail = lazy(() => import('./pages/CaseStudyDetail'));
const Content = lazy(() => import('./pages/Content'));
const Skills = lazy(() => import('./pages/Skills'));
const Contact = lazy(() => import('./pages/Contact'));

// Admin pages
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminPosts = lazy(() => import('./admin/AdminPosts'));
const AdminPostForm = lazy(() => import('./admin/AdminPostForm'));
const AdminSoftSkills = lazy(() => import('./admin/AdminSoftSkills'));
const AdminSoftSkillForm = lazy(() => import('./admin/AdminSoftSkillForm'));
const AdminExperiences = lazy(() => import('./admin/AdminExperiences'));
const AdminExperienceForm = lazy(() => import('./admin/AdminExperienceForm'));
const AdminMedia = lazy(() => import('./admin/AdminMedia'));
const AdminSettings = lazy(() => import('./admin/AdminSettings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="experience" element={<Experience />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<CaseStudyDetail />} />
          <Route path="case-studies" element={<CaseStudies />} />
          <Route path="case-studies/:slug" element={<CaseStudyDetail />} />
          <Route path="content" element={<Content />} />
          <Route path="skills" element={<Skills />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/new" element={<AdminPostForm />} />
          <Route path="posts/:id/edit" element={<AdminPostForm />} />
          <Route path="experiences" element={<AdminExperiences />} />
          <Route path="experiences/new" element={<AdminExperienceForm />} />
          <Route path="experiences/:id/edit" element={<AdminExperienceForm />} />
          <Route path="soft-skills" element={<AdminSoftSkills />} />
          <Route path="soft-skills/new" element={<AdminSoftSkillForm />} />
          <Route path="soft-skills/:id/edit" element={<AdminSoftSkillForm />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
