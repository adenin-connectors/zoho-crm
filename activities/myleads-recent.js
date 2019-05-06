'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const currentUser = await api(`/users?type=CurrentUser`);
    if ($.isErrorResponse(activity, currentUser, [200, 204])) return;
    let currentUserId = currentUser.body.users[0].id;

    var pagination = $.pagination(activity);
    const response = await api(`/Leads/search?criteria=(Owner.id:equals:${currentUserId})` +
      `&page=${pagination.page}&per_page=${pagination.pageSize}`);
    if ($.isErrorResponse(activity, response, [200, 204])) return;

    var dateRange = $.dateRange(activity, "today");
    let filteredLeads = [];
    if (response.body.data) {
      filteredLeads = api.filterLeadsByDateRange(response.body.data, dateRange);
    }

    activity.Response.Data.items = api.convertResponse(filteredLeads);
    let value = activity.Response.Data.items.items.length;
    activity.Response.Data.title = T(activity, 'Recent Leads');
    activity.Response.Data.link = `https://crm.zoho.com/crm/${activity.Context.connector.custom1}/tab/Leads`;
    activity.Response.Data.linkLabel = T(activity, 'All Leads');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} new leads.", value)
        : T(activity, "You have 1 new lead.");
    } else {
      activity.Response.Data.description = T(activity, `You have no new leads.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
