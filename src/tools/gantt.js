const CATEGORY_MAP = { '社内': '1', '工事': '2', '納材': '3', '検査': '4' };

async function listGantts(client, params = {}) {
  const p = { work_id: params.work_id };
  if (params.start_date) p.start_date = params.start_date;
  if (params.end_date) p.end_date = params.end_date;
  return client.call('gantt_list', p);
}

async function getGantt(client, { gantt_id }) {
  // API仕様書: パラメータ名は schedule_id（gantt_id ではない）
  return client.call('gantt_info', { schedule_id: gantt_id });
}

async function createGantt(client, params) {
  return client.call('gantt_new', params);
}

async function editGantt(client, { gantt_id, work_id, status, ...rest }) {
  // gantt_edit は work_id + schedule_id + status + category が必須。
  // category が省略された場合は gantt_info から取得して補完する（read-modify-write）。
  let resolvedCategory = rest.category;
  if (!resolvedCategory) {
    const info = await client.call('gantt_info', { schedule_id: gantt_id });
    if (info.errors) return info;
    // gantt_info はカテゴリ名を返すので数値に変換
    resolvedCategory = CATEGORY_MAP[info.category] || info.category;
    // 他の省略フィールドも補完（名前・日付は指定がなければ既存値を使う）
    if (!rest.name) rest.name = info.name;
    if (!rest.day_start) rest.day_start = (info.start_date || '').substring(0, 10);
    if (!rest.day_end) rest.day_end = (info.end_date || '').substring(0, 10);
  }
  return client.call('gantt_edit', {
    schedule_id: gantt_id,
    work_id,
    status: status || '1',
    category: resolvedCategory,
    ...rest,
  });
}

module.exports = { listGantts, getGantt, createGantt, editGantt };
