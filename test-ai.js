const { GoogleGenerativeAI } = require("@google/generative-ai")
require("dotenv").config({ path: ".env.local" })

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
console.log("API Key exists:", !!apiKey)

const genAI = new GoogleGenerativeAI(apiKey)

async function testAi() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const prompt = "Explain 'hypertension' in one simple sentence in Korean."
        const result = await model.generateContent(prompt)
        console.log("AI Response:", result.response.text())
    } catch (error) {
        console.error("AI Error:", error)
    }
}

testAi()
