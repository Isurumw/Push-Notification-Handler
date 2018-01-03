var config = require('config'),
    HttpStatus = require('http-status-codes'),
    pushNotification = require('push-notification'),
    path = require('path'),
    application = require('../models').application,
    deviceType = pushNotification.DeviceType;

exports.sendNotification = (object) => {
    return new Promise((resolve, reject) => {
        let pn = pushNotification({
            apn: {
                cert: path.resolve(object.certpath),
                key: path.resolve(object.certpath),
                production: object.production,
            },
            gcm: {
                apiKey: object.gcm
            }
        });
    
        let data = {
            'title': object.title,
            'message': object.message,
            'badge': 0,
            'sound': config.notification.SOUND,
            'payload' : { 'thread-id' : object.threadid, 'category-id' : object.categoryid }
        };
        let resources = []
        if (object.certpath && object.tokensIos.length != 0) {
            resources.push(send(pn, object.tokensIos, data, deviceType.IOS));
        }
        if (object.gcm && object.tokensAndroid.length != 0) {
            resources.push(send(pn, object.tokensAndroid, data, deviceType.ANDROID));
        }
        if (resources.length == 0) {
            return reject({success: false, message: 'The notification send failure'});
        }
        Promise.all(resources).then(res => {
            resolve(res);
        }, err => {
            reject(err);
        });
    });
};

var send = (pn, tokens, data, deviceType) => {
    return new Promise(function(resolve, reject) {
        pn.push(tokens, data, deviceType).then(res => {
            resolve(res);
        }, err => {
            reject(err);
        });
    });
}

exports.checkAppId = (req, res, next) => {
    let id =  req.body.appId || req.body.appId || req.headers['appid'] || req.param('appid') || req.query.appId
    application.findOne({ _id: id }, (err, result) => {
        if (err) {
            res.status(HttpStatus.UNAUTHORIZED).json({success: false, message: "Unauthorized"});
        } else {
            req.app = result;
            next();
        }
    })
}

exports.jsUcfirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
