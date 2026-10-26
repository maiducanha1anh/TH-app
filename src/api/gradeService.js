import { request } from './client.js';

/**
 * Service quản lý kết quả học tập / điểm số
 * Tuân thủ hợp đồng mục 5.6: getAll, getById, update, create
 */
export async function getAll() {
  return await request('GET', '/grades?_expand=course');
}

export async function getById(id) {
  return await request('GET', `/grades/${id}?_expand=course`);
}

export async function update(id, data) {
  return await request('PATCH', `/grades/${id}`, data);
}

export async function create(data) {
  return await request('POST', '/grades', data);
}

export default {
  getAll,
  getById,
  update,
  create,
};
