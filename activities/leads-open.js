'use strict';

const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const viewsResponse = await api('/settings/custom_views?module=Leads');

    if ($.isErrorResponse(activity, viewsResponse));

    const views = viewsResponse.body.custom_views;

    // set default response values
    activity.Response.Data.title = T(activity, 'Open Leads');
    activity.Response.Data.link = `https://crm.zoho.com/crm/${activity.Context.connector.custom1}/tab/Leads`;
    activity.Response.Data.linkLabel = T(activity, 'All Leads');
    activity.Response.Data.thumbnail = 'https://www.adenin.com/assets/images/wp-images/logo/zoho-crm.svg';
    activity.Response.Data.actionable = false;
    activity.Response.Data.items = [];

    if (!views || views.length === 0) {
      activity.Response.Data.description = T(activity, 'You have no Zoho CRM Leads views defined');
      return;
    }

    let openLeadsViewId;

    for (let i = 0; i < views.length; i++) {
      const viewName = views[i].display_value.toLowerCase();

      if (viewName === 'open' || viewName === 'open leads') {
        openLeadsViewId = views[i].id;
        break;
      }
    }

    if (!openLeadsViewId) {
      activity.Response.Data.description = T(activity, 'You have no Zoho CRM view for open leads');
      return;
    }

    const maxRecords = 200;
    let page = 1;

    let customViewResponse = await api(`/Leads?cvid=${openLeadsViewId}&page=${page}&per_page=${maxRecords}&sortColumnString=ID&sortOrderString=desc`);

    if ($.isErrorResponse(activity, customViewResponse, [200, 204])) return;

    const allLeads = [];

    allLeads.push(...customViewResponse.body.data);

    while (customViewResponse.body.info.more_records) {
      page++;

      customViewResponse = await api(`/Leads?cvid=${openLeadsViewId}&page=${page}&per_page=${maxRecords}&sortColumnString=ID&sortOrderString=desc`);

      if ($.isErrorResponse(activity, customViewResponse)) return;

      allLeads.push(...customViewResponse.body.data);
    }

    const dateRange = $.dateRange(activity);

    let leads = api.filterLeadsByDateRange(allLeads, dateRange);

    const value = leads.length;
    const pagination = $.pagination(activity);

    leads = api.paginateItems(leads, pagination);

    activity.Response.Data.items = api.convertResponse(leads);

    if (parseInt(pagination.page) === 1) {
      activity.Response.Data.actionable = value > 0;

      if (value > 0) {
        const first = activity.Response.Data.items[0];

        activity.Response.Data.value = value;
        activity.Response.Data.date = first.date;
        activity.Response.Data.description = value > 1 ? T(activity, 'You have {0} open leads.', value) : T(activity, 'You have 1 open lead.');

        // if we have the company, we put company in briefing message (the message for notification)
        if (first.raw.Company) {
          // there is at least one item, so have this message at a minimum
          activity.Response.Data.briefing = `You have an open lead from <b>${first.raw.Company}</b>`;

          // if there's more than one item, append 'and X more ...', need conditional check for whether to assign plural or not
          if (value > 1) activity.Response.Data.briefing += value > 2 ? `, and ${value - 1} more open leads` : ', and 1 more open lead';
        } else {
          // if for some reason we don't have the company, we just append the title of the first item to the default 'You have X leads' description
          activity.Response.Data.briefing = activity.Response.Data.description + `The latest is <b>${first.title}<b>`;
        }
      } else {
        activity.Response.Data.description = T(activity, 'You have no open leads.');
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
