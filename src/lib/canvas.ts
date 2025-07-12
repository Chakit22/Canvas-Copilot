// lib/canvas.ts
import axios from "axios";

/*
 * Environment Variables Required:
 * CANVAS_API_TOKEN=your_canvas_api_token_here
 * CANVAS_BASE_URL=https://your-school.instructure.com/api/v1
 * OPENAI_API_KEY=your_openai_api_key_here
 */

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
    `${baseURL}/courses/${courseId}/assignments/${assignmentId}`,
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

// Download file content
export async function downloadFile(fileUrl: string) {
  try {
    const { data } = await axios.get(fileUrl, {
      headers,
      responseType: "arraybuffer",
    });
    return data;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

// AI Helper functions
export async function summarizeFile(filename: string, content: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes educational content. Create a brief summary of the main topics and concepts covered in this file.",
        },
        {
          role: "user",
          content: `Summarize this file "${filename}": ${content.substring(
            0,
            2000
          )}...`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function selectRelevantFiles(
  assignment: any,
  fileSummaries: any[]
) {
  const summaryText = fileSummaries
    .map((f) => `${f.filename}: "${f.summary}"`)
    .join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Given an assignment and a list of lecture files with summaries, select the 2-3 most relevant files that would help answer the assignment. Reply only with the filenames, one per line.",
        },
        {
          role: "user",
          content: `Assignment: "${assignment.name}"\nDescription: "${assignment.description}"\n\nLecture files:\n${summaryText}\n\nWhich 2-3 files are most relevant to answer this assignment?`,
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const relevantFilenames = data.choices[0].message.content.trim().split("\n");
  return relevantFilenames;
}

export async function generateAssignmentHelp(
  assignment: any,
  relevantContent: string
) {
  const rubricText = assignment.rubric
    ? assignment.rubric
        .map((r: any) => `${r.description}: ${r.points} points`)
        .join("\n")
    : "No rubric provided";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful academic assistant. Based on the assignment, rubric, and lecture content, provide guidance on how to approach this assignment. Include key points to cover, potential structure, and suggestions for getting a high score.",
        },
        {
          role: "user",
          content: `Assignment: "${assignment.name}"\nDescription: "${assignment.description}"\n\nRubric:\n${rubricText}\n\nRelevant lecture content:\n${relevantContent}\n\nPlease provide guidance on how to approach this assignment.`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
