import { request } from './client.js';

/**
 * Service quản lý môn học
 * Tuân thủ hợp đồng mục 5.6: getAll, getById, update, create
 */
export async function getAll() {
  return await request('GET', '/courses');
}

export async function getById(id) {
  return await request('GET', `/courses/${id}`);
}

export async function update(id, data) {
  return await request('PATCH', `/courses/${id}`, data);
}

export async function create(data) {
  return await request('POST', '/courses', data);
}

export default {
  getAll,
  getById,
  update,
  create,
};
