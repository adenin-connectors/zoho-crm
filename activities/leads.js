'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);
    var pagination = $.pagination(activity);
    const response = await api(`/Leads?page=${pagination.page}&per_page=${pagination.pageSize}`);
    if ($.isErrorResponse(activity, response, [200, 204])) return;

    activity.Response.Data.items = api.convertResponse(response.body.data);
    let value = activity.Response.Data.items.items.length;
    activity.Response.Data.title = T(activity, 'Active Leads');
    activity.Response.Data.link = `https://crm.zoho.com/crm/${activity.Context.connector.custom1}/tab/Leads`;
    activity.Response.Data.linkLabel = T(activity, 'All Leads');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} leads.", value)
        : T(activity, "You have 1 lead.");
    } else {
      activity.Response.Data.description = T(activity, `You have no leads.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};