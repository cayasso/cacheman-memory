'use strict';

/**
 * Module dependencies.
 */

var lru = require("lru-cache")
  , noop = function () {};

/**
 * Export `MemoryStore`.
 */

module.exports = MemoryStore;

/**
 * RedisStore constructor.
 *
 * @param {Object} options
 * @param {Bucket} bucket
 * @api public
 */

function MemoryStore(options, bucket) {
  options = options || {};
  this.bucket = bucket || {};
  this.client = lru(options.count || 100);
}

/**
 * Get an entry.
 *
 * @param {String} key
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.get = function get(key, fn) {
  fn = fn || noop;
  var data = this.client.get(key);
  if (!data) return fn(null, data);
  if (data.expire < Date.now()) {
    this.client.del(key);
    return fn();
  }
  try {
    fn(null, JSON.parse(data.value));
  } catch (e) {
    fn(e);
  }
};

/**
 * Set an entry.
 *
 * @param {String} key
 * @param {Mixed} val
 * @param {Number} ttl
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.set = function set(key, val, ttl, fn) {
  
  if ('function' === typeof ttl) {
    fn = ttl;
    ttl = null;
  }

  fn = fn || noop;

  if ('undefined' === typeof val) return fn(null, null);

  try {
    var data = {
      value: JSON.stringify(val),
      expire: Date.now() + ((ttl || 60) * 1000)
    };
  } catch (e) {
    fn(e);
  }

  this.client.set(key, data);
  fn(null, val);
};

/**
 * Delete an entry.
 *
 * @param {String} key
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.del = function del(key, fn) {
  fn = fn || noop;
  this.set(key, null, -1, fn);
};

/**
 * Clear all entries for this bucket.
 *
 * @param {String} key
 * @param {Function} fn
 * @api public
 */

MemoryStore.prototype.clear = function clear(prefix, fn) {
  fn = fn || noop;
  this.client.reset();
  process.nextTick(fn);
};