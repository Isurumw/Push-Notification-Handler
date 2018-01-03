var mongoose = require("mongoose"),
    config = require("config"),
    Schema = mongoose.Schema;

var applicationSchema = new Schema({
    name: { type: String, required: true },
    production: { type: Boolean, default: false },
    apn: {
      voip: { type: String },
      text: { type: String }
    },
    gcm: { type: String },
    description: { type: String }
  }, {
    timestamps: true
  }
);

module.exports = mongoose.model("Application", applicationSchema);
