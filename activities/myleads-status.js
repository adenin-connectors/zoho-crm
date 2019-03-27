'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const response = await api(`/Leads`);

    if (Activity.isErrorResponse(response)) return;

    let leads = [];
    if (response.body.data) {
      leads = response.body.data;
    }

    let leadsStatus = {
      title: T('Active Leads'),
      link: `https://crm.zoho.com/crm/`,
      linkLabel: T('All Leads')
    };

    let leadsCount = leads.length;

    if (leadsCount != 0) {
      leadsStatus = {
        ...leadsStatus,
        description: leadsCount > 1 ? T("You have {0} leads.", leadsCount) : T("You have 1 lead."),
        color: 'blue',
        value: leadsCount,
        actionable: true
      };
    } else {
      leadsStatus = {
        ...leadsStatus,
        description: T(`You have no leads.`),
        actionable: false
      };
    }

    activity.Response.Data = leadsStatus;
  } catch (error) {
    Activity.handleError(error);
  }
};