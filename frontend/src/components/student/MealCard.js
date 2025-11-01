import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { motion } from 'framer-motion';

const MealCard = ({ mealName, status, userVote, onVote }) => {
  const isLive = status === 'LIVE';

  return (
    <Card className="w-full max-w-sm text-center">
      <h3 className="text-2xl font-bold mb-2">{mealName}</h3>
      <div className="mb-4">
        <span className={`px-3 py-1 text-sm rounded-full ${isLive ? 'bg-green-500' : 'bg-red-500'}`}>
          Voting {status}
        </span>
      </div>
      {isLive ? (
        <div className="flex justify-center gap-4">
          <Button onClick={() => onVote(mealName, true)} className="bg-green-600 hover:bg-green-700">YES</Button>
          <Button onClick={() => onVote(mealName, false)} className="bg-red-600 hover:bg-red-700">NO</Button>
        </div>
      ) : (
        <p className="text-lg">Voting is closed.</p>
      )}
      {userVote && (
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="mt-4 text-lg font-semibold">
          You voted: <span className={userVote === 'YES' ? 'text-green-400' : 'text-red-400'}>{userVote}</span>
        </motion.p>
      )}
    </Card>
  );
};

export default MealCard;
