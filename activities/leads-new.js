'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const response = await api(`/Leads`);

    if (Activity.isErrorResponse(response, [200,204])) return;

    var dateRange = Activity.dateRange("today");
    let filteredLeads = [];
    if (response.body.data) {
      filteredLeads = api.filterLeadsByDateRange(response.body.data, dateRange);
    }

    let leadsStatus = {
      title: T('New Leads'),
      link: `https://crm.zoho.com/crm/`,
      linkLabel: T('All Leads')
    };

    let leadsCount = filteredLeads.length;

    if (leadsCount != 0) {
      leadsStatus = {
        ...leadsStatus,
        description: leadsCount > 1 ? T("You have {0} new leads.", leadsCount) : T("You have 1 new lead."),
        color: 'blue',
        value: leadsCount,
        actionable: true
      };
    } else {
      leadsStatus = {
        ...leadsStatus,
        description: T(`You have no new leads.`),
        actionable: false
      };
    }

    activity.Response.Data = leadsStatus;
  } catch (error) {
    Activity.handleError(error);
  }
};
