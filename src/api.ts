import type {
  AuthResponse,
  Course,
  FinishAttemptResponse,
  Lesson,
  LessonCompletionResponse,
  LoginRequest,
  MeResponse,
  RegisterStudentRequest,
  RegisterTeacherRequest,
  RiskStudent,
  RiskZone,
  StartAttemptResponse,
  StudentAnswerResponse,
  TeacherAttemptDetails,
  TeacherStudent,
  TestListItem,
  TestQuestion,
  AdminDashboardDto,
  AdminCourseDto,
  AdminLessonDto,
  AdminTestDto,
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
  UpdateTestAnswerRequest
} from "./types";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8081";

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

  getCourses() {
    return request<Course[]>("/api/public/courses");
  },

  getCourseLessons(courseId: number) {
    return request<Lesson[]>(`/api/public/courses/${courseId}/lessons`);
  },

  getLesson(lessonId: number) {
    return request<Lesson>(`/api/public/lessons/${lessonId}`);
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
  }
};

export { ApiError };
