function smartfloConfig() {
  return {
    mode: process.env.SMARTFLO_MODE || "mock",
    baseUrl: process.env.SMARTFLO_BASE_URL,
    accountToken: process.env.SMARTFLO_ACCOUNT_API_TOKEN,
    clickToCallApiKey: process.env.SMARTFLO_CLICK_TO_CALL_API_KEY,
    paths: {
      clickToCall: process.env.SMARTFLO_CLICK_TO_CALL_PATH || "/v1/click_to_call",
      hangup: process.env.SMARTFLO_HANGUP_PATH || "/v1/hangup",
      status: process.env.SMARTFLO_CALL_STATUS_PATH || "/v1/call_status",
    },
  };
}

module.exports = smartfloConfig;
