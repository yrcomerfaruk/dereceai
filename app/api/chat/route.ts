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

        // 2. Calculate real dates (starting from next Monday)
        const getNextWeekDates = () => {
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
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

        // 3. Build personalized context from user profile
        let personalizedContext = '';

        if (userProfile.proficiency) {
            const weakTopics: string[] = [];
            Object.entries(userProfile.proficiency).forEach(([subjectId, topics]: [string, any]) => {
                Object.entries(topics).forEach(([topic, status]: [string, any]) => {
                    if (status === 0 || status === 1) { // 0 = don't know, 1 = medium
                        weakTopics.push(`${subjectId}: ${topic}`);
                    }
                });
            });
            if (weakTopics.length > 0) {
                personalizedContext += `\n\n**Eksik/Zayıf Konular:**\n${weakTopics.slice(0, 10).join(', ')}`;
            }
        }

        if (userProfile.subjectResources) {
            personalizedContext += '\n\n**Kullandığı Kaynaklar:**';
            Object.entries(userProfile.subjectResources).forEach(([subjectId, resources]: [string, any]) => {
                if (resources.teachers?.length > 0 || resources.books?.length > 0) {
                    personalizedContext += `\n- ${subjectId}: Hocalar: ${resources.teachers?.join(', ') || 'Yok'}, Kitaplar: ${resources.books?.join(', ') || 'Yok'}`;
                }
            });
        }

        if (userProfile.nets) {
            const { current, target } = userProfile.nets;
            if (current && target) {
                personalizedContext += '\n\n**Netler (Mevcut → Hedef):**';
                Object.keys(target).forEach(key => {
                    if (current[key] !== undefined && target[key] !== undefined) {
                        personalizedContext += `\n- ${key}: ${current[key]} → ${target[key]}`;
                    }
                });
            }
        }

        // Add study and session details
        let studySchedule = '';
        if (userProfile.studyDetails) {
            const { dailyHours, startTime, endTime } = userProfile.studyDetails;
            studySchedule += `\n\n**Çalışma Saatleri:**`;
            studySchedule += `\n- Günlük Hedef: ${dailyHours || 6} saat`;
            studySchedule += `\n- Başlangıç: ${startTime || '09:00'}`;
            studySchedule += `\n- Bitiş: ${endTime || '22:00'}`;
        }

        if (userProfile.sessionDetails) {
            const { sessionLength, breakLength, lunchBreak } = userProfile.sessionDetails;
            studySchedule += `\n\n**Etüt ve Mola Süreleri:**`;
            studySchedule += `\n- Etüt Uzunluğu: ${sessionLength || 50} dakika`;
            studySchedule += `\n- Ders Arası Mola: ${breakLength || 10} dakika`;
            studySchedule += `\n- Öğle Molası: ${lunchBreak || 60} dakika`;
        }

        // 4. Construct Enhanced Prompt
        const systemPrompt = `Sen Türkiye YKS (TYT/AYT) sınavı için uzman bir eğitim koçusun. Adın "Derece Koçu".

Öğrenci Profili:
- Sınıf: ${userProfile.grade || 'Belirtilmemiş'}
- Bölüm: ${userProfile.department || 'Belirtilmemiş'}
${personalizedContext}
${studySchedule}

**ÖNEMLİ:** Eğer öğrenci "Haftalık Program" veya "Program Oluştur" derse, öğrencinin eksiklerine ve kaynaklarına göre KİŞİSELLEŞTİRİLMİŞ bir program oluştur.

Program oluştururken:
1. Öğrencinin ZAYIF olduğu konulara öncelik ver
2. Öğrencinin kullandığı HOCA ve KİTAPLARI programda belirt (eğer yoksa "Belirtilmemiş" yaz)
3. Net hedeflerine ulaşması için gereken konuları ekle
4. Her gün için GERÇEK TARİH kullan (aşağıda verilen tarihler)
5. Öğrencinin belirlediği ÇALIŞMA SAATLERİNE uy (${userProfile.studyDetails?.startTime || '09:00'} - ${userProfile.studyDetails?.endTime || '22:00'})
6. Her etüt ${userProfile.sessionDetails?.sessionLength || 50} dakika olmalı
7. Dersler arası ${userProfile.sessionDetails?.breakLength || 10} dakika mola ver
8. Öğle arası ${userProfile.sessionDetails?.lunchBreak || 60} dakika mola ver (13:00-14:00 arası)
9. **KRİTİK: SAATLER ÇAKIŞMAMALI!** Her ders bir önceki dersin bitişinden sonra başlamalı

Tarihler:
${weekDays.map((day, i) => `${day}: ${weekDates[i]}`).join('\n')}

Kısa bir açıklama yap ve aşağıdaki JSON formatında bir program oluştur.

**SAAT HESAPLAMA ÖRNEĞİ:**
- İlk ders: ${userProfile.studyDetails?.startTime || '09:00'} başlar, ${userProfile.sessionDetails?.sessionLength || 50} dk sürer
- Mola: ${userProfile.sessionDetails?.breakLength || 10} dk
- İkinci ders: İlk dersin bitişi + mola sonrası başlar
- Öğle molası: 13:00-14:00 arası ${userProfile.sessionDetails?.lunchBreak || 60} dk
- Son ders: ${userProfile.studyDetails?.endTime || '22:00'}'dan önce bitmeli

\`\`\`json
{
  "weeklyProgram": [
    {
      "day": "Pazartesi",
      "date": "${weekDates[0]}",
      "sessions": [
        {
          "subject": "Matematik (AYT)",
          "topic": "Türev",
          "teacher": "${userProfile.subjectResources?.['ayt-matematik']?.teachers?.[0] || 'Belirtilmemiş'}",
          "book": "${userProfile.subjectResources?.['ayt-matematik']?.books?.[0] || 'Belirtilmemiş'}",
          "duration": "${userProfile.sessionDetails?.sessionLength || 50} dakika",
          "startTime": "${userProfile.studyDetails?.startTime || '09:00'}"
        },
        {
          "subject": "Fizik (AYT)",
          "topic": "Elektrik",
          "teacher": "Belirtilmemiş",
          "book": "Belirtilmemiş",
          "duration": "${userProfile.sessionDetails?.sessionLength || 50} dakika",
          "startTime": "10:00"
        },
        {
          "subject": "Kimya (AYT)",
          "topic": "Asit-Baz",
          "teacher": "Belirtilmemiş",
          "book": "Belirtilmemiş",
          "duration": "${userProfile.sessionDetails?.sessionLength || 50} dakika",
          "startTime": "11:00"
        }
      ]
    },
    {
      "day": "Salı",
      "date": "${weekDates[1]}",
      "sessions": [
        {
          "subject": "Türkçe (TYT)",
          "topic": "Paragraf",
          "teacher": "Belirtilmemiş",
          "book": "Belirtilmemiş",
          "duration": "${userProfile.sessionDetails?.sessionLength || 50} dakika",
          "startTime": "${userProfile.studyDetails?.startTime || '09:00'}"
        }
      ]
    }
  ]
}
\`\`\`

**KRİTİK KURALLAR:**
1. MUTLAKA 7 GÜN OLUŞTUR (Pazartesi'den Pazar'a kadar)
2. Her gün için yukarıdaki tarihleri AYNEN kullan
3. JSON formatına KESINLIKLE uy - her session'da subject, topic, teacher, book, duration, startTime olmalı
4. **startTime MUTLAKA belirt** - Her ders için başlangıç saati olmalı
5. **Saatler çakışmamalı** - İkinci ders ilk dersten ${userProfile.sessionDetails?.sessionLength || 50} dk + ${userProfile.sessionDetails?.breakLength || 10} dk sonra başlamalı
6. Pazar günü hafif tutulabilir veya dinlenme günü olabilir
7. Öğrencinin kullandığı hoca ve kitapları kullan, yoksa "Belirtilmemiş" yaz
8. Duration her zaman "${userProfile.sessionDetails?.sessionLength || 50} dakika" formatında olmalı

Soru: ${message}`;

        // 5. Call Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        const result = await model.generateContent(systemPrompt);
        let response = result.response.text();

        // Parse and extract JSON if present
        let weeklyProgram = null;
        const jsonMatch = response.match(/```json\s*\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            try {
                const jsonStr = jsonMatch[1];
                const parsed = JSON.parse(jsonStr);
                if (parsed.weeklyProgram) {
                    weeklyProgram = parsed.weeklyProgram;
                    // Remove JSON block from response
                    response = response.replace(/```json\s*\n[\s\S]*?\n```/, '').trim();
                }
            } catch (e) {
                console.error("JSON Parse error in backend:", e);
            }
        }

        // Save to database (save the cleaned response without JSON)
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

        return NextResponse.json({ response, weeklyProgram });

    } catch (e: any) {
        console.error("Chat API Error:", e);
        return NextResponse.json({
            error: e.message || "Internal Server Error",
            details: e.toString()
        }, { status: 500 });
    }
}
