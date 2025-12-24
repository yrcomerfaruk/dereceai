import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

// Initialize Supabase Client
const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(sbUrl, sbKey);

export const runtime = 'nodejs';

// Define Zod schema for structured output
const SessionSchema = z.object({
    subject: z.string().describe('Ders adı (örn: TYT Matematik, AYT Fizik)'),
    topic: z.string().describe('Konu adı (örn: Türev, Elektrik) - ASLA boş olmamalı'),
    duration: z.string().describe('Süre (örn: 50 dakika)'),
    startTime: z.string().describe('Başlangıç saati (HH:MM formatında, örn: 09:00)')
});

const DayProgramSchema = z.object({
    day: z.string().describe('Gün adı (Pazartesi, Salı, vb.)'),
    date: z.string().describe('Tarih (YYYY-MM-DD formatında)'),
    sessions: z.array(SessionSchema).min(4).describe('Günlük etüt listesi - EN AZ 4 session olmalı')
});

const WeeklyProgramSchema = z.object({
    weeklyProgram: z.array(DayProgramSchema).length(7).describe('7 günlük program (Pazartesi-Pazar)')
});

export async function POST(req: NextRequest) {
    try {
        console.log("LangChain Schedule Generation API called");

        // 1. Get User Profile
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('metadata, grade, department')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const userProfile = { ...profile.metadata, grade: profile.grade, department: profile.department };

        // 2. Extract session details
        const sessionDetails = userProfile.sessionDetails || {};
        const studyDetails = userProfile.studyDetails || {};

        const sessionLength = sessionDetails.sessionLength || 50;
        const breakLength = sessionDetails.breakLength || 10;
        const lunchBreak = sessionDetails.lunchBreak || sessionDetails.lunchBreakLength || 60;
        const dailyHours = studyDetails.dailyHours || 6;
        const startTime = studyDetails.startTime || '09:00';
        const endTime = studyDetails.endTime || '22:00';

        // 3. Load all subjects and extract weak topics
        const fs = await import('fs/promises');
        const path = await import('path');
        const subjectsPath = path.join(process.cwd(), 'app', 'onboarding', 'subjects.json');
        const subjectsData = await fs.readFile(subjectsPath, 'utf-8');
        const allSubjects = JSON.parse(subjectsData);

        const weakTopics: { subject: string; topic: string; status: number }[] = [];
        const userProficiency = userProfile.proficiency || {};

        allSubjects.forEach((subject: any) => {
            const subjectId = subject.id;
            const subjectTopics = userProficiency[subjectId] || {};

            subject.topics.forEach((topicName: string) => {
                const status = subjectTopics[topicName] !== undefined ? subjectTopics[topicName] : 0;
                if (status === 0 || status === 1) {
                    weakTopics.push({
                        subject: subject.name,
                        topic: topicName,
                        status: status as number
                    });
                }
            });
        });

        weakTopics.sort((a, b) => a.status - b.status);

        if (weakTopics.length === 0) {
            return NextResponse.json({
                error: 'Tüm konuları biliyorsun! Tebrikler! 🎉',
                allTopicsKnown: true
            }, { status: 400 });
        }

        // 4. Calculate dates
        const getNextWeekDates = () => {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
            const nextMonday = new Date(today);
            nextMonday.setDate(today.getDate() + daysUntilMonday);

            const dates: string[] = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(nextMonday);
                date.setDate(nextMonday.getDate() + i);
                dates.push(date.toISOString().split('T')[0]);
            }
            return dates;
        };

        const weekDates = getNextWeekDates();
        const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

        // 5. Build prompt with LangChain
        const topicsList = weakTopics.slice(0, 50).map(t => `- ${t.subject}: ${t.topic} (${t.status === 0 ? 'Bilmiyor' : 'Orta'})`).join('\n');

        const prompt = `Sen bir YKS çalışma programı oluşturucususun. 7 günlük DETAYLI çalışma programı oluştur.

**Öğrenci Bilgileri:**
- Sınıf: ${userProfile.grade || 'Belirtilmemiş'}
- Bölüm: ${userProfile.department || 'Belirtilmemiş'}

**ÖNEMLİ: Öğrencinin EKSİK KONULARI (İlk 50 konu - bunlardan seç!):**
${topicsList}

**Çalışma Kuralları:**
- Her etüt: ${sessionLength} dakika
- Günlük çalışma hedefi: ${dailyHours} saat
- Başlangıç: ${startTime}, Bitiş: ${endTime}

**Tarihler:**
${weekDays.map((day, i) => `${day}: ${weekDates[i]}`).join('\n')}

**KRİTİK KURALLAR:**
1. Her gün EN AZ 4-6 FARKLI session oluştur
2. Her session için MUTLAKA "subject" VE "topic" doldur
3. "topic" alanı ASLA boş olmamalı - yukarıdaki listeden seç
4. Her gün FARKLI derslerden konular seç (çeşitlilik!)
5. "Bilmiyor" konularına öncelik ver
6. Saatler çakışmamalı
7. startTime formatı: "HH:MM"

7 günlük program oluştur.`;

        // 6. Initialize LangChain with JSON mode
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-pro",
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
            temperature: 0.7,
        });

        // Add JSON format instruction to prompt
        const fullPrompt = `${prompt}

**ÖNEMLİ: Yanıtını SADECE aşağıdaki JSON formatında ver, başka hiçbir şey yazma:**

{
  "weeklyProgram": [
    {
      "day": "Pazartesi",
      "date": "2025-12-30",
      "sessions": [
        { "subject": "TYT Matematik", "topic": "Türev", "duration": "50 dakika", "startTime": "09:00" },
        { "subject": "AYT Fizik", "topic": "Elektrik", "duration": "50 dakika", "startTime": "10:00" }
      ]
    }
  ]
}`;

        console.log('Calling LangChain...');
        const response = await model.invoke(fullPrompt);

        console.log('LangChain response:', response.content);

        // Parse JSON from response
        let jsonContent = response.content as string;

        // Extract JSON if wrapped in markdown
        const jsonMatch = jsonContent.match(/```json\s*\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            jsonContent = jsonMatch[1];
        }

        const parsedResult = JSON.parse(jsonContent);

        // Validate with Zod
        const validatedResult = WeeklyProgramSchema.parse(parsedResult);

        console.log('Validated result:', JSON.stringify(validatedResult, null, 2));

        if (!validatedResult.weeklyProgram || !Array.isArray(validatedResult.weeklyProgram)) {
            return NextResponse.json({ error: 'Invalid schedule format' }, { status: 500 });
        }

        // 7. Save to database
        const scheduleInserts = [];
        for (const dayProgram of validatedResult.weeklyProgram) {
            scheduleInserts.push({
                user_id: user.id,
                title: `${dayProgram.day} - Çalışma Programı`,
                description: JSON.stringify(dayProgram.sessions),
                date: dayProgram.date,
                type: 'study'
            });
        }

        const { error: insertError } = await supabase
            .from('schedules')
            .insert(scheduleInserts);

        if (insertError) {
            console.error("Database insert error:", insertError);
            return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            weeklyProgram: validatedResult.weeklyProgram,
            message: 'Program başarıyla oluşturuldu!'
        });

    } catch (e: any) {
        console.error("LangChain Schedule API Error:", e);
        return NextResponse.json({
            error: e.message || "Internal Server Error",
            details: e.toString()
        }, { status: 500 });
    }
}
