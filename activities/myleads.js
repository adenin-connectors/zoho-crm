'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    var pagination = Activity.pagination();
    const response = await api(`/Leads?page=${pagination.page}&per_page=${pagination.pageSize}`);

    if (Activity.isErrorResponse(response)) return;

    activity.Response.Data = convertResponse(response);
  } catch (error) {
    Activity.handleError(error);
  }
};
//**maps response data to items */
function convertResponse(response) {
  let items = [];
  let data = response.body.data;

  for (let i = 0; i < data.length; i++) {
    let raw = data[i];
    let item = { id: raw.id, title: raw.Designation, description: raw.Description, link: `https://crm.zoho.com/crm/`, raw: raw }
    items.push(item);
  }

  return { items: items };
}