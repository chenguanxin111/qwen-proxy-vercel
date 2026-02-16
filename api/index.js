// api/index.js - 智谱 GLM 代理服务

const express = require('express');
const fetch = require('node-fetch');

const app = express();

// 解析 JSON 请求体
app.use(express.json());

// 代理接口：转发到智谱 GLM
app.post('/api/qwen', async (req, res) => {
  try {
    const apiKey = process.env.ZHIPU_API_KEY; // 从 Vercel 环境变量读取
    if (!apiKey) {
      return res.status(500).json({ error: '请先在 Vercel 设置 ZHIPU_API_KEY 环境变量' });
    }

    // 构造请求体（适配智谱 GLM-4.6V-Flash）
    const requestBody = {
      model: 'glm-4.6v-flash',      // 正在使用的模型
      messages: [
        {
          role: 'user',
          content: req.body.prompt || ''  // 前端传来的 prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    };

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('代理错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 健康检查
app.get('/', (req, res) => {
  res.json({ message: 'Qwen Proxy is running on Vercel' });
});

// 导出 Express 应用（Vercel 需要）
module.exports = app;