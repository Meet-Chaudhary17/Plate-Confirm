import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getStaffPlan } from '../services/api';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import QuantitySheet from '../components/staff/QuantitySheet';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { auth, logout } = useContext(AuthContext);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await getStaffPlan(auth.token);
        setPlans(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch plans.');
      }
      setLoading(false);
    };

    if (auth.token) {
      fetchPlan();
      // Optional: Poll for updates every 30 seconds
      const interval = setInterval(fetchPlan, 30000);
      return () => clearInterval(interval);
    }
  }, [auth.token]);

  if (loading) {
    return <Layout><p>Loading dashboard...</p></Layout>;
  }

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mess Staff Dashboard</h1>
          <Button onClick={logout} className="bg-red-600 hover:bg-red-700">Logout</Button>
        </header>
        <QuantitySheet plans={plans} />
      </div>
    </Layout>
  );
};

export default StaffDashboard;
