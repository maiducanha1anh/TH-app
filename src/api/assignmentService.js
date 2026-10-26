import { request } from './client.js';

/**
 * Service quản lý bài tập
 * Tuân thủ hợp đồng mục 5.6: getAll, getById, update, create
 */
export async function getAll() {
  return await request('GET', '/assignments?_expand=course&_sort=dueDate');
}

export async function getById(id) {
  return await request('GET', `/assignments/${id}?_expand=course`);
}

export async function update(id, data) {
  return await request('PATCH', `/assignments/${id}`, data);
}

export async function create(data) {
  return await request('POST', '/assignments', data);
}

// Hàm tiện ích cập nhật trạng thái bài tập (todo <-> done)
export async function updateStatus(id, status, updatedAt = new Date().toISOString()) {
  return await update(id, { status, updatedAt });
}

export default {
  getAll,
  getById,
  update,
  create,
  updateStatus,
};
