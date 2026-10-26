import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as studentService from '../api/studentService.js';
import * as courseService from '../api/courseService.js';
import * as sessionService from '../api/sessionService.js';
import * as assignmentService from '../api/assignmentService.js';
import * as gradeService from '../api/gradeService.js';
import { getCache, setCache } from '../storage/cache.js';
import { STORAGE_KEYS } from '../storage/keys.js';
import { checkOnlineStatus } from '../hooks/useNetworkStatus.js';
import * as outboxStorage from '../storage/outbox.js';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  // Dữ liệu chính của 5 tài nguyên
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);

  // Thời điểm cập nhật cuối (timestamp ms)
  const [lastUpdated, setLastUpdated] = useState(null);

  // Trạng thái tải & lỗi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Đọc toàn bộ bộ nhớ đệm ban đầu (Cache First)
   * Trả về boolean cho biết đã có ít nhất một phần dữ liệu trong cache hay chưa
   */
  const loadFromCache = useCallback(async () => {
    try {
      const [
        cachedStudent,
        cachedCourses,
        cachedSessions,
        cachedAssignments,
        cachedGrades,
      ] = await Promise.all([
        getCache(STORAGE_KEYS.CACHE_STUDENT),
        getCache(STORAGE_KEYS.CACHE_COURSES),
        getCache(STORAGE_KEYS.CACHE_SESSIONS),
        getCache(STORAGE_KEYS.CACHE_ASSIGNMENTS),
        getCache(STORAGE_KEYS.CACHE_GRADES),
      ]);

      let hasData = false;
      let maxSavedAt = 0;

      if (cachedStudent && cachedStudent.data) {
        setStudent(cachedStudent.data);
        hasData = true;
        if (cachedStudent.savedAt > maxSavedAt) maxSavedAt = cachedStudent.savedAt;
      }
      if (cachedCourses && Array.isArray(cachedCourses.data)) {
        setCourses(cachedCourses.data);
        hasData = true;
        if (cachedCourses.savedAt > maxSavedAt) maxSavedAt = cachedCourses.savedAt;
      }
      if (cachedSessions && Array.isArray(cachedSessions.data)) {
        setSessions(cachedSessions.data);
        hasData = true;
        if (cachedSessions.savedAt > maxSavedAt) maxSavedAt = cachedSessions.savedAt;
      }
      if (cachedAssignments && Array.isArray(cachedAssignments.data)) {
        setAssignments(cachedAssignments.data);
        hasData = true;
        if (cachedAssignments.savedAt > maxSavedAt) maxSavedAt = cachedAssignments.savedAt;
      }
      if (cachedGrades && Array.isArray(cachedGrades.data)) {
        setGrades(cachedGrades.data);
        hasData = true;
        if (cachedGrades.savedAt > maxSavedAt) maxSavedAt = cachedGrades.savedAt;
      }

      if (maxSavedAt > 0) {
        setLastUpdated(maxSavedAt);
      }

      return hasData;
    } catch (err) {
      console.warn('[AppDataContext] Lỗi khi nạp dữ liệu từ cache ban đầu:', err);
      return false;
    }
  }, []);

  /**
   * Đồng bộ toàn bộ dữ liệu mới nhất từ API và cập nhật Cache (Network After)
   * Bảo đảm merge thông minh với các hành động pending trong Outbox, không để GET ghi đè mất thay đổi offline
   */
  const fetchAndCacheAll = useCallback(async () => {
    try {
      const [
        freshStudent,
        freshCourses,
        freshSessions,
        freshAssignments,
        freshGrades,
        pendingActions,
      ] = await Promise.all([
        studentService.getById(1),
        courseService.getAll(),
        sessionService.getAll(),
        assignmentService.getAll(),
        gradeService.getAll(),
        outboxStorage.getAll(),
      ]);

      let mergedStudent = freshStudent;
      let mergedAssignments = [...freshAssignments];

      // Áp dụng các thay đổi đang chờ trong outbox lên dữ liệu mới lấy về
      if (pendingActions && pendingActions.length > 0) {
        for (const act of pendingActions) {
          if (act.type === 'UPDATE_STUDENT' && act.body) {
            mergedStudent = { ...mergedStudent, ...act.body, pending: true };
          } else if (act.type === 'UPDATE_ASSIGNMENT_STATUS' && act.body) {
            const actId = act.body.id || act.url.split('/').pop();
            mergedAssignments = mergedAssignments.map(item =>
              String(item.id) === String(actId)
                ? { ...item, status: act.body.status, pending: true }
                : item
            );
          } else if (act.type === 'CREATE_ASSIGNMENT' && act.body) {
            const exists = mergedAssignments.some(item => String(item.id) === String(act.body.id));
            if (!exists) {
              const course = freshCourses.find(c => Number(c.id) === Number(act.body.courseId));
              mergedAssignments.push({
                ...act.body,
                pending: true,
                course: course || null,
              });
            }
          }
        }
      }

      // Sắp xếp bài tập theo hạn chót dueDate
      mergedAssignments.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

      const now = Date.now();

      // Cập nhật State
      setStudent(mergedStudent);
      setCourses(freshCourses);
      setSessions(freshSessions);
      setAssignments(mergedAssignments);
      setGrades(freshGrades);
      setLastUpdated(now);
      setError(null);

      // Lưu đè dữ liệu mới vào AsyncStorage (kèm dữ liệu pending đã merge)
      await Promise.all([
        setCache(STORAGE_KEYS.CACHE_STUDENT, mergedStudent),
        setCache(STORAGE_KEYS.CACHE_COURSES, freshCourses),
        setCache(STORAGE_KEYS.CACHE_SESSIONS, freshSessions),
        setCache(STORAGE_KEYS.CACHE_ASSIGNMENTS, mergedAssignments),
        setCache(STORAGE_KEYS.CACHE_GRADES, freshGrades),
      ]);

      return true;
    } catch (apiErr) {
      console.warn('[AppDataContext] Gọi API đồng bộ thất bại:', apiErr.message);
      throw apiErr;
    }
  }, []);

  /**
   * Khởi động quy trình "Cache trước, Mạng sau"
   */
  const refreshAll = useCallback(async () => {
    // 1. Luôn đọc toàn bộ dữ liệu từ cache trước (Cache First)
    const hasCachedData = await loadFromCache();
    if (hasCachedData) {
      setLoading(false);
    } else {
      setLoading(true);
    }

    // 2. Kiểm tra trạng thái mạng thực tế tại thời điểm gọi
    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      if (!hasCachedData) {
        setError('Bạn đang offline và chưa có dữ liệu lưu tạm.');
      } else {
        setError(null);
      }
      setLoading(false);
      return;
    }

    // 3. Chỉ khi thiết bị thực sự có mạng mới gửi request API
    try {
      await fetchAndCacheAll();
    } catch (err) {
      if (!hasCachedData) {
        setError(err?.message || 'Không thể kết nối đến máy chủ và chưa có dữ liệu lưu tạm.');
      }
    } finally {
      setLoading(false);
    }
  }, [loadFromCache, fetchAndCacheAll]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  /**
   * Cập nhật thông tin sinh viên (Hỗ trợ Offline Outbox & Online API)
   */
  const updateStudent = useCallback(async (formData) => {
    const prev = student;
    const nowIso = new Date().toISOString();
    const isOnline = await checkOnlineStatus();

    // TRƯỜNG HỢP 1: Thiết bị đang Offline -> Lưu vào Outbox
    if (!isOnline) {
      const offlineUpdated = { ...prev, ...formData, updatedAt: nowIso, pending: true };
      setStudent(offlineUpdated);
      setLastUpdated(Date.now());
      await setCache(STORAGE_KEYS.CACHE_STUDENT, offlineUpdated);
      await outboxStorage.enqueue({
        method: 'PATCH',
        url: '/students/1',
        body: { ...formData, updatedAt: nowIso },
        type: 'UPDATE_STUDENT',
        createdAt: Date.now(),
      });
      return offlineUpdated;
    }

    // TRƯỜNG HỢP 2: Thiết bị Online -> Gửi trực tiếp lên API
    const optimistic = { ...prev, ...formData, updatedAt: nowIso };
    setStudent(optimistic);

    try {
      const updated = await studentService.update(1, {
        ...formData,
        updatedAt: nowIso,
      });
      setStudent(updated);
      setLastUpdated(Date.now());
      await setCache(STORAGE_KEYS.CACHE_STUDENT, updated);
      return updated;
    } catch (err) {
      // Nếu rớt mạng đột ngột (network/timeout error) -> Fallback lưu vào Outbox
      if (err?.type === 'network' || err?.type === 'timeout') {
        const fallbackUpdated = { ...prev, ...formData, updatedAt: nowIso, pending: true };
        setStudent(fallbackUpdated);
        await setCache(STORAGE_KEYS.CACHE_STUDENT, fallbackUpdated);
        await outboxStorage.enqueue({
          method: 'PATCH',
          url: '/students/1',
          body: { ...formData, updatedAt: nowIso },
          type: 'UPDATE_STUDENT',
          createdAt: Date.now(),
        });
        return fallbackUpdated;
      }

      // Lỗi HTTP 4xx/5xx: Hoàn tác và ném lỗi
      setStudent(prev);
      Alert.alert('Lỗi cập nhật', err.message || 'Không thể lưu thông tin lên máy chủ.');
      throw err;
    }
  }, [student]);

  /**
   * Đổi trạng thái bài tập (Hỗ trợ Offline Outbox & Online Optimistic Update)
   */
  const toggleAssignmentStatus = useCallback(async (id) => {
    const target = assignments.find(a => String(a.id) === String(id));
    if (!target) return;

    const previousStatus = target.status;
    const nextStatus = previousStatus === 'todo' ? 'done' : 'todo';
    const nowIso = new Date().toISOString();

    const isOnline = await checkOnlineStatus();

    // TRƯỜNG HỢP 1: Thiết bị Offline -> Lưu Outbox
    if (!isOnline) {
      const offlineList = assignments.map(item =>
        String(item.id) === String(id)
          ? { ...item, status: nextStatus, updatedAt: nowIso, pending: true }
          : item
      );
      setAssignments(offlineList);
      setLastUpdated(Date.now());
      await setCache(STORAGE_KEYS.CACHE_ASSIGNMENTS, offlineList);
      await outboxStorage.enqueue({
        method: 'PATCH',
        url: `/assignments/${id}`,
        body: { id, status: nextStatus, updatedAt: nowIso },
        type: 'UPDATE_ASSIGNMENT_STATUS',
        createdAt: Date.now(),
      });
      return;
    }

    // TRƯỜNG HỢP 2: Thiết bị Online -> Optimistic update lên server
    const optimisticList = assignments.map(item =>
      String(item.id) === String(id)
        ? { ...item, status: nextStatus, updatedAt: nowIso }
        : item
    );
    setAssignments(optimisticList);

    try {
      const updated = await assignmentService.updateStatus(id, nextStatus, nowIso);
      const finalList = assignments.map(item =>
        String(item.id) === String(id) ? { ...item, ...updated, pending: false } : item
      );
      setAssignments(finalList);
      setLastUpdated(Date.now());
      await setCache(STORAGE_KEYS.CACHE_ASSIGNMENTS, finalList);
    } catch (err) {
      if (err?.type === 'network' || err?.type === 'timeout') {
        const fallbackList = assignments.map(item =>
          String(item.id) === String(id)
            ? { ...item, status: nextStatus, updatedAt: nowIso, pending: true }
            : item
        );
        setAssignments(fallbackList);
        await setCache(STORAGE_KEYS.CACHE_ASSIGNMENTS, fallbackList);
        await outboxStorage.enqueue({
          method: 'PATCH',
          url: `/assignments/${id}`,
          body: { id, status: nextStatus, updatedAt: nowIso },
          type: 'UPDATE_ASSIGNMENT_STATUS',
          createdAt: Date.now(),
        });
        return;
      }

      // Hoàn tác nếu lỗi HTTP 4xx/5xx
      setAssignments(assignments);
      Alert.alert(
        'Lỗi cập nhật bài tập',
        'Không thể cập nhật trạng thái bài tập lên máy chủ. Giao diện đã được hoàn tác.'
      );
    }
  }, [assignments]);

  /**
   * Thêm bài tập mới (Hỗ trợ Offline Outbox với ID tạm & Online POST)
   */
  const addAssignment = useCallback(async (newAssignmentData) => {
    const isOnline = await checkOnlineStatus();
    const nowIso = new Date().toISOString();

    // TRƯỜNG HỢP 1: Thiết bị Offline -> Cấp ID tạm và đưa vào Outbox
    if (!isOnline) {
      const tempId = `temp-${Date.now()}`;
      const course = courses.find(c => Number(c.id) === Number(newAssignmentData.courseId));
      const offlineItem = {
        ...newAssignmentData,
        id: tempId,
        courseId: Number(newAssignmentData.courseId),
        status: newAssignmentData.status || 'todo',
        updatedAt: nowIso,
        pending: true,
        course: course || null,
      };

      const updatedList = [...assignments, offlineItem].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
      setAssignments(updatedList);
      setLastUpdated(Date.now());
      await setCache(STORAGE_KEYS.CACHE_ASSIGNMENTS, updatedList);

      await outboxStorage.enqueue({
        id: `act-create-${tempId}`,
        method: 'POST',
        url: '/assignments',
        body: {
          id: tempId,
          courseId: Number(newAssignmentData.courseId),
          title: newAssignmentData.title,
          description: newAssignmentData.description || '',
          dueDate: newAssignmentData.dueDate,
          status: newAssignmentData.status || 'todo',
          updatedAt: nowIso,
        },
        type: 'CREATE_ASSIGNMENT',
        createdAt: Date.now(),
      });

      return offlineItem;
    }

    // TRƯỜNG HỢP 2: Thiết bị Online -> Gọi POST API
    try {
      const created = await assignmentService.create({
        ...newAssignmentData,
        status: newAssignmentData.status || 'todo',
        updatedAt: nowIso,
      });

      const freshAssignments = await assignmentService.getAll();
      setAssignments(freshAssignments);
      setLastUpdated(Date.now());
      await setCache(STORAGE_KEYS.CACHE_ASSIGNMENTS, freshAssignments);
      return created;
    } catch (err) {
      if (err?.type === 'network' || err?.type === 'timeout') {
        const tempId = `temp-${Date.now()}`;
        const course = courses.find(c => Number(c.id) === Number(newAssignmentData.courseId));
        const offlineItem = {
          ...newAssignmentData,
          id: tempId,
          courseId: Number(newAssignmentData.courseId),
          status: newAssignmentData.status || 'todo',
          updatedAt: nowIso,
          pending: true,
          course: course || null,
        };
        const updatedList = [...assignments, offlineItem].sort(
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        setAssignments(updatedList);
        await setCache(STORAGE_KEYS.CACHE_ASSIGNMENTS, updatedList);
        await outboxStorage.enqueue({
          id: `act-create-${tempId}`,
          method: 'POST',
          url: '/assignments',
          body: {
            id: tempId,
            courseId: Number(newAssignmentData.courseId),
            title: newAssignmentData.title,
            description: newAssignmentData.description || '',
            dueDate: newAssignmentData.dueDate,
            status: newAssignmentData.status || 'todo',
            updatedAt: nowIso,
          },
          type: 'CREATE_ASSIGNMENT',
          createdAt: Date.now(),
        });
        return offlineItem;
      }

      Alert.alert('Lỗi thêm bài tập', err.message || 'Không thể tạo bài tập mới.');
      throw err;
    }
  }, [assignments, courses]);

  /**
   * Đếm số bài tập chưa hoàn thành cho TabBadge
   */
  const uncompletedAssignmentsCount = assignments.filter(
    item => item && item.status === 'todo'
  ).length;

  /**
   * Các hàm lấy chi tiết có hỗ trợ Cache First cho 4 màn hình chi tiết
   */
  const getCourseDetail = useCallback(async (id) => {
    const cacheKey = STORAGE_KEYS.CACHE_COURSE_DETAIL(id);
    const cached = await getCache(cacheKey);

    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      if (cached && cached.data) return cached.data;
      const fromList = courses.find(c => Number(c.id) === Number(id));
      if (fromList) return fromList;
      throw new Error('Bạn đang offline và chưa có dữ liệu môn học này.');
    }

    try {
      const fresh = await courseService.getById(id);
      await setCache(cacheKey, fresh);
      return fresh;
    } catch (err) {
      if (cached && cached.data) return cached.data;
      const fromList = courses.find(c => Number(c.id) === Number(id));
      if (fromList) return fromList;
      throw err;
    }
  }, [courses]);

  const getSessionDetail = useCallback(async (id) => {
    const cacheKey = STORAGE_KEYS.CACHE_SESSION_DETAIL(id);
    const cached = await getCache(cacheKey);

    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      if (cached && cached.data) return cached.data;
      const fromList = sessions.find(s => Number(s.id) === Number(id));
      if (fromList) return fromList;
      throw new Error('Bạn đang offline và chưa có dữ liệu buổi học này.');
    }

    try {
      const fresh = await sessionService.getById(id);
      await setCache(cacheKey, fresh);
      return fresh;
    } catch (err) {
      if (cached && cached.data) return cached.data;
      const fromList = sessions.find(s => Number(s.id) === Number(id));
      if (fromList) return fromList;
      throw err;
    }
  }, [sessions]);

  const getAssignmentDetail = useCallback(async (id) => {
    const cacheKey = STORAGE_KEYS.CACHE_ASSIGNMENT_DETAIL(id);
    const cached = await getCache(cacheKey);

    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      if (cached && cached.data) return cached.data;
      const fromList = assignments.find(a => String(a.id) === String(id));
      if (fromList) return fromList;
      throw new Error('Bạn đang offline và chưa có dữ liệu bài tập này.');
    }

    try {
      const fresh = await assignmentService.getById(id);
      await setCache(cacheKey, fresh);
      return fresh;
    } catch (err) {
      if (cached && cached.data) return cached.data;
      const fromList = assignments.find(a => String(a.id) === String(id));
      if (fromList) return fromList;
      throw err;
    }
  }, [assignments]);

  const getGradeDetail = useCallback(async (id) => {
    const cacheKey = STORAGE_KEYS.CACHE_GRADE_DETAIL(id);
    const cached = await getCache(cacheKey);

    const isOnline = await checkOnlineStatus();
    if (!isOnline) {
      if (cached && cached.data) return cached.data;
      const fromList = grades.find(g => Number(g.id) === Number(id));
      if (fromList) return fromList;
      throw new Error('Bạn đang offline và chưa có dữ liệu kết quả học tập này.');
    }

    try {
      const fresh = await gradeService.getById(id);
      await setCache(cacheKey, fresh);
      return fresh;
    } catch (err) {
      if (cached && cached.data) return cached.data;
      const fromList = grades.find(g => Number(g.id) === Number(id));
      if (fromList) return fromList;
      throw err;
    }
  }, [grades]);

  const value = {
    student,
    updateStudent,

    courses,
    getCourseDetail,

    sessions,
    getSessionDetail,

    assignments,
    getAssignmentDetail,
    toggleAssignmentStatus,
    addAssignment,
    uncompletedAssignmentsCount,

    grades,
    getGradeDetail,

    lastUpdated,
    loading,
    error,
    refreshAll,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData phải được sử dụng bên trong AppDataProvider');
  }
  return context;
}

export default AppDataContext;
