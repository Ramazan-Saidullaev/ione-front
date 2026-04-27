import { BrowserRouter, Routes, Route, Navigate, useParams, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { YrysAuthPage } from "./pages/YrysAuthPage";
import { YrysRegisterPage } from "./pages/YrysRegisterPage";
import { StudentProfilePage } from "./pages/student/StudentProfilePage";
import { TeacherProfilePage } from "./pages/teacher/TeacherProfilePage";
import { PublicCoursesPage } from "./pages/PublicCoursesPage";

const SUPPORTED_LANGS = ["ru", "kz", "en"];

function LangWrapper() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && SUPPORTED_LANGS.includes(lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  if (!lang || !SUPPORTED_LANGS.includes(lang)) {
    return <Navigate to={`/ru`} replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:lang" element={<LangWrapper />}>
          <Route index element={<HomeLandingPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="public-courses" element={<PublicCoursesPage />} />
          <Route path="auth/register" element={<RegisterTypePage />} />
          <Route path="auth/register/teacher" element={<TeacherRegisterPage />} />
          <Route path="auth/register/student" element={<StudentRegisterPage />} />
          <Route path="teachers/profile" element={<TeacherProfilePage />} />
          <Route path="teachers/*" element={<TeacherPage />} />
          <Route path="students/course/:courseId/lesson/:lessonId/situation-test" element={<SituationTestPage />} />
          <Route path="students/profile" element={<StudentProfilePage />} />
          <Route path="students/*" element={<StudentPage />} />
          <Route path="admin/*" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        {/* <Route path="/yrys/auth" element={<YrysAuthPage />} /> */}
{/* <Route path="/yrys/register" element={<YrysRegisterPage />} /> */}
        <Route path="/" element={<Navigate to="/ru" replace />} />
        <Route path="*" element={<Navigate to="/ru" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
