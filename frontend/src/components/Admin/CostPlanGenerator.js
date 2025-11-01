import React, { useState } from 'react';
import { generateCostPlan, sendToStaff } from '../../services/api';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const CostPlanGenerator = ({ mealName, token }) => {
  const [costs, setCosts] = useState({
    rice: '50', dal: '100', vegetables: '40', 
    flour: '30', sugar: '45', milk: '60'
  });
  const [plan, setPlan] = useState(null);
  const [totalCost, setTotalCost] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCostChange = (e) => {
    setCosts({ ...costs, [e.target.name]: e.target.value });
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const numericCosts = Object.keys(costs).reduce((acc, key) => {
        acc[key] = parseFloat(costs[key]);
        return acc;
      }, {});

      const response = await generateCostPlan({ meal_name: mealName, costs: numericCosts }, token);
      setPlan(response.data.plan);
      setTotalCost(response.data.total_cost);
      toast.success('Cost plan generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate plan.');
    }
    setLoading(false);
  };
  
  const handleSendToStaff = async () => {
    try {
        await sendToStaff({ meal_name: mealName }, token);
        toast.success('Plan sent to staff!');
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send plan.');
    }
  }

  return (
    <div className="mt-6 p-4 bg-light-bg rounded-lg border border-light-border">
      <h4 className="text-xl font-bold mb-4">Generate Cost Plan for {mealName}</h4>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {Object.keys(costs).map(ing => (
          <div key={ing}>
            <label className="capitalize text-sm">{ing} (per kg/L)</label>
            <input 
              type="number"
              name={ing}
              value={costs[ing]}
              onChange={handleCostChange}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-primary"
            />
          </div>
        ))}
      </div>

      <Button onClick={handleGeneratePlan} disabled={loading} className="bg-secondary hover:bg-blue-700">
        {loading ? 'Generating...' : 'Generate Plan'}
      </Button>

      {plan && (
        <div className="mt-6">
          <h5 className="text-lg font-bold">Optimized Quantities:</h5>
          <ul className="list-disc list-inside">
            {Object.keys(plan).map(ing => (
              <li key={ing} className="capitalize">{ing}: {plan[ing]} kg/L</li>
            ))}
          </ul>
          <p className="font-bold mt-2">Estimated Total Cost: ₹ {totalCost}</p>
          <Button onClick={handleSendToStaff} className="mt-4 bg-green-600 hover:bg-green-700">
            Send to Staff
          </Button>
        </div>
      )}
    </div>
  );
};

export default CostPlanGenerator;
