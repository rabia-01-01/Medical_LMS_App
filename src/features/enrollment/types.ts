// ============================================================================
// PHASE 7: STUDENT ENROLLMENT & BATCH MANAGEMENT TYPES
// ============================================================================

export interface CourseEnrollment {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrolledAt: string;
  enrolledBy: 'self' | 'faculty' | 'admin';
  enrolledByName?: string;
  status: 'active' | 'completed' | 'dropped';
}

export interface BatchInfo {
  id: string;
  name: string;
  classId?: string;
  examId?: string;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  enrolledCount: number;
}

export interface StudentEnrollmentSummary {
  studentId: string;
  enrolledCourseIds: string[];
  enrolledCoursesCount: number;
  availableCoursesCount: number;
  targetExam?: string;
}

export interface CourseWithEnrollmentStatus {
  id: string;
  name: string;
  category: string; // NEET, IMAT, UCAT, MCAT
  description: string;
  subjects: string[];
  duration: string;
  icon: string;
  color: string;
  isEnrolled: boolean;
  isUploadedByAdmin: boolean;
  studentCount: number;
  facultyCount: number;
}
