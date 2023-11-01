const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const { promisify } = require('es6-promisify');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

//=======================

// import configuration
const config = require('./config/');
const responseBody = require('./config/responseSetting');

// handle our api routes!
const testApi = require('./routes/api/lead/index');
const accountAPIRoutes = require('./routes/api/account/index');
const centerAPIRoutes = require('./routes/api/center/index');
const qrLeadRoutes = require('./routes/api/qrcodelead/index')
const timeAPIRoutes = require('./routes/api/time/index');
const leadsAPIRoutes = require('./routes/api/leads/index');
const followupsAPIRoutes = require('./routes/api/followups/index');
const bookmarkAPIRoutes = require('./routes/api/bookmarks/index');
const programCatAPIRoutes = require('./routes/api/programCategory/index');
const programAPIRoutes = require('./routes/api/program/index');
const countryAPIRoutes = require('./routes/api/country/index');
const stateAPIRoutes = require('./routes/api/state/index');
const cityAPIRoutes = require('./routes/api/city/index');
const zoneAPIRoutes = require('./routes/api/zone/index');
const StatusAPIRoutes = require('./routes/api/status/index');
const KnowusAPIRoutes = require('./routes/api/knownus/index');
const quickResponseAPIRoutes = require('./routes/api/quickResponse/index');

// handle our admin routes!
const inventoryAdminRoutes = require('./routes/admin/inventory/index');
const accountAdminRoutes = require('./routes/admin/account/index');
const employeesAdminRoutes = require('./routes/admin/employee/index');
const clientAdminRoutes = require('./routes/admin/client/index');
const centerAdminRoutes = require('./routes/admin/center/index');
const categoryAdminRoutes = require('./routes/admin/category/index');
const courseAdminRoutes = require('./routes/admin/course/index');
const leadAdminRoutes = require('./routes/admin/lead/index');
const logAdminRoutes = require('./routes/admin/log/index');
const zoneAdminRoutes = require('./routes/admin/zone/index');
const messageAdminRoutes = require('./routes/admin/message/index');
const mediaAdminRoutes = require('./routes/admin/media/index');
const academicYearAdminRoutes = require('./routes/admin/academic-year/index');
const uacAdminRoutes = require('./routes/admin/uac/index');
const helperRoutes = require('./routes/api/helper/index'); // common api where we can use anywhere.
const programCategoryAdminRoutes = require('./routes/admin/program-category/index')
const programAdminRoutes = require('./routes/admin/program/index')
const countryAdminRoutes = require('./routes/admin/country/index');
const responsesAdminRoutes = require('./routes/admin/responses/index');
const qrcodeAdminRoutes = require('./routes/admin/qrcode/index');
const reportsAdminRoutes = require('./routes/admin/reports/index');
const socialAdminRoutes = require('./routes/admin/socialLeads/index');
//=======================================================
const helpers = require('./helpers');
const errorHandlers = require('./handlers/errorHandlers');
const plugin = require('./handlers/helper');
const services = require('./services/redis/cacher');

// === admin authorization == //
const authCheck = require('./controllers/admin/accountController');

const app = express();

// compress all responses
app.use(compression());

// Helmet can help protect our app from some well-known web vulnerabilities by setting HTTP headers appropriately.
// app.use(helmet());

app.use(cors());

app.use(express.json());

// for parsing application/x-www-form-urlencoded
// app.use(express.urlencoded({ extended: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json({
  limit: '200mb'
}));
app.use(bodyParser.urlencoded({
  limit: '200mb',
  extended: true,
  parameterLimit: 1000000000
}));

// const expiryDate = new Date(Date.now() + 60 * 60 * 1000)
app.use(cookieParser());
app.use(session({
  secret: config.keys.secret,
  key: config.keys.key,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.db.devDb.uri,
    autoRemove: "interval",
    autoRemoveInterval: 60, // In minutes
  }),
}));

// Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require('./handlers/passport')(passport);

app.use(flash());

app.use(async (req, res, next) => {
  res.locals.session = req.session;
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  res.locals.responseAdmin = responseBody.admin_response || {};
  res.locals.responseUrl = responseBody.redirect_url || {};
  res.locals.permissionCacheData = await services.getFromCache(config.redis.key);
  next();
});

// promisify some callback based APIs
app.use(async (req, res, next) => {
  req.login = promisify(req.login, req);
  req.config = config;
  req.responseAdmin = responseBody.admin_response || {};
  req.responseUrl = responseBody.redirect_url || {};
  req.permissionCacheData = await services.getFromCache(config.redis.key);
  req.checkSuperAdmin = await plugin.checkSuperAdmin(req, res, next);
  next();
});

app.use(async (req, res, next) => {
  res.locals.checkSuperAdmin = await plugin.checkSuperAdmin(req, res, next);
  next();
})

app.get('/', (req, res, next) => {
  res.redirect('/admin');
  return;
});

// handle our api routes!
app.use('/api', testApi);
app.use('/', qrLeadRoutes);
app.use('/api/account', accountAPIRoutes);
app.use('/api/center', centerAPIRoutes);
app.use('/api/leads', leadsAPIRoutes);
app.use('/api/followups', followupsAPIRoutes);
app.use('/api/bookmark', bookmarkAPIRoutes);
app.use('/api/programcategory', programCatAPIRoutes);
app.use('/api/program', programAPIRoutes);
app.use('/api/country', countryAPIRoutes);
app.use('/api/state', stateAPIRoutes);
app.use('/api/city', cityAPIRoutes);
app.use('/api/zone', zoneAPIRoutes);
app.use('/api/status', StatusAPIRoutes);
app.use('/api/sources', KnowusAPIRoutes);
app.use('/api/quickresponse', quickResponseAPIRoutes);

// handle our admin routes!
app.use('/admin', inventoryAdminRoutes);
app.use('/admin/account', accountAdminRoutes);
app.use('/admin/employee', employeesAdminRoutes);
app.use('/admin/client', clientAdminRoutes);
app.use('/admin/center', authCheck.authorization, centerAdminRoutes);
app.use('/admin/category', authCheck.authorization, categoryAdminRoutes);
app.use('/admin/course', authCheck.authorization, courseAdminRoutes);
app.use('/admin/lead', authCheck.authorization, leadAdminRoutes);
app.use('/admin/zone', authCheck.authorization, zoneAdminRoutes);
app.use('/admin/message', authCheck.authorization, messageAdminRoutes);
app.use('/admin/media', authCheck.authorization, mediaAdminRoutes);
app.use('/admin/academic/year', authCheck.authorization, academicYearAdminRoutes);
app.use('/admin/uac', authCheck.authorization, uacAdminRoutes);
app.use('/admin/programcategory', authCheck.authorization, programCategoryAdminRoutes);
app.use('/admin/program', authCheck.authorization, programAdminRoutes);
app.use('/admin/country', authCheck.authorization, countryAdminRoutes);
app.use('/admin/responses', responsesAdminRoutes);
app.use('/admin/qrcode', qrcodeAdminRoutes);
app.use('/admin/reports', authCheck.authorization, reportsAdminRoutes);
app.use('/admin/fb/leads', socialAdminRoutes);
app.use('/api', logAdminRoutes);
app.use('/api/time', timeAPIRoutes);
app.use('/api/helper', helperRoutes);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors);

// Otherwise this was a really bad error we didn't expect!
if (app.get('env') === 'development') {
  // not found err - DEV
  app.use(errorHandlers.notFoundDev);

  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.errorResponderDev);
  app.use(errorHandlers.errorHandlingMiddlewareDev);
} else {
  // not found err - PRODUCTION
  app.use(errorHandlers.notFoundProd);

  // production error handler
  app.use(errorHandlers.errorResponderProd);
  app.use(errorHandlers.errorHandlingMiddlewareProd);
}

// done! we export it so we can start the site in start.js
module.exports = app;