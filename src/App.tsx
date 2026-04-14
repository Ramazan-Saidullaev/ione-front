import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomeLandingPage } from "./pages/HomeLandingPage";
import { AuthPage } from "./pages/AuthPage";
import { RegisterTypePage } from "./pages/RegisterTypePage";
import { TeacherRegisterPage } from "./pages/TeacherRegisterPage";
import { StudentRegisterPage } from "./pages/StudentRegisterPage";
import { TeacherPage } from "./pages/TeacherPage";
import { StudentPage } from "./pages/StudentPage";
import { SituationTestPage } from "./pages/SituationTestPage";
import { AdminPage } from "./pages/AdminPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { StudentProfilePage } from "./pages/StudentProfilePage";
import { TeacherProfilePage } from "./pages/TeacherProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/register" element={<RegisterTypePage />} />
        <Route path="/auth/register/teacher" element={<TeacherRegisterPage />} />
        <Route path="/auth/register/student" element={<StudentRegisterPage />} />
        <Route path="/teachers/profile" element={<TeacherProfilePage />} />
        <Route path="/teachers/*" element={<TeacherPage />} />
        <Route path="/students/course/:courseId/lesson/:lessonId/situation-test" element={<SituationTestPage />} />
        <Route path="/students/profile" element={<StudentProfilePage />} />
        <Route path="/students/*" element={<StudentPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
