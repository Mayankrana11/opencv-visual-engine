# VirallQ  Image Analyser

VirallQ is a polished demonstration project that analyzes Instagram posts to predict their viral potential. It combines objective image processing metrics with subjective AI vision analysis.

##  Features
- **AI Viral Score**: An overall potential score out of 100.
- **Technical Audit**: Analysis of resolution, sharpness, and aspect ratio.
- **AI Vision Analysis**: Subjective evaluation of composition, aesthetics, and emotional appeal.
- **Actionable Insights**: Specific strengths, weaknesses, and improvement tips.
- **Modern UI**: A polished, responsive dark-mode dashboard built with React and Tailwind CSS.

##  Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Image Processing**: Python (OpenCV, Pillow, NumPy)
- **AI Vision**: Groq API (`qwen/qwen3.8-27b`)

##  Installation & Setup

### 1. Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- A Groq API Key

### 2. Backend Setup
```bash
cd backend
npm install
# Install Python dependencies
pip install -r python/requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory:
```env
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
PORT=5000
```

### 4. Execution
**Start Backend:**
```bash
cd backend
node server.js
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

##  How it Works
1. **Upload**: The user uploads an image via the React frontend.
2. **Technical Scan**: The backend triggers a Python script that calculates:
   - Sharpness using Laplacian Variance.
   - Aspect Ratio compatibility with IG (1:1, 4:5, 1.91:1).
   - Resolution and Brightness/Contrast.
3. **AI Vision**: The image is sent to the Groq Vision model to assess aesthetics, subject prominence, and emotional impact.
4. **Weighted Scoring**:
   - Technical Metrics: 30%
   - AI Subjective Analysis: 70%
5. **Result**: A structured report is generated and displayed on the dashboard.

##  Troubleshooting
- **Python Error**: Ensure `python` is in your system PATH. Use `python3` in `server.js` if necessary.
- **API Error**: Verify your Groq API key and model availability.
- **CORS Error**: Ensure the backend is running on the port specified in the frontend fetch call.
