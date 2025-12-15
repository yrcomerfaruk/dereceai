interface Topic {
  name: string;
  completion: number;
}

interface Course {
  id: string;
  name: string;
  completion: number;
  topics: Topic[];
}

interface RequestBody {
  courses: Course[];
}

// Mock LLM yanıtı - Groq/OpenAI entegre edilecek
function generateScheduleMock(courses: Course[]): object {
  const incompleteCourses = courses
    .flatMap((course) =>
      course.topics
        .filter((t) => t.completion < 100)
        .map((t) => ({
          course: course.name,
          topic: t.name,
          completion: t.completion,
          priority: 100 - t.completion, // Tamamlanmamış olanları öncelikle
        }))
    )
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 20); // İlk 20 konu

  const days = [
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
    'Pazar',
  ];
  const schedule = {
    week: Math.ceil(Math.random() * 52),
    days: days.map((day, idx) => ({
      day,
      duration: idx < 5 ? '3 saat' : idx === 5 ? '4 saat' : '2 saat',
      topics: incompleteCourses
        .slice(idx * 3, idx * 3 + 3)
        .map((item) => `${item.course} - ${item.topic}`),
    })),
  };

  return schedule;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    
    // TODO: Groq/OpenAI API çağrısı
    // const response = await fetch('https://api.groq.com/...', {
    //   headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
    //   body: JSON.stringify({ courses: body.courses }),
    // });

    const schedule = generateScheduleMock(body.courses);

    return Response.json({
      success: true,
      schedule,
      message: 'Program başarıyla oluşturuldu. (Şu anda mock veri)',
    });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Program oluşturulamadı' },
      { status: 500 }
    );
  }
}
