const assert = require('assert')
const Cache = require('../src/index')

let cache

describe('cacheman-memory', function () {

  before(function(done){
    cache = new Cache({}, {})
    done()
  })

  after(function(done){
    cache.clear(done)
  })

  it('should have main methods', function () {
    assert.ok(cache.set)
    assert.ok(cache.get)
    assert.ok(cache.del)
    assert.ok(cache.clear)
    assert.ok(cache.getAll)
  })

  it('should store items', function (done) {
    cache.set('test1', { a: 1 }, function (err) {
      if (err) return done(err)
      cache.get('test1', function (err, data) {
        if (err) return done(err)
        assert.equal(data.a, 1)
        done()
      })
    })
  })

  it('should store zero', function (done) {
    cache.set('test2', 0, function (err) {
      if (err) return done(err)
      cache.get('test2', function (err, data) {
        if (err) return done(err)
        assert.strictEqual(data, 0)
        done()
      })
    })
  })

  it('should store false', function (done) {
    cache.set('test3', false, function (err) {
      if (err) return done(err)
      cache.get('test3', function (err, data) {
        if (err) return done(err)
        assert.strictEqual(data, false)
        done()
      })
    })
  })

  it('should store null', function (done) {
    cache.set('test4', null, function (err) {
      if (err) return done(err)
      cache.get('test4', function (err, data) {
        if (err) return done(err)
        assert.strictEqual(data, null)
        done()
      })
    })
  })

  it('should delete items', function (done) {
    let value = Date.now()
    cache.set('test5', value, function (err) {
      if (err) return done(err)
      cache.get('test5', function (err, data) {
        if (err) return done(err)
        assert.equal(data, value)
        cache.del('test5', function (err) {
          if (err) return done(err)
          cache.get('test5', function (err, data) {
            if (err) return done(err)
            assert.equal(data, null)
            done()
          })
        })
      })
    })
  })

  it('should clear items', function (done) {
    let value = Date.now()
    cache.set('test6', value, function (err) {
      if (err) return done(err)
      cache.get('test6', function (err, data) {
        if (err) return done(err)
        assert.equal(data, value)
        cache.clear(function (err) {
          if (err) return done(err)
          cache.get('test6', function (err, data) {
            if (err) return done(err)
            assert.equal(data, null)
            done()
          })
        })
      })
    })
  })

  it('should expire key', function (done) {
    this.timeout(0)
    cache.set('test1', { a: 1 }, 1, function (err) {
      if (err) return done(err)
      setTimeout(function () {
        cache.get('test1', function (err, data) {
          if (err) return done(err)
          assert.equal(data, null)
          done()
        })
      }, 1100)
    })
  })

  it('should get all items in cache', function (done) {
    let entries, items = [
      { key: 'test0', data: { a: 'test0' } },
      { key: 'test1', data: { a: 'test1' } },
      { key: 'test2', data: { a: 'test2' } }
    ]

    function compare(a, b) {
      if (a.key < b.key) return -1
      else if (a.key > b.key) return 1
      else return 0
    }

    items.forEach(function (obj, index) {
      cache.set(obj.key, obj.data, function (err, val) {
        assert.deepEqual(null, err)
      })
    })

    cache.getAll(function (err, results) {
      assert.deepEqual(null, err)
      entries = results.sort(compare)
      assert.deepEqual(items, entries)
      done()
    })
  })

  it('should not expire key', function (done) {
    this.timeout(0)
    cache.set('test1', { a: 1 }, -1, function (err) {
      if (err) return done(err)
      setTimeout(function () {
        cache.get('test1', function (err, data) {
          if (err) return done(err)
          assert.deepEqual(data, { a: 1 })
          done()
        })
      }, 500)
    })
  })

})
