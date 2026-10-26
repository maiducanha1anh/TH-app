/**
 * Các tiện ích định dạng và tính toán ngày giờ
 */

/**
 * Định dạng ngày theo chuẩn dd/MM/yyyy hoặc HH:mm, dd/MM/yyyy
 * @param {string | Date} dateInput
 * @param {boolean} [includeTime=false]
 * @returns {string}
 */
export function formatDate(dateInput, includeTime = false) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (includeTime) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}, ${day}/${month}/${year}`;
  }

  return `${day}/${month}/${year}`;
}

/**
 * Kiểm tra xem hạn nộp đã quá hạn chưa
 * @param {string | Date} dueDateInput
 * @returns {boolean}
 */
export function isOverdue(dueDateInput) {
  if (!dueDateInput) return false;
  const due = new Date(dueDateInput);
  if (isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

/**
 * Tính số ngày còn lại đến hạn nộp
 * @param {string | Date} dueDateInput
 * @returns {number} Số ngày còn lại (âm nếu quá hạn)
 */
export function daysLeft(dueDateInput) {
  if (!dueDateInput) return 0;
  const due = new Date(dueDateInput);
  if (isNaN(due.getTime())) return 0;
  const diffTime = due.getTime() - Date.now();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default {
  formatDate,
  isOverdue,
  daysLeft,
};
