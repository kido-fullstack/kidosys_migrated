/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const redis = require('./services/redis/');
const logger = require('./handlers/logger');
const config = require('./config/');

mongoose.set("strictQuery", false);
// Connect to our Database and handle any bad connections
mongoose.connect(`${config.db.devDb.uri}` , {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.once("open", async () => {
  console.log('Connection established to DB...');
  await require('./utils/adminDb').createSystemUser(config.admin)
  console.log("Server started now..");
  console.log('Trying to connect redis server now...');
  const client = redis.init(config.redis);
  redis.onError(client);
  redis.onConnect(client);
});

mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

db.on('error', (err) => {
  console.error(`🚫 🚫 🚫 🚫 → ${err.message}`);
});

// Import all our modelss
require('./models/Employee');
require('./models/Client');
require('./models/City');
require('./models/State');
require('./models/Center');
require('./models/Course');
require('./models/Category');
require('./models/Lead');
require('./models/Followup');
require('./models/Token');
require('./models/Zone');
require('./models/AcademicYear');
require('./models/Role');
require('./models/Permission');
require('./models/RoleAssign');
require('./models/Media');
require('./models/ProgramCategory');
require('./models/Program');
require('./models/Country');
require('./models/Message');
require('./models/Status');
require('./models/SubStatus');
require('./models/SpecificListing');
require('./models/Key');
require('./models/Response');
require('./models/ViewOption');
require('./models/Qrcode');
require('./models/Time');
require('./models/Acknowledgment');
require('./models/Otp');
require('./models/Bookmark');
require('./models/Counter');
require('./models/Feed');

// Start our app!
const app = require('./app');
app.set('port', config.server.port || 49005);
const server = app.listen(app.get('port'), () => {
  logger.log('info', {code: 200, msg: 'Server started!'});
  console.log(`Server trying to start at port ${server.address().port}....`);
  const io = require('./services/socket/').init(server);
  require('./services/socket/').connectionIO(io);
});

module.exports = db;