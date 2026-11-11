import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense, ComponentType } from 'react';
import Layout from './components/Layout';
import AdminLayout from './admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// main.tsx swallows vite:preloadError and reloads; the swallowed import then resolves to
// undefined. Suspending forever until the reload lands avoids flashing the error screen.
const page = (load: () => Promise<{ default: ComponentType }>) =>
  lazy(() => load().then((m) => m ?? new Promise<never>(() => {})));

// Public pages
const Home = page(() => import('./pages/Home'));
const About = page(() => import('./pages/About'));
const Experience = page(() => import('./pages/Experience'));
const Projects = page(() => import('./pages/Projects'));
const Newsletter = page(() => import('./pages/Newsletter'));
const NewsletterDetail = page(() => import('./pages/NewsletterDetail'));
const PostDetail = page(() => import('./pages/PostDetail'));
const Content = page(() => import('./pages/Content'));
const Skills = page(() => import('./pages/Skills'));
const Contact = page(() => import('./pages/Contact'));

// Admin pages
const AdminLogin = page(() => import('./admin/AdminLogin'));
const AdminDashboard = page(() => import('./admin/AdminDashboard'));
const AdminPosts = page(() => import('./admin/AdminPosts'));
const AdminPostForm = page(() => import('./admin/AdminPostForm'));
const AdminSoftSkills = page(() => import('./admin/AdminSoftSkills'));
const AdminSoftSkillForm = page(() => import('./admin/AdminSoftSkillForm'));
const AdminSkillCategories = page(() => import('./admin/AdminSkillCategories'));
const AdminSkillCategoryForm = page(() => import('./admin/AdminSkillCategoryForm'));
const AdminExperiences = page(() => import('./admin/AdminExperiences'));
const AdminExperienceForm = page(() => import('./admin/AdminExperienceForm'));
const AdminNewsletters = page(() => import('./admin/AdminNewsletters'));
const AdminNewsletterForm = page(() => import('./admin/AdminNewsletterForm'));
const AdminInterests = page(() => import('./admin/AdminInterests'));
const AdminInterestForm = page(() => import('./admin/AdminInterestForm'));
const AdminMedia = page(() => import('./admin/AdminMedia'));
const AdminSettings = page(() => import('./admin/AdminSettings'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="experience" element={<Experience />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<PostDetail />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="newsletter/:slug" element={<NewsletterDetail />} />
          <Route path="content" element={<Content />} />
          <Route path="content/:slug" element={<PostDetail />} />
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
          <Route path="newsletters" element={<AdminNewsletters />} />
          <Route path="newsletters/new" element={<AdminNewsletterForm />} />
          <Route path="newsletters/:id/edit" element={<AdminNewsletterForm />} />
          <Route path="experiences" element={<AdminExperiences />} />
          <Route path="experiences/new" element={<AdminExperienceForm />} />
          <Route path="experiences/:id/edit" element={<AdminExperienceForm />} />
          <Route path="soft-skills" element={<AdminSoftSkills />} />
          <Route path="soft-skills/new" element={<AdminSoftSkillForm />} />
          <Route path="soft-skills/:id/edit" element={<AdminSoftSkillForm />} />
          <Route path="skill-categories" element={<AdminSkillCategories />} />
          <Route path="skill-categories/new" element={<AdminSkillCategoryForm />} />
          <Route path="skill-categories/:id/edit" element={<AdminSkillCategoryForm />} />
          <Route path="interests" element={<AdminInterests />} />
          <Route path="interests/new" element={<AdminInterestForm />} />
          <Route path="interests/:id/edit" element={<AdminInterestForm />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
