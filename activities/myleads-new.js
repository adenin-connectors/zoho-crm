'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api(`/Leads`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    var dateRange = cfActivity.dateRange(activity, "today");
    let filteredLeads = filterLeadsByDateRange(response.body.data, dateRange);

    let leadsStatus = {
      title: 'New Leads',
      url: `https://crm.zoho.com/crm/`,
      urlLabel: 'All Leads',
    };

    let leadsCount = filteredLeads.length;

    if (leadsCount != 0) {
      leadsStatus = {
        ...leadsStatus,
        description: `You have ${leadsCount > 1 ? leadsCount + " new leads" : leadsCount + " new lead"}.`,
        color: 'blue',
        value: leadsCount,
        actionable: true
      };
    } else {
      leadsStatus = {
        ...leadsStatus,
        description: `You have no new leads.`,
        actionable: false
      };
    }

    activity.Response.Data = leadsStatus;
  } catch (error) {
    cfActivity.handleError(activity, error);
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