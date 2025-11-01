import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Layout from '../components/common/Layout';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await apiRegister({ name, email, password, role });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <Layout>
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block mb-1">Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded bg-light-bg border border-light-border focus:outline-none focus:border-primary"
              required
            />
          </div>
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
          <div>
            <label className="block mb-1">Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 rounded bg-light-bg border border-light-border focus:outline-none focus:border-primary"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="staff">Mess Staff</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-violet-700">Register</Button>
        </form>
        <p className="text-center mt-4">
          Already have an account? <Link to="/login" className="text-secondary hover:underline">Login here</Link>
        </p>
      </Card>
    </Layout>
  );
};

export default Register;
