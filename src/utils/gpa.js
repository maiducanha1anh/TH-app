/**
 * Bảng quy đổi điểm dùng trong utils/gpa.js (mục 4 Phần C & 5.6):
 * Điểm hệ 10   Điểm chữ    Điểm hệ 4
 * 8,5 – 10     A           4,0
 * 8,0 – 8,4    B+          3,5
 * 7,0 – 7,9    B           3,0
 * 6,5 – 6,9    C+          2,5
 * 5,5 – 6,4    C           2,0
 * 5,0 – 5,4    D+          1,5
 * 4,0 – 4,9    D           1,0
 * Dưới 4,0     F           0
 */

/**
 * Quy đổi điểm hệ 10 sang điểm hệ 4 và điểm chữ
 * @param {number | string} score10 - Điểm tổng kết hệ 10
 * @returns {{ scale4: number, letter: string }}
 */
export function toScale4(score10) {
  const num = Number(score10);
  if (isNaN(num) || num < 4.0) {
    return { scale4: 0.0, letter: 'F' };
  }
  if (num < 5.0) {
    return { scale4: 1.0, letter: 'D' };
  }
  if (num < 5.5) {
    return { scale4: 1.5, letter: 'D+' };
  }
  if (num < 6.5) {
    return { scale4: 2.0, letter: 'C' };
  }
  if (num < 7.0) {
    return { scale4: 2.5, letter: 'C+' };
  }
  if (num < 8.0) {
    return { scale4: 3.0, letter: 'B' };
  }
  if (num < 8.5) {
    return { scale4: 3.5, letter: 'B+' };
  }
  return { scale4: 4.0, letter: 'A' };
}

/**
 * Tính GPA hệ 4 có trọng số tín chỉ và tổng tín chỉ tích lũy
 * Hợp đồng mục 5.6: calcGpa(grades, courses)
 * Quy tắc:
 * - GPA = tổng (điểm hệ 4 × số tín chỉ) / tổng số tín chỉ.
 * - Môn điểm F VẪN TÍNH vào mẫu số tổng tín chỉ để tính GPA.
 * - Môn điểm F KHÔNG TÍNH vào số tín chỉ tích lũy.
 *
 * @param {Array<object>} grades - Danh sách kết quả học tập
 * @param {Array<object>} [courses=[]] - Danh sách môn học (để tra cứu số tín chỉ nếu grade chưa expand)
 * @returns {{ gpa: number, totalCredits: number, totalGpaCredits: number }}
 */
export function calcGpa(grades = [], courses = []) {
  if (!Array.isArray(grades) || grades.length === 0) {
    return {
      gpa: 0.0,
      totalCredits: 0,
      totalGpaCredits: 0,
    };
  }

  // Tạo map tra cứu tín chỉ môn học theo id
  const courseMap = new Map();
  if (Array.isArray(courses)) {
    courses.forEach(c => {
      if (c && c.id !== undefined) {
        courseMap.set(String(c.id), Number(c.credits) || 0);
      }
    });
  }

  let totalWeightedScore = 0;
  let totalGpaCredits = 0;          // Mẫu số GPA (bao gồm cả môn F)
  let totalAccumulatedCredits = 0;    // Tín chỉ tích lũy (loại trừ môn F)

  grades.forEach(g => {
    if (!g) return;

    // Lấy số tín chỉ: từ grade.course (nếu đã _expand), từ map courses, hoặc grade.credits
    let credits = 0;
    if (g.course && typeof g.course.credits === 'number') {
      credits = g.course.credits;
    } else if (courseMap.has(String(g.courseId))) {
      credits = courseMap.get(String(g.courseId));
    } else if (typeof g.credits === 'number') {
      credits = g.credits;
    }

    if (credits <= 0) return;

    // Xác định điểm tổng kết (ưu tiên g.total, nếu không tính từ 10% attendance + 30% midterm + 60% final)
    let totalScore = g.total;
    if ((totalScore === undefined || totalScore === null) && g.final !== undefined) {
      const att = Number(g.attendance) || 0;
      const mid = Number(g.midterm) || 0;
      const fin = Number(g.final) || 0;
      totalScore = att * 0.1 + mid * 0.3 + fin * 0.6;
    }

    // Xác định điểm hệ 4
    let scale4 = 0;
    if (totalScore !== undefined && totalScore !== null) {
      scale4 = toScale4(totalScore).scale4;
    } else if (g.letter) {
      switch (String(g.letter).trim().toUpperCase()) {
        case 'A': scale4 = 4.0; break;
        case 'B+': scale4 = 3.5; break;
        case 'B': scale4 = 3.0; break;
        case 'C+': scale4 = 2.5; break;
        case 'C': scale4 = 2.0; break;
        case 'D+': scale4 = 1.5; break;
        case 'D': scale4 = 1.0; break;
        default: scale4 = 0.0; break;
      }
    }

    totalWeightedScore += scale4 * credits;
    totalGpaCredits += credits;

    // Chỉ cộng vào tín chỉ tích lũy nếu không phải điểm F (scale4 > 0)
    if (scale4 > 0) {
      totalAccumulatedCredits += credits;
    }
  });

  const gpa = totalGpaCredits > 0
    ? Number((totalWeightedScore / totalGpaCredits).toFixed(2))
    : 0.0;

  return {
    gpa,
    totalCredits: totalAccumulatedCredits,
    totalGpaCredits,
  };
}

export default {
  toScale4,
  calcGpa,
};
