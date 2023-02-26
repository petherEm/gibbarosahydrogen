/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: 'app',
  ignoredRouteFiles: ['**/.*'],
  watchPaths: ['./public'],
  server: './server.js',
  serverBuildTarget: "vercel",
  /**
   * The following settings are required to deploy Hydrogen apps to Oxygen:
   */
  
};
