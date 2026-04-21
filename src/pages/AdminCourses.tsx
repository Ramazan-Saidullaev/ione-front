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
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<number | null>(null);
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

  // Scenario Modal State
  const [isScenModalOpen, setIsScenModalOpen] = useState(false);
  const [editingScenarioId, setEditingScenarioId] = useState<number | null>(null);
  const [scenTitle, setScenTitle] = useState("");
  const [scenDesc, setScenDesc] = useState("");
  const [scenImageType, setScenImageType] = useState<"url" | "file">("url");
  const [scenImageUrl, setScenImageUrl] = useState("");
  const [scenImageFile, setScenImageFile] = useState<File | null>(null);
  const [scenBusy, setScenBusy] = useState(false);

  // Scenario Option Modal State
  const [isOptModalOpen, setIsOptModalOpen] = useState(false);
  const [editingOptId, setEditingOptId] = useState<number | null>(null);
  const [optText, setOptText] = useState("");
  const [optResultText, setOptResultText] = useState("");
  const [optImageType, setOptImageType] = useState<"url" | "file">("url");
  const [optImageUrl, setOptImageUrl] = useState("");
  const [optImageFile, setOptImageFile] = useState<File | null>(null);
  const [optScore, setOptScore] = useState("");
  const [optBusy, setOptBusy] = useState(false);

  if (isLoading) return <div style={{ color: "#6b7280" }}>Loading courses...</div>;
  const courses = data?.courses || [];
  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const selectedLesson = selectedCourse?.lessons.find(l => l.id === selectedLessonId);
  const lessonScenarios: any[] = (data?.scenarios || []).filter((s: any) => s.lessonId === selectedLessonId);
  lessonScenarios.sort((a, b) => (a.id || 0) - (b.id || 0));
  const activeScenarioId =
    selectedScenarioId && lessonScenarios.some(s => s.id === selectedScenarioId)
      ? selectedScenarioId
      : (lessonScenarios[0]?.id ?? null);
  const activeScenario: any = activeScenarioId ? lessonScenarios.find(s => s.id === activeScenarioId) : null;

  // Функция для правильного отображения картинок (локальных и по ссылке)
  function getMediaUrl(path: string | undefined | null) {
    if (!path) return "";

    // Если бэкенд ошибочно склеил свой путь и внешнюю ссылку
    const externalMatch = path.match(/\/media\/(https?:\/\/.*)/);
    if (externalMatch) {
      return externalMatch[1];
    }

    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
    return baseUrl + (path.startsWith("/") ? path : `/${path}`);
  }

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

  // --- SCENARIO HANDLERS ---
  async function handleScenarioSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !selectedLessonId) return;
    setScenBusy(true);
    try {
      let finalImagePath = scenImageUrl;
      if (scenImageType === "file" && scenImageFile) {
        const uploadRes = await api.uploadMedia(session.accessToken, scenImageFile);
        finalImagePath = uploadRes.url;
      }
      
      const payload = { lessonId: selectedLessonId, title: scenTitle.trim(), description: scenDesc.trim() || undefined, baseImagePath: finalImagePath || undefined };
      
      if (editingScenarioId) {
        await api.updateScenario(session.accessToken, editingScenarioId, {
          title: payload.title,
          description: payload.description,
          baseImagePath: payload.baseImagePath
        });
      } else {
        const created = await api.createScenario(session.accessToken, payload);
        setSelectedScenarioId(created.id);
      }
      setIsScenModalOpen(false); refetch();
    } catch (err) { alert(getErrorMessage(err)); } finally { setScenBusy(false); }
  }

  async function handleDeleteScenario(scenarioId: number) {
    if (!session || !confirm("Удалить сценарий и все его варианты ответа?")) return;
    try {
      await api.deleteScenario(session.accessToken, scenarioId);
      if (selectedScenarioId === scenarioId) setSelectedScenarioId(null);
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  async function handleOptionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !activeScenario) return;
    setOptBusy(true);
    try {
      let finalImagePath = optImageUrl;
      if (optImageType === "file" && optImageFile) {
        const uploadRes = await api.uploadMedia(session.accessToken, optImageFile);
        finalImagePath = uploadRes.url;
      }

      const payload = { scenarioId: activeScenario.id, optionText: optText.trim(), resultText: optResultText.trim(), resultImagePath: finalImagePath || undefined, score: Number(optScore) };

      if (editingOptId) {
        await api.updateScenarioOption(session.accessToken, editingOptId, payload);
      } else {
        await api.createScenarioOption(session.accessToken, payload);
      }
      setIsOptModalOpen(false); refetch();
    } catch (err) { alert(getErrorMessage(err)); } finally { setOptBusy(false); }
  }

  async function handleDeleteOption(optId: number) {
    if (!session || !confirm("Удалить вариант ответа?")) return;
    try { await api.deleteScenarioOption(session.accessToken, optId); refetch(); } catch (err) { alert(getErrorMessage(err)); }
  }

  // УРОВЕНЬ 3: Сценарий выбранного урока
  if (selectedCourse && selectedLesson) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => { setSelectedLessonId(null); setSelectedScenarioId(null); }} style={{ background: "none", border: "1px solid #e5e7eb", color: "#4b5563", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#fff", fontWeight: 500 }}>
            ← Back to Lessons
          </button>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>Scenario: {selectedLesson.title}</h1>
        </div>

        {lessonScenarios.length === 0 ? (
          <div style={{ background: "#fff", padding: "40px", borderRadius: "12px", border: "1px dashed #d1d5db", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎭</div>
            <h3 style={{ color: "#111827", marginBottom: "8px" }}>У этого урока еще нет интерактивного сценария</h3>
            <p style={{ color: "#6b7280", marginBottom: "24px", maxWidth: "500px", margin: "0 auto 24px auto" }}>Добавьте сценарий, чтобы ученики могли прочитать ситуацию, увидеть фото и принять решение, влияющее на результат.</p>
            <button onClick={() => { setEditingScenarioId(null); setScenTitle(""); setScenDesc(""); setScenImageUrl(""); setScenImageFile(null); setIsScenModalOpen(true); }} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "10px 20px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer" }}>
              + Создать сценарий
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "24px" }}>
            {/* SCENARIO LIST */}
            <div style={{ background: "#fff", padding: "20px 24px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#111827" }}>Ситуационные тесты урока</h3>
                <button
                  onClick={() => {
                    setEditingScenarioId(null);
                    setScenTitle("");
                    setScenDesc("");
                    setScenImageUrl("");
                    setScenImageFile(null);
                    setScenImageType("url");
                    setIsScenModalOpen(true);
                  }}
                  style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 14px", borderRadius: "6px", border: "none", fontWeight: 600, cursor: "pointer" }}
                >
                  + Добавить вариант
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {lessonScenarios.map(s => {
                  const active = s.id === activeScenarioId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedScenarioId(s.id)}
                      style={{
                        borderRadius: "9999px",
                        border: active ? "1px solid #2563eb" : "1px solid #e5e7eb",
                        background: active ? "#eff6ff" : "#fff",
                        color: active ? "#1d4ed8" : "#374151",
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                      title={s.title}
                    >
                      #{s.id} {s.title || "Без названия"}
                      <span style={{ fontWeight: 600, fontSize: "0.8rem", opacity: 0.75 }}>
                        ({(s.options?.length ?? 0)} вариантов)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SCENARIO HEADER */}
            <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", display: "flex", gap: "24px" }}>
              {activeScenario?.baseImagePath ? (
                 <img src={getMediaUrl(activeScenario.baseImagePath)} alt="Scenario" style={{ width: "200px", height: "150px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" }} />
              ) : (
                 <div style={{ width: "200px", height: "150px", background: "#f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", border: "1px dashed #d1d5db" }}>Нет фото</div>
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: "0 0 8px 0", fontSize: "1.4rem", color: "#111827" }}>{activeScenario?.title}</h2>
                <p style={{ color: "#4b5563", marginBottom: "16px", lineHeight: "1.5" }}>{activeScenario?.description}</p>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => {
                      if (!activeScenario) return;
                      setEditingScenarioId(activeScenario.id);
                      setScenTitle(activeScenario.title || "");
                      setScenDesc(activeScenario.description || "");
                      setScenImageUrl(activeScenario.baseImagePath || "");
                      setScenImageFile(null);
                      setScenImageType("url");
                      setIsScenModalOpen(true);
                    }}
                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}
                  >
                    Изменить выбранный
                  </button>
                  {activeScenario ? (
                    <button onClick={() => handleDeleteScenario(activeScenario.id)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}>Удалить</button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* SCENARIO OPTIONS */}
            <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#111827" }}>Варианты ответов (Действия ученика)</h3>
                <button onClick={() => { setEditingOptId(null); setOptText(""); setOptResultText(""); setOptImageUrl(""); setOptScore(""); setIsOptModalOpen(true); }} style={{ backgroundColor: "#111827", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer" }}>+ Добавить вариант</button>
              </div>

              <div style={{ display: "grid", gap: "16px" }}>
                {(!activeScenario?.options || activeScenario.options.length === 0) && <p style={{ color: "#6b7280" }}>Пока нет вариантов ответа. Добавьте первый!</p>}
                {activeScenario?.options?.map((opt: any) => (
                  <div key={opt.id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", display: "flex" }}>
                    <div style={{ padding: "16px", background: "#f9fafb", width: "35%", borderRight: "1px solid #e5e7eb" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Если ученик выберет:</span>
                      <h4 style={{ margin: "8px 0", color: "#1d4ed8", fontSize: "1.05rem" }}>"{opt.optionText}"</h4>
                      <span style={{ display: "inline-block", background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>Баллы учителю: {opt.score}</span>
                    </div>
                    <div style={{ padding: "16px", flex: 1, display: "flex", gap: "16px", background: "#fff" }}>
                      {opt.resultImagePath && <img src={getMediaUrl(opt.resultImagePath)} alt="Result" style={{ width: "100px", height: "75px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e5e7eb" }} />}
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Он увидит результат:</span>
                        <p style={{ margin: "8px 0 0 0", color: "#374151" }}>{opt.resultText}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <button onClick={() => { setEditingOptId(opt.id); setOptText(opt.optionText); setOptResultText(opt.resultText); setOptScore(String(opt.score)); setOptImageUrl(opt.resultImagePath || ""); setIsOptModalOpen(true); }} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 500, textAlign: "right" }}>Edit</button>
                        <button onClick={() => handleDeleteOption(opt.id)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 500, textAlign: "right" }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCENARIO MODAL */}
        <Modal isOpen={isScenModalOpen} onClose={() => setIsScenModalOpen(false)} title={editingScenarioId ? "Редактировать сценарий" : "Новый сценарий"}>
          <form onSubmit={handleScenarioSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Название ситуации</span><input type="text" value={scenTitle} onChange={e => setScenTitle(e.target.value)} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} placeholder="Напр: Ситуация на перемене" /></label>
            <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Текст (описание)</span><textarea value={scenDesc} onChange={e => setScenDesc(e.target.value)} required rows={4} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} placeholder="Опишите ситуацию для ученика..." /></label>
            
            <div style={{ border: "1px solid #e5e7eb", padding: "12px", borderRadius: "6px", background: "#f9fafb" }}>
              <span style={{ display: "block", marginBottom: "12px", fontSize: "0.85rem", fontWeight: 500 }}>Картинка ситуации</span>
              <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
                <label style={{ fontSize: "0.85rem" }}><input type="radio" checked={scenImageType === "url"} onChange={() => setScenImageType("url")} /> Указать URL ссылку</label>
                <label style={{ fontSize: "0.85rem" }}><input type="radio" checked={scenImageType === "file"} onChange={() => setScenImageType("file")} /> Загрузить файл</label>
              </div>
              {scenImageType === "url" ? (
                <input type="url" value={scenImageUrl} onChange={e => setScenImageUrl(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} placeholder="https://..." />
              ) : (
                <input type="file" accept="image/*" onChange={e => setScenImageFile(e.target.files?.[0] || null)} style={{ width: "100%", fontSize: "0.85rem" }} />
              )}
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <button type="button" onClick={() => setIsScenModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}>Отмена</button>
              <button type="submit" disabled={scenBusy} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Сохранить</button>
            </div>
          </form>
        </Modal>

        {/* OPTION MODAL */}
        <Modal isOpen={isOptModalOpen} onClose={() => setIsOptModalOpen(false)} title={editingOptId ? "Редактировать вариант" : "Новый вариант ответа"}>
          <form onSubmit={handleOptionSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Что может выбрать ученик?</span><input type="text" value={optText} onChange={e => setOptText(e.target.value)} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} placeholder="Напр: Убежать" /></label>
            <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Текст последствия (результат)</span><textarea value={optResultText} onChange={e => setOptResultText(e.target.value)} required rows={3} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} placeholder="Что произойдет после этого выбора..." /></label>
            
            <div style={{ border: "1px solid #e5e7eb", padding: "12px", borderRadius: "6px", background: "#f9fafb" }}>
              <span style={{ display: "block", marginBottom: "12px", fontSize: "0.85rem", fontWeight: 500 }}>Картинка последствия (опционально)</span>
              <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
                <label style={{ fontSize: "0.85rem" }}><input type="radio" checked={optImageType === "url"} onChange={() => setOptImageType("url")} /> Указать URL</label>
                <label style={{ fontSize: "0.85rem" }}><input type="radio" checked={optImageType === "file"} onChange={() => setOptImageType("file")} /> Загрузить файл</label>
              </div>
              {optImageType === "url" ? (
                <input type="url" value={optImageUrl} onChange={e => setOptImageUrl(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} placeholder="https://..." />
              ) : (
                <input type="file" accept="image/*" onChange={e => setOptImageFile(e.target.files?.[0] || null)} style={{ width: "100%", fontSize: "0.85rem" }} />
              )}
            </div>

            <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Баллы (Видит только учитель)</span><input type="number" value={optScore} onChange={e => setOptScore(e.target.value)} required style={{ width: "100px", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} placeholder="Напр: 10" /></label>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <button type="button" onClick={() => setIsOptModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}>Отмена</button>
              <button type="submit" disabled={optBusy} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Сохранить</button>
            </div>
          </form>
        </Modal>
      </div>
    );
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
                      <button onClick={(e) => { e.stopPropagation(); setSelectedLessonId(lesson.id); }} style={{ color: "#8b5cf6", background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginRight: "16px", padding: "6px 12px", borderRadius: "6px", backgroundColor: "#f5f3ff" }}>🎭 Сценарий</button>
                      <button onClick={(e) => { e.stopPropagation(); openEditLessonModal(lesson); }} style={{ marginRight: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Delete</button>
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