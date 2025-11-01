import axios from 'axios';

const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

// Auth
export const register = (userData) => API.post('/register', userData);
export const login = (email, password) => API.post('/login', {}, { auth: { username: email, password } });

// Voting
export const castVote = (voteData, token) => API.post('/cast_vote', voteData, { headers: { 'x-access-token': token } });
export const getVoteData = (token) => API.get('/get_vote_data', { headers: { 'x-access-token': token } });

// Admin
export const getYesStudents = (mealName, token) => API.get(`/get_yes_students/${mealName}`, { headers: { 'x-access-token': token } });
export const generateCostPlan = (planData, token) => API.post('/generate_cost_plan', planData, { headers: { 'x-access-token': token } });
export const sendToStaff = (mealData, token) => API.post('/send_to_staff', mealData, { headers: { 'x-access-token': token } });

// Staff
export const getStaffPlan = (token) => API.get('/get_staff_plan', { headers: { 'x-access-token': token } });
