/**
 * Các khóa định danh (keys) dùng cho AsyncStorage
 */
export const STORAGE_KEYS = {
  // Bộ nhớ đệm (Cache) cho các tài nguyên danh sách
  CACHE_STUDENT: 'cache:students:1',
  CACHE_COURSES: 'cache:courses',
  CACHE_SESSIONS: 'cache:sessions',
  CACHE_ASSIGNMENTS: 'cache:assignments',
  CACHE_GRADES: 'cache:grades',

  // Bộ nhớ đệm cho các màn hình chi tiết
  CACHE_COURSE_DETAIL: id => `cache:courses:${id}`,
  CACHE_SESSION_DETAIL: id => `cache:sessions:${id}`,
  CACHE_ASSIGNMENT_DETAIL: id => `cache:assignments:${id}`,
  CACHE_GRADE_DETAIL: id => `cache:grades:${id}`,

  // Hàng đợi thao tác ngoại tuyến (Outbox Queue - dành cho Bước 5)
  OUTBOX_QUEUE: 'outbox:queue',
};

export default STORAGE_KEYS;

