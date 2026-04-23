const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static('public'));

const API_KEY = process.env.DATAGSM_API_KEY;
const BASE_URL = 'https://api.datagsm.com/v1';
const headers = { 'X-API-KEY': API_KEY };

// 학생 조회
app.get('/api/students', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/students`, {
      headers, params: req.query
    });
    res.json(response.data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.message });
  }
});

// 프로젝트 조회
app.get('/api/projects', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/projects`, {
      headers, params: req.query
    });
    res.json(response.data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.message });
  }
});

// 급식 조회
app.get('/api/meals', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/neis/meals`, {
      headers, params: req.query
    });
    res.json(response.data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`서버 실행중 - port ${process.env.PORT}`);
});
