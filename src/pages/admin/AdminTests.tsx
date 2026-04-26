import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api";
import { loadSession } from "../../storage";
import { getErrorMessage } from "../../utils/helpers";
import { Modal } from "../Modal";
import type { AdminTestDto, AdminTestCategoryDto } from "../../types";

export function AdminTests() {
  const [session] = useState(() => loadSession("admin"));
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => api.getAdminDashboard(session!.accessToken),
    enabled: !!session,
  });

  // Navigation States
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  // Test Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<number | null>(null);
  const [testTitle, setTestTitle] = useState("");
  const [testDesc, setTestDesc] = useState("");
  const [testBusy, setTestBusy] = useState(false);

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catBusy, setCatBusy] = useState(false);

  // Zones (Inline)
  const [newZoneCatId, setNewZoneCatId] = useState<number | null>(null);
  const [newZoneType, setNewZoneType] = useState("GREEN");
  const [newZoneMin, setNewZoneMin] = useState("");
  const [newZoneMax, setNewZoneMax] = useState("");
  const [newZonePriority, setNewZonePriority] = useState("0");
  const [editingZoneId, setEditingZoneId] = useState<number | null>(null);
  const [editZoneType, setEditZoneType] = useState("GREEN");
  const [editZoneMin, setEditZoneMin] = useState("");
  const [editZoneMax, setEditZoneMax] = useState("");
  const [editZonePriority, setEditZonePriority] = useState("0");

  // Questions & Answers (Inline)
  const [newQCatId, setNewQCatId] = useState<number | null>(null);
  const [newQText, setNewQText] = useState("");
  const [newQOrder, setNewQOrder] = useState("1");
  const [editingQId, setEditingQId] = useState<number | null>(null);
  const [editQText, setEditQText] = useState("");
  const [editQOrder, setEditQOrder] = useState("1");
  const [newAQId, setNewAQId] = useState<number | null>(null);
  const [newAText, setNewAText] = useState("");
  const [newAScore, setNewAScore] = useState("");
  const [editingAId, setEditingAId] = useState<number | null>(null);
  const [editAText, setEditAText] = useState("");
  const [editAScore, setEditAScore] = useState("0");

  // Bulk Answer Creation
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());
  const [isBulkAnswerModalOpen, setIsBulkAnswerModalOpen] = useState(false);
  const [bulkAnswers, setBulkAnswers] = useState<{ text: string; score: string }[]>([{ text: "", score: "" }]);
  const [bulkBusy, setBulkBusy] = useState(false);

  if (isLoading) return <div style={{ color: "#6b7280" }}>Загрузка тестов...</div>;
  if (!data) return null;

  const tests = data.tests;
  const selectedTest = tests.find(t => t.id === selectedTestId);
  const selectedCategory = selectedTest?.categories.find(c => c.id === selectedCategoryId);

  // --- TEST HANDLERS ---
  function openTestModal(test?: AdminTestDto) {
    if (test) {
      setEditingTestId(test.id); setTestTitle(test.title); setTestDesc(test.description || "");
    } else {
      setEditingTestId(null); setTestTitle(""); setTestDesc("");
    }
    setIsTestModalOpen(true);
  }
  async function handleTestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setTestBusy(true);
    try {
      if (editingTestId) {
        await api.updateTest(session.accessToken, editingTestId, { title: testTitle.trim(), description: testDesc.trim() || undefined });
      } else {
        await api.createTest(session.accessToken, { title: testTitle.trim(), description: testDesc.trim() || undefined });
      }
      setIsTestModalOpen(false); refetch();
    } catch (err) { alert(getErrorMessage(err)); } finally { setTestBusy(false); }
  }
  async function handleDeleteTest(id: number) {
    if (!session || !confirm("Удалить этот тест?")) return;
    try { await api.deleteTest(session.accessToken, id); } catch (err) { alert(getErrorMessage(err)); } finally { refetch(); }
  }

  // --- CATEGORY HANDLERS ---
  function openCatModal(cat?: AdminTestCategoryDto) {
    if (cat) {
      setEditingCatId(cat.id); setCatName(cat.name); setCatDesc(cat.description || "");
    } else {
      setEditingCatId(null); setCatName(""); setCatDesc("");
    }
    setIsCatModalOpen(true);
  }
  async function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !selectedTestId) return;
    setCatBusy(true);
    try {
      if (editingCatId) {
        await api.updateTestCategory(session.accessToken, editingCatId, { name: catName.trim(), description: catDesc.trim() || undefined });
      } else {
        await api.createTestCategory(session.accessToken, { testId: selectedTestId, name: catName.trim(), description: catDesc.trim() || undefined });
      }
      setIsCatModalOpen(false); refetch();
    } catch (err) { alert(getErrorMessage(err)); } finally { setCatBusy(false); }
  }
  async function handleDeleteCategory(testId: number, catId: number) {
    if (!session || !confirm("Удалить эту категорию?")) return;
    try { await api.deleteTestCategory(session.accessToken, catId); } catch (err) { alert(getErrorMessage(err)); } finally { refetch(); }
  }

  // --- ZONE HANDLERS ---
  async function handleCreateZone(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !selectedCategoryId) return;
    try { await api.createCategoryZone(session.accessToken, { categoryId: selectedCategoryId, zone: newZoneType, minScore: Number(newZoneMin), maxScore: Number(newZoneMax), priority: Number(newZonePriority) }); setNewZoneMin(""); setNewZoneMax(""); setNewZonePriority(String(Number(newZonePriority) + 1)); refetch(); } catch (err) { alert(getErrorMessage(err)); }
  }
  async function handleUpdateZone(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !selectedCategoryId || editingZoneId === null) return;
    try { await api.updateCategoryZone(session.accessToken, editingZoneId, { zone: editZoneType, minScore: Number(editZoneMin), maxScore: Number(editZoneMax), priority: Number(editZonePriority) }); setEditingZoneId(null); refetch(); } catch (err) { alert(getErrorMessage(err)); }
  }
  async function handleDeleteZone(zoneId: number) {
    if (!session || !confirm("Удалить зону?")) return;
    try { await api.deleteCategoryZone(session.accessToken, zoneId); } catch (err) { alert(getErrorMessage(err)); } finally { refetch(); }
  }

  // --- QUESTION & ANSWER HANDLERS ---
  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !selectedTestId || !selectedCategoryId) return;
    try { await api.createTestQuestion(session.accessToken, { testId: selectedTestId, categoryId: selectedCategoryId, text: newQText.trim(), orderNumber: Number(newQOrder) }); setNewQText(""); setNewQOrder(String(Number(newQOrder) + 1)); refetch(); } catch (err) { alert(getErrorMessage(err)); }
  }
  async function handleUpdateQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!session || editingQId === null) return;
    try { await api.updateTestQuestion(session.accessToken, editingQId, { text: editQText.trim(), orderNumber: Number(editQOrder) }); setEditingQId(null); refetch(); } catch (err) { alert(getErrorMessage(err)); }
  }
  async function handleDeleteQuestion(qId: number) {
    if (!session || !confirm("Удалить вопрос?")) return;
    try { await api.deleteTestQuestion(session.accessToken, qId); } catch (err) { alert(getErrorMessage(err)); } finally { refetch(); }
  }
  async function handleCreateAnswer(e: React.FormEvent, qId: number) {
    e.preventDefault();
    if (!session) return;
    try { await api.createTestAnswer(session.accessToken, { questionId: qId, text: newAText.trim(), score: Number(newAScore) }); setNewAText(""); setNewAScore(""); refetch(); } catch (err) { alert(getErrorMessage(err)); }
  }
  async function handleUpdateAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!session || editingAId === null) return;
    try { await api.updateTestAnswer(session.accessToken, editingAId, { text: editAText.trim(), score: Number(editAScore) }); setEditingAId(null); refetch(); } catch (err) { alert(getErrorMessage(err)); }
  }
  async function handleDeleteAnswer(aId: number) {
    if (!session || !confirm("Удалить вариант ответа?")) return;
    try { await api.deleteTestAnswer(session.accessToken, aId); } catch (err) { alert(getErrorMessage(err)); } finally { refetch(); }
  }

  // --- BULK ANSWER HANDLERS ---
  function toggleQuestionSelection(qId: number) {
    setSelectedQuestionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(qId)) {
        newSet.delete(qId);
      } else {
        newSet.add(qId);
      }
      return newSet;
    });
  }
  function selectAllQuestions() {
    if (selectedCategory) {
      setSelectedQuestionIds(new Set(selectedCategory.questions.map(q => q.id)));
    }
  }
  function deselectAllQuestions() {
    setSelectedQuestionIds(new Set());
  }
  function addBulkAnswerField() {
    setBulkAnswers(prev => [...prev, { text: "", score: "" }]);
  }
  function removeBulkAnswerField(index: number) {
    setBulkAnswers(prev => prev.filter((_, i) => i !== index));
  }
  function updateBulkAnswerField(index: number, field: "text" | "score", value: string) {
    setBulkAnswers(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a));
  }
  async function handleBulkAnswerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || selectedQuestionIds.size === 0) return;
    setBulkBusy(true);
    try {
      const validAnswers = bulkAnswers.filter(a => a.text.trim() && a.score !== "");
      if (validAnswers.length === 0) {
        alert("Добавьте хотя бы один вариант ответа");
        return;
      }
      const questionIds = Array.from(selectedQuestionIds);
      let createdCount = 0;
      for (const qId of questionIds) {
        for (const answer of validAnswers) {
          await api.createTestAnswer(session.accessToken, { questionId: qId, text: answer.text.trim(), score: Number(answer.score) });
          createdCount++;
        }
      }
      alert(`Добавлено ${createdCount} ответов к ${questionIds.length} вопросам`);
      setIsBulkAnswerModalOpen(false);
      setBulkAnswers([{ text: "", score: "" }]);
      setSelectedQuestionIds(new Set());
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setBulkBusy(false);
    }
  }
  function openBulkAnswerModal() {
    if (selectedQuestionIds.size === 0) {
      alert("Выберите хотя бы один вопрос");
      return;
    }
    setBulkAnswers([{ text: "", score: "" }]);
    setIsBulkAnswerModalOpen(true);
  }

  // УРОВЕНЬ 3: Категория (Зоны и Вопросы)
  if (selectedTest && selectedCategory) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => setSelectedCategoryId(null)} style={{ background: "none", border: "1px solid #e5e7eb", color: "#4b5563", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#fff", fontWeight: 500 }}>
            ← Назад к категориям
          </button>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>{selectedCategory.name}</h1>
        </div>

        <div style={{ display: "grid", gap: "24px", alignItems: "start", gridTemplateColumns: "1fr" }}>

          {/* PANELS: ZONES */}
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#111827" }}>Зоны риска</h3>
              <button onClick={() => {
                if (newZoneCatId === selectedCategory.id) {
                  setNewZoneCatId(null);
                } else {
                  setNewZoneCatId(selectedCategory.id);
                  const maxPriority = selectedCategory.zones.reduce((max, z) => Math.max(max, z.priority || 0), -1);
                  setNewZonePriority(String(maxPriority + 1));
                }
              }} style={{ padding: "6px 12px", fontSize: "0.8rem", border: "1px solid #d1d5db", borderRadius: "6px", background: "#fff", cursor: "pointer", fontWeight: 500 }}>+ Добавить зону</button>
            </div>

            {newZoneCatId === selectedCategory.id && (
              <form onSubmit={handleCreateZone} style={{ display: "flex", gap: "8px", marginBottom: "16px", padding: "12px", background: "#f9fafb", borderRadius: "8px", border: "1px dashed #d1d5db", flexWrap: "wrap" }}>
                <select value={newZoneType} onChange={e => setNewZoneType(e.target.value)} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #d1d5db" }}>
                  <option value="GREEN">GREEN</option><option value="YELLOW">YELLOW</option><option value="RED">RED</option><option value="BLACK">BLACK</option>
                </select>
                <input type="number" placeholder="Мин. балл" value={newZoneMin} onChange={e => setNewZoneMin(e.target.value)} required style={{ width: "90px", padding: "6px", borderRadius: "4px", border: "1px solid #d1d5db" }} />
                <input type="number" placeholder="Макс. балл" value={newZoneMax} onChange={e => setNewZoneMax(e.target.value)} required style={{ width: "90px", padding: "6px", borderRadius: "4px", border: "1px solid #d1d5db" }} />
                <input type="number" placeholder="Приоритет" value={newZonePriority} onChange={e => setNewZonePriority(e.target.value)} style={{ width: "90px", padding: "6px", borderRadius: "4px", border: "1px solid #d1d5db" }} />
                <button type="submit" style={{ padding: "6px 12px", background: "#111827", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Сохранить</button>
                <button type="button" onClick={() => setNewZoneCatId(null)} style={{ padding: "6px 12px", background: "none", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" }}>Отмена</button>
              </form>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {selectedCategory.zones.length === 0 ? <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>Зоны риска не настроены.</div> : null}
              {selectedCategory.zones.map(z => (
                <div key={z.id}>
                  {editingZoneId === z.id ? (
                    <form onSubmit={handleUpdateZone} style={{ display: "flex", gap: "6px", padding: "10px", background: "#f9fafb", borderRadius: "6px", border: "1px solid #d1d5db", flexWrap: "wrap" }}>
                      <select value={editZoneType} onChange={e => setEditZoneType(e.target.value)} style={{ padding: "4px", borderRadius: "4px", border: "1px solid #d1d5db" }}>
                        <option value="GREEN">GREEN</option><option value="YELLOW">YELLOW</option><option value="RED">RED</option><option value="BLACK">BLACK</option>
                      </select>
                      <input type="number" placeholder="Мин." value={editZoneMin} onChange={e => setEditZoneMin(e.target.value)} required style={{ width: "70px", padding: "4px", borderRadius: "4px", border: "1px solid #d1d5db" }} />
                      <input type="number" placeholder="Макс." value={editZoneMax} onChange={e => setEditZoneMax(e.target.value)} required style={{ width: "70px", padding: "4px", borderRadius: "4px", border: "1px solid #d1d5db" }} />
                      <input type="number" placeholder="Приор." value={editZonePriority} onChange={e => setEditZonePriority(e.target.value)} style={{ width: "80px", padding: "4px", borderRadius: "4px", border: "1px solid #d1d5db" }} />
                      <button type="submit" style={{ padding: "4px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>Сохранить</button>
                      <button type="button" onClick={() => setEditingZoneId(null)} style={{ padding: "4px 12px", background: "none", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>Отмена</button>
                    </form>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "8px", background: z.zone === "GREEN" ? "#f0fdf4" : z.zone === "YELLOW" ? "#fefce8" : z.zone === "RED" ? "#fef2f2" : "#f3f4f6", border: "1px solid " + (z.zone === "GREEN" ? "#bbf7d0" : z.zone === "YELLOW" ? "#fef08a" : z.zone === "RED" ? "#fecaca" : "#e5e7eb") }}>
                      <span style={{ fontWeight: 500, color: z.zone === "GREEN" ? "#166534" : z.zone === "YELLOW" ? "#854d0e" : z.zone === "RED" ? "#991b1b" : "#1f2937" }}>
                        {z.zone} ({z.minScore} - {z.maxScore} баллов) <span style={{ opacity: 0.7, fontSize: "0.85rem", marginLeft: "8px" }}>Приоритет: {z.priority || 0}</span>
                      </span>
                      <div>
                        <button onClick={() => { setEditingZoneId(z.id); setEditZoneType(z.zone); setEditZoneMin(String(z.minScore)); setEditZoneMax(String(z.maxScore)); setEditZonePriority(String(z.priority || 0)); }} style={{ color: "#2563eb", border: "none", background: "none", cursor: "pointer", marginRight: "12px", fontSize: "0.85rem", fontWeight: 500 }}>Изменить</button>
                        <button onClick={() => handleDeleteZone(z.id)} style={{ color: "#dc2626", border: "none", background: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}>Удалить</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PANELS: QUESTIONS */}
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#111827" }}>Вопросы и ответы</h3>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {selectedQuestionIds.size > 0 && (
                  <span style={{ fontSize: "0.85rem", color: "#6b7280", marginRight: "8px" }}>Выбрано: {selectedQuestionIds.size}</span>
                )}
                <button onClick={openBulkAnswerModal} disabled={selectedQuestionIds.size === 0} style={{ padding: "6px 12px", fontSize: "0.8rem", border: "1px solid #2563eb", borderRadius: "6px", background: selectedQuestionIds.size > 0 ? "#2563eb" : "#f3f4f6", color: selectedQuestionIds.size > 0 ? "#fff" : "#9ca3af", cursor: selectedQuestionIds.size > 0 ? "pointer" : "not-allowed", fontWeight: 500 }}>+ Добавить ответы к выбранным</button>
                <button onClick={() => { 
                  if (newQCatId === selectedCategory.id) {
                    setNewQCatId(null);
                  } else {
                    setNewQCatId(selectedCategory.id);
                    const maxOrder = selectedCategory.questions.reduce((max, q) => Math.max(max, q.orderNumber || 0), 0);
                    setNewQOrder(String(maxOrder + 1)); 
                  }
                }} style={{ padding: "6px 12px", fontSize: "0.8rem", border: "1px solid #d1d5db", borderRadius: "6px", background: "#fff", cursor: "pointer", fontWeight: 500 }}>+ Добавить вопрос</button>
              </div>
            </div>
            {selectedCategory.questions.length > 0 && (
              <div style={{ display: "flex", gap: "12px", marginBottom: "12px", padding: "8px 12px", background: "#f9fafb", borderRadius: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#374151", cursor: "pointer" }}>
                  <input type="checkbox" checked={selectedQuestionIds.size === selectedCategory.questions.length && selectedCategory.questions.length > 0} onChange={(e) => e.target.checked ? selectAllQuestions() : deselectAllQuestions()} />
                  Выбрать все
                </label>
                {selectedQuestionIds.size > 0 && (
                  <button onClick={deselectAllQuestions} style={{ fontSize: "0.8rem", color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>Снять выбор</button>
                )}
              </div>
            )}

            {newQCatId === selectedCategory.id && (
              <form onSubmit={handleCreateQuestion} style={{ display: "flex", gap: "8px", marginBottom: "20px", padding: "16px", background: "#f9fafb", borderRadius: "8px", border: "1px dashed #d1d5db" }}>
                <input type="number" placeholder="Порядок" value={newQOrder} onChange={e => setNewQOrder(e.target.value)} style={{ width: "90px", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                <input type="text" placeholder="Текст вопроса..." value={newQText} onChange={e => setNewQText(e.target.value)} required style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                <button type="submit" style={{ padding: "8px 16px", background: "#111827", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Сохранить</button>
                <button type="button" onClick={() => setNewQCatId(null)} style={{ padding: "8px 16px", background: "none", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer" }}>Отмена</button>
              </form>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {selectedCategory.questions.length === 0 ? <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>Вопросы ещё не добавлены.</div> : null}
              {selectedCategory.questions.map(q => (
                <div key={q.id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                  {editingQId === q.id ? (
                    <form onSubmit={handleUpdateQuestion} style={{ display: "flex", gap: "8px", padding: "12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      <input type="number" placeholder="Порядок" value={editQOrder} onChange={e => setEditQOrder(e.target.value)} required style={{ width: "90px", padding: "6px", borderRadius: "4px", border: "1px solid #d1d5db" }} />
                      <input type="text" value={editQText} onChange={e => setEditQText(e.target.value)} required style={{ flex: 1, padding: "6px", borderRadius: "4px", border: "1px solid #d1d5db" }} />
                      <button type="submit" style={{ padding: "6px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>Сохранить</button>
                      <button type="button" onClick={() => setEditingQId(null)} style={{ padding: "6px 12px", background: "none", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>Отмена</button>
                    </form>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 16px", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", cursor: "pointer" }} onClick={() => setExpandedQuestionId(expandedQuestionId === q.id ? null : q.id)}>
                      <div style={{ fontWeight: 500, color: "#111827", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <input
                          type="checkbox"
                          checked={selectedQuestionIds.has(q.id)}
                          onChange={(e) => { e.stopPropagation(); toggleQuestionSelection(q.id); }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ marginTop: "3px", cursor: "pointer" }}
                        />
                        <span style={{ color: "#6b7280", minWidth: "32px" }}>{expandedQuestionId === q.id ? "▼" : "▶"} {q.orderNumber}.</span>
                        <span>{q.text}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                         <span style={{ fontSize: "0.8rem", color: "#6b7280", marginRight: "8px" }}>{q.answers.length} вариантов</span>
                         <button onClick={(e) => { e.stopPropagation(); setEditingQId(q.id); setEditQText(q.text); setEditQOrder(String(q.orderNumber || 1)); }} style={{ color: "#2563eb", border: "none", background: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}>Изменить</button>
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }} style={{ color: "#dc2626", border: "none", background: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}>Удалить</button>
                      </div>
                    </div>
                  )}

                  {/* ANSWERS (Always visible or toggleable, let's keep it visible if question is expanded or just always visible to make it easier) */}
                  {(expandedQuestionId === q.id || editingQId === q.id) && (
                    <div style={{ padding: "16px", backgroundColor: "#fff" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Варианты ответов</span>
                        <button onClick={() => {
                          if (newAQId === q.id) {
                            setNewAQId(null);
                          } else {
                            setNewAQId(q.id);
                            setNewAScore("");
                          }
                        }} style={{ padding: "4px 8px", fontSize: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", background: "#fff", cursor: "pointer" }}>+ Добавить ответ</button>
                      </div>

                      {newAQId === q.id && (
                        <form onSubmit={e => handleCreateAnswer(e, q.id)} style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                          <input type="text" placeholder="Текст ответа..." value={newAText} onChange={e => setNewAText(e.target.value)} required style={{ flex: 1, padding: "6px", fontSize: "0.85rem", borderRadius: "4px", border: "1px solid #d1d5db" }} />
                          <input type="number" placeholder="Баллы" value={newAScore} onChange={e => setNewAScore(e.target.value)} required style={{ width: "90px", padding: "6px", fontSize: "0.85rem", borderRadius: "4px", border: "1px solid #d1d5db" }} />
                          <button type="submit" style={{ padding: "6px 12px", background: "#111827", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>Сохранить</button>
                        </form>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {q.answers.length === 0 ? <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Ответов пока нет.</div> : null}
                        {q.answers.map(a => (
                          <div key={a.id}>
                            {editingAId === a.id ? (
                              <form onSubmit={handleUpdateAnswer} style={{ display: "flex", gap: "8px" }}>
                                <input type="text" value={editAText} onChange={e => setEditAText(e.target.value)} required style={{ flex: 1, padding: "4px 8px", fontSize: "0.85rem", borderRadius: "4px", border: "1px solid #d1d5db" }} />
                                <input type="number" value={editAScore} onChange={e => setEditAScore(e.target.value)} required style={{ width: "70px", padding: "4px 8px", fontSize: "0.85rem", borderRadius: "4px", border: "1px solid #d1d5db" }} />
                                <button type="submit" style={{ padding: "4px 10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>Сохранить</button>
                                <button type="button" onClick={() => setEditingAId(null)} style={{ padding: "4px 10px", background: "none", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>Отмена</button>
                              </form>
                            ) : (
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                                <span style={{ fontSize: "0.9rem", color: "#374151" }}>{a.text} <span style={{ fontWeight: 600, color: "#10b981", marginLeft: "8px", padding: "2px 6px", background: "#d1fae5", borderRadius: "99px", fontSize: "0.75rem" }}>+{a.score} баллов</span></span>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button onClick={() => { setEditingAId(a.id); setEditAText(a.text); setEditAScore(String(a.score)); }} style={{ color: "#2563eb", border: "none", background: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}>Изменить</button>
                                  <button onClick={() => handleDeleteAnswer(a.id)} style={{ color: "#dc2626", border: "none", background: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}>Удалить</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BULK ANSWER MODAL */}
        <Modal isOpen={isBulkAnswerModalOpen} onClose={() => setIsBulkAnswerModalOpen(false)} title={`Добавить ответы к ${selectedQuestionIds.size} вопросам`}>
          <form onSubmit={handleBulkAnswerSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>Укажите варианты ответов и их баллы. Они будут добавлены ко всем выбранным вопросам.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {bulkAnswers.map((answer, index) => (
                <div key={index} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Текст ответа"
                    value={answer.text}
                    onChange={(e) => updateBulkAnswerField(index, "text", e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                  <input
                    type="number"
                    placeholder="Баллы"
                    value={answer.score}
                    onChange={(e) => updateBulkAnswerField(index, "score", e.target.value)}
                    style={{ width: "100px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                  {bulkAnswers.length > 1 && (
                    <button type="button" onClick={() => removeBulkAnswerField(index)} style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", color: "#dc2626" }}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addBulkAnswerField} style={{ padding: "8px 16px", background: "#f3f4f6", border: "1px dashed #d1d5db", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>+ Добавить ещё один вариант ответа</button>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <button type="button" onClick={() => setIsBulkAnswerModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 500 }}>Отмена</button>
              <button type="submit" disabled={bulkBusy} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer", opacity: bulkBusy ? 0.7 : 1 }}>{bulkBusy ? "Сохранение..." : "Сохранить ответы"}</button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // УРОВЕНЬ 2: Тест (Список категорий)
  if (selectedTest) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => setSelectedTestId(null)} style={{ background: "none", border: "1px solid #e5e7eb", color: "#4b5563", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#fff", fontWeight: 500 }}>
            ← Назад к тестам
          </button>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>Категории теста «{selectedTest.title}»</h1>
          <button onClick={() => openCatModal()} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer", marginLeft: "auto" }}>
            + Добавить категорию
          </button>
        </div>

        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
          {selectedTest.categories.length === 0 ? (
             <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Категорий пока нет. Нажмите «Добавить категорию», чтобы создать первую.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <tr>
                  <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem" }}>Название категории</th>
                  <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem" }}>Зоны</th>
                  <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem" }}>Вопросы</th>
                  <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem", textAlign: "right" }}>Действия</th>
                </tr>
              </thead>

              <tbody>
                {selectedTest.categories.map(cat => (
                  <tr key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} style={{ borderBottom: "1px solid #e5e7eb", transition: "background-color 0.2s", cursor: "pointer" }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: "16px 24px", fontWeight: 500, color: "#111827" }}>
                      {cat.name}
                      {cat.description && <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "4px", fontWeight: 400 }}>{cat.description}</div>}
                    </td>
                    <td style={{ padding: "16px 24px", color: "#4b5563" }}><span style={{ fontWeight: 600 }}>{cat.zones.length}</span> шт.</td>
                    <td style={{ padding: "16px 24px", color: "#4b5563" }}><span style={{ fontWeight: 600 }}>{cat.questions.length}</span> шт.</td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <span style={{ color: "#6b7280", marginRight: "16px", fontSize: "0.85rem" }}>Открыть →</span>
                      <button onClick={(e) => { e.stopPropagation(); openCatModal(cat); }} style={{ marginRight: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Изменить</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(selectedTest.id, cat.id); }} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title={editingCatId ? "Редактировать категорию" : "Новая категория"}>
          <form onSubmit={handleCatSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>Название категории *</label>
              <input type="text" value={catName} onChange={e => setCatName(e.target.value)} required style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }} placeholder="Напр: Тревожность" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>Описание</label>
              <textarea value={catDesc} onChange={e => setCatDesc(e.target.value)} rows={3} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box", fontFamily: "inherit" }} placeholder="Краткое описание..." />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <button type="button" onClick={() => setIsCatModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 500 }}>Отмена</button>
              <button type="submit" disabled={catBusy} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer", opacity: catBusy ? 0.7 : 1 }}>{catBusy ? "Сохранение..." : "Сохранить"}</button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // УРОВЕНЬ 1: Список всех тестов
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>Тесты и опросники</h1>
        <button onClick={() => openTestModal()} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer" }}>
          + Добавить тест
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
        {tests.length === 0 ? (
           <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Тестов пока нет. Нажмите «Добавить тест», чтобы создать первый.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem" }}>Название</th>
                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem" }}>Категории</th>
                <th style={{ padding: "12px 24px", color: "#6b7280", fontWeight: 500, fontSize: "0.85rem", textAlign: "right" }}>Действия</th>
              </tr>
            </thead>

            <tbody>
              {tests.map(test => (
                <tr key={test.id} onClick={() => setSelectedTestId(test.id)} style={{ borderBottom: "1px solid #e5e7eb", transition: "background-color 0.2s", cursor: "pointer" }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: "16px 24px", fontWeight: 500, color: "#111827" }}>
                    {test.title}
                    {test.description && <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "4px", fontWeight: 400 }}>{test.description}</div>}
                  </td>
                  <td style={{ padding: "16px 24px", color: "#4b5563" }}><span style={{ fontWeight: 600 }}>{test.categories.length}</span> шт.</td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <span style={{ color: "#6b7280", marginRight: "16px", fontSize: "0.85rem" }}>Открыть категории →</span>
                    <button onClick={(e) => { e.stopPropagation(); openTestModal(test); }} style={{ marginRight: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Изменить</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTest(test.id); }} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} title={editingTestId ? "Редактировать тест" : "Новый тест"}>
        <form onSubmit={handleTestSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>Название теста *</label>
            <input type="text" value={testTitle} onChange={e => setTestTitle(e.target.value)} required style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }} placeholder="Напр: Оценка уровня стресса" />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>Описание</label>
            <textarea value={testDesc} onChange={e => setTestDesc(e.target.value)} rows={3} style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box", fontFamily: "inherit" }} placeholder="Краткое описание..." />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" onClick={() => setIsTestModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 500 }}>Отмена</button>
            <button type="submit" disabled={testBusy} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer", opacity: testBusy ? 0.7 : 1 }}>{testBusy ? "Сохранение..." : "Сохранить"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}