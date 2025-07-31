const apiConfig = {
    protocol: "http",
    url: "192.168.0.111",
    port: 8080
}

export const api = `${apiConfig.protocol}://${apiConfig.url}:${apiConfig.port}`
