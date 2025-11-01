import React from 'react';
import Card from '../common/Card';

const VoteCounts = ({ data }) => {
  return (
    <Card className="w-full">
      <h3 className="text-2xl font-bold mb-4 text-center">Live Vote Counts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.keys(data).map(mealName => (
          <div key={mealName} className="p-4 rounded-lg bg-light-bg border border-light-border">
            <h4 className="font-bold text-xl">{mealName}</h4>
            <p className="text-green-400">YES: {data[mealName].yes}</p>
            <p className="text-red-400">NO: {data[mealName].no}</p>
            <p className="text-gray-300">Status: {data[mealName].status}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default VoteCounts;
