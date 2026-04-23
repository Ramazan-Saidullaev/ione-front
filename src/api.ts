import type {
  AuthResponse,
  Course,
  FinishAttemptResponse,
  Lesson,
  LessonCompletionResponse,
  StudentCourseProgress,
  StudentLessonProgress,
  StudentLessonScenario,
  StudentLessonScenarios,
  StudentScenarioAnswerResult,
  LoginRequest,
  MeResponse,
  RegisterStudentRequest,
  RegisterTeacherRequest,
  RiskStudent,
  RiskZone,
  StartAttemptResponse,
  StudentAnswerResponse,
  TeacherAttemptDetails,
  TeacherAttemptListItem,
  TeacherStudent,
  TeacherStudentCourseProgress,
  TeacherStudentLatestAttempt,
  TeacherStudentTestAttemptSummary,
  TestListItem,
  TestQuestion,
  AdminDashboardDto,
  AdminCourseDto,
  AdminLessonDto,
  AdminTestDto,
  AdminSchoolDto,
  AdminTeacherDto,
  AdminStudentDto,
  CreateCourseRequest,
  UpdateCourseRequest,
  CreateLessonRequest,
  UpdateLessonRequest,
  AdminTestCategoryDto,
  AdminCategoryZoneDto,
  AdminTestQuestionDto,
  AdminTestAnswerDto,
  CreateTestRequest,
  UpdateTestRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateCategoryZoneRequest,
  UpdateCategoryZoneRequest,
  CreateTestQuestionRequest,
  UpdateTestQuestionRequest,
  CreateTestAnswerRequest,
  UpdateTestAnswerRequest,
  CreateSchoolRequest,
  UpdateSchoolRequest,
  UpdateTeacherRequest,
  UpdateStudentRequest,
  AdminScenarioDto,
  AdminScenarioOptionDto,
  CreateScenarioRequest,
  UpdateScenarioRequest,
  CreateScenarioOptionRequest,
  UpdateScenarioOptionRequest,
  PublicSchoolDto,
  PublicTeacherDto,
  PublicClassDto
} from "./types";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://diploma.romasai.club";

type RequestOptions = {
  method?: "GET" | "POST";
  token?: string | null;
  body?: unknown;
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string; error?: string };
    return data.message || data.error || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export const api = {
  baseUrl: API_BASE_URL,

  login(payload: LoginRequest) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: payload
    });
  },

  registerTeacher(payload: RegisterTeacherRequest) {
    return request<AuthResponse>("/api/auth/register/teacher", {
      method: "POST",
      body: payload
    });
  },

  registerStudent(payload: RegisterStudentRequest) {
    return request<AuthResponse>("/api/auth/register/student", {
      method: "POST",
      body: payload
    });
  },

  me(token: string) {
    return request<MeResponse>("/api/me", { token });
  },

  getRiskStudents(token: string, testId: number, minZone: RiskZone) {
    const params = new URLSearchParams({
      testId: String(testId),
      minZone
    });
    return request<RiskStudent[]>(`/api/teacher/risk-students?${params.toString()}`, { token });
  },

  getTeacherStudents(token: string) {
    return request<TeacherStudent[]>("/api/teacher/students", { token });
  },

  getAttemptDetails(token: string, attemptId: number) {
    return request<TeacherAttemptDetails>(`/api/teacher/test-attempts/${attemptId}`, { token });
  },

  getTeacherStudentTestAttempts(token: string, studentId: number, testId: number) {
    return request<TeacherAttemptListItem[]>(
      `/api/teacher/tests/students/${studentId}/tests/${testId}/attempts`,
      { token }
    );
  },

  getTeacherStudentsLatestAttempts(token: string) {
    return request<TeacherStudentLatestAttempt[]>("/api/teacher/tests/students/latest", { token });
  },

  getTeacherStudentLatestTestResults(token: string, studentId: number) {
    return request<TeacherStudentTestAttemptSummary[]>(
      `/api/teacher/tests/students/${studentId}/results`,
      { token }
    );
  },

  getTeacherStudentsCourseProgress(token: string) {
    return request<TeacherStudentCourseProgress[]>("/api/teacher/students/course-progress", { token });
  },

  getCourses() {
    return request<Course[]>("/api/public/courses");
  },

  getCourseLessons(courseId: number) {
    return request<Lesson[]>(`/api/public/courses/${courseId}/lessons`);
  },

  getLesson(lessonId: number) {
    return request<Lesson>(`/api/public/lessons/${lessonId}`);
  },

  getCourseLessonProgress(token: string, courseId: number) {
    return request<StudentLessonProgress[]>(`/api/student/courses/${courseId}/lesson-progress`, {
      token
    });
  },

  getLessonScenario(token: string, courseId: number, lessonId: number) {
    return request<StudentLessonScenario>(
      `/api/student/courses/${courseId}/lessons/${lessonId}/scenario`,
      { token }
    );
  },

  getLessonScenarios(token: string, courseId: number, lessonId: number) {
    return request<StudentLessonScenarios>(
      `/api/student/courses/${courseId}/lessons/${lessonId}/scenarios`,
      { token }
    );
  },

  answerScenario(token: string, scenarioId: number, optionId: number) {
    return request<StudentScenarioAnswerResult>(`/api/student/scenarios/${scenarioId}/answer`, {
      method: "POST",
      token,
      body: { optionId }
    });
  },

  getStudentCourseProgress(token: string) {
    return request<StudentCourseProgress[]>("/api/student/course-progress", { token });
  },

  completeLesson(token: string, lessonId: number) {
    return request<LessonCompletionResponse>(`/api/student/lessons/${lessonId}/complete`, {
      method: "POST",
      token
    });
  },

  getStudentTests(token: string) {
    return request<TestListItem[]>("/api/student/tests", { token });
  },

  getStudentTest(token: string, testId: number) {
    return request<TestQuestion[]>(`/api/student/tests/${testId}`, { token });
  },

  startStudentAttempt(token: string, testId: number) {
    return request<StartAttemptResponse>(`/api/student/tests/${testId}/attempts/start`, {
      method: "POST",
      token
    });
  },

  answerStudentQuestion(token: string, attemptId: number, questionId: number, optionId: number) {
    return request<StudentAnswerResponse>(
      `/api/student/tests/attempts/${attemptId}/questions/${questionId}/answer`,
      {
        method: "POST",
        token,
        body: { optionId }
      }
    );
  },

  finishStudentAttempt(token: string, attemptId: number) {
    return request<FinishAttemptResponse>(`/api/student/tests/attempts/${attemptId}/finish`, {
      method: "POST",
      token
    });
  },

  getAdminDashboard(token: string) {
    return request<AdminDashboardDto>("/api/admin/dashboard", { token });
  },

  createCourse(token: string, data: CreateCourseRequest) {
    return request<AdminCourseDto>("/api/admin/courses/add", {
      method: "POST",
      token,
      body: data
    });
  },

  updateCourse(token: string, courseId: number, data: UpdateCourseRequest) {
    return request<AdminCourseDto>(`/api/admin/courses/update/${courseId}`, {
      method: "POST",
      token,
      body: data
    });
  },

  deleteCourse(token: string, courseId: number) {
    return request<{ success?: boolean }>(`/api/admin/courses/delete/${courseId}`, {
      method: "POST",
      token
    });
  },

  createLesson(token: string, data: CreateLessonRequest) {
    return request<AdminLessonDto>("/api/admin/lessons/add", {
      method: "POST",
      token,
      body: data
    });
  },

  updateLesson(token: string, lessonId: number, data: UpdateLessonRequest) {
    return request<AdminLessonDto>(`/api/admin/lessons/update/${lessonId}`, {
      method: "POST",
      token,
      body: data
    });
  },

  deleteLesson(token: string, lessonId: number) {
    return request<{ success?: boolean }>(`/api/admin/lessons/delete/${lessonId}`, {
      method: "POST",
      token
    });
  },

  createTest(token: string, data: CreateTestRequest) {
    return request<AdminTestDto>("/api/admin/tests/add", { method: "POST", token, body: data });
  },
  updateTest(token: string, id: number, data: UpdateTestRequest) {
    return request<AdminTestDto>(`/api/admin/tests/update/${id}`, { method: "POST", token, body: data });
  },
  deleteTest(token: string, id: number) {
    return request<{ success?: boolean }>(`/api/admin/tests/delete/${id}`, { method: "POST", token });
  },

  createTestCategory(token: string, data: CreateCategoryRequest) {
    return request<AdminTestCategoryDto>("/api/admin/test-categories/add", { method: "POST", token, body: data });
  },
  updateTestCategory(token: string, id: number, data: UpdateCategoryRequest) {
    return request<AdminTestCategoryDto>(`/api/admin/test-categories/update/${id}`, { method: "POST", token, body: data });
  },
  deleteTestCategory(token: string, id: number) {
    return request<{ success?: boolean }>(`/api/admin/test-categories/delete/${id}`, { method: "POST", token });
  },

  createCategoryZone(token: string, data: CreateCategoryZoneRequest) {
    return request<AdminCategoryZoneDto>("/api/admin/category-zones/add", { method: "POST", token, body: data });
  },
  updateCategoryZone(token: string, id: number, data: UpdateCategoryZoneRequest) {
    return request<AdminCategoryZoneDto>(`/api/admin/category-zones/update/${id}`, { method: "POST", token, body: data });
  },
  deleteCategoryZone(token: string, id: number) {
    return request<{ success?: boolean }>(`/api/admin/category-zones/delete/${id}`, { method: "POST", token });
  },

  createTestQuestion(token: string, data: CreateTestQuestionRequest) {
    return request<AdminTestQuestionDto>("/api/admin/test-questions/add", { method: "POST", token, body: data });
  },
  updateTestQuestion(token: string, id: number, data: UpdateTestQuestionRequest) {
    return request<AdminTestQuestionDto>(`/api/admin/test-questions/update/${id}`, { method: "POST", token, body: data });
  },
  deleteTestQuestion(token: string, id: number) {
    return request<{ success?: boolean }>(`/api/admin/test-questions/delete/${id}`, { method: "POST", token });
  },

  createTestAnswer(token: string, data: CreateTestAnswerRequest) {
    return request<AdminTestAnswerDto>("/api/admin/test-answers/add", { method: "POST", token, body: data });
  },
  updateTestAnswer(token: string, id: number, data: UpdateTestAnswerRequest) {
    return request<AdminTestAnswerDto>(`/api/admin/test-answers/update/${id}`, { method: "POST", token, body: data });
  },
  deleteTestAnswer(token: string, id: number) {
    return request<{ success?: boolean }>(`/api/admin/test-answers/delete/${id}`, { method: "POST", token });
  },

  createSchool(token: string, data: CreateSchoolRequest) {
    return request<AdminSchoolDto>("/api/admin/schools/add", { method: "POST", token, body: data });
  },
  updateSchool(token: string, id: number, data: UpdateSchoolRequest) {
    return request<AdminSchoolDto>(`/api/admin/schools/update/${id}`, { method: "POST", token, body: data });
  },
  deleteSchool(token: string, id: number) {
    return request<{ success?: boolean }>(`/api/admin/schools/delete/${id}`, { method: "POST", token });
  },

  updateTeacher(token: string, id: number, data: UpdateTeacherRequest) {
    return request<AdminTeacherDto>(`/api/admin/teachers/update/${id}`, { method: "POST", token, body: data });
  },
  deleteTeacher(token: string, id: number) {
    return request<{ success?: boolean }>(`/api/admin/teachers/delete/${id}`, { method: "POST", token });
  },

  updateStudent(token: string, id: number, data: UpdateStudentRequest) {
    return request<AdminStudentDto>(`/api/admin/students/update/${id}`, { method: "POST", token, body: data });
  },
  deleteStudent(token: string, id: number) {
    return request<{ success?: boolean }>(`/api/admin/students/delete/${id}`, { method: "POST", token });
  },

  createScenario(token: string, data: CreateScenarioRequest) {
    return request<AdminScenarioDto>("/api/admin/scenarios/add", { method: "POST", token, body: data });
  },

  updateScenario(token: string, id: number, data: UpdateScenarioRequest) {
    return request<AdminScenarioDto>(`/api/admin/scenarios/update/${id}`, { method: "POST", token, body: data });
  },

  deleteScenario(token: string, id: number) {
    return request<{ success?: boolean }>(`/api/admin/scenarios/delete/${id}`, { method: "POST", token });
  },

  createScenarioOption(token: string, data: CreateScenarioOptionRequest) {
    return request<AdminScenarioOptionDto>("/api/admin/scenario-options/add", { method: "POST", token, body: data });
  },

  updateScenarioOption(token: string, id: number, data: UpdateScenarioOptionRequest) {
    return request<AdminScenarioOptionDto>(`/api/admin/scenario-options/update/${id}`, { method: "POST", token, body: data });
  },

  deleteScenarioOption(token: string, id: number) {
    return request<{ success?: boolean }>(`/api/admin/scenario-options/delete/${id}`, { method: "POST", token });
  },

  uploadMedia(token: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return fetch(`${API_BASE_URL}/api/admin/media/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    }).then(res => {
      if (!res.ok) throw new Error("Failed to upload media");
      return res.json() as Promise<{ url: string }>;
    });
  },

  // Public registration endpoints
  getSchools() {
    return request<PublicSchoolDto[]>("/api/public/schools");
  },

  getTeachersBySchool(schoolId: number) {
    return request<PublicTeacherDto[]>(`/api/public/schools/${schoolId}/teachers`);
  },

  getClassesBySchool(schoolId: number) {
    return request<PublicClassDto[]>(`/api/public/schools/${schoolId}/classes`);
  }
};

export { ApiError };
