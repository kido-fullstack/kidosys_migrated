exports.config = {
  "port": 49005,
  "logConfig": {
    "logFolder": ".//logs//",
    "logFile": "combined.log"
  },
  "errLogConfig": {
    "errLogFolder": ".//logs//",
    "errLogFile": "errorLogs.log"
  },
  "expLogConfig": {
    "expLogFolder": ".//logs//",
    "expLogFile": "exceptionErrLogs.log"
  },
  "rejLogConfig": {
    "rejLogFolder": ".//logs//",
    "rejLogFile": "rejectionErrLogs.log"
  }
}