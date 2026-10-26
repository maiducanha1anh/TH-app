import { request } from './client.js';

/**
 * Service quản lý thông tin sinh viên
 * Tuân thủ hợp đồng mục 5.6: getAll, getById, update, create
 */
export async function getAll() {
  return await request('GET', '/students');
}

export async function getById(id = 1) {
  return await request('GET', `/students/${id}`);
}

export async function update(id = 1, data) {
  return await request('PATCH', `/students/${id}`, data);
}

export async function create(data) {
  return await request('POST', '/students', data);
}

// Hàm tiện ích ngữ nghĩa theo đề
export async function getStudent(id = 1) {
  return await getById(id);
}

export async function updateStudent(data, id = 1) {
  return await update(id, data);
}

export default {
  getAll,
  getById,
  update,
  create,
  getStudent,
  updateStudent,
};
