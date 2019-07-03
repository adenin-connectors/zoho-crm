'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);
    const currentUser = await api(`/users?type=CurrentUser`);
    if ($.isErrorResponse(activity, currentUser, [200, 204])) return;
    let currentUserId = currentUser.body.users[0].id;

    let allLeads = [];
    let page = 1;
    let maxRecords = 200;
    let response = await api(`/Leads/search?criteria=(Owner.id:equals:${currentUserId})` +
      `&page=${page}&per_page=${maxRecords}&sortColumnString=ID&sortOrderString=desc`);
    if ($.isErrorResponse(activity, response, [200, 204])) return;
    allLeads.push(...response.body.data);

    while (response.body.info.more_records) {
      page++;
      response = await api(`/Leads/search?criteria=(Owner.id:equals:${currentUserId})` +
      `&page=${page}&per_page=${maxRecords}&sortColumnString=ID&sortOrderString=desc`);
      if ($.isErrorResponse(activity, response)) return;
      allLeads.push(...response.body.data);
    }

    let dateRange = $.dateRange(activity);
    let leads = api.filterLeadsByDateRange(allLeads, dateRange);
    let value = leads.length;
    var pagination = $.pagination(activity);
    leads = api.paginateItems(leads, pagination);

    activity.Response.Data.items = api.convertResponse(leads);
    if (parseInt(pagination.page) == 1) {
      activity.Response.Data.title = T(activity, 'Active Leads');
      activity.Response.Data.link = `https://crm.zoho.com/crm/${activity.Context.connector.custom1}/tab/Leads`;
      activity.Response.Data.linkLabel = T(activity, 'All Leads');
      activity.Response.Data.actionable = value > 0;

      if (value > 0) {
        activity.Response.Data.value = value;
        activity.Response.Data.date = activity.Response.Data.items[0].date;
        activity.Response.Data.color = 'blue';
        activity.Response.Data.description = value > 1 ? T(activity, "You have {0} leads.", value)
          : T(activity, "You have 1 lead.");
      } else {
        activity.Response.Data.description = T(activity, `You have no leads.`);
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};