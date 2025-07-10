"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [assignmentDetail, setAssignmentDetail] = useState(null);
  const [files, setFiles] = useState([]);

  // Fetch courses once on mount
  useEffect(() => {
    fetch("/api/canvas?type=courses")
      .then((r) => r.json())
      .then(setCourses);
  }, []);

  const loadAssignments = (courseId: string) => {
    setSelectedCourse(courseId);
    fetch(`/api/canvas?type=assignments&courseId=${courseId}`)
      .then((r) => r.json())
      .then(setAssignments);
  };

  const loadAssignmentDetails = async (
    courseId: string,
    assignmentId: string
  ) => {
    const assignment = await fetch(
      `/api/canvas?type=assignment&courseId=${courseId}&assignmentId=${assignmentId}`
    ).then((res) => res.json());

    console.log("assignment", assignment);

    const files = await fetch(
      `/api/canvas?type=files&courseId=${courseId}`
    ).then((res) => res.json());

    console.log("files", files);

    setAssignmentDetail(assignment);
    setFiles(files);
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Canvas Copilot (Token Mode)</h1>

      {/* Course list */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Courses</h2>
        <ul className="space-y-2">
          {courses.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => loadAssignments(c.id)}
                className="text-blue-600 underline"
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Assignments for selected course */}
      {selectedCourse && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Assignments</h2>
          <ul className="space-y-3">
            {assignments.map((a) => (
              <li key={a.id} className="border p-3 rounded-md">
                <div className="font-medium">
                  {a.name}
                  <button
                    className="text-blue-600 underline"
                    onClick={() => loadAssignmentDetails(selectedCourse, a.id)}
                  >
                    Details
                  </button>
                </div>
                {a.due_at && (
                  <div className="text-sm text-gray-600">
                    Due: {new Date(a.due_at).toLocaleString()}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
