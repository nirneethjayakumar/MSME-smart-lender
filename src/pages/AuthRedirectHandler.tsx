import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // or 'next/router' if using Next.js
import { supabase } from '../integrations/supabase/client'; // Adjust path as needed
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Assumes you have a setter for auth user context

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); // Update user context/state
    navigate('/'); // Redirect to main website page (adjust path as needed)
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

const AuthRedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function handleAuthRedirect() {
      // Parse URL params
      const params = new URLSearchParams(location.search);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const type = params.get('type');

      if (access_token && refresh_token && type) {
        // Complete the session with Supabase
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (!error) {
          // Redirect to dashboard after successful session set
          navigate('/dashboard', { replace: true });
        } else {
          // Handle error, maybe redirect to login page
          console.error('Error setting session:', error.message);
          navigate('/login', { replace: true });
        }
      } else {
        // No tokens in URL, redirect to login or homepage
        navigate('/login', { replace: true });
      }
    }

    handleAuthRedirect();
  }, [location, navigate]);

  return <div>Verifying your account... Please wait.</div>;
};

export default AuthRedirectHandler;
