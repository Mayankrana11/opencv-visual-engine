const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const Groq = require('groq-sdk');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Setup Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only images (jpg, jpeg, png, webp) are allowed'));
    }
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Runs the Python analyzer script and returns parsed JSON
 */
async function runPythonAnalysis(filePath) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['python/analyzer.py', filePath]);
        let dataString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python script exited with code ${code}`));
                return;
            }
            try {
                const parsedData = JSON.parse(dataString);
                console.log('\n--- Python OpenCV/Pillow Response ---');
                console.log(JSON.stringify(parsedData, null, 2));
                console.log('-------------------------------------\n');
                resolve(parsedData);
            } catch (e) {
                reject(new Error('Failed to parse Python output as JSON'));
            }
        });
    });
}

/**
 * Calls Groq Vision API for subjective analysis
 */
async function runGroqAnalysis(filePath) {
    // Convert image to base64 for Groq API
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = path.extname(filePath).slice(1) === 'png' ? 'image/png' : 'image/jpeg';

    const prompt = `
    Analyze this Instagram post image and provide a detailed viral potential assessment.
    You must return the response in STRICT JSON format.

    Analyze the following aspects and provide a score (0-100) and a brief explanation for each:
    1. background_aesthetics: Lighting, colors, distracting elements.
    2. foreground_clarity: Subject prominence and focus.
    3. composition: Framing, visual hierarchy, and rule of thirds.
    4. emotional_appeal: Originality, mood, and likely audience interest.

    Also provide:
    - strengths: A list of 2-3 things that work well.
    - weaknesses: A list of 2-3 things that could be improved.
    - suggestions: 3 actionable tips to make this post go viral.
    - verdict: A one-sentence final summary of the image's potential.

    JSON Structure:
    {
      "scores": {
        "background_aesthetics": { "score": 85, "explanation": "..." },
        "foreground_clarity": { "score": 90, "explanation": "..." },
        "composition": { "score": 70, "explanation": "..." },
        "emotional_appeal": { "score": 80, "explanation": "..." }
      },
      "strengths": [],
      "weaknesses": [],
      "suggestions": [],
      "verdict": "..."
    }
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`
                            }
                        },
                    ],
                },
            ],
            model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(chatCompletion.choices[0].message.content);
        console.log('\n--- Groq AI Response ---');
        console.log(JSON.stringify(content, null, 2));
        console.log('------------------------\n');
        return content;
    } catch (e) {
        console.error('Groq API Error:', e);
        throw e;
    }
}

app.post('/analyze', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    const filePath = req.file.path;

    try {
        // 1. Run Python and Groq in parallel
        const [pythonData, groqData] = await Promise.all([
            runPythonAnalysis(filePath),
            runGroqAnalysis(filePath)
        ]);

        if (pythonData.error) throw new Error(`Python Analysis failed: ${pythonData.error}`);

        // 2. Combine and Weight Scores
        // Python Weights: Technical Quality (15%), Aspect Ratio (15%) = 30%
        // Groq Weights: BG (15%), FG (15%), Comp (20%), Appeal (20%) = 70%

        const techScore = pythonData.scores.technical_quality || 0;
        const ratioScore = pythonData.scores.aspect_ratio_compatibility || 0;

        const bgScore = groqData.scores.background_aesthetics.score;
        const fgScore = groqData.scores.foreground_clarity.score;
        const compScore = groqData.scores.composition.score;
        const appealScore = groqData.scores.emotional_appeal.score;

        const overallScore = (
            (techScore * 0.15) +
            (ratioScore * 0.15) +
            (bgScore * 0.15) +
            (fgScore * 0.15) +
            (compScore * 0.20) +
            (appealScore * 0.20)
        );

        let label = 'Low Potential';
        if (overallScore > 80) label = "Algorithm's Favourite";
        else if (overallScore > 60) label = 'High Potential';
        else if (overallScore > 40) label = 'Promising';

        // 3. Construct Final Response
        const response = {
            overallScore: Math.round(overallScore),
            label: label,
            breakdown: {
                "Technical Quality": techScore,
                "Aspect Ratio": ratioScore,
                "Background Aesthetics": bgScore,
                "Foreground Clarity": fgScore,
                "Composition": compScore,
                "Engagement Potential": appealScore,
            },
            aiAnalysis: {
                verdict: groqData.verdict,
                strengths: groqData.strengths,
                weaknesses: groqData.weaknesses,
                suggestions: groqData.suggestions,
                details: groqData.scores
            },
            metadata: pythonData.metrics
        };

        res.json(response);

    } catch (error) {
        console.error('Analysis Pipeline Error:', error);
        res.status(500).json({ error: 'Internal server error during analysis' });
    } finally {
        // Cleanup: Delete uploaded file
        fs.unlink(filePath, (err) => {
            if (err) console.error(`Failed to delete temporary file ${filePath}:`, err);
        });
    }
});

app.listen(PORT, () => {
    console.log(`VirallQ Backend running on port ${PORT}`);
});
