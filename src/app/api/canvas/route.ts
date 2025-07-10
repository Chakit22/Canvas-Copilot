// app/api/canvas/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getCourses,
  getAssignments,
  getCourseFiles,
  getAssignmentWithRubric,
} from "@/lib/canvas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const courseId = searchParams.get("courseId");
    const assignmentId = searchParams.get("assignmentId");

    if (type === "courses") {
      const courses = await getCourses();
      return NextResponse.json(courses);
    }

    if (type === "assignments" && courseId) {
      const assignments = await getAssignments(courseId);
      return NextResponse.json(assignments);
    }

    if (type === "assignment" && courseId && assignmentId) {
      const assignment = await getAssignmentWithRubric(courseId, assignmentId);
      return NextResponse.json(assignment);
    }

    if (type === "files" && courseId) {
      const files = await getCourseFiles(courseId);
      return NextResponse.json(files);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: "Canvas API error", details: err },
      { status: 500 }
    );
  }
}
