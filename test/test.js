const assert = require('assert');
const testUtil = require('apostrophe/test-lib/test');
const range = require('lodash.range');
// const async = require('async');

describe('Apostrophe cache implementation in Redis', function() {
  let apos;

  this.timeout(10000);

  after(async () => {
    testUtil.destroy(apos);
  });

  it('should be a property of the apos object', async () => {
    apos = await testUtil.create({
      shortname: 'test-redis',
      testModule: true,
      modules: {
        '@apostrophecms/express': {
          options: {
            port: 4242,
            session: { secret: 'test-the-redis' }
          }
        },
        '@apostrophecms/cache-redis': {
          options: {
            redisActive: true
          }
        }
      }
    });

    assert(apos.modules['@apostrophecms/cache'].options.redisActive === true);
  });

  it('initializes a redis client', async () => {
    assert(apos.cache.client);
  });

  it('can store 2000 keys in Cache One', async function() {
    const values = range(0, 2000);
    const responses = [];
    for (const val of values) {
      const response = await apos.cache.set('cache-one', val, val);
      responses.push(response);
    }

    assert(responses.length === 2000);
    assert(!responses.find(r => r !== 'OK'));
  });
  it('can store 2000 keys in Cache Two', async function() {
    const values = range(2000, 4000);
    const responses = [];
    for (const val of values) {
      const response = await apos.cache.set('cache-two', val, val);
      responses.push(response);
    }

    assert(responses.length === 2000);
    assert(!responses.find(r => r !== 'OK'));
  });

  it('can retrieve key from cache 1', async function() {
    const val = await apos.cache.get('cache-one', 1000);
    assert(val === 1000);
  });
  it('can retrieve key from cache 2', async function() {
    const val = await apos.cache.get('cache-two', 3000);

    assert(val === 3000);
  });
  it('cannot retrieve Cache Two key from Cache One (namespacing)', async function() {
    const val = await apos.cache.get('cache-one', 3000);

    assert(val === undefined);
  });
});
