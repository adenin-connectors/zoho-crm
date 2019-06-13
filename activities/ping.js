'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api('/Leads');
    if ($.isErrorResponse(activity, response, [200, 204])) return;
    
    activity.Response.Data = {
      success: response && response.statusCode === 200
    };
  } catch (error) {
    $.handleError(activity, error);
    activity.Response.Data.success = false;
  }
};
