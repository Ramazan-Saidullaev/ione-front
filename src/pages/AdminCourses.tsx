import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { loadSession } from "../storage";
import { getErrorMessage } from "../utils/helpers";
import { Modal } from "./Modal";
import type { AdminCourseDto, AdminLessonDto } from "../types";

export function AdminCourses() {
  const [session] = useState(() => loadSession("admin"));
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => api.getAdminDashboard(session!.accessToken),
    enabled: !!session,
  });

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourseDto | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [age, setAge] = useState("");
  const [busy, setBusy] = useState(false);

  // Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AdminLessonDto | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonVideo, setLessonVideo] = useState("");
  const [lessonText, setLessonText] = useState("");
  const [lessonOrder, setLessonOrder] = useState("1");
  const [lessonBusy, setLessonBusy] = useState(false);

  if (isLoading) return <div style={{ color: "#6b7280" }}>Loading courses...</div>;
  const courses = data?.courses || [];
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  function openCreateModal() {
    setEditingCourse(null);
    setTitle(""); setDesc(""); setAge("");
    setIsModalOpen(true);
  }

  function openEditModal(course: AdminCourseDto) {
    setEditingCourse(course);
    setTitle(course.title); setDesc(course.description || ""); setAge(course.ageGroup || "");
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setBusy(true);
    try {
      if (editingCourse) {
        await api.updateCourse(session.accessToken, editingCourse.id, { title: title.trim(), description: desc.trim() || undefined, ageGroup: age.trim() || undefined });
      } else {
        await api.createCourse(session.accessToken, { title: title.trim(), description: desc.trim() || undefined, ageGroup: age.trim() || undefined });
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) { alert(getErrorMessage(err)); }
    finally { setBusy(false); }
  }

  async function handleDelete(id: number) {
    if (!session || !confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.deleteCourse(session.accessToken, id);
    } catch (err) { alert(getErrorMessage(err)); } 
    finally { refetch(); }
  }

  // --- LESSON HANDLERS ---
  function openCreateLessonModal() {
    setEditingLesson(null);
    setLessonTitle(""); setLessonVideo(""); setLessonText("");
    const nextOrder = selectedCourse ? selectedCourse.lessons.length + 1 : 1;
    setLessonOrder(String(nextOrder));
    setIsLessonModalOpen(true);
  }

  function openEditLessonModal(lesson: AdminLessonDto) {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonVideo(lesson.videoPath || "");
    setLessonText(lesson.textContent || "");
    setLessonOrder(String(lesson.orderNumber || 1));
    setIsLessonModalOpen(true);
  }

  async function handleLessonSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !selectedCourseId) return;
    setLessonBusy(true);
    try {
      if (editingLesson) {
        await api.updateLesson(session.accessToken, editingLesson.id, {
          title: lessonTitle.trim(),
          videoPath: lessonVideo.trim() || undefined,
          textContent: lessonText.trim() || undefined,
          orderNumber: Number(lessonOrder)
        });
      } else {
        await api.createLesson(session.accessToken, {
          courseId: selectedCourseId,
          title: lessonTitle.trim(),
          videoPath: lessonVideo.trim() || undefined,
          textContent: lessonText.trim() || undefined,
          orderNumber: Number(lessonOrder)
        });
      }
      setIsLessonModalOpen(false);
      refetch();
    } catch (err) { alert(getErrorMessage(err)); }
    finally { setLessonBusy(false); }
  }

  async function handleDeleteLesson(id: number) {
    if (!session || !confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.deleteLesson(session.accessToken, id);
    } catch (err) { alert(getErrorMessage(err)); }
    finally { refetch(); }
  }

  // Уровень 2: Уроки выбранного курса
  if (selectedCourse) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => setSelectedCourseId(null)} style={{ background: "none", border: "1px solid #e5e7eb", color: "#4b5563", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#fff", fontWeight: 500, transition: "background-color 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#f9fafb"} onMouseOut={e => e.currentTarget.style.backgroundColor = "#fff"}>
            ← Back to Courses
          </button>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>Lessons for {selectedCourse.title}</h1>
          <button onClick={openCreateLessonModal} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer", marginLeft: "auto" }}>
            + Add Lesson
          </button>
        </div>

        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
          {selectedCourse.lessons.length === 0 ? (
             <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>No lessons available. Click "Add Lesson" to create one.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <tr>
                  <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem", width: "80px" }}>Order</th>
                  <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem" }}>Title</th>
                  <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem" }}>Content</th>
                  <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedCourse.lessons.map(lesson => (
                  <tr key={lesson.id} style={{ borderBottom: "1px solid #e5e7eb", transition: "background-color 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: "16px 24px", fontWeight: 600, color: "#4b5563" }}>#{lesson.orderNumber}</td>
                    <td style={{ padding: "16px 24px", fontWeight: 500, color: "#111827" }}>{lesson.title}</td>
                    <td style={{ padding: "16px 24px", color: "#4b5563" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {lesson.videoPath && <span style={{ background: "#e0e7ff", color: "#1e40af", padding: "2px 8px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500 }}>🎥 Video</span>}
                        {lesson.textContent && <span style={{ background: "#dcfce7", color: "#065f46", padding: "2px 8px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500 }}>📝 Text</span>}
                        {!lesson.videoPath && !lesson.textContent && <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Empty</span>}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button onClick={() => openEditLessonModal(lesson)} style={{ marginRight: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Edit</button>
                      <button onClick={() => handleDeleteLesson(lesson.id)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Modal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} title={editingLesson ? "Edit Lesson" : "Create New Lesson"}>
          <form onSubmit={handleLessonSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>Lesson Title *</label>
              <input type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} required style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }} placeholder="e.g. Introduction" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>Order Number *</label>
              <input type="number" value={lessonOrder} onChange={e => setLessonOrder(e.target.value)} required style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>Video Path (optional)</label>
              <input type="text" value={lessonVideo} onChange={e => setLessonVideo(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }} placeholder="e.g. https://..." />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>Text Content (optional)</label>
              <textarea value={lessonText} onChange={e => setLessonText(e.target.value)} rows={4} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box", fontFamily: "inherit" }} placeholder="Write lesson content here..." />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <button type="button" onClick={() => setIsLessonModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 500 }}>
                Cancel
              </button>
              <button type="submit" disabled={lessonBusy} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer", opacity: lessonBusy ? 0.7 : 1 }}>
                {lessonBusy ? "Saving..." : "Save Lesson"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // Уровень 1: Все курсы

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>Courses</h1>
        <button onClick={openCreateModal} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer" }}>
          + Add Course
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
        {courses.length === 0 ? (
           <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>No courses available. Click "Add Course" to create one.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem" }}>Title</th>
                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem" }}>Age Group</th>
                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem" }}>Lessons</th>
                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} onClick={() => setSelectedCourseId(course.id)} style={{ borderBottom: "1px solid #e5e7eb", transition: "background-color 0.2s", cursor: "pointer" }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: "16px 24px", fontWeight: 500, color: "#111827" }}>
                    {course.title}
                    {course.description && <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "4px", fontWeight: 400 }}>{course.description}</div>}
                  </td>
                  <td style={{ padding: "16px 24px", color: "#4b5563" }}>
                    {course.ageGroup ? <span style={{ background: "#e0e7ff", color: "#1e40af", padding: "2px 8px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 500 }}>{course.ageGroup}</span> : <span style={{ color: "#9ca3af" }}>—</span>}
                  </td>
                  <td style={{ padding: "16px 24px", color: "#4b5563" }}>
                    <span style={{ fontWeight: 600 }}>{course.lessons.length}</span> items
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <span style={{ color: "#6b7280", marginRight: "16px", fontSize: "0.85rem" }}>View Lessons →</span>
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(course); }} style={{ marginRight: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCourse ? "Edit Course" : "Create New Course"}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>Course Title *</label>
            <input 
              type="text" value={title} onChange={e => setTitle(e.target.value)} required 
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }} 
              placeholder="e.g. Online Safety Basics" 
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>Description</label>
            <textarea 
              value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box", fontFamily: "inherit" }} 
              placeholder="Brief course overview..." 
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>Age Group</label>
            <input 
              type="text" value={age} onChange={e => setAge(e.target.value)} 
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }} 
              placeholder="e.g. 12-14" 
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 500 }}>
              Cancel
            </button>
            <button type="submit" disabled={busy} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
              {busy ? "Saving..." : "Save Course"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}