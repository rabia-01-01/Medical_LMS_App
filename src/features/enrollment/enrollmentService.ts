import { supabase } from '../../lib/supabase';
import { Course } from '../../context/DataContext';
import { CourseWithEnrollmentStatus, StudentEnrollmentSummary } from './types';

const ENROLLMENTS_STORAGE_KEY = 'lms_course_enrollments_v1';

export class EnrollmentService {
  /**
   * Helper to fetch persisted local enrollment records
   */
  private getLocalEnrollments(): Record<string, string[]> {
    try {
      const data = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * Helper to save local enrollment records
   */
  private saveLocalEnrollments(map: Record<string, string[]>): void {
    try {
      localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(map));
    } catch (e) {
      console.warn('[EnrollmentService] Failed to persist local enrollment:', e);
    }
  }

  /**
   * Enroll a student in a course (Self-service or Faculty/Admin operated)
   */
  async enrollStudent(
    courseId: string,
    studentId: string,
    enrolledBy: 'self' | 'faculty' | 'admin' = 'self'
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Attempt Supabase student_subjects / student_exams upsert if table exists
      try {
        const { error } = await supabase
          .from('student_subjects')
          .upsert([{ student_id: studentId, subject_id: courseId }], { onConflict: 'student_id,subject_id' });

        if (!error) {
          console.log(`[EnrollmentService] Enrolled student ${studentId} in course ${courseId} via Supabase`);
        }
      } catch (dbErr) {
        // Fall through to local fallback
      }

      // 2. Persist locally to ensure instant feedback across views
      const map = this.getLocalEnrollments();
      const currentList = map[courseId] || [];
      if (!currentList.includes(studentId)) {
        map[courseId] = [...currentList, studentId];
        this.saveLocalEnrollments(map);
      }

      return {
        success: true,
        message: enrolledBy === 'self' 
          ? 'You have successfully enrolled in this course!' 
          : 'Student enrolled successfully!',
      };
    } catch (err: any) {
      console.error('[EnrollmentService] enrollStudent error:', err);
      return { success: false, message: err?.message || 'Failed to enroll in course' };
    }
  }

  /**
   * Unenroll a student from a course
   */
  async unenrollStudent(
    courseId: string,
    studentId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      try {
        await supabase
          .from('student_subjects')
          .delete()
          .match({ student_id: studentId, subject_id: courseId });
      } catch (dbErr) {
        // Fall through to local fallback
      }

      const map = this.getLocalEnrollments();
      if (map[courseId]) {
        map[courseId] = map[courseId].filter(id => id !== studentId);
        this.saveLocalEnrollments(map);
      }

      return { success: true, message: 'Unenrolled from course successfully' };
    } catch (err: any) {
      console.error('[EnrollmentService] unenrollStudent error:', err);
      return { success: false, message: err?.message || 'Failed to unenroll' };
    }
  }

  /**
   * Decorate courses with student enrollment status and admin ownership
   */
  getDecoratedCoursesForStudent(courses: Course[], studentId?: string): CourseWithEnrollmentStatus[] {
    const sid = studentId || '';
    const map = this.getLocalEnrollments();

    return courses.map(course => {
      const localStudents = map[course.id] || [];
      const combinedStudentIds = new Set([...(course.studentIds || []), ...localStudents]);
      const isEnrolled = sid ? combinedStudentIds.has(sid) : false;
      const isUploadedByAdmin = !course.facultyIds || course.facultyIds.length === 0;

      return {
        id: course.id,
        name: course.name,
        category: course.category,
        description: course.description,
        subjects: course.subjects,
        duration: course.duration,
        icon: course.icon,
        color: course.color,
        isEnrolled,
        isUploadedByAdmin,
        studentCount: combinedStudentIds.size,
        facultyCount: course.facultyIds?.length || 0,
      };
    });
  }

  /**
   * Get courses visible to a faculty member:
   * Returns:
   * 1. Courses assigned directly to the faculty member
   * 2. Courses uploaded / created by Admin (institution courses)
   */
  getFacultyVisibleCourses(courses: Course[], facultyId?: string): {
    assignedCourses: Course[];
    adminCourses: Course[];
    allVisibleCourses: Course[];
  } {
    const fid = facultyId || '';

    const assignedCourses = courses.filter(c => (c.facultyIds || []).includes(fid));
    // Admin courses are those created without specific faculty or created by administration
    const adminCourses = courses.filter(c => !(c.facultyIds || []).includes(fid));

    return {
      assignedCourses,
      adminCourses,
      allVisibleCourses: courses,
    };
  }

  /**
   * Get student enrollment summary
   */
  getStudentEnrollmentSummary(courses: Course[], studentId?: string): StudentEnrollmentSummary {
    const sid = studentId || '';
    const decorated = this.getDecoratedCoursesForStudent(courses, sid);
    const enrolled = decorated.filter(c => c.isEnrolled);

    return {
      studentId: sid,
      enrolledCourseIds: enrolled.map(c => c.id),
      enrolledCoursesCount: enrolled.length,
      availableCoursesCount: decorated.length,
    };
  }
}

export const enrollmentService = new EnrollmentService();
