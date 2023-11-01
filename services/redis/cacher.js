const redis = require('../redis/index');

exports.saveToCache = async (key, value) => {
  try {
    const status = await redis.getRedis().set(key, value);
    return status;
  } catch (err) {
    console.log(err);
    console.log('err in redis saveToCache.');
    return err;
  }
};

exports.getFromCache = async (key) => {
  try {
    const status = await redis.getRedis().get(key);
    return status;
  } catch (err) {
    console.log('err in redis getFromCache.');
    return err;
  }
};

exports.setKeyExpiry = async (key, expiry) => {
  try {
    const status = await redis.getRedis().expire(key, expiry);
    return status;
  } catch (err) {
    console.log('err in redis setKeyExpiry.');
    return err;
  }
};

exports.deleteKey = async (key) => {
  try {
    const status = await redis.getRedis().del(key);
    return status;
  } catch (err) {
    console.log('err in redis deleteKey.');
    return err;
  }
};

exports.saveToCacheAndExpire = async (key, value, expiry) => {
  try {
    await redis.getRedis().set(key, value);
    await redis.getRedis().expire(key, expiry);
    return true;
  } catch (err) {
    console.log('err in redis saveToCacheAndExpire.');
    return err;
  }
}

exports.checkKeyInCache = async (key) => {
  try {
    const status = await redis.getRedis().exists(key);
    return status;
  } catch (err) {
    console.log('err in redis checkKeyInCache.');
    return err;
  }
};

exports.saveMultiKeyToCache = async (key, value) => {
  try {
    const status = await redis.getRedis().hmset(key, value);
    return status;
  } catch (err) {
    console.log(err);
    console.log('err in redis saveMultiKeyToCache.');
    return err;
  }
};