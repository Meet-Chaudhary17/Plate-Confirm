import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getVoteData, castVote } from '../services/api';
import Layout from '../components/common/Layout';
import MealCard from '../components/student/MealCard';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { auth, logout } = useContext(AuthContext);
  const [mealData, setMealData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMealData = async () => {
    try {
      const response = await getVoteData(auth.token);
      setMealData(response.data);
    } catch (error) {
      toast.error('Failed to fetch meal data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if(auth.token) fetchMealData();
  }, [auth.token]);

  const handleVote = async (mealName, vote) => {
    try {
      const response = await castVote({ meal_name: mealName, vote: vote }, auth.token);
      toast.success(response.data.message);
      fetchMealData(); // Refresh data after voting
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cast vote.');
    }
  };

  if (loading) {
    return <Layout><p>Loading dashboard...</p></Layout>;
  }

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome, {auth.name}!</h1>
          <Button onClick={logout} className="bg-red-600 hover:bg-red-700">Logout</Button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mealData && Object.keys(mealData).map(mealName => (
            <MealCard 
              key={mealName}
              mealName={mealName}
              status={mealData[mealName].status}
              userVote={mealData[mealName].user_vote}
              onVote={handleVote}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
