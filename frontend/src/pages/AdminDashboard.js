import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getVoteData } from '../services/api';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import VoteCounts from '../components/Admin/VoteCounts';
import StudentList from '../components/Admin/StudentList';
import CostPlanGenerator from '../components/Admin/CostPlanGenerator';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { auth, logout } = useContext(AuthContext);
  const [voteData, setVoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');

  useEffect(() => {
    const fetchVoteData = async () => {
      try {
        const response = await getVoteData(auth.token);
        setVoteData(response.data);
      } catch (error) {
        toast.error('Failed to fetch vote data.');
      }
      setLoading(false);
    };
    if(auth.token) fetchVoteData();
  }, [auth.token]);

  if (loading) {
    return <Layout><p>Loading dashboard...</p></Layout>;
  }

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={logout} className="bg-red-600 hover:bg-red-700">Logout</Button>
        </header>
        
        {voteData && <VoteCounts data={voteData} />}

        <div className="mt-8 glassmorphism p-6">
          <h2 className="text-2xl font-bold mb-4">Meal Management</h2>
          <div className="flex gap-2 mb-4">
            {voteData && Object.keys(voteData).map(mealName => (
              <Button 
                key={mealName} 
                onClick={() => setSelectedMeal(mealName)}
                className={`${selectedMeal === mealName ? 'bg-primary' : 'bg-secondary'}`}>
                {mealName}
              </Button>
            ))}
          </div>

          {selectedMeal && (
            <div>
              <StudentList mealName={selectedMeal} token={auth.token} />
              <CostPlanGenerator mealName={selectedMeal} token={auth.token} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
