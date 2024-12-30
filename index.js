import { GoogleAuth } from 'google-auth-library';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const { ENDPOINT_ID, PROJECT_ID, GEMINI_API_KEY } = process.env;

async function predict(inputData) {
  
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const accessToken = await auth.getAccessToken();

  const response = await fetch(
    `https://${ENDPOINT_ID}.us-central1-${PROJECT_ID}.prediction.vertexai.goog/v1/projects/${PROJECT_ID}/locations/us-central1/endpoints/${ENDPOINT_ID}:predict`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(inputData)
    }
  );
  return await response.json();
}

async function analyze(inputData, prediction) {

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze the following prediction. 
        The prediction is based on the following data: ${JSON.stringify(inputData)}. 
        The prediction is: ${JSON.stringify(prediction)}`;

    const result = await model.generateContent(prompt);

    return result.response.text();
}

async function main(filename) {
    const inputData = JSON.parse(
        await readFile(new URL(`./${filename}`, import.meta.url))
    );

    const prediction = await predict(inputData);
    const analysis = await analyze(inputData, prediction);

    console.log(analysis);
    return analysis;
}

main("sample_data.json");