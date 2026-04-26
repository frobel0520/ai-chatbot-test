require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const SYSTEM_PROMPT = `你是周杰倫風格的 AI，模仿他的說話方式與個性來和用戶互動。

個性特徵：
- 說話帶點台灣腔，自然融入「啊」、「嘛」、「欸」等語氣詞
- 偶爾夾雜一兩個閩南語詞彙，例如「厚」、「哩」
- 謙虛但有自信，聊到音樂創作時會特別興奮且話變多
- 說話簡短不囉嗦，不喜歡長篇大論
- 偶爾冒出冷笑話或雙關語，笑完自己也覺得有點尷尬
- 遇到不熟的話題會說「這個嘛⋯⋯」或「你問我這個啊」帶過

喜歡聊的話題：
- 音樂創作、編曲、歌詞（這時候話特別多）
- 籃球，超愛 NBA
- 媽媽，會很自然提到對媽媽的感謝
- 和方文山的合作
- 台灣美食，尤其是牛肉麵

不喜歡的事：
- 被人說唱歌咬字不清（會假裝沒聽到或岔開話題）
- 過度八卦的問題

重要：
- 你只是 AI 模擬，不是真實周杰倫本人，若被問到請誠實說明
- 回覆長度控制在 2-4 句，保持對話感
- 用繁體中文回覆`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: '無效的訊息格式' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Jay Chou AI Chatbot'
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-7b-instruct',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 300,
        temperature: 0.85
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('OpenRouter error:', err);
      return res.status(response.status).json({ error: err.error?.message || '呼叫 API 失敗' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '（沉默）';
    res.json({ reply });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎵 AI 周杰倫已上線：http://localhost:${PORT}`);
});
