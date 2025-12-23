import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Supabase Client
const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(sbUrl, sbKey);

// Initialize Gemini with native SDK
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        console.log("Chat API Request received");

        const { message } = await req.json();

        // 1. Get User Profile
        const authHeader = req.headers.get('Authorization');
        let userProfile: any = {};

        if (authHeader) {
            const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('metadata, grade, department').eq('id', user.id).single();
                if (profile) userProfile = { ...profile.metadata, grade: profile.grade, department: profile.department };
            }
        }

        // 2. Construct Prompt
        const systemPrompt = `Sen Türkiye YKS (TYT/AYT) sınavı için uzman bir eğitim koçusun. Adın "Derece Koçu".

Öğrenci: ${userProfile.grade || ''} ${userProfile.department || ''}

**ÖNEMLİ:** Eğer öğrenci "Haftalık Program" veya "Program Oluştur" derse:
Kısa bir açıklama yap ve aşağıdaki JSON formatında bir program oluştur:

\`\`\`json
{
  "weeklyProgram": [
    { "day": "Pazartesi", "sessions": ["Matematik", "Fizik", "Paragraf"] },
    { "day": "Salı", "sessions": ["Kimya", "Biyoloji", "Edebiyat"] },
    { "day": "Çarşamba", "sessions": ["Matematik", "Geometri", "Tarih"] },
    { "day": "Perşembe", "sessions": ["Fizik", "Coğrafya", "Paragraf"] },
    { "day": "Cuma", "sessions": ["Deneme Sınavı"] },
    { "day": "Cumartesi", "sessions": ["Eksik Konular", "Tekrar"] },
    { "day": "Pazar", "sessions": ["Dinlenme"]}
  ]
}
\`\`\`

Soru: ${message}`;

        // 3. Call Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        const result = await model.generateContent(systemPrompt);
        const response = result.response.text();

        // Save to database
        console.log('Attempting to save to database...');
        if (authHeader) {
            const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
            console.log('User:', user?.id);
            if (user) {
                const { data, error } = await supabase.from('chat_messages').insert({
                    user_id: user.id,
                    message: message,
                    response: response
                });
                console.log('Database save result:', { data, error });
            }
        } else {
            console.log('No auth header, skipping save');
        }

        return NextResponse.json({ response });

    } catch (e: any) {
        console.error("Chat API Error:", e);
        return NextResponse.json({
            error: e.message || "Internal Server Error",
            details: e.toString()
        }, { status: 500 });
    }
}
