const Lead = require("../models/Lead");
const { parseLeadsFromFile, exportLeadsToCSV, exportLeadsToXLSX } = require("../helpers/excel");

function cleanPhone(p) {
  return String(p || "").replace(/\D/g, "");
}

exports.list = async (req, res, next) => {
  try {
    const { q, status, city, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (city) filter.city = city;
    if (q) {
      filter.$or = [{ name: { $regex: q, $options: "i" } }, { phone: { $regex: q, $options: "i" } }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Lead.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await Lead.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Lead not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.name || !body.phone) return res.status(400).json({ message: "name and phone required" });
    const lead = await Lead.create({ ...body, phone: cleanPhone(body.phone) });
    res.status(201).json({ item: lead });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const body = req.body || {};
    if (body.phone) body.phone = cleanPhone(body.phone);
    const item = await Lead.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!item) return res.status(404).json({ message: "Lead not found" });
    res.json({ item });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Lead.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Lead not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.importFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "file is required (field name: file)" });
    const leads = parseLeadsFromFile(req.file.buffer, req.file.originalname);

    const prepared = leads.map((l) => {
      const phone = cleanPhone(l.phone);
      const status = phone.length < 10 ? "Invalid" : (l.status || "New");
      return { ...l, phone, status };
    });

    const inserted = await Lead.insertMany(prepared.filter((l) => l.name && l.phone), { ordered: false });
    res.json({ inserted: inserted.length });
  } catch (err) {
    if (err && err.insertedDocs) return res.json({ inserted: err.insertedDocs.length, warning: "Some rows failed" });
    next(err);
  }
};

exports.exportFile = async (req, res, next) => {
  try {
    const format = String(req.query.format || "csv").toLowerCase();
    const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();

    const flat = leads.map((l) => ({
      id: l._id.toString(),
      name: l.name,
      phone: l.phone,
      city: l.city || "",
      place: l.place || "",
      status: l.status || "",
      notes: l.notes || "",
      attempts: l.attempts || 0,
      lastCallAt: l.lastCallAt ? new Date(l.lastCallAt).toISOString() : "",
      nextFollowUpAt: l.nextFollowUpAt ? new Date(l.nextFollowUpAt).toISOString() : "",
      customFields: JSON.stringify(l.customFields || {}),
    }));

    if (format === "xlsx") {
      const buf = exportLeadsToXLSX(flat);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=leads.xlsx");
      return res.send(buf);
    }

    const buf = exportLeadsToCSV(flat);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    return res.send(buf);
  } catch (err) {
    next(err);
  }
};
