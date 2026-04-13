export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export type AuthResponse = {
  accessToken: string;
  userId: number;
  role: UserRole;
  fullName?: string;
  studentId?: number;  // Added for students
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterTeacherRequest = {
  fullName: string;
  email: string;
  password: string;
  schoolId: number;
};

export type RegisterStudentRequest = {
  fullName: string;
  email: string;
  password: string;
  schoolId: number;
  teacherId: number;
  className: string | null;
};

export type PublicSchoolDto = {
  id: number;
  name: string;
};

export type PublicTeacherDto = {
  id: number;
  fullName: string;
};

export type MeResponse = {
  userId: number | null;
  authorities: string[];
};

export type RiskZone = "GREEN" | "YELLOW" | "RED" | "BLACK";

export type RiskStudent = {
  studentId: number;
  studentName: string;
  className: string | null;
  attemptId: number;
  maxZone: RiskZone;
};

export type TeacherStudent = {
  id: number;
  fullName: string;
  className: string | null;
};

export type CategoryResult = {
  categoryId: number;
  categoryName: string;
  totalScore: number;
  zone: RiskZone;
};

export type AttemptAnswer = {
  questionId: number;
  orderNumber: number;
  categoryId: number;
  categoryName: string;
  questionText: string;
  selectedOptionId: number;
  selectedOptionText: string;
  score: number;
};

export type TeacherAttemptDetails = {
  attemptId: number;
  testId: number;
  testTitle: string;
  studentId: number;
  studentName: string;
  className: string | null;
  isFinished: boolean;
  startedAt: string;
  finishedAt: string | null;
  maxZone: RiskZone;
  categoryResults: CategoryResult[];
  answers: AttemptAnswer[];
};

export type TeacherLatestAttemptBrief = {
  attemptId: number;
  testId: number;
  testTitle: string;
  finishedAt: string | null;
  maxZone: RiskZone;
};

export type TeacherStudentLatestAttempt = {
  studentId: number;
  studentName: string;
  className: string | null;
  latestAttempt: TeacherLatestAttemptBrief | null;
};

export type TeacherStudentTestAttemptSummary = {
  attemptId: number;
  testId: number;
  testTitle: string;
  startedAt: string;
  finishedAt: string | null;
  maxZone: RiskZone;
  categoryResults: CategoryResult[];
};

export type TeacherAttemptListItem = {
  attemptId: number;
  startedAt: string;
  finishedAt: string | null;
  maxZone: RiskZone;
};

export type TeacherCourseProgress = {
  courseId: number;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  completed: boolean;
};

export type TeacherStudentCourseProgress = {
  studentId: number;
  studentName: string;
  className: string | null;
  courses: TeacherCourseProgress[];
};

export type Course = {
  id: number;
  title: string;
  description: string | null;
  ageGroup: string | null;
};

export type Lesson = {
  id: number;
  courseId: number;
  title: string;
  orderNumber: number;
  videoUrl: string | null;
  textContent: string | null;
};

export type StudentLessonProgress = {
  lessonId: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completedAt: string | null;
};

export type StudentCourseProgress = {
  courseId: number;
  totalLessons: number;
  completedLessons: number;
  completed: boolean;
};

export type StudentScenarioOption = {
  id: number;
  optionText: string;
};

export type StudentLessonScenario = {
  available: boolean;
  completed: boolean;
  hasScenario: boolean;
  scenarioId: number | null;
  title: string | null;
  description: string | null;
  baseImageUrl: string | null;
  options: StudentScenarioOption[];
  message: string | null;
  selectedOptionText: string | null;
  resultText: string | null;
  resultImageUrl: string | null;
};

export type StudentScenarioAnswerResult = {
  answerId: number;
  selectedOptionId: number;
  selectedOptionText: string | null;
  resultText: string | null;
  resultImageUrl: string | null;
};

export type TestListItem = {
  id: number;
  title: string;
  description: string | null;
};

export type TestOption = {
  id: number;
  text: string;
};

export type TestQuestion = {
  id: number;
  categoryId: number;
  categoryName: string;
  text: string;
  orderNumber: number;
  options: TestOption[];
};

export type StartAttemptResponse = {
  attemptId: number;
};

export type StudentAnswerResponse = {
  answerId: number;
  score: number;
};

export type LessonCompletionResponse = {
  lessonId: number;
  status: string;
  completedAt: string;
};

export type FinishAttemptResponse = {
  attemptId: number;
  results: CategoryResult[];
  maxZone: RiskZone;
};

export type AdminStudentDto = {
  id: number;
  fullName: string;
  className: string | null;
};

export type AdminTeacherDto = {
  id: number;
  fullName: string;
  students: AdminStudentDto[];
};

export type AdminSchoolDto = {
  id: number;
  name: string;
  teachers: AdminTeacherDto[];
};

export type AdminLessonDto = {
  id: number;
  title: string;
  orderNumber: number;
  videoPath: string | null;
  textContent: string | null;
};

export type AdminCourseDto = {
  id: number;
  title: string;
  description: string | null;
  ageGroup: string | null;
  lessons: AdminLessonDto[];
};

export type AdminTestAnswerDto = {
  id: number;
  text: string;
  score: number;
};

export type AdminTestQuestionDto = {
  id: number;
  text: string;
  orderNumber: number;
  answers: AdminTestAnswerDto[];
};

export type AdminCategoryZoneDto = {
  id: number;
  zone: string;
  minScore: number;
  maxScore: number;
  priority: number;
};

export type AdminTestCategoryDto = {
  id: number;
  name: string;
  description: string | null;
  zones: AdminCategoryZoneDto[];
  questions: AdminTestQuestionDto[];
};

export type AdminTestDto = {
  id: number;
  title: string;
  description: string | null;
  categories: AdminTestCategoryDto[];
};

export type AdminScenarioOptionDto = {
  id: number;
  optionText: string;
  resultText: string | null;
  resultImagePath: string | null;
  score: number;
};

export type AdminScenarioDto = {
  id: number;
  lessonId: number;
  title: string;
  description: string | null;
  baseImagePath: string | null;
  options: AdminScenarioOptionDto[];
};

export type AdminDashboardDto = {
  schools: AdminSchoolDto[];
  courses: AdminCourseDto[];
  tests: AdminTestDto[];
  scenarios: AdminScenarioDto[];
};

export type CreateSchoolRequest = { name: string; address?: string };
export type UpdateSchoolRequest = { name?: string; address?: string };
export type UpdateTeacherRequest = { fullName?: string };
export type UpdateStudentRequest = { fullName?: string; className?: string };

export type CreateCourseRequest = {
  title: string;
  description?: string;
  ageGroup?: string;
};

export type UpdateCourseRequest = {
  title?: string;
  description?: string;
  ageGroup?: string;
};

export type CreateLessonRequest = {
  courseId: number;
  title: string;
  videoPath?: string;
  textContent?: string;
  orderNumber?: number;
};

export type UpdateLessonRequest = {
  title?: string;
  videoPath?: string;
  textContent?: string;
  orderNumber?: number;
};

export type CreateTestRequest = { title: string; description?: string };
export type UpdateTestRequest = { title?: string; description?: string };

export type CreateCategoryRequest = { testId: number; name: string; description?: string };
export type UpdateCategoryRequest = { name?: string; description?: string };

export type CreateCategoryZoneRequest = { categoryId: number; zone: string; minScore: number; maxScore: number; priority: number };
export type UpdateCategoryZoneRequest = { zone?: string; minScore?: number; maxScore?: number; priority?: number };

export type CreateTestQuestionRequest = { testId: number; categoryId: number; text: string; orderNumber: number };
export type UpdateTestQuestionRequest = { text?: string; orderNumber?: number };

export type CreateTestAnswerRequest = { questionId: number; text: string; score: number };
export type UpdateTestAnswerRequest = { text?: string; score?: number };

export type CreateScenarioRequest = { lessonId: number; title: string; description?: string; baseImagePath?: string };
export type UpdateScenarioRequest = { title?: string; description?: string; baseImagePath?: string };
export type CreateScenarioOptionRequest = { scenarioId: number; optionText: string; resultText?: string; resultImagePath?: string; score: number };
export type UpdateScenarioOptionRequest = { optionText?: string; resultText?: string; resultImagePath?: string; score?: number };
