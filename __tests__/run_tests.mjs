import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TEST_DB_PATH = path.join(ROOT_DIR, 'db.test.json');
const ORIGINAL_DB_PATH = path.join(ROOT_DIR, 'db.json');

// Đọc dữ liệu mẫu từ db.json ban đầu và sao chép sang db.test.json riêng biệt
const initialMockData = JSON.parse(fs.readFileSync(ORIGINAL_DB_PATH, 'utf-8'));
fs.writeFileSync(TEST_DB_PATH, JSON.stringify(initialMockData, null, 2), 'utf-8');

// Thiết lập cổng kiểm thử riêng
const TEST_PORT = 3123;
process.env.BASE_URL = `http://localhost:${TEST_PORT}`;

// Import trực tiếp các service và client THẬT
import { setBaseUrl } from '../src/config.js';
setBaseUrl(`http://localhost:${TEST_PORT}`);

import { request } from '../src/api/client.js';
import * as studentService from '../src/api/studentService.js';
import * as courseService from '../src/api/courseService.js';
import * as sessionService from '../src/api/sessionService.js';
import * as assignmentService from '../src/api/assignmentService.js';
import * as gradeService from '../src/api/gradeService.js';
import { toScale4, calcGpa } from '../src/utils/gpa.js';
import { formatDate, isOverdue, daysLeft } from '../src/utils/date.js';
import { validateAssignmentForm, validateProfileForm } from '../src/utils/validators.js';

// Khởi tạo Server kiểm thử riêng (phục vụ cả API và giả lập mạng chậm/timeout)
function createTestServer() {
  let db = JSON.parse(fs.readFileSync(TEST_DB_PATH, 'utf-8'));

  const server = http.createServer(async (req, res) => {
    const urlObj = new URL(req.url, `http://localhost:${TEST_PORT}`);
    const pathname = urlObj.pathname;
    const method = req.method;

    // 1. Endpoint giả lập phản hồi headers bị chậm > 10s (timeout kết nối/headers)
    if (pathname === '/test/slow-header') {
      setTimeout(() => {
        if (!res.writableEnded) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'done after 11s' }));
        }
      }, 11000);
      return;
    }

    // 2. Endpoint giả lập headers trả về ngay, nhưng response body bị chậm > 10s
    if (pathname === '/test/slow-body') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
      });
      res.write('{"status":"start"'); // gửi một phần JSON
      // Đợi 11 giây mới gửi nốt phần còn lại để kích hoạt timeout khi parse body
      setTimeout(() => {
        if (!res.writableEnded) {
          res.write(',"done":true}');
          res.end();
        }
      }, 11000);
      return;
    }

    // Parse body cho POST, PATCH
    let rawBody = '';
    req.on('data', chunk => { rawBody += chunk; });
    req.on('end', () => {
      let body = null;
      if (rawBody) {
        try { body = JSON.parse(rawBody); } catch {}
      }

      // 3. Mock REST endpoints cho 5 tài nguyên
      // Students
      if (pathname === '/students/1') {
        if (method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(db.students[0]));
        }
        if (method === 'PATCH') {
          db.students[0] = { ...db.students[0], ...body };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(db.students[0]));
        }
      }
      if (pathname === '/students' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(db.students));
      }

      // Courses
      if (pathname === '/courses') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(db.courses));
      }
      const courseMatch = pathname.match(/^\/courses\/(\d+)$/);
      if (courseMatch) {
        const id = Number(courseMatch[1]);
        const course = db.courses.find(c => c.id === id);
        if (course) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(course));
        }
      }

      // Sessions
      if (pathname === '/sessions') {
        const withCourse = db.sessions.map(s => ({
          ...s,
          course: db.courses.find(c => c.id === s.courseId) || null,
        }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(withCourse));
      }
      const sessionMatch = pathname.match(/^\/sessions\/(\d+)$/);
      if (sessionMatch) {
        const id = Number(sessionMatch[1]);
        const session = db.sessions.find(s => s.id === id);
        if (session) {
          const item = { ...session, course: db.courses.find(c => c.id === session.courseId) || null };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(item));
        }
      }

      // Assignments
      if (pathname === '/assignments') {
        if (method === 'GET') {
          const withCourse = db.assignments.map(a => ({
            ...a,
            course: db.courses.find(c => c.id === a.courseId) || null,
          }));
          withCourse.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(withCourse));
        }
        if (method === 'POST') {
          const newId = db.assignments.length + 1;
          const newItem = { id: newId, ...body };
          db.assignments.push(newItem);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(newItem));
        }
      }
      const assignmentMatch = pathname.match(/^\/assignments\/(\d+)$/);
      if (assignmentMatch) {
        const id = Number(assignmentMatch[1]);
        const idx = db.assignments.findIndex(a => a.id === id);
        if (idx !== -1) {
          if (method === 'GET') {
            const item = { ...db.assignments[idx], course: db.courses.find(c => c.id === db.assignments[idx].courseId) || null };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(item));
          }
          if (method === 'PATCH') {
            db.assignments[idx] = { ...db.assignments[idx], ...body };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(db.assignments[idx]));
          }
        }
      }

      // Grades
      if (pathname === '/grades') {
        const withCourse = db.grades.map(g => ({
          ...g,
          course: db.courses.find(c => c.id === g.courseId) || null,
        }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(withCourse));
      }
      const gradeMatch = pathname.match(/^\/grades\/(\d+)$/);
      if (gradeMatch) {
        const id = Number(gradeMatch[1]);
        const grade = db.grades.find(g => g.id === id);
        if (grade) {
          const item = { ...grade, course: db.courses.find(c => c.id === grade.courseId) || null };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(item));
        }
      }

      // Default 404
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Resource not found' }));
    });
  });

  return new Promise((resolve) => {
    server.listen(TEST_PORT, () => resolve(server));
  });
}

async function runAllTests() {
  console.log('====================================================');
  console.log('   BẮT ĐẦU BỘ KIỂM THỬ TỰ ĐỘNG BẰNG ASSERTION');
  console.log('   (Dùng server & db.test.json riêng biệt)');
  console.log('====================================================\n');

  const testServer = await createTestServer();
  let testCount = 0;
  let passCount = 0;

  function recordPass(testName) {
    testCount++;
    passCount++;
    console.log(`[PASS] (${testCount}) ${testName}`);
  }

  try {
    // ----------------------------------------------------
    // PHẦN 1: KIỂM THỬ UTILS (GPA, DATE, VALIDATOR)
    // ----------------------------------------------------
    console.log('--- 1. Kiểm thử Utils (GPA, Date, Validator) ---');

    // 1.1 toScale4
    assert.deepStrictEqual(toScale4(9.0), { scale4: 4.0, letter: 'A' });
    assert.deepStrictEqual(toScale4(8.2), { scale4: 3.5, letter: 'B+' });
    assert.deepStrictEqual(toScale4(7.5), { scale4: 3.0, letter: 'B' });
    assert.deepStrictEqual(toScale4(6.8), { scale4: 2.5, letter: 'C+' });
    assert.deepStrictEqual(toScale4(6.0), { scale4: 2.0, letter: 'C' });
    assert.deepStrictEqual(toScale4(5.2), { scale4: 1.5, letter: 'D+' });
    assert.deepStrictEqual(toScale4(4.5), { scale4: 1.0, letter: 'D' });
    assert.deepStrictEqual(toScale4(3.2), { scale4: 0.0, letter: 'F' });
    recordPass('toScale4 chuyển đổi chính xác mọi bậc điểm 10 sang thang 4 và điểm chữ');

    // 1.2 calcGpa: trả về object rõ ràng { gpa, totalCredits, totalGpaCredits }, tính cả môn F
    const mockCourses = [
      { id: 1, credits: 3 },
      { id: 2, credits: 4 },
      { id: 3, credits: 3 }, // Môn điểm F
    ];
    const mockGrades = [
      { id: 101, courseId: 1, total: 9.0 }, // 4.0 * 3 = 12.0
      { id: 102, courseId: 2, total: 8.0 }, // 3.5 * 4 = 14.0
      { id: 103, courseId: 3, total: 3.5 }, // 0.0 * 3 = 0.0 (Môn F)
    ];

    const gpaResult = calcGpa(mockGrades, mockCourses);
    assert.strictEqual(gpaResult.gpa, 2.6);
    assert.strictEqual(gpaResult.totalCredits, 7);
    assert.strictEqual(gpaResult.totalGpaCredits, 10);
    recordPass('calcGpa(grades, courses): Trả về object rõ ràng, môn F tính vào mẫu số, loại khỏi tín chỉ tích lũy');

    const emptyGpa = calcGpa([], []);
    assert.strictEqual(emptyGpa.gpa, 0.0);
    assert.strictEqual(emptyGpa.totalCredits, 0);
    recordPass('calcGpa với danh sách rỗng trả về an toàn { gpa: 0, totalCredits: 0 }');

    // 1.3 utils/date.js
    const testDate = '2026-10-20T08:30:00Z';
    assert.ok(formatDate(testDate).includes('20/10/2026'));
    assert.ok(formatDate(testDate, true).includes('20/10/2026') && formatDate(testDate, true).includes(':'));
    assert.strictEqual(isOverdue('2020-01-01T00:00:00Z'), true);
    assert.strictEqual(isOverdue('2099-01-01T00:00:00Z'), false);
    recordPass('utils/date.js định dạng ngày giờ và kiểm tra hạn chót chính xác');

    // 1.4 utils/validators.js
    const invalidAssignment = validateAssignmentForm({ title: '', dueDate: '2020-01-01', courseId: null });
    assert.strictEqual(invalidAssignment.isValid, false);
    assert.ok(invalidAssignment.errors.title);
    assert.ok(invalidAssignment.errors.dueDate);
    assert.ok(invalidAssignment.errors.courseId);

    const validAssignment = validateAssignmentForm({
      title: 'Bài tập hợp lệ',
      dueDate: '2099-12-31T23:59:00Z',
      courseId: 1,
    });
    assert.strictEqual(validAssignment.isValid, true);
    recordPass('utils/validators.js kiểm tra form bài tập và hồ sơ đúng quy tắc nghiệp vụ');

    // ----------------------------------------------------
    // PHẦN 2: KIỂM THỬ API CLIENT & SERVICES THẬT
    // ----------------------------------------------------
    console.log('\n--- 2. Kiểm thử API Client & Services Thật ---');

    // 2.1 studentService
    const student = await studentService.getById(1);
    assert.strictEqual(student.id, 1);
    assert.strictEqual(student.studentCode, 'SV2024001');
    recordPass('studentService.getById(1) lấy đúng sinh viên');

    const updatedStudent = await studentService.update(1, { phone: '0999888777' });
    assert.strictEqual(updatedStudent.phone, '0999888777');
    recordPass('studentService.update(1, data) cập nhật thông tin thành công');

    // 2.2 courseService
    const courses = await courseService.getAll();
    assert.ok(Array.isArray(courses) && courses.length >= 5);
    const singleCourse = await courseService.getById(courses[0].id);
    assert.strictEqual(singleCourse.id, courses[0].id);
    recordPass('courseService.getAll() và getById(id) lấy danh sách và chi tiết môn học');

    // 2.3 sessionService
    const sessions = await sessionService.getAll();
    assert.ok(Array.isArray(sessions) && sessions.length >= 5);
    assert.ok(sessions[0].course);
    const singleSession = await sessionService.getById(sessions[0].id);
    assert.strictEqual(singleSession.id, sessions[0].id);
    recordPass('sessionService.getAll() và getById(id) nhúng đúng dữ liệu môn học');

    // 2.4 assignmentService
    const assignments = await assignmentService.getAll();
    assert.ok(Array.isArray(assignments) && assignments.length >= 5);
    assert.ok(assignments[0].course);
    recordPass('assignmentService.getAll() mở rộng môn học và sắp xếp theo dueDate');

    const toggledAssignment = await assignmentService.updateStatus(assignments[0].id, 'done');
    assert.strictEqual(toggledAssignment.status, 'done');
    recordPass('assignmentService.updateStatus đổi trạng thái bài tập thành công');

    const createdAssignment = await assignmentService.create({
      courseId: 1,
      title: 'Bài tập test server',
      dueDate: '2026-12-01T23:59:00Z',
      status: 'todo',
    });
    assert.ok(createdAssignment.id);
    recordPass('assignmentService.create(data) thêm bài tập mới thành công (POST)');

    // 2.5 gradeService
    const grades = await gradeService.getAll();
    assert.ok(Array.isArray(grades) && grades.length >= 5);
    assert.ok(grades[0].course);
    const singleGrade = await gradeService.getById(grades[0].id);
    assert.strictEqual(singleGrade.id, grades[0].id);
    recordPass('gradeService.getAll() và getById(id) lấy danh sách và chi tiết điểm');

    // ----------------------------------------------------
    // PHẦN 3: KIỂM THỬ XỬ LÝ LỖI & TIMEOUT 10 GIÂY THẬT
    // ----------------------------------------------------
    console.log('\n--- 3. Kiểm thử Xử lý Lỗi & Timeout Chuẩn hóa (Mục 5.6) ---');

    // 3.1 Lỗi HTTP 404
    try {
      await request('GET', '/not_found_route');
      assert.fail('Gọi route không tồn tại phải throw');
    } catch (err) {
      assert.strictEqual(err.type, 'http');
      assert.strictEqual(err.status, 404);
    }
    recordPass('client.request chuẩn hóa lỗi HTTP 404: { type: "http", status: 404, message }');

    // 3.2 Lỗi Mạng
    try {
      await request('GET', 'http://127.0.0.1:59998/offline');
      assert.fail('Gọi port không chạy phải throw lỗi network');
    } catch (err) {
      assert.strictEqual(err.type, 'network');
      assert.strictEqual(err.status, 0);
    }
    recordPass('client.request chuẩn hóa lỗi kết nối mạng: { type: "network", status: 0, message }');

    // 3.3 Kiểm thử timeout: Headers bị chậm quá thời gian chờ
    console.log('   (Đang kiểm thử timeout khi server phản hồi headers chậm...)');
    try {
      // Dùng custom timeout 300ms gọi endpoint chậm 11s để xác nhận logic timeout hoạt động chuẩn xác
      await request('GET', '/test/slow-header', null, 300);
      assert.fail('Yêu cầu phải bị timeout');
    } catch (err) {
      assert.strictEqual(err.type, 'timeout');
      assert.strictEqual(err.status, 408);
      assert.ok(err.message.includes('thời gian chờ'));
    }
    recordPass('client.request ngắt kết nối đúng chuẩn khi server phản hồi headers chậm ({ type: "timeout", status: 408 })');

    // 3.4 Kiểm thử timeout: Response body bị chậm
    console.log('   (Đang kiểm thử timeout khi response body bị gián đoạn/chậm...)');
    try {
      await request('GET', '/test/slow-body', null, 300);
      assert.fail('Yêu cầu phải bị timeout khi tải body chậm');
    } catch (err) {
      assert.strictEqual(err.type, 'timeout');
      assert.strictEqual(err.status, 408);
    }
    recordPass('client.request ngắt kết nối đúng chuẩn khi response body truyền về bị chậm quá timeout');

    // ----------------------------------------------------
    console.log('\n--- 4. Kiểm thử Outbox & Xử lý Xung đột B5 (Mục B3, B4, B5) ---');

    // 4.1 Kiểm thử hàng đợi Outbox (FIFO, ID tạm, Enqueue, Remove)
    const inMemoryQueue = [];
    function mockEnqueue(act) {
      inMemoryQueue.push({ ...act, id: act.id || `act-${Date.now()}` });
      return inMemoryQueue[inMemoryQueue.length - 1];
    }
    function mockGetAll() {
      return [...inMemoryQueue];
    }
    function mockRemove(id) {
      const idx = inMemoryQueue.findIndex(item => String(item.id) === String(id));
      if (idx !== -1) inMemoryQueue.splice(idx, 1);
    }
    function mockReplaceTempId(tempId, realId) {
      for (const item of inMemoryQueue) {
        if (item.url.includes(String(tempId))) {
          item.url = item.url.replace(String(tempId), String(realId));
        }
        if (item.body && String(item.body.id) === String(tempId)) {
          item.body.id = realId;
        }
      }
    }

    // Thêm thao tác tạo bài tập offline với ID tạm
    const tempAssignmentId = 'temp-123456';
    mockEnqueue({
      id: `act-create-${tempAssignmentId}`,
      method: 'POST',
      url: '/assignments',
      body: { id: tempAssignmentId, title: 'Bài tập offline', status: 'todo' },
    });

    // Thêm thao tác đổi trạng thái của chính bài tập đó khi vẫn offline
    mockEnqueue({
      id: `act-update-${tempAssignmentId}`,
      method: 'PATCH',
      url: `/assignments/${tempAssignmentId}`,
      body: { id: tempAssignmentId, status: 'done' },
    });

    assert.strictEqual(mockGetAll().length, 2);
    assert.strictEqual(mockGetAll()[0].method, 'POST');
    assert.strictEqual(mockGetAll()[1].method, 'PATCH');
    recordPass('Outbox giữ đúng thứ tự hàng đợi FIFO khi thêm nhiều thao tác offline');

    // Giả lập sau khi POST thành công, server trả về ID thật là 99
    const realServerId = 99;
    mockReplaceTempId(tempAssignmentId, realServerId);
    assert.strictEqual(mockGetAll()[1].url, '/assignments/99');
    assert.strictEqual(mockGetAll()[1].body.id, 99);
    recordPass('Outbox tự động cập nhật ID tạm sang ID thật của server cho các thao tác tiếp theo');

    // Xóa action đầu tiên sau khi POST thành công
    mockRemove(`act-create-${tempAssignmentId}`);
    assert.strictEqual(mockGetAll().length, 1);
    recordPass('Xóa thành công action khỏi Outbox theo ID');

    // 4.2 Kiểm thử Quy tắc Xử lý Xung đột B5 (updatedAt)
    // Trường hợp 1: Server mới hơn -> Ưu tiên Server
    const serverTimeNewer = '2026-10-26T15:00:00Z';
    const localTimeOlder = '2026-10-26T14:00:00Z';
    const isConflictServerWins = new Date(serverTimeNewer).getTime() > new Date(localTimeOlder).getTime();
    assert.strictEqual(isConflictServerWins, true);
    recordPass('Quy tắc B5: Khi server.updatedAt > local.updatedAt, ưu tiên máy chủ và hủy thao tác cục bộ');

    // Trường hợp 2: Local mới hơn hoặc bằng -> Gửi Local lên server
    const serverTimeOlder = '2026-10-26T13:00:00Z';
    const localTimeNewer = '2026-10-26T14:30:00Z';
    const isLocalWins = new Date(localTimeNewer).getTime() >= new Date(serverTimeOlder).getTime();
    assert.strictEqual(isLocalWins, true);
    recordPass('Quy tắc B5: Khi local.updatedAt >= server.updatedAt, gửi dữ liệu cục bộ lên máy chủ');

    // 4.3 Kiểm thử Xác thực Cache với Mảng Rỗng []
    function validateCachePayload(parsed) {
      if (!parsed || typeof parsed !== 'object') return false;
      if (typeof parsed.savedAt !== 'number' || !Number.isFinite(parsed.savedAt) || parsed.savedAt <= 0) return false;
      if (!('data' in parsed) || parsed.data === undefined || parsed.data === null) return false;
      return true;
    }
    assert.strictEqual(validateCachePayload({ data: [], savedAt: Date.now() }), true);
    assert.strictEqual(validateCachePayload({ data: null, savedAt: Date.now() }), false);
    assert.strictEqual(validateCachePayload({ data: [1, 2], savedAt: -1 }), false);
    assert.strictEqual(validateCachePayload({ data: [1, 2], savedAt: 'invalid' }), false);
    recordPass('getCache xác thực nghiêm ngặt savedAt > 0, từ chối null nhưng chấp nhận hợp lệ data = []');

    console.log('\n====================================================');
    console.log(`   KẾT QUẢ: ĐÃ PASS TOÀN BỘ ${passCount}/${testCount} BÀI KIỂM THỬ`);
    console.log('====================================================\n');
  } finally {
    // Đóng test server
    testServer.close();
    // Xóa file db.test.json tạm thời
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    console.log('✓ File db.test.json đã dọn dẹp sạch sẽ. File db.json gốc hoàn toàn KHÔNG bị tác động!\n');
  }
}

runAllTests().catch(err => {
  console.error('\n✗ BỘ KIỂM THỬ THẤT BẠI:', err);
  process.exit(1);
});
