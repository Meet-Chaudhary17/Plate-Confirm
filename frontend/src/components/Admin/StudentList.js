import React, { useState, useEffect } from 'react';
import { getYesStudents } from '../../services/api';
import toast from 'react-hot-toast';

const StudentList = ({ mealName, token }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mealName) {
      const fetchStudents = async () => {
        setLoading(true);
        try {
          const response = await getYesStudents(mealName, token);
          setStudents(response.data);
        } catch (error) {
          toast.error('Failed to fetch student list.');
        }
        setLoading(false);
      };
      fetchStudents();
    }
  }, [mealName, token]);

  return (
    <div className="mt-6">
      <h4 className="text-xl font-bold mb-2">Students who voted YES for {mealName}</h4>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="max-h-60 overflow-y-auto p-4 bg-light-bg rounded-lg border border-light-border">
          {students.length > 0 ? (
            <ul>
              {students.map((student, index) => (
                <li key={index} className="border-b border-light-border py-2">
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-sm text-gray-300">{student.email}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No students have voted YES for this meal yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentList;
