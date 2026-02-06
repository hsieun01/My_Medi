const { GoogleGenerativeAI } = require("@google/generative-ai")

const apiKey = 'AIzaSyC8Fb7ANGVvLK38Z8xW8xqsvD2GVbJsuNU'
const genAI = new GoogleGenerativeAI(apiKey)

async function listModels() {
    try {
        // There isn't a simple listModels in the client, but we can try to use a different model
        console.log("Testing gemini-pro...")
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })
        const result = await model.generateContent("Hi")
        console.log("gemini-pro response:", result.response.text())
    } catch (error) {
        console.error("gemini-pro failed:", error.message)
        try {
            console.log("Testing gemini-1.5-flash...")
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
            const result = await model.generateContent("Hi")
            console.log("gemini-1.5-flash response:", result.response.text())
        } catch (e) {
            console.error("gemini-1.5-flash failed:", e.message)
        }
    }
}

listModels()
