import { useEffect, useState } from 'react';
import { createBrowserRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { useAppDispatch } from '@/redux/hooks';
import NotFound from 'components/share/not.found';
import LoginPage from 'pages/auth/login';
import RegisterPage from 'pages/auth/register';
import LayoutAdmin from 'components/admin/layout.admin';
import ProtectedRoute from 'components/share/protected-route.ts';
import Footer from 'components/client/footer.client';
import HomePage from 'pages/home';
import styles from 'styles/app.module.scss';
import DashboardPage from './pages/admin/dashboard';
import CompanyPage from './pages/admin/company';
import PipelinePage from './pages/admin/pipeline';
import PermissionPage from './pages/admin/permission';
import ResumePage from './pages/admin/resume';
import RolePage from './pages/admin/role';
import UserPage from './pages/admin/user';
import { fetchAccount, setLogoutAction } from './redux/slice/accountSlide';
import { fetchSavedJobIds } from './redux/slice/savedJobSlide';
import { fetchAppliedJobs } from './redux/slice/appliedJobSlide';
import LayoutApp from './components/share/layout.app';
import JobPage from './pages/admin/job';
import ViewUpsertJob from './components/admin/job/upsert.job';
import ClientJobPage from './pages/job';
import ClientJobDetailPage from './pages/job/detail';
import ClientCompanyPage from './pages/company';
import ClientCompanyDetailPage from './pages/company/detail';
import AboutPage from './pages/about';
import FaqPage from './pages/faq';
import BlogPage from './pages/blog';
import ATSLandingPage from './pages/ats';
import MyJobsPage from './pages/my-jobs';
import CvListPage from './pages/cv';
import CvEditorPage from './pages/cv/editor';
import SalaryPage from './pages/salary';
import InterviewPage from './pages/interview';

const LayoutClient = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { pathname } = useLocation();

  // Scroll to top on page change only, so filter/query-string updates keep the scroll position
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className='layout-app'>
      <div className={styles['content-app']}>
        <Outlet context={[searchTerm, setSearchTerm]} />
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  const dispatch = useAppDispatch();
  const { isLoaded, isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      dispatch(fetchAccount());
      dispatch(fetchSavedJobIds());
      dispatch(fetchAppliedJobs());
    } else {
      dispatch(setLogoutAction());
    }
  }, [dispatch, isLoaded, isSignedIn, userId]);

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <LayoutApp>
          <LayoutClient />
        </LayoutApp>
      ),
      errorElement: <NotFound />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'job', element: <ClientJobPage /> },
        { path: 'job/:id', element: <ClientJobDetailPage /> },
        { path: 'company', element: <ClientCompanyPage /> },
        { path: 'company/:id', element: <ClientCompanyDetailPage /> },
        { path: 'about', element: <AboutPage /> },
        { path: 'faq', element: <FaqPage /> },
        { path: 'ats', element: <ATSLandingPage /> },
        { path: 'my-jobs', element: <MyJobsPage /> },
        { path: 'cv', element: <CvListPage /> },
        { path: 'cv/:id', element: <CvEditorPage /> },
        { path: 'salary', element: <SalaryPage /> },
        { path: 'interview/:token', element: <InterviewPage /> },
      ],
    },

    {
      path: '/admin',
      element: <LayoutAdmin />,
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'company',
          element: (
            <ProtectedRoute>
              <CompanyPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'user',
          element: (
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          ),
        },

        {
          path: 'job',
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  {' '}
                  <JobPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'upsert',
              element: (
                <ProtectedRoute>
                  <ViewUpsertJob />
                </ProtectedRoute>
              ),
            },
          ],
        },

        {
          path: 'resume',
          element: (
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'pipeline',
          element: (
            <ProtectedRoute>
              <PipelinePage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'permission',
          element: (
            <ProtectedRoute>
              <PermissionPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'role',
          element: (
            <ProtectedRoute>
              <RolePage />
            </ProtectedRoute>
          ),
        },
      ],
    },

    {
      path: '/login/*',
      element: <LoginPage />,
    },

    {
      path: '/register/*',
      element: <RegisterPage />,
    },
    {
      path: '/blog',
      element: <BlogPage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
