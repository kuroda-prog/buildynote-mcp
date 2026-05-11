async function listWorks(client, params = {}) {
  const p = {};
  if (params.name) p.name = params.name;
  if (params.status) p.status = params.status;
  if (params.customer_id) p.customer_id = params.customer_id;
  if (params.limit) p.limit = params.limit;
  if (params.page) p.page = params.page;

  // construction_type_id → 名前に変換して q フィルタに設定
  if (params.construction_type_id) {
    const ct = await client.call('construction_type_list');
    const found = (ct.list || []).find(c => String(c.id) === String(params.construction_type_id));
    if (found) {
      p['q[0]'] = `construction_type=${found.name}`;
    }
    // 絞り込み時は updated も返す
    p['fields[0]'] = 'id';
    p['fields[1]'] = 'name';
    p['fields[2]'] = 'construction_type';
    p['fields[3]'] = 'updated';
    p['fields[4]'] = 'status';
  }

  // sort=desc のとき: limit=1000 で全取得しクライアント側で updated 降順ソート
  if (params.sort === 'desc' || params.sort === 'updated_desc') {
    p.limit = 1000;
    delete p.page;
    const result = await client.call('work_list', p);
    if (result.list) {
      result.list.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));
    }
    return result;
  }

  return client.call('work_list', p);
}

async function getWork(client, { work_id }) {
  return client.call('work_info', { work_id });
}

async function createWork(client, params) {
  return client.call('work_new', params);
}

async function editWork(client, { work_id, ...rest }) {
  return client.call('work_edit', { work_id, ...rest });
}

async function deleteWork(client, { work_id }) {
  return client.call('work_delete', { work_id });
}

module.exports = { listWorks, getWork, createWork, editWork, deleteWork };
