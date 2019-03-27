'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const response = await api(`/Leads`);

    if (Activity.isErrorResponse(response)) return;

    var dateRange = Activity.dateRange("today");
    let filteredLeads = filterLeadsByDateRange(response.body.data, dateRange);

    let leadsStatus = {
      title: T('New Leads'),
      url: `https://crm.zoho.com/crm/`,
      urlLabel: T('All Leads')
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
//**filters leads based on provided dateRange */
function filterLeadsByDateRange(leads, dateRange) {
  let filteredLeads = [];
  let timeMin = new Date(dateRange.startDate).valueOf();
  let timeMax = new Date(dateRange.endDate).valueOf();

  for (let i = 0; i < leads.length; i++) {
    let createdAtMilis = new Date(leads[i].Created_Time).valueOf();

    if (createdAtMilis > timeMin && createdAtMilis < timeMax) {
      filteredLeads.push(leads[i]);
    }
  }

  return filteredLeads;
}