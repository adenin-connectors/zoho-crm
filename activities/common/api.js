'use strict';

const got = require('got');
const HttpAgent = require('agentkeepalive');
const HttpsAgent = HttpAgent.HttpsAgent;

let _activity = null;

function api(path, opts) {
  if (typeof path !== 'string') {
    return Promise.reject(new TypeError(`Expected \`path\` to be a string, got ${typeof path}`));
  }

  opts = Object.assign({
    json: true,
    token: _activity.Context.connector.token,
    endpoint: 'https://www.zohoapis.com/crm/v2',
    agent: {
      http: new HttpAgent(),
      https: new HttpsAgent()
    }
  }, opts);

  opts.headers = Object.assign({
    accept: 'application/json',
    'user-agent': 'adenin Digital Assistant Connector, https://www.adenin.com/digital-assistant'
  }, opts.headers);

  if (opts.token) opts.headers.Authorization = `Zoho-oauthtoken ${opts.token}`;

  const url = /^http(s)\:\/\/?/.test(path) && opts.endpoint ? path : opts.endpoint + path;

  if (opts.stream) return got.stream(url, opts);

  return got(url, opts).catch((err) => {
    throw err;
  });
}

const helpers = [
  'get',
  'post',
  'put',
  'patch',
  'head',
  'delete'
];

api.initialize = (activity) => {
  _activity = activity;
};

api.stream = (url, opts) => got(url, Object.assign({}, opts, {
  json: false,
  stream: true
}));

for (const x of helpers) {
  const method = x.toUpperCase();
  api[x] = (url, opts) => api(url, Object.assign({}, opts, { method }));
  api.stream[x] = (url, opts) => api.stream(url, Object.assign({}, opts, { method }));
}

//**filters leads based on provided dateRange */
api.filterLeadsByDateRange = function (leads, dateRange) {
  const filteredLeads = [];
  const timeMin = new Date(dateRange.startDate).valueOf();
  const timeMax = new Date(dateRange.endDate).valueOf();

  for (let i = 0; i < leads.length; i++) {
    const createdAtMilis = new Date(leads[i].Created_Time).valueOf();

    if (createdAtMilis > timeMin && createdAtMilis < timeMax) filteredLeads.push(leads[i]);
  }

  return filteredLeads;
};

//**maps response data to items */
api.convertResponse = function (leads) {
  const items = [];
  let data = [];

  if (leads) data = leads;

  for (let i = 0; i < data.length; i++) {
    const raw = data[i];
    const item = {
      id: raw.id,
      title: raw.Designation,
      description: raw.Description,
      date: new Date(raw.Created_Time).toISOString(),
      link: `https://crm.zoho.com/crm/${_activity.Context.connector.custom1}/tab/Leads/${raw.id}`,
      raw: raw
    };

    items.push(item);
  }

  return { items };
};

module.exports = api;
