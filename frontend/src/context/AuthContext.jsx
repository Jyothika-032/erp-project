import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentInstitution, setCurrentInstitution] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const savedInst = localStorage.getItem('currentInstitution');
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
      
      const mockInstitutions = [
        { id: 'abc-kochi', name: 'ABC Academy Kochi' },
        { id: 'abc-kozhy', name: 'ABC Academy Kozhikode' }
      ];

      try {
        const data = await apiClient.get('/institutions');
        if (data.success && data.data.length > 0) {
          setInstitutions(data.data);
          if (savedInst) {
            const parsed = JSON.parse(savedInst);
            const exists = data.data.find(i => i.id === parsed.id);
            if (exists) {
              setCurrentInstitution(exists);
            } else {
              setCurrentInstitution(data.data[0]);
              localStorage.setItem('currentInstitution', JSON.stringify(data.data[0]));
            }
          } else {
            setCurrentInstitution(data.data[0]);
            localStorage.setItem('currentInstitution', JSON.stringify(data.data[0]));
          }
        } else {
          // If API returns empty, use mock
          setInstitutions(mockInstitutions);
          if (savedInst) {
            const parsed = JSON.parse(savedInst);
            const exists = mockInstitutions.find(i => i.id === parsed.id);
            if (exists) {
              setCurrentInstitution(exists);
            } else {
              setCurrentInstitution(mockInstitutions[0]);
            }
          } else {
            setCurrentInstitution(mockInstitutions[0]);
          }
        }
      } catch (err) {
        console.warn('API unavailable, using mock institutions fallback');
        setInstitutions(mockInstitutions);
        if (savedInst) {
          const parsed = JSON.parse(savedInst);
          const exists = mockInstitutions.find(i => i.id === parsed.id);
          if (exists) {
            setCurrentInstitution(exists);
          } else {
            setCurrentInstitution(mockInstitutions[0]);
          }
        } else {
          setCurrentInstitution(mockInstitutions[0]);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, institutionId) => {
    try {
      const data = await apiClient.post('/auth/login', { 
        email, 
        password, 
        institution_id: institutionId 
      });

      if (data.success) {
        setUser(data.user);
        
        // Sync with premium standard keys (used in apiClient interceptors)
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Handle institution selection
        const instId = data.user.institution_id || institutionId;
        const inst = institutions.find(i => i.id === instId);
        if (inst) {
          setCurrentInstitution(inst);
          localStorage.setItem('currentInstitution', JSON.stringify(inst));
        }
        
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentInstitution(null);
    localStorage.removeItem('user');
    localStorage.removeItem('currentInstitution');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const switchInstitution = (instId) => {
    const inst = institutions.find(i => i.id === instId);
    if (inst) {
      setCurrentInstitution(inst);
      localStorage.setItem('currentInstitution', JSON.stringify(inst));
      window.location.reload(); // Refresh to update all context data
    }
  };

  const signup = async (email, password, name, institutionId) => {
    try {
      const data = await apiClient.post('/auth/signup', { email, password, name, institution_id: institutionId });
      if (data.success) {
        return login(email, password, institutionId);
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentInstitution, 
      institutions,
      login, 
      logout,
      signup, 
      switchInstitution,
      isAuthenticated: !!user,
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
