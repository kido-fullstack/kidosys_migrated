let redis;
let client;

module.exports = {
  init: redisConfig => {
    redis = require('redis');
    client = redis.createClient({
      url: `redis://${redisConfig.server}:${redisConfig.port}`
    });
    return client;
  },
  onError: client => {
    return client.on('error', (err) => console.log('Redis Client Error', err));
  },
  onConnect: client => {
    return client.connect().then(() => console.log('Redis server established successfully.'));
  },
  getRedis: () => {
    if (!client) {
      throw new Error('redis is not initialized!');
    }
    return client;
  }
}