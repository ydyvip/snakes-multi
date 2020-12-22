module.exports = {
  devServer: {
    port: 8888,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    proxy: {
      '/api': {
          target: 'http://localhost:3006'
      },
      '/socket.io': {
        target: 'http://localhost:3006'
      }
    }
  }
}
