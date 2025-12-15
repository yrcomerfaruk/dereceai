import coursesData from '@/data/yks-courses.json';

export async function GET() {
  return Response.json(coursesData);
}
