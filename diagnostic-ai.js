const { GoogleGenerativeAI } = require("@google/generative-ai")

const apiKey = 'AIzaSyC8Fb7ANGVvLK38Z8xW8xqsvD2GVbJsuNU'
const genAI = new GoogleGenerativeAI(apiKey)

const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-pro",
    "text-bison-001"
]

async function diagnostic() {
    for (const modelName of models) {
        try {
            console.log(`Testing ${modelName}...`)
            const model = genAI.getGenerativeModel({ model: modelName })
            const result = await model.generateContent("Hello")
            const response = await result.response
            console.log(`  Success! Response: ${response.text().substring(0, 20)}...`)
            break; // Found one!
        } catch (e) {
            console.log(`  Failed: ${e.message}`)
        }
    }
}

diagnostic()
