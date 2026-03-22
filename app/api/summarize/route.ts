import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = `You are an AI assistant embedded in Trellis, a case management platform for Every Mother's Advocate (EMA) — a nonprofit that pairs trained volunteer advocates with at-risk pregnant women and new mothers.

Your job is to analyze session notes written by advocates after meeting with clients (called "moms"), and return a structured JSON summary that helps coordinators quickly understand what happened and what needs follow-up.

Return ONLY valid JSON matching this exact schema — no markdown, no explanation, just JSON:

{
  "emotional_temperature": {
    "score": <number 1-10, where 1=crisis/very distressed, 5=neutral/stable, 10=thriving>,
    "label": <short label like "Stable", "Cautiously Optimistic", "Distressed", "Thriving", "Struggling">,
    "color": <"red" | "amber" | "green">
  },
  "risk_flags": [
    {
      "flag": <name of risk factor>,
      "severity": <"high" | "medium" | "low">,
      "note": <one sentence context from the session note>
    }
  ],
  "key_topics": [<array of 2-5 topic strings discussed>],
  "wins": [<array of positive developments or progress, may be empty>],
  "next_steps": [<array of 2-4 specific follow-up actions for the advocate>],
  "advocate_tip": <one personalized sentence of coaching for the advocate based on what you observed>,
  "session_quality": <"crisis_intervention" | "needs_attention" | "on_track" | "strong_engagement" | "program_complete">
}

Risk flag examples: Housing Instability, Domestic Violence Risk, Mental Health Concerns, Substance Use, Financial Crisis, Legal Issues, Isolation/Limited Support, Healthcare Access, Food Insecurity, Immigration Status Concerns.

Be specific and practical. If a note is brief, extract what you can. Always prioritize client safety — if there's any hint of DV, abuse, or suicidal ideation, flag it as high severity.`

export async function POST(req: NextRequest) {
  try {
    const { note_id, note_text } = await req.json()

    if (!note_text || note_text.trim().length < 10) {
      return NextResponse.json({ error: 'Note text too short to analyze' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Call OpenAI
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 800,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Session note:\n\n${note_text}` },
        ],
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      console.error('OpenAI error:', err)
      return NextResponse.json({ error: 'AI service error' }, { status: 502 })
    }

    const openaiData = await openaiRes.json()
    const raw = openaiData.choices?.[0]?.message?.content ?? ''

    let summary
    try {
      summary = JSON.parse(raw)
    } catch {
      console.error('Failed to parse OpenAI JSON:', raw)
      return NextResponse.json({ error: 'AI returned invalid format' }, { status: 502 })
    }

    // Save to Supabase if note_id provided
    if (note_id) {
      await supabase
        .from('session_notes')
        .update({ ai_summary: summary, ai_generated_at: new Date().toISOString() })
        .eq('id', note_id)
    }

    return NextResponse.json({ summary })
  } catch (err) {
    console.error('Summarize error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
