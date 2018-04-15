'use strict';

/**
 * Module dependencies.
 */

import lru from 'lru-cache';

/**
 * Module constants.
 */

const noop = () => {};

export default class MemoryStore {

  /**
   * MemoryStore constructor.
   *
   * @param {Object} options
   * @api public
   */

  constructor(options = {}) {
    this.client = lru(options.count || 100);
  }

  /**
   * Get an entry.
   *
   * @param {String} key
   * @param {Function} fn
   * @api public
   */

  get(key, fn = noop) {
    let val, data = this.client.get(key);
    if (!data) return fn(null, data);
    if (data.expire < Date.now()) {
      this.client.del(key);
      return setImmediate(fn);
    }
    try {
      val = JSON.parse(data.value);
    } catch (e) {
      return setImmediate(fn.bind(null, e));
    }

    setImmediate(fn.bind(null, null, val));
  }

  /**
   * Set an entry.
   *
   * @param {String} key
   * @param {Mixed} val
   * @param {Number} ttl
   * @param {Function} fn
   * @api public
   */

  set(key, val, ttl, fn = noop) {

    let data;
    if ('function' === typeof ttl) {
      fn = ttl;
      ttl = null;
    }

    if ('undefined' === typeof val) return fn();

    try {
      data = {
        value: JSON.stringify(val),
        expire: Date.now() + ((ttl || 60) * 1000)
      };
    } catch (e) {
      return setImmediate(fn.bind(null, e));
    }

    this.client.set(key, data);

    setImmediate(fn.bind(null, null, val));

  }

  /**
   * Delete an entry.
   *
   * @param {String} key
   * @param {Function} fn
   * @api public
   */

  del(key, fn = noop) {
    this.set(key, null, -1, fn);
  }

  /**
   * Clear all entries for this bucket.
   *
   * @param {Function} fn
   * @api public
   */

  clear(fn = noop) {
    this.client.reset();
    setImmediate(fn);
  }

  /**
   * Get all entries in cache.
   *
   * @param {Function} fn
   * @api public
   */

  getAll(fn = noop) {
    let entries = [];
    let keys = this.client.keys();

    this.client.forEach((value, key, cache) => {
      entries.push({ key: key, data: JSON.parse(value.value) });
    });

    fn(null, entries);
  }
}
