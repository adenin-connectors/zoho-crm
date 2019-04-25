'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api(`/Leads`);

    if ($.isErrorResponse(activity, response, [200, 204])) return;

    var dateRange = $.dateRange(activity, "today");
    let filteredLeads = [];
    if (response.body.data) {
      filteredLeads = api.filterLeadsByDateRange(response.body.data, dateRange);
    }

    let leadsStatus = {
      title: T(activity, 'New Leads'),
      link: `https://crm.zoho.com/crm/`,
      linkLabel: T(activity, 'All Leads')
    };

    let leadsCount = filteredLeads.length;

    if (leadsCount != 0) {
      leadsStatus = {
        ...leadsStatus,
        description: leadsCount > 1 ? T(activity, "You have {0} new leads.", leadsCount) : T(activity, "You have 1 new lead."),
        color: 'blue',
        value: leadsCount,
        actionable: true
      };
    } else {
      leadsStatus = {
        ...leadsStatus,
        description: T(activity, `You have no new leads.`),
        actionable: false
      };
    }

    activity.Response.Data = leadsStatus;
  } catch (error) {
    $.handleError(activity, error);
  }
};
