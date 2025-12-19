// Subject status data based on department
export const SUBJECTS = {
    Sayısal: [
        { id: 'tyt-turkce', name: 'TYT Türkçe', category: 'TYT' },
        { id: 'tyt-matematik', name: 'TYT Matematik', category: 'TYT' },
        { id: 'tyt-sosyal', name: 'TYT Sosyal', category: 'TYT' },
        { id: 'tyt-fen', name: 'TYT Fen', category: 'TYT' },
        { id: 'ayt-matematik', name: 'AYT Matematik', category: 'AYT' },
        { id: 'ayt-fen', name: 'AYT Fen', category: 'AYT' },
    ],
    EA: [
        { id: 'tyt-turkce', name: 'TYT Türkçe', category: 'TYT' },
        { id: 'tyt-matematik', name: 'TYT Matematik', category: 'TYT' },
        { id: 'tyt-sosyal', name: 'TYT Sosyal', category: 'TYT' },
        { id: 'tyt-fen', name: 'TYT Fen', category: 'TYT' },
        { id: 'ayt-matematik', name: 'AYT Matematik', category: 'AYT' },
        { id: 'ayt-sosyal', name: 'AYT Sosyal 1', category: 'AYT' },
    ],
};

// Popular YouTube teachers (mock data)
export const YOUTUBE_TEACHERS = [
    { id: '1', name: 'Hakan Hoca', subject: 'Matematik' },
    { id: '2', name: 'Ayşe Öğretmen', subject: 'Türkçe' },
    { id: '3', name: 'Mehmet Bey', subject: 'Fizik' },
    { id: '4', name: 'Zeynep Hanım', subject: 'Kimya' },
    { id: '5', name: 'Ali Hoca', subject: 'Biyoloji' },
];

// Popular YKS books (mock data)
export const YKS_BOOKS = [
    { id: '1', name: 'Limit Matematik', publisher: 'Limit Yayınları', subject: 'Matematik' },
    { id: '2', name: 'Karekök TYT', publisher: 'Karekök', subject: 'TYT' },
    { id: '3', name: 'Palme Fizik', publisher: 'Palme', subject: 'Fizik' },
    { id: '4', name: 'Apotemi Türkçe', publisher: 'Apotemi', subject: 'Türkçe' },
    { id: '5', name: '3D Kimya', publisher: '3D Yayınları', subject: 'Kimya' },
];

export const WEEK_DAYS = [
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
    'Pazar',
];
