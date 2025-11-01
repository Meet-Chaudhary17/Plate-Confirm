import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { login as apiLogin } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Layout from '../components/common/Layout';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiLogin(email, password);
      const { token, role, name } = response.data;
      login(token, role, name);
      toast.success('Logged in successfully!');
      
      // Redirect based on role
      if (role === 'admin') navigate('/admin');
      else if (role === 'staff') navigate('/staff');
      else navigate('/student');

    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <Layout>
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Plate-Confirm Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-1">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-light-bg border border-light-border focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-light-bg border border-light-border focus:outline-none focus:border-primary"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-violet-700">Login</Button>
        </form>
        <p className="text-center mt-4">
          New user? <Link to="/register" className="text-secondary hover:underline">Register here</Link>
        </p>
      </Card>
    </Layout>
  );
};

export default Login;
