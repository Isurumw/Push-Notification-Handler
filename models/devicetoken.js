var mongoose = require("mongoose"),
    config = require("config"),
    Schema = mongoose.Schema;

var devicetokenSchema = new Schema({
    type: { type: String, enum: config.notification.TYPE, required: true },
    token: { type: String, required: true, unique: true },
    appid: { type: String, required: true },
    userid: { type: String, required: true },
    devicetype: { type: String, enum: config.notification.DEVICETYPE, required: true },
  }, {
    timestamps: true
  }
);

module.exports = mongoose.model("Devicetoken", devicetokenSchema);
