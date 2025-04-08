import React, { useState, useEffect, createContext } from 'react';
import { Link } from 'react-router-dom';

const UserContext = createContext<User | null>(null);

interface User {
  email: string;
}

function AuthorizeView(props: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // add a loading state
  //const navigate = useNavigate();
  let emptyuser: User = { email: '' };

  const [user, setUser] = useState(emptyuser);

  useEffect(() => {
    async function fetchWithRetry(url: string, options: any) {
      try {
        const response = await fetch(url, options);
        //console.log('AuthorizeView: Raw Response:', response);

        const contentType = response.headers.get('content-type');

        // Ensure response is JSON before parsing
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format from server');
        }

        const data = await response.json();

        if (data.email) {
          setUser({ email: data.email });
          setAuthorized(true);
        } else {
          throw new Error('Invalid user session');
        }
      } catch (error) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';
    fetchWithRetry(`${baseUrl}/pingauth`, {
      method: 'GET',
      credentials: 'include',
    });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (authorized) {
    return (
      <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
    );
  }

  if (!authorized) {
    return <p>You must be logged in to view this page. <Link to="/login">Go to Login</Link></p>;
  }
  
}

export function AuthorizedUser(props: { value: string }) {
  const user = React.useContext(UserContext);

  if (!user) return null; // Prevents errors if context is null

  return props.value === 'email' ? <>{user.email}</> : null;
}

export default AuthorizeView;