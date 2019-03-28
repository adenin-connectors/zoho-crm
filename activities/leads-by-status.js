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

    activity.Response.Data = mapResponseToChartData(filteredLeads);
  } catch (error) {
    Activity.handleError(error);
  }
};
//** maps response data to data format usable by chart */
function mapResponseToChartData(leads) {
  let labels = [];
  let datasets = [];
  let data = [];

  for (let i = 0; i < leads.length; i++) {
    let status = leads[i].Lead_Status || "No Status";
    if (!labels.includes(status)) {
      labels.push(status);
    }
  }

  for (let x = 0; x < labels.length; x++) {
    let counter = 0;
    for (let y = 0; y < leads.length; y++) {
      let status = leads[y].Lead_Status || "No Status";
      if (labels[x] == status) {
        counter++;
      }
    }
    data.push(counter);
  }
  datasets.push({ label: 'Number Of Leads', data });

  let chartData = {
    chart: {
      configuration: {
        data: {},
        options: {
          title: {
            display: true,
            text: 'Lead Metrics By Status'
          }
        }
      },
      template: 'bar',
      palette: 'office.Office6'
    },
    _settings: {}
  };
  chartData.chart.configuration.data.labels = labels;
  chartData.chart.configuration.data.datasets = datasets;

  return chartData;
}