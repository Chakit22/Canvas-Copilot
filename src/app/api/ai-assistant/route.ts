import { NextRequest, NextResponse } from "next/server";
import {
  getCourseFiles,
  getAssignmentWithRubric,
  selectRelevantFiles,
  generateAssignmentHelp,
} from "@/lib/canvas";

export async function POST(req: NextRequest) {
  try {
    const { courseId, assignmentId } = await req.json();

    if (!courseId || !assignmentId) {
      return NextResponse.json(
        { error: "Course ID and Assignment ID are required" },
        { status: 400 }
      );
    }

    // Step 1: Get assignment details with rubric
    console.log("Fetching assignment details...");
    const assignment = await getAssignmentWithRubric(courseId, assignmentId);

    // Step 2: Get all course files
    console.log("Fetching course files...");
    const files = await getCourseFiles(courseId);

    // Step 3: Process files - create summaries (simplified for MVP)
    console.log("Creating file summaries...");
    const fileSummaries = [];

    // For MVP, we'll just use filename and basic info instead of full content parsing
    for (const file of files.slice(0, 10)) {
      // Limit to first 10 files for MVP
      try {
        // Simple summary based on filename for MVP
        const basicSummary = `File: ${file.display_name} (${file.content_type})`;
        fileSummaries.push({
          filename: file.display_name,
          summary: basicSummary,
          id: file.id,
          url: file.url,
        });
      } catch (error) {
        console.error(`Error processing file ${file.display_name}:`, error);
      }
    }

    // Step 4: Select relevant files using AI
    console.log("Selecting relevant files...");
    const relevantFilenames = await selectRelevantFiles(
      assignment,
      fileSummaries
    );

    // Step 5: Get relevant file content (simplified for MVP)
    console.log("Processing relevant files...");
    const relevantContent = relevantFilenames
      .map(
        (filename: string) =>
          `File: ${filename} - Contains lecture content relevant to the assignment`
      )
      .join("\n\n");

    // Step 6: Generate assignment help
    console.log("Generating assignment help...");
    const aiResponse = await generateAssignmentHelp(
      assignment,
      relevantContent
    );

    return NextResponse.json({
      assignment: {
        name: assignment.name,
        description: assignment.description,
        due_at: assignment.due_at,
      },
      relevantFiles: relevantFilenames,
      aiGuidance: aiResponse,
      processedFiles: fileSummaries.length,
    });
  } catch (error) {
    console.error("AI Assistant error:", error);
    return NextResponse.json(
      { error: "AI Assistant processing failed", details: error },
      { status: 500 }
    );
  }
}
