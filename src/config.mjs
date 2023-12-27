export const adapterConfig = {
  http: {
    node: {
      pipe: {
        request: [],
        response: []
      },
      server: {
        key: null,
        cert: null,
        port: 8080,
        protocol: 'http',
        hostname: 'localhost',
        requestTimeout: 300000
      }
    },
    aws: {
      lambda: {
        pipe: {
          request: [],
          response: []
        }
      }
    }
  },
  event: {
    aws: {
      lambda: {
        pipe: {
          request: [],
          response: []
        }
      }
    }
  }
}
