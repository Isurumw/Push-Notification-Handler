var con = require('../controllers'),
    helpers = require('../helpers');

module.exports = (router) => {
  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });
  router.route('/app')
    .get(helpers.checkAppId, con.getapplications)
    .post(con.registerapplication)
    .put(helpers.checkAppId, con.editapplication)
    .delete(helpers.checkAppId, con.removeapplication);;
  router.route('/devicetoken')
    .get(helpers.checkAppId, con.getdevicetokens)
    .post(helpers.checkAppId, con.savedevicetoken);
  router.route('/devicetoken/:token').delete(helpers.checkAppId, con.removedevicetoken);
  router.route('/devicetoken/:id').get(helpers.checkAppId, con.getdevicetokensforuser)
  router.route('/notification').post(helpers.checkAppId, con.sendNotification);
  router.route('/files').post(helpers.checkAppId, con.uplodacert);
}
