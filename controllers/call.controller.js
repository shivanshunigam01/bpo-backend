const axios = require("axios");
const smartfloConfig = require("../config/smartflo");
const Lead = require("../models/Lead");

function nowIso() {
  return new Date().toISOString();
}

exports.start = async (req, res) => {
  try {
    const { leadId, phone, reference_id } = req.body || {};
    const cfg = smartfloConfig();

    const ref = reference_id || leadId || `lead-${Date.now()}`;
    const to = String(phone || "").replace(/\D/g, "");
    if (!to) return res.status(400).json({ message: "phone required" });

    // LIVE ONLY
    const url = cfg.baseUrl.replace(/\/$/, "") + cfg.paths.clickToCall;

    const payload = {
      customer_number: to,
      reference_id: ref,
    };

    const response = await axios.post(url, payload, {
      headers: {
        "x-api-key": cfg.clickToCallApiKey,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    if (leadId) {
      await Lead.findByIdAndUpdate(leadId, {
        $inc: { attempts: 1 },
        lastCallAt: new Date(),
      });
    }

    return res.json(response.data);
  } catch (err) {
    console.error("SMARTFLO ERROR:", err.response?.data || err.message);
    return res
      .status(err.response?.status || 500)
      .json(err.response?.data || { message: err.message });
  }
};

exports.hangup = async (req, res) => {
  try {
    const { callId } = req.body || {};
    const cfg = smartfloConfig();
    if (!callId) return res.status(400).json({ message: "callId required" });

    if (cfg.mode === "mock")
      return res.json({ mode: "mock", callId, status: "Ended", at: nowIso() });

    const url = cfg.baseUrl.replace(/\/$/, "") + cfg.paths.hangup;
    const response = await axios.post(
      url,
      { callId },
      {
        headers: {
          Authorization: `Bearer ${cfg.accountToken}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    res.json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { message: err.message });
  }
};

exports.status = async (req, res) => {
  try {
    const { callId } = req.params;
    const cfg = smartfloConfig();

    if (cfg.mode === "mock")
      return res.json({
        mode: "mock",
        callId,
        status: "Connected",
        at: nowIso(),
      });

    const url =
      cfg.baseUrl.replace(/\/$/, "") +
      cfg.paths.status +
      `/${encodeURIComponent(callId)}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${cfg.accountToken}` },
      timeout: 30000,
    });
    res.json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { message: err.message });
  }
};
