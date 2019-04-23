'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    var pagination = $.pagination(activity);
    api.initialize(activity);
    const response = await api(`/Leads?page=${pagination.page}&per_page=${pagination.pageSize}`);

    if ($.isErrorResponse(activity, response, [200, 204])) return;

    activity.Response.Data = api.convertResponse(response);
  } catch (error) {
    $.handleError(activity, error);
  }
};