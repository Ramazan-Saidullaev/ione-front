import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { loadSession } from "../storage";

export function AdminSchools() {
  const [session] = useState(() => loadSession("admin"));
  const { data, isLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => api.getAdminDashboard(session!.accessToken),
    enabled: !!session,
  });

  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

  if (isLoading) return <div style={{ color: "#6b7280" }}>Loading schools...</div>;
  if (!data) return null;

  const selectedSchool = data.schools.find(s => s.id === selectedSchoolId);
  const selectedTeacher = selectedSchool?.teachers.find(t => t.id === selectedTeacherId);

  // Уровень 3: Студенты выбранного учителя
  if (selectedTeacher && selectedSchool) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => setSelectedTeacherId(null)} style={{ background: "none", border: "1px solid #e5e7eb", color: "#4b5563", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#fff", fontWeight: 500, transition: "background-color 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#f9fafb"} onMouseOut={e => e.currentTarget.style.backgroundColor = "#fff"}>
            ← Back to Teachers
          </button>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>Students of {selectedTeacher.fullName}</h1>
        </div>
        {selectedTeacher.students.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280", background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb" }}>No students registered under this teacher.</div>
        ) : (
          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
            {selectedTeacher.students.map(student => (
              <div key={student.id} style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
                <div style={{ fontWeight: 600, color: "#111827", fontSize: "1.1rem", marginBottom: "4px" }}>{student.fullName}</div>
                <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>Class: <span style={{ fontWeight: 500, color: "#374151" }}>{student.className || "Not set"}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Уровень 2: Учителя выбранной школы
  if (selectedSchool) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => setSelectedSchoolId(null)} style={{ background: "none", border: "1px solid #e5e7eb", color: "#4b5563", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#fff", fontWeight: 500, transition: "background-color 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#f9fafb"} onMouseOut={e => e.currentTarget.style.backgroundColor = "#fff"}>
            ← Back to Schools
          </button>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", margin: 0 }}>Teachers in {selectedSchool.name}</h1>
        </div>
        {selectedSchool.teachers.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280", background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb" }}>No teachers registered in this school.</div>
        ) : (
          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {selectedSchool.teachers.map(teacher => (
              <div key={teacher.id} onClick={() => setSelectedTeacherId(teacher.id)} style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", cursor: "pointer", transition: "box-shadow 0.2s, border-color 0.2s" }} onMouseOver={e => { e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"; e.currentTarget.style.borderColor = "#bfdbfe"; }} onMouseOut={e => { e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", color: "#111827", fontSize: "1.1rem" }}>{teacher.fullName}</h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>{teacher.students.length} students</p>
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: "1.2rem" }}>→</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Уровень 1: Все школы
  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", marginBottom: "24px" }}>Schools & Users</h1>
      <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {data.schools.map((school) => (
          <div key={school.id} onClick={() => setSelectedSchoolId(school.id)} style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", cursor: "pointer", transition: "box-shadow 0.2s, border-color 0.2s" }} onMouseOver={e => { e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"; e.currentTarget.style.borderColor = "#bfdbfe"; }} onMouseOut={e => { e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 8px 0", color: "#111827", fontSize: "1.2rem" }}>{school.name}</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#2563eb", fontWeight: 500 }}>{school.teachers.length} Teachers</p>
              </div>
              <div style={{ color: "#9ca3af", fontSize: "1.2rem" }}>→</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}