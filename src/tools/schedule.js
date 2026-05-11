// YYYY-MM-DD → YYYY-MM-DDT00:00:00（schedule_list の start_date 用）
function toIsoDatetime(s) {
  if (!s) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s + 'T00:00:00' : s;
}

// YYYY-MM-DD → YYYY-MM-DDT23:59:59（schedule_list の end_date 用）
function toIsoEndDatetime(s) {
  if (!s) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s + 'T23:59:59' : s;
}

// date + time → "YYYY-MM-DD HH:mm"（schedule_new/edit の start_date / end_date 用）
function combineDateTime(date, time) {
  if (!date) return undefined;
  return time ? `${date} ${time}` : date;
}

// user_list: [{user_id: 277}, ...] → {'user_list[0][user_id]': 277, ...}
function flattenUserList(users) {
  if (!users || !Array.isArray(users)) return {};
  const result = {};
  users.forEach((u, i) => {
    const uid = typeof u === 'object' ? u.user_id : u;
    result[`user_list[${i}][user_id]`] = uid;
  });
  return result;
}

async function listSchedules(client, params = {}) {
  const p = {};
  if (params.user_id) p.user_id = params.user_id;
  if (params.start_date) p.start_date = toIsoDatetime(params.start_date);
  if (params.end_date) p.end_date = toIsoEndDatetime(params.end_date);
  if (params.work_id) p.work_id = params.work_id;
  return client.call('schedule_list', p);
}

async function getSchedule(client, { schedule_id }) {
  return client.call('schedule_info', { schedule_id });
}

async function createSchedule(client, params) {
  const { user_list, start_date, start_time, end_date, end_time, ...rest } = params;
  return client.call('schedule_new', {
    ...rest,
    start_date: combineDateTime(start_date, start_time),
    end_date: combineDateTime(end_date, end_time),
    ...flattenUserList(user_list),
  });
}

async function editSchedule(client, { schedule_id, user_list, start_date, start_time, end_date, end_time, ...rest }) {
  if (rest.is_regular === undefined) rest.is_regular = 0;
  return client.call('schedule_edit', {
    schedule_id,
    ...rest,
    start_date: combineDateTime(start_date, start_time),
    end_date: combineDateTime(end_date, end_time),
    ...flattenUserList(user_list),
  });
}

async function deleteSchedule(client, { schedule_id }) {
  return client.call('schedule_delete', { schedule_id });
}

module.exports = { listSchedules, getSchedule, createSchedule, editSchedule, deleteSchedule };
