import React from 'react';
import Card from '../common/Card';

const QuantitySheet = ({ plans }) => {
  const hasPlans = plans && Object.keys(plans).length > 0;

  return (
    <Card className="w-full max-w-4xl">
      <h3 className="text-2xl font-bold mb-4 text-center">Today's Cooking Plan</h3>
      {hasPlans ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(plans).map(([mealName, plan]) => (
            <div key={mealName} className="p-4 rounded-lg bg-light-bg border border-light-border">
              <h4 className="font-bold text-xl mb-2">{mealName}</h4>
              <h5 className="font-semibold mb-1">Required Quantities:</h5>
              <ul className="list-disc list-inside mb-3">
                {Object.entries(plan.quantities).map(([ingredient, qty]) => (
                  <li key={ingredient} className="capitalize">{ingredient}: {qty} kg/L</li>
                ))}
              </ul>
              <p className="font-bold text-lg">Estimated Cost: <span className="text-green-400">₹ {plan.total_cost}</span></p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-lg">No meal plans have been sent for today yet.</p>
      )}
    </Card>
  );
};

export default QuantitySheet;
