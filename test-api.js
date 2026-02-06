const test = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "explanation",
                targetId: "33b3626d-5c42-4611-b650-f9d5eca29d7e",
                targetType: "disease",
                medicalTerm: "Hypertension is high blood pressure.",
                targetName: "고혈압"
            })
        })
        const data = await res.json()
        console.log("Response Status:", res.status)
        console.log("Response Data:", JSON.stringify(data, null, 2))
    } catch (e) {
        console.error("Fetch Error:", e)
    }
}
test()
