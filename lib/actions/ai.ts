"use server"

import { createClient } from "@/lib/supabase/server"

export async function getSimpleExplanation(
    targetId: string,
    targetType: "disease" | "drug",
    medicalTerm: string,
    targetName: string
) {
    const supabase = await createClient()

    // 1. Check Cache
    const { data: cache } = await supabase
        .from("ai_explanations")
        .select("content")
        .eq("target_id", targetId)
        .single()

    if (cache) {
        return cache.content
    }

    // 2. Clear Prompt for Groq
    const prompt = `
    당신의 임무는 어려운 의학 정보를 일반인도 이해하기 아주 쉽게 설명해주는 것입니다.
    대상: ${targetName} (${targetType === "disease" ? "질환" : "약품"})
    어려운 내용: ${medicalTerm}
    위 내용을 3문장 이내의 아주 쉬운 한국어로 친절하게 설명해 주세요.
  `

    try {
        const apiKey = process.env.GROQ_API_KEY
        if (!apiKey) throw new Error("GROQ_API_KEY is missing")

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 512
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Groq API Error: ${JSON.stringify(errorData)}`)
        }

        const data = await response.json()
        const explanation = data.choices[0].message.content.trim()

        // 3. Save to Cache
        await supabase.from("ai_explanations").insert({
            target_id: targetId,
            target_type: targetType,
            content: explanation,
            model: "llama3-8b-8192"
        })

        return explanation
    } catch (error: any) {
        console.error("AI Action Error:", error)
        return "오류 발생: " + error.message
    }
}
