const redis = require('redis');

module.exports = {
  improve: '@apostrophecms/cache',
  methods(self) {
    return {
      // Fully replace the `enableCollection` method from core.
      async enableCollection() {
        const redisOptions = self.options.redis || {};

        if (!self.options.prefix) {
          if (self.options.prefix !== false) {
            // Distinguish sites
            self.options.prefix = self.apos.shortName + ':';
          }
        }

        self.prefix = self.options.prefix || '';
        self.client = redis.createClient(redisOptions);
      },
      getRedisKey(namespace, key) {
        return self.prefix + namespace + ':' + key;
      },

      // Get the cached value associated with the specified key from the
      // specified namespace. Returns undefined if not found. Be sure to use
      // `await`.
      async get(namespace, key) {
        key = self.getRedisKey(namespace, key);

        const json = await self.client.get(key);

        if (!json) {
          return undefined;
        }

        let data;

        try {
          data = JSON.parse(json);
        } catch (error) {
          self.apos.util.error(error);
          // An error here is likely due to invalid JSON structure.
          return undefined;
        }

        return data;
      }

    };
  },
  handlers(self) {
    return {
      // 'apostrophe:destroy': {
      //   closeRedisConnection () {
      //     self.client.stream.removeAllListeners();
      //     self.client.stream.destroy();
      //   }
      // }
    };
  }
};
