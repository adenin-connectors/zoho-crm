'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    var pagination = Activity.pagination();
    let query = activity.Request.Query.query;
    const response = await api(`/Leads/search?criteria=((Last_Name:starts_with:${query})OR(First_Name:starts_with:${query}))`+
    `&page=${pagination.page}&per_page=${pagination.pageSize}`);

    if (Activity.isErrorResponse(response, [200,204])) return;

    activity.Response.Data = api.convertResponse(response);
  } catch (error) {
    Activity.handleError(error);
  }
};