import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api";
import { loadSession } from "../../storage";
import { Modal } from "../Modal";
import { getErrorMessage } from "../../utils/helpers";
import { PasswordToggleField } from "../../components/PasswordToggleField";

export function AdminSchools() {
  const [session] = useState(() => loadSession("admin"));
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => api.getAdminDashboard(session!.accessToken),
    enabled: !!session,
  });

  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

  const [busy, setBusy] = useState(false);

  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<number | null>(null);
  const [schoolName, setSchoolName] = useState("");

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
  const [teacherName, setTeacherName] = useState("");
  const [teacherHomeroomClass, setTeacherHomeroomClass] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // Clear teacher form fields when opening add modal
  useEffect(() => {
    if (isTeacherModalOpen && editingTeacherId === null) {
      setTeacherName("");
      setTeacherHomeroomClass("");
      setTeacherEmail("");
      setTeacherPassword("");
    }
  }, [isTeacherModalOpen, editingTeacherId]);

  // Clear student form fields when opening add modal
  useEffect(() => {
    if (isStudentModalOpen && editingStudentId === null) {
      setStudentName("");
      setStudentClass("");
      setStudentEmail("");
      setStudentPassword("");
    }
  }, [isStudentModalOpen, editingStudentId]);

  async function handleSchoolSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setBusy(true);
    try {
      if (editingSchoolId) {
        await api.updateSchool(session.accessToken, editingSchoolId, { name: schoolName.trim() });
      } else {
        await api.createSchool(session.accessToken, { name: schoolName.trim() });
      }
      await refetch();
      setIsSchoolModalOpen(false);
    } catch (err) { alert(getErrorMessage(err)); } finally { setBusy(false); }
  }
  async function handleSchoolDelete(id: number) {
    if (!session || !confirm("Удалить школу? Внимание: это также безвозвратно удалит всех её учителей и учеников!")) return;
    try { await api.deleteSchool(session.accessToken, id); setSelectedSchoolId(null); await refetch(); } catch (err) { alert(getErrorMessage(err)); }
  }

  async function handleTeacherSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setBusy(true);
    try {
      if (editingTeacherId) {
        await api.updateTeacher(session.accessToken, editingTeacherId, {
          fullName: teacherName.trim(),
          homeroomClass: teacherHomeroomClass.trim() ? teacherHomeroomClass.trim().toUpperCase().replace(/\s+/g, "") : undefined
        });
      } else {
        if (!selectedSchoolId) return;
        if (!teacherHomeroomClass.trim()) {
          alert("Укажите класс (классный руководитель), например 7A");
          return;
        }
        await api.registerTeacher({
          fullName: teacherName.trim(),
          email: teacherEmail.trim(),
          password: teacherPassword,
          homeroomClass: teacherHomeroomClass.trim().toUpperCase().replace(/\s+/g, ""),
          schoolId: selectedSchoolId
        });
      }
      await refetch();
      setIsTeacherModalOpen(false);
    } catch (err) { alert(getErrorMessage(err)); } finally { setBusy(false); }
  }
  async function handleTeacherDelete(id: number) {
    if (!session || !confirm("Удалить учителя и его аккаунт? Внимание: это также безвозвратно удалит всех его учеников!")) return;
    try { await api.deleteTeacher(session.accessToken, id); setSelectedTeacherId(null); await refetch(); } catch (err) { alert(getErrorMessage(err)); }
  }

  async function handleStudentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setBusy(true);
    try {
      if (editingStudentId) {
        await api.updateStudent(session.accessToken, editingStudentId, { fullName: studentName.trim(), className: studentClass.trim() || undefined });
      } else {
        if (!selectedSchoolId || !selectedTeacherId) return;
        const teacher = data?.schools
          .find(s => s.id === selectedSchoolId)
          ?.teachers.find(t => t.id === selectedTeacherId);
        const targetClass = (teacher?.homeroomClass || studentClass).trim();
        if (!targetClass) {
          alert("У выбранного учителя не указан классный руководитель. Укажите класс вручную.");
          return;
        }
        await api.registerStudent({
          fullName: studentName.trim(),
          email: studentEmail.trim(),
          password: studentPassword,
          schoolId: selectedSchoolId,
          className: targetClass.toUpperCase().replace(/\s+/g, "")
        });
      }
      await refetch();
      setIsStudentModalOpen(false);
    } catch (err) { alert(getErrorMessage(err)); } finally { setBusy(false); }
  }
  async function handleStudentDelete(id: number) {
    if (!session || !confirm("Удалить ученика и его аккаунт?")) return;
    try { await api.deleteStudent(session.accessToken, id); await refetch(); } catch (err) { alert(getErrorMessage(err)); }
  }

  if (isLoading) return <div style={{ color: "#6b7280" }}>Загрузка школ...</div>;
  if (!data) return null;

  const selectedSchool = data.schools.find(s => s.id === selectedSchoolId);
  const selectedTeacher = selectedSchool?.teachers.find(t => t.id === selectedTeacherId);

  let content;

  // Уровень 3: Ученики выбранного учителя
  if (selectedTeacher && selectedSchool) {
    content = (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => setSelectedTeacherId(null)} style={{ background: "none", border: "1px solid #e5e7eb", color: "#4b5563", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#fff", fontWeight: 500, transition: "background-color 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#f9fafb"} onMouseOut={e => e.currentTarget.style.backgroundColor = "#fff"}>
            ← Назад к учителям
          </button>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>Ученики учителя: {selectedTeacher.fullName}</h1>
          <button onClick={() => { setEditingStudentId(null); setStudentName(""); setStudentClass(""); setStudentEmail(""); setStudentPassword(""); setIsStudentModalOpen(true); }} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer", marginLeft: "auto" }}>
            + Добавить ученика
          </button>
        </div>
        {selectedTeacher.students.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280", background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
            <p style={{ marginBottom: "16px" }}>У этого учителя пока нет учеников.</p>
            <button onClick={() => { setEditingStudentId(null); setStudentName(""); setStudentClass(""); setStudentEmail(""); setStudentPassword(""); setIsStudentModalOpen(true); }} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer" }}>+ Создать ученика</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
            {selectedTeacher.students.map(student => (
              <div key={student.id} style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
                <div style={{ fontWeight: 600, color: "#111827", fontSize: "1.1rem", marginBottom: "4px" }}>{student.fullName}</div>
                <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>Класс: <span style={{ fontWeight: 500, color: "#374151" }}>{student.className || "Не указан"}</span></div>
            <div style={{ display: "flex", gap: "12px", marginTop: "16px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
              <button onClick={(e) => { e.stopPropagation(); setEditingStudentId(student.id); setStudentName(student.fullName); setStudentClass(student.className || ""); setIsStudentModalOpen(true); }} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.85rem" }}>Изменить</button>
              <button onClick={(e) => { e.stopPropagation(); handleStudentDelete(student.id); }} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.85rem" }}>Удалить</button>
            </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Уровень 2: Учителя выбранной школы
  else if (selectedSchool) {
    content = (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => setSelectedSchoolId(null)} style={{ background: "none", border: "1px solid #e5e7eb", color: "#4b5563", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#fff", fontWeight: 500, transition: "background-color 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#f9fafb"} onMouseOut={e => e.currentTarget.style.backgroundColor = "#fff"}>
            ← Назад к школам
          </button>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>Учителя школы: {selectedSchool.name}</h1>
          <button onClick={() => { setEditingTeacherId(null); setTeacherName(""); setTeacherHomeroomClass(""); setTeacherEmail(""); setTeacherPassword(""); setIsTeacherModalOpen(true); }} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer", marginLeft: "auto" }}>
            + Добавить учителя
          </button>
        </div>
        {selectedSchool.teachers.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280", background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
            <p style={{ marginBottom: "16px" }}>В этой школе пока нет учителей.</p>
            <button onClick={() => { setEditingTeacherId(null); setTeacherName(""); setTeacherHomeroomClass(""); setTeacherEmail(""); setTeacherPassword(""); setIsTeacherModalOpen(true); }} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer" }}>+ Создать учителя</button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {selectedSchool.teachers.map(teacher => (
              <div key={teacher.id} onClick={() => setSelectedTeacherId(teacher.id)} style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", cursor: "pointer", transition: "box-shadow 0.2s, border-color 0.2s" }} onMouseOver={e => { e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"; e.currentTarget.style.borderColor = "#bfdbfe"; }} onMouseOut={e => { e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", color: "#111827", fontSize: "1.1rem" }}>{teacher.fullName}</h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
                      Класс: <span style={{ fontWeight: 600, color: "#374151" }}>{teacher.homeroomClass || "Не указан"}</span>
                    </p>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>{teacher.students.length} учеников</p>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <button onClick={(e) => { e.stopPropagation(); setEditingTeacherId(teacher.id); setTeacherName(teacher.fullName); setTeacherHomeroomClass(teacher.homeroomClass || ""); setIsTeacherModalOpen(true); }} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.85rem" }}>Изменить</button>
                    <button onClick={(e) => { e.stopPropagation(); handleTeacherDelete(teacher.id); }} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.85rem" }}>Удалить</button>
                    <div style={{ color: "#9ca3af", fontSize: "1.2rem", marginLeft: "8px" }}>→</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Уровень 1: Все школы
  else {
    content = (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>Школы и пользователи</h1>
          <button onClick={() => { setEditingSchoolId(null); setSchoolName(""); setIsSchoolModalOpen(true); }} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: 500, cursor: "pointer" }}>
            + Добавить школу
          </button>
        </div>
        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {data.schools.map((school) => (
          <div key={school.id} onClick={() => setSelectedSchoolId(school.id)} style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", cursor: "pointer", transition: "box-shadow 0.2s, border-color 0.2s" }} onMouseOver={e => { e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"; e.currentTarget.style.borderColor = "#bfdbfe"; }} onMouseOut={e => { e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 8px 0", color: "#111827", fontSize: "1.2rem" }}>{school.name}</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#2563eb", fontWeight: 500 }}>{school.teachers.length} учителей</p>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button onClick={(e) => { e.stopPropagation(); setEditingSchoolId(school.id); setSchoolName(school.name); setIsSchoolModalOpen(true); }} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.85rem" }}>Изменить</button>
                <button onClick={(e) => { e.stopPropagation(); handleSchoolDelete(school.id); }} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.85rem" }}>Удалить</button>
                <div style={{ color: "#9ca3af", fontSize: "1.2rem", marginLeft: "8px" }}>→</div>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {content}
      <Modal isOpen={isSchoolModalOpen} onClose={() => setIsSchoolModalOpen(false)} title={editingSchoolId ? "Редактировать школу" : "Добавить школу"}>
        <form onSubmit={handleSchoolSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Название школы</span><input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} /></label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" onClick={() => setIsSchoolModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}>Отмена</button>
            <button type="submit" disabled={busy} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Сохранить</button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)} title={editingTeacherId ? "Редактировать учителя" : "Добавить учителя"}>
        <form onSubmit={handleTeacherSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>ФИО Учителя</span><input type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} /></label>
          <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Классный руководитель (например, 7A)</span><input type="text" value={teacherHomeroomClass} onChange={e => setTeacherHomeroomClass(e.target.value)} required={!editingTeacherId} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} /></label>
          {!editingTeacherId && (
            <>
              <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Email (логин)</span><input type="email" value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} /></label>
              <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Пароль</span><PasswordToggleField value={teacherPassword} onChange={setTeacherPassword} required placeholder="Введите пароль" /></label>
            </>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" onClick={() => setIsTeacherModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}>Отмена</button>
            <button type="submit" disabled={busy} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Сохранить</button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} title={editingStudentId ? "Редактировать ученика" : "Добавить ученика"}>
        <form onSubmit={handleStudentSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>ФИО Ученика</span><input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} /></label>
          {editingStudentId ? (
            <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Класс (например, 8A)</span><input type="text" value={studentClass} onChange={e => setStudentClass(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} /></label>
          ) : (
            <div style={{ padding: "12px", backgroundColor: "#f3f4f6", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
              <span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>Класс</span>
              <span style={{ fontWeight: 600, color: "#111827" }}>{selectedTeacher?.homeroomClass || "Не указан"}</span>
              <span style={{ display: "block", marginTop: "4px", fontSize: "0.75rem", color: "#6b7280" }}>Класс определяется автоматически по классу учителя</span>
            </div>
          )}
          {!editingStudentId && (
            <>
              <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Email (логин)</span><input type="email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }} /></label>
              <label><span style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 500 }}>Пароль</span><PasswordToggleField value={studentPassword} onChange={setStudentPassword} required placeholder="Введите пароль" /></label>
            </>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" onClick={() => setIsStudentModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}>Отмена</button>
            <button type="submit" disabled={busy} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Сохранить</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}