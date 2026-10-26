/**
 * Định nghĩa tập trung tên các màn hình và Tab trong ứng dụng
 * Tuân thủ quy tắc 1 mục 3: Không viết chuỗi trực tiếp khi gọi navigate
 */
export const ROUTES = {
  // 5 Tab chính
  TABS: {
    HOME: 'HomeTab',
    COURSES: 'CoursesTab',
    SCHEDULE: 'ScheduleTab',
    ASSIGNMENTS: 'AssignmentsTab',
    PROFILE: 'ProfileTab',
  },

  // Màn hình trong Tab Tổng quan
  HOME: {
    MAIN: 'HomeScreen',
    COURSE_DETAIL: 'HomeCourseDetail',
    ASSIGNMENT_DETAIL: 'HomeAssignmentDetail',
  },

  // Màn hình trong Tab Môn học
  COURSES: {
    LIST: 'CourseListScreen',
    DETAIL: 'CourseDetailScreen',
  },

  // Màn hình trong Tab Thời khóa biểu
  SCHEDULE: {
    MAIN: 'ScheduleScreen',
    DETAIL: 'SessionDetailScreen',
  },

  // Màn hình trong Tab Bài tập
  ASSIGNMENTS: {
    LIST: 'AssignmentListScreen',
    DETAIL: 'AssignmentDetailScreen',
    FORM: 'AssignmentFormScreen',
  },

  // Màn hình trong Tab Cá nhân
  PROFILE: {
    MAIN: 'ProfileScreen',
    EDIT: 'EditProfileScreen',
    GRADE_LIST: 'GradeListScreen',
    GRADE_DETAIL: 'GradeDetailScreen',
  },
};

export default ROUTES;
