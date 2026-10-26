/**
 * Các hàm kiểm tra tính hợp lệ của dữ liệu đầu vào (Form validation)
 */

/**
 * Kiểm tra form bài tập mới
 * @param {{ title: string, dueDate: string, courseId: any }} form
 * @returns {{ isValid: boolean, errors: { title?: string, dueDate?: string, courseId?: string } }}
 */
export function validateAssignmentForm(form) {
  const errors = {};

  if (!form.title || !form.title.trim()) {
    errors.title = 'Tiêu đề bài tập không được để trống.';
  }

  if (!form.dueDate) {
    errors.dueDate = 'Vui lòng chọn hạn nộp.';
  } else {
    const dueTime = new Date(form.dueDate).getTime();
    if (isNaN(dueTime)) {
      errors.dueDate = 'Định dạng hạn nộp không hợp lệ.';
    } else if (dueTime < Date.now()) {
      errors.dueDate = 'Hạn nộp không được ở quá khứ.';
    }
  }

  if (!form.courseId) {
    errors.courseId = 'Vui lòng chọn môn học liên quan.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Kiểm tra form chỉnh sửa thông tin cá nhân
 * @param {{ fullName: string, email?: string, phone?: string }} form
 * @returns {{ isValid: boolean, errors: { fullName?: string, email?: string, phone?: string } }}
 */
export function validateProfileForm(form) {
  const errors = {};

  if (!form.fullName || !form.fullName.trim()) {
    errors.fullName = 'Họ và tên không được để trống.';
  }

  if (form.email && form.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      errors.email = 'Địa chỉ email không đúng định dạng.';
    }
  }

  if (form.phone && form.phone.trim()) {
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(form.phone.trim().replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ (cần 10 số).';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export default {
  validateAssignmentForm,
  validateProfileForm,
};
