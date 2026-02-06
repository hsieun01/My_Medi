import { getSimpleExplanation } from "./lib/actions/ai"

const test = async () => {
    try {
        console.log("Calling getSimpleExplanation...")
        const result = await getSimpleExplanation(
            "33b3626d-5c42-4611-b650-f9d5eca29d7e",
            "disease",
            "High blood pressure",
            "고혈압"
        )
        console.log("Result:", result)
    } catch (e) {
        console.error("Error:", e)
    }
}
// This won't work easily from Node because of 'use server' and Supabase server client
// but I'll try to run it.
test()
