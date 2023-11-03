require('dotenv').config();

module.exports = Object.assign({}, {
    server: {
        port: process.env.PORT || 49006,
        env: process.env.NODE_ENV || "development",
        devenv: process.env.DEVENV || "dev", // dev, uat, prod
        ssl: {
            key: process.env.SSLPATH_KEY || "",
            cert: process.env.SSLPATH_CERT || ""
        }
    },
    db: {
      devDb: {
        server: process.env.DB_SERVER_NAME || "localhost",
        port: process.env.DB_PORT || 27017,
        username: process.env.DB_USERNAME || "",
        password: process.env.DB_PASSWORD || "",
        dbName: "test",
        uri: "mongodb+srv://kido_admin:q8HeYTvfYwOyv4lz@kido.flmyjkt.mongodb.net/?retryWrites=true&w=majority",
        type: process.env.DB_TYPE || "mongodb"
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
      username: process.env.MAIL_USER || "rahulgupta0992@gmail.com",
      // username: process.env.MAIL_USER || "kidoindia@kidoschools.com",
      password: process.env.MAIL_PASS || "rvnsatmbztcchfid",
      // password: process.env.MAIL_PASS || "ydbeozqojyblyukp",
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: process.env.MAIL_PORT || 587
      // service:'gmail'
    },
    mailMessage: {
      newUser: {
        subject: "Kido CRM login credentials",
        title: "Kido CRM"
      },
      approvalUser: {
        subject: "Approval mail for you.",
        title: "Kido CRM"
      },
      existingUser: {
        subject: "Kido CRM login credentials",
        title: "Kido CRM"
      }
    },
    siteHeader: process.env.SITE_HEADER || "http",
    sessionTime: process.env.SESSION_AGE || 43200000,
    startPasswordNumber: process.env.START_PASS_NUM || 8,
    endPasswordNumber: process.env.END_PASS_NUM || 14,
    randomCharacters: process.env.RANDOM_CHARS || "&~$@#",
    passwordExpiryDays: process.env.PASSWORD_EXPIRY_DAYS || 90,
    smsAPI: process.env.SMS_API || "http://mobicomm.dove-sms.com//REST/sendsms/",
    smsAPIsenderID: process.env.SMS_API_SENDER_ID || "KIDOED",
    smsAPIclientID: process.env.SMS_API_CLIENT_ID || "1947692308",
    smsAPIuser: process.env.SMS_API_USER || "KidoEdu",
    smsAPIpassword: process.env.SMS_API_PASSWORD || "01a7ebe9c3XX",
    keys: {
      secret: process.env.SECRET || "kido_app",
      key: process.env.KEY || "mng_lead_app"
    },
    redis: {
      server: process.env.REDIS_SERVER || "localhost",
      port: process.env.REDIS_PORT || 6379,
      expiry: process.env.REDIS_EXPIRY || 600,
      encrypt: process.env.REDIS_ENCRYPT || "",
      retryDelay: process.env.REDIS_RETRY_DELAY || 3000,
      retryAttempts: process.env.REDIS_RETRY_ATTEMPTS || 300,
      delay: process.env.REDIS_DELAY || 200,
      maxAttempts: process.env.REDIS_MAX_ATTEMPTS || 3,
      minDelay: process.env.REDIS_MIN_DELAY || 200,
      maxDelay: process.env.REDIS_MAX_DELAY || 400,
      clearInternalRedis: process.env.CLEAR_REDIS ? process.env.CLEAR_REDIS === 'true' : true,
      key: "roles"
    },
    log: {
      logLevel: process.env.LOG_LEVEL || 0
    },
    admin: {
        email: process.env.SYS_ADMIN_EMAIL || "sysadmin@system.com",
        password: process.env.SYS_ADMIN_PASSWORD || "asdf@123",
        firstName: process.env.FIRSTNAME || "system",
        lastName: process.env.LASTNAME || "admin",
        phone: process.env.PHONE || 9876543210,
        role: process.env.ROLE || "admin",
        userUniqueId: process.env.USER_UNIQUE_ID || "#sysadmin_909090",
        empUniqueId: process.env.EMPLOYEE_UNIQUE_ID || "19251914132000",
        adminApproval: process.env.ADMIN_APPROVAL || 1,
        main: process.env.SUP_ADMIN || "super_admin"
    }
})