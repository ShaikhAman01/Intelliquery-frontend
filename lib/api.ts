import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getConnections = async (userId: number) => {
  const res = await api.get(`/connections/?user_id=${userId}`);
  return res.data;
};

export const createConnection = async (data: Record<string, unknown>) => {
  const res = await api.post('/connections/', data);
  return res.data;
};

export const sendQuery = async (query: string, connectionId: number) => {
  const res = await api.post('/query/generate', null, {
    params: { user_query: query, connection_id: connectionId },
  });
  return res.data;
};