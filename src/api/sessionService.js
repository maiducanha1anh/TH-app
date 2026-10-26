import { request } from './client.js';

/**
 * Service quản lý lịch học / thời khóa biểu
 * Tuân thủ hợp đồng mục 5.6: getAll, getById, update, create
 */
export async function getAll() {
  return await request('GET', '/sessions?_expand=course');
}

export async function getById(id) {
  return await request('GET', `/sessions/${id}?_expand=course`);
}

export async function update(id, data) {
  return await request('PATCH', `/sessions/${id}`, data);
}

export async function create(data) {
  return await request('POST', '/sessions', data);
}

export default {
  getAll,
  getById,
  update,
  create,
};
