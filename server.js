const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static('public'));

const API_KEY = process.env.DATAGSM_API_KEY;
const BASE_URL = (process.env.DATAGSM_API_BASE || 'https://openapi.datagsm.kr/v1').replace(/\/$/, '');
const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const upstream = axios.create({
  baseURL: BASE_URL,
  headers: { 'X-API-KEY': API_KEY },
  timeout: 30_000,
});

function mapUpstreamError(e) {
  if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
    return { status: 504, body: { error: '외부 API 응답이 너무 오래 걸립니다. 잠시 후 다시 시도해 주세요.' } };
  }
  if (e.code === 'ECONNREFUSED') {
    return {
      status: 503,
      body: {
        error:
          'DatagSM API 서버(HTTPS)에 연결할 수 없습니다. API 서버 점검·방화벽·주소 변경 여부를 확인하거나, 관리자에게 문의하세요.',
      },
    };
  }
  if (e.code === 'ENOTFOUND') {
    return { status: 503, body: { error: 'API 주소(DNS)를 찾을 수 없습니다. 네트워크와 도메인 설정을 확인하세요.' } };
  }
  if (e.code === 'ETIMEDOUT') {
    return { status: 504, body: { error: 'API 서버 연결 시간이 초과되었습니다.' } };
  }
  if (e.response) {
    const status = e.response.status || 502;
    const body = e.response.data ?? { error: 'upstream_error' };
    return { status, body };
  }
  return { status: 502, body: { error: '외부 API와 통신하지 못했습니다.' } };
}

// 학생 조회
app.get('/api/students', async (req, res) => {
  try {
    const response = await upstream.get('/students', { params: req.query });
    res.json(response.data);
  } catch (e) {
    const { status, body } = mapUpstreamError(e);
    res.status(status).json(body);
  }
});

// 프로젝트 조회
app.get('/api/projects', async (req, res) => {
  try {
    const response = await upstream.get('/projects', { params: req.query });
    res.json(response.data);
  } catch (e) {
    const { status, body } = mapUpstreamError(e);
    res.status(status).json(body);
  }
});

// 급식 조회
app.get('/api/meals', async (req, res) => {
  try {
    const response = await upstream.get('/neis/meals', { params: req.query });
    res.json(response.data);
  } catch (e) {
    const { status, body } = mapUpstreamError(e);
    res.status(status).json(body);
  }
});

app.listen(PORT, HOST, () => {
  console.log(`서버 실행중 — http://${HOST}:${PORT} (실제 접속은 방화벽·리버스 프록시 포트와 맞추세요)`);
  console.log(`DatagSM upstream: ${BASE_URL}`);
  if (!API_KEY) console.warn('경고: DATAGSM_API_KEY가 설정되어 있지 않습니다.');
});
