import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import * as Tooltip from '@radix-ui/react-tooltip';

{/* theme and user validification */}
import { ThemeProvider } from './components/ui/theme-provider';
import { checkUserExists, getIsValidToken } from './services/authfunctions';

{/* main modules, with 4 dynamic imports */}
import Header from './components/header';
import Footer from './components/footer';
import QuestionsAccordion from './components/questions-accordion';
import Register from './features/user/Register';
import Login from './features/user/Login';
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const Search = lazy(() => import('./features/search/Search'));
const Statistics = lazy(() => import('./features/statistics/Statistics'));
const Errors = lazy(() => import('./features/errors/Errors'));

export default function App() {
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [validToken, setValidToken] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkInitialState = async () => {
      try {
        const userExistsResponse = await checkUserExists();
        setUserExists(userExistsResponse.exists);

        const token = localStorage.getItem('accessToken');
        if (token) {
          const isValid = await getIsValidToken();
          setValidToken(isValid);
          if (!isValid) {
            localStorage.removeItem('accessToken');
          }
        } else {
          setValidToken(false);
        }
      } catch (error) {
        console.error('Error checking initial state:', error);
        setUserExists(false);
        setValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialState();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (userExists === false && location.pathname !== '/register') {
        navigate('/register');
      } else if (validToken === false && !['/login', '/register'].includes(location.pathname)) {
        navigate('/login');
      }
    }
  }, [userExists, validToken, isLoading, navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setValidToken(false);
    toast.success('You have been logged out', {
      duration: 3000,
      position: 'top-center',
      style: { background: 'black', color: 'white' },
      icon: '👋',
    });
    navigate('/login');
  };

  {/* don't show header and qa for login and register */}
  const showHeaderAndQA = !['/login', '/register'].includes(location.pathname);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Tooltip.Provider>
        <div className="flex min-h-screen flex-col">
          {showHeaderAndQA && <Header onLogout={handleLogout} />}
          <main className="flex-grow">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/register" element={<Register onRegistrationSuccess={() => { setUserExists(true); navigate('/login'); }} />} />
                <Route path="/login" element={<Login onLoginSuccess={() => { setValidToken(true); navigate('/dashboard'); }} />} />
                <Route path="/dashboard" element={validToken ? <Dashboard /> : <Navigate to="/login" replace />} />
                <Route path="/search" element={validToken ? <Search /> : <Navigate to="/login" replace />} />
                <Route path="/statistics" element={validToken ? <Statistics /> : <Navigate to="/login" replace />} />
                <Route path="/errors" element={validToken ? <Errors /> : <Navigate to="/login" replace />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </main>
          {showHeaderAndQA && <QuestionsAccordion className="w-full max-w-5xl mx-auto px-4 mt-12 mb-20" />}
          <Footer />
        </div>
      </Tooltip.Provider>
    </ThemeProvider>
  );
}
