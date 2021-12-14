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
