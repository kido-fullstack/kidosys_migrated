require('dotenv').config();

module.exports = Object.assign({}, {
    server: {
        port: process.env.PORT,
        env: process.env.NODE_ENV,
        devenv: process.env.DEVENV,
        ssl: {
            key: process.env.SSLPATH_KEY || "",
            cert: process.env.SSLPATH_CERT || ""
        }
    },
    db: {
      devDb: {
        server: process.env.DB_SERVER_NAME,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME,
        uri: process.env.DB_URI,
        type: process.env.DB_TYPE
      },
      serverDb: {
        server: process.env.DB_SERVER_NAME,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME,
        uri: process.env.DB_URI,
        type: process.env.DB_TYPE
      }
    },
    mail: {
      username: process.env.MAIL_USER,
      password: process.env.MAIL_PASS,
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT
      // service:'gmail'
    },
    mailMessage: {
      newUser: {
        subject: "Login credentials for your KIDOSYS account",
        title: "KIDO India"
      },
      approvalUser: {
        subject: "Approval mail for you.",
        title: "KIDO India"
      },
      existingUser: {
        subject: "Login credentials for your KIDOSYS account",
        title: "KIDO India"
      }
    },
    siteHeader: process.env.SITE_HEADER,
    sessionTime: process.env.SESSION_AGE,
    startPasswordNumber: process.env.START_PASS_NUM,
    endPasswordNumber: process.env.END_PASS_NUM,
    randomCharacters: process.env.RANDOM_CHARS,
    passwordExpiryDays: process.env.PASSWORD_EXPIRY_DAYS,
    smsAPI: process.env.SMS_API,
    smsAPIsenderID: process.env.SMS_API_SENDER_ID,
    smsAPIclientID: process.env.SMS_API_CLIENT_ID,
    smsAPIuser: process.env.SMS_API_USER,
    smsAPIpassword: process.env.SMS_API_PASSWORD,
    keys: {
      secret: process.env.SECRET,
      key: process.env.KEY
    },
    redis: {
      server: process.env.REDIS_SERVER,
      port: process.env.REDIS_PORT,
      expiry: process.env.REDIS_EXPIRY,
      encrypt: process.env.REDIS_ENCRYPT,
      retryDelay: process.env.REDIS_RETRY_DELAY,
      retryAttempts: process.env.REDIS_RETRY_ATTEMPTS,
      delay: process.env.REDIS_DELAY,
      maxAttempts: process.env.REDIS_MAX_ATTEMPTS,
      minDelay: process.env.REDIS_MIN_DELAY,
      maxDelay: process.env.REDIS_MAX_DELAY,
      clearInternalRedis: process.env.CLEAR_REDIS ? process.env.CLEAR_REDIS === 'true' : true,
      key: "roles"
    },
    log: {
      logLevel: process.env.LOG_LEVEL
    },
    admin: {
        email: process.env.SYS_ADMIN_EMAIL,
        password: process.env.SYS_ADMIN_PASSWORD,
        firstName: process.env.FIRSTNAME,
        lastName: process.env.LASTNAME,
        phone: process.env.PHONE,
        role: process.env.ROLE,
        userUniqueId: process.env.USER_UNIQUE_ID,
        empUniqueId: process.env.EMPLOYEE_UNIQUE_ID,
        adminApproval: process.env.ADMIN_APPROVAL,
        main: process.env.SUP_ADMIN
    }
})