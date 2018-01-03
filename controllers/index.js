var HttpStatus = require("http-status-codes"),
    helpers = require('../helpers'),
    application = require('../models').application,
    devicetoken = require('../models').devicetoken,
    fs = require('fs-extra'),
    Busboy = require('busboy'),
    path = require('path'),
    config = require("config");

module.exports = {
    getapplications: (req, res) => {
        application.findOne({ _id: req.app._id }, (err, result) => {
            if (err) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
            res.status(HttpStatus.OK).json(result);
        });
    },
    registerapplication: (req, res) => {
        let newApplication = new application(req.body);
        newApplication.save((err, result) => {
            if (err) return res.status(HttpStatus.BAD_REQUEST).json(err);
            saveApplication(result);
            res.status(HttpStatus.OK).json(result);
        });
    },
    editapplication: (req, res) => {
        application.findOneAndUpdate({ _id: req.app._id }, { $set: req.body }, { new: true }, (err, result) => {
            if (err) return res.status(HttpStatus.BAD_REQUEST).json(err);
            saveApplication(result);
            res.status(HttpStatus.OK).json(result);
        });
    },
    removeapplication: (req, res) => {
        application.remove({ _id: req.app._id }, (err, result) => {
            if (err) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
            res.status(HttpStatus.OK).json(result);
        });
    },
    getdevicetokens: (req, res) => {
        devicetoken.find({ appid: req.app._id }, (err, result) => {
            if (err) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
            res.status(HttpStatus.OK).json(result);
        });
    },
    getdevicetokensforuser: (req, res) => {
        devicetoken.find({ appid: req.app._id, userid: req.param('id') }, (err, result) => {
            if (err) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
            res.status(HttpStatus.OK).json(result);
        });
    },
    savedevicetoken: (req, res) => {
        req.body.appid = req.app._id;
        let newDevicetoken = new devicetoken(req.body);
        newDevicetoken.save((err, result) => {
            if (err) return res.status(HttpStatus.BAD_REQUEST).json(err);
            res.status(HttpStatus.OK).json(result);
        });
    },
    removedevicetoken: (req, res) => {
        devicetoken.remove({ token: req.param('token') }, (err, result) => {
            if (err) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
            res.status(HttpStatus.OK).json(result);
        });
    },
    uplodacert: (req, res) => {

        var busboy = new Busboy({ headers: req.headers });
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
            var folderPath = './cert/' + req.app.name + '_' + req.app._id;
            fs.emptyDir(folderPath, err => {
                if (err) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
                var saveTo = path.join(folderPath, path.basename(fieldname + '.pem'));
                file.pipe(fs.createWriteStream(saveTo));
            });
        });
        busboy.on('finish', function() {
            res.status(HttpStatus.OK).json({success: true, message: 'The files have been uploaded.'});
        });
        return req.pipe(busboy);

    },
    sendNotification: (req, res) => {

        let type = req.body.categoryid == config.notification.CATEGORYID[0] ? config.notification.TYPE[1] : config.notification.TYPE[0];
        let query = { appid: req.app._id, userid: req.body.to, type: type };
        
        devicetoken.find(query, (err, result) => {
            if (err) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);

            var tokensIos = result.filter(obj => obj.devicetype == config.notification.DEVICETYPE[0]).map(a => a.token);
            var tokensAndroid = result.filter(obj => obj.devicetype == config.notification.DEVICETYPE[1]).map(a => a.token);
            var certpath = type == config.notification.TYPE[0] ? req.app.apn.voip : req.app.apn.text

            let object = {
                certpath: certpath,
                gcm: req.app.gcm,
                production: req.app.production,
                title: req.body.title ? req.body.title : helpers.jsUcfirst(req.app.name) + ' messenger',
                message: req.body.message ? req.body.message : config.notification.MESSAGE,
                categoryid: req.body.categoryid,
                threadid: req.body.from,
                deviceType : req.body.devicetype,
                tokensIos: tokensIos,
                tokensAndroid: tokensAndroid
            }

            helpers.sendNotification(object).then(result => {
                res.status(HttpStatus.OK).json({success: true, message: 'The notification has been sent!'});
            }, err => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success: false, message: 'The notification send failure'});
            });
        });
    }
};

var updateEnvironment = (appId) => {
    application.findOne({ _id: appId }, (err, app) => {
        saveApplication(app);
    });
}

var saveApplication = (app) => {
    if (app.production) app.apn.text = './cert/' + app.name + '_' + app._id + '/pcert.pem';
    else app.apn.text = './cert/' + app.name + '_' + app._id + '/dcert.pem';
    app.apn.voip = './cert/' + app.name + '_' + app._id + '/voip.pem';
    app.save();
}
