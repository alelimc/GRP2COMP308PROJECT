import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';

export const AuthContext = createContext();

// GraphQL Mutations
const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        role
        firstName
        lastName
      }
    }
  }
`;

const REGISTER_USER = gql`
  mutation RegisterUser(
    $username: String!
    $email: String!
    $password: String!
    $role: String!
    $firstName: String!
    $lastName: String!
    $dateOfBirth: String
  ) {
    registerUser(
      username: $username
      email: $email
      password: $password
      role: $role
      firstName: $firstName
      lastName: $lastName
      dateOfBirth: $dateOfBirth
    ) {
      token
      user {
        id
        username
        email
        role
        firstName
        lastName
      }
    }
  }
`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Login mutation
  const [loginUser, { loading: loginLoading }] = useMutation(LOGIN_USER);

  // Register mutation
  const [registerUser, { loading: registerLoading }] = useMutation(REGISTER_USER);

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const { data } = await loginUser({
        variables: { email, password }
      });

      //const { token, user } = data.loginUser;

      //localStorage.setItem('token', token);
      //localStorage.setItem('user', JSON.stringify(user));
      //localStorage.setItem('userRole', user.role);

      setUser(user);

      navigate(`/${user.role}/dashboard`);

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const { data } = await registerUser({
        variables: userData
      });

      const { token, user } = data.registerUser;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);

      setUser(user);

    
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginLoading,
        registerLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
