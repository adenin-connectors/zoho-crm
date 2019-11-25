'use strict';

const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const allLeads = [];
    const maxRecords = 200;

    let page = 1;
    let response = await api(`/Leads?page=${page}&per_page=${maxRecords}&sortColumnString=ID&sortOrderString=desc`);

    if ($.isErrorResponse(activity, response, [200, 204])) return;

    allLeads.push(...response.body.data);

    while (response.body.info.more_records) {
      page++;
      response = await api(`/Leads?page=${page}&per_page=${maxRecords}&sortColumnString=ID&sortOrderString=desc`);

      if ($.isErrorResponse(activity, response)) return;

      allLeads.push(...response.body.data);
    }

    const dateRange = $.dateRange(activity);

    let leads = api.filterLeadsByDateRange(allLeads, dateRange);

    leads = api.convertResponse(leads);

    let count = 0;
    let readDate = (new Date(new Date().setDate(new Date().getDate() - 30))).toISOString(); // default read date 30 days in the past

    if (activity.Request.Query.readDate) readDate = activity.Request.Query.readDate;

    for (let i = 0; i < leads.length; i++) {
      if (leads[i].date > readDate) count++;
    }

    const pagination = $.pagination(activity);

    leads = api.paginateItems(leads, pagination);

    activity.Response.Data.items = leads;

    if (parseInt(pagination.page) === 1) {
      activity.Response.Data.title = T(activity, 'New Leads');
      activity.Response.Data.link = `https://crm.zoho.com/crm/${activity.Context.connector.custom1}/tab/Leads`;
      activity.Response.Data.linkLabel = T(activity, 'All Leads');
      activity.Response.Data.thumbnail = 'https://www.adenin.com/assets/images/wp-images/logo/zoho-crm.svg';
      activity.Response.Data.actionable = count > 0;

      if (count > 0) {
        const first = activity.Response.Data.items[0];

        activity.Response.Data.value = count;
        activity.Response.Data.date = first.date;
        activity.Response.Data.description = count > 1 ? T(activity, 'You have {0} new leads.', count) : T(activity, 'You have 1 new lead.');

        // if we have the company, we put company in briefing message (the message for notification)
        if (first.raw.Company) {
          // there is at least one item, so have this message at a minimum
          activity.Response.Data.briefing = `You have a new lead from <b>${first.raw.Company}</b>`;

          // if there's more than one item, append 'and X more ...', need conditional check for whether to assign plural or not
          if (count > 1) activity.Response.Data.briefing += count > 2 ? ` and ${count - 1} more new leads` : ' and 1 more new lead';
        } else {
          // if for some reason we don't have the company, we just append the title of the first item to the default 'You have X leads' description
          activity.Response.Data.briefing = activity.Response.Data.description + ` The latest is <b>${first.title}</b>`;
        }
      } else {
        activity.Response.Data.description = T(activity, 'You have no leads.');
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
