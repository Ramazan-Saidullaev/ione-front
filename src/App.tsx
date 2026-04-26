import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomeLandingPage } from "./pages/HomeLandingPage";
import { AuthPage } from "./pages/AuthPage";
import { RegisterTypePage } from "./pages/RegisterTypePage";
import { TeacherRegisterPage } from "./pages/teacher/TeacherRegisterPage";
import { StudentRegisterPage } from "./pages/student/StudentRegisterPage";
import { TeacherPage } from "./pages/teacher/TeacherPage";
import { StudentPage } from "./pages/student/StudentPage";
import { SituationTestPage } from "./pages/SituationTestPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { StudentProfilePage } from "./pages/student/StudentProfilePage";
import { TeacherProfilePage } from "./pages/teacher/TeacherProfilePage";
import { PublicCoursesPage } from "./pages/PublicCoursesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/public-courses" element={<PublicCoursesPage />} />
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
