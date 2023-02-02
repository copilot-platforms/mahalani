const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      'frame-ancestors https://dashboard.copilot-staging.com https://*.copilot-staging.app;',
  },
];

module.exports = {
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:appId',
        headers: securityHeaders,
      },
    ];
  },
  reactStrictMode: true,
};
