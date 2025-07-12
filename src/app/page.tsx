"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch courses once on mount
  useEffect(() => {
    fetch("/api/canvas?type=courses")
      .then((r) => r.json())
      .then(setCourses);
  }, []);

  const loadAssignments = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedAssignment(null);
    setAiResponse(null);
    fetch(`/api/canvas?type=assignments&courseId=${courseId}`)
      .then((r) => r.json())
      .then(setAssignments);
  };

  const selectAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setAiResponse(null);
  };

  const getAiAssistance = async () => {
    if (!selectedCourse || !selectedAssignment) return;

    setLoading(true);
    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse,
          assignmentId: selectedAssignment.id,
        }),
      });

      const data = await response.json();
      setAiResponse(data);
    } catch (error) {
      console.error("Error getting AI assistance:", error);
      setAiResponse({ error: "Failed to get AI assistance" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Canvas Copilot (AI Assistant)</h1>

      {/* Course list */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Courses</h2>
        <ul className="space-y-2">
          {courses.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => loadAssignments(c.id)}
                className={`text-blue-600 underline ${
                  selectedCourse === c.id ? "font-bold" : ""
                }`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Assignments for selected course */}
      {selectedCourse && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Assignments</h2>
          <ul className="space-y-3">
            {assignments.map((a) => (
              <li key={a.id} className="border p-3 rounded-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {a.description}
                    </div>
                    {a.due_at && (
                      <div className="text-sm text-gray-600 mt-1">
                        Due: {new Date(a.due_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => selectAssignment(a)}
                    className={`ml-4 px-3 py-1 rounded ${
                      selectedAssignment?.id === a.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Select
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Selected assignment and AI assistance */}
      {selectedAssignment && (
        <section className="mb-8">
          <div className="border-2 border-blue-200 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Selected Assignment</h2>
            <div className="font-medium text-lg mb-2">
              {selectedAssignment.name}
            </div>
            <div className="text-gray-600 mb-4">
              {selectedAssignment.description}
            </div>

            <button
              onClick={getAiAssistance}
              disabled={loading}
              className={`px-6 py-2 rounded font-medium ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {loading ? "Getting AI Assistance..." : "Get AI Assistance 🤖"}
            </button>
          </div>
        </section>
      )}

      {/* AI Response */}
      {aiResponse && (
        <section className="mb-8">
          <div className="border-2 border-green-200 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">AI Guidance</h2>

            {aiResponse.error ? (
              <div className="text-red-600">Error: {aiResponse.error}</div>
            ) : (
              <div className="space-y-4">
                {/* Relevant files */}
                <div>
                  <h3 className="font-medium mb-2">Relevant Lecture Files:</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {aiResponse.relevantFiles?.map(
                      (file: string, index: number) => (
                        <li key={index}>{file}</li>
                      )
                    )}
                  </ul>
                </div>

                {/* AI guidance */}
                <div>
                  <h3 className="font-medium mb-2">Assignment Guidance:</h3>
                  <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap">
                    {aiResponse.aiGuidance}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-sm text-gray-500">
                  Processed {aiResponse.processedFiles} lecture files
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
