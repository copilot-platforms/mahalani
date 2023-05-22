const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      'frame-ancestors https://dashboard.copilot-staging.com  https://dashboard.copilot.com https://*.copilot-staging.app https://*.copilot.app https://clients.infinite.law https://portal.potluckportal.com/;',
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
};
