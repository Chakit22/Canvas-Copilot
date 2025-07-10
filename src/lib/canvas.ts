// lib/canvas.ts
import axios from "axios";

const token = process.env.CANVAS_API_TOKEN!;
const baseURL = process.env.CANVAS_BASE_URL!;

const headers = { Authorization: `Bearer ${token}` };

export async function getCourses() {
  const { data } = await axios.get(
    `${baseURL}/courses?enrollment_state=active&state[]=available`,
    { headers }
  );
  console.log("courses", data);
  return data;
}

export async function getAssignments(courseId: string) {
  const { data } = await axios.get(
    `${baseURL}/courses/${courseId}/assignments`,
    { headers }
  );
  return data;
}

// Get assignment with rubric
export async function getAssignmentWithRubric(
  courseId: string,
  assignmentId: string
) {
  const { data } = await axios.get(
    `${baseURL}/courses/${courseId}/assignments/${assignmentId}?include[]=rubric`,
    { headers }
  );
  return data;
}

// Get all course files (PDFs, PPTs)
export async function getCourseFiles(courseId: string) {
  const { data } = await axios.get(`${baseURL}/courses/${courseId}/files`, {
    headers,
  });
  return data.filter((f: any) =>
    [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ].includes(f.content_type)
  );
}
