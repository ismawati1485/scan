import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// 🔥 FILL THIS OUT FIRST!
// Get your Gemini API key by visiting https://g.co/ai/idxGetGeminiKey
let API_KEY = 'AIzaSyDyR1Xvb33gYOHHvO3yiNBcJL4Wmj5ddUI';

let form = document.querySelector('form');
let output = document.querySelector('.output');
let canvas = document.getElementById('canvas'); // Pastikan canvas tersedia di HTML

// Tombol "Go" untuk menjalankan analisis makanan
document.getElementById('go-btn').addEventListener('click', async (ev) => {
  ev.preventDefault();
  output.textContent = 'Analyzing food...';

  try {
    // Pastikan canvas memiliki gambar sebelum mengambil data base64
    if (canvas.width === 0 || canvas.height === 0) {
      output.textContent = 'Tidak ada gambar yang tersedia untuk dianalisis.';
      return;
    }

    // Ambil data gambar dari canvas dalam format base64
    const base64String = canvas.toDataURL('image/png').split(',')[1];

    // Gunakan prompt tetap yang ada di HTML
    let prompt = "Apa saja isi makanan tersebut dan mengandung berapa kalori?";

    // Kombinasikan gambar dengan prompt tetap
    let contents = [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: 'image/png', data: base64String } }, // Pastikan tipe MIME sesuai
          { text: prompt }
        ]
      }
    ];

    // Panggil API Gemini
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", // or gemini-1.5-pro
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContentStream({ contents });

    // Read from the stream and interpret the output as markdown
    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    console.error('Error during analysis:', e);
    output.innerHTML += '<hr>Terjadi kesalahan saat menganalisis gambar. Silakan coba lagi atau periksa koneksi Anda.';
  }
});


