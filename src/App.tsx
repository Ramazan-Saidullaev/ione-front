import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomeLandingPage } from "./pages/HomeLandingPage";
import { AuthPage } from "./pages/AuthPage";
import { TeacherRegisterPage } from "./pages/TeacherRegisterPage";
import { StudentRegisterPage } from "./pages/StudentRegisterPage";
import { TeacherPage } from "./pages/TeacherPage";
import { StudentPage } from "./pages/StudentPage";
import { AdminPage } from "./pages/AdminPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/register/teacher" element={<TeacherRegisterPage />} />
        <Route path="/auth/register/student" element={<StudentRegisterPage />} />
        <Route path="/teachers/*" element={<TeacherPage />} />
        <Route path="/students/*" element={<StudentPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
