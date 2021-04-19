module.exports = {
  future: {
    webpack5: true,
  },
  target: 'serverless',
  webpack: (config, { webpack }) => {
    config.plugins.push(new webpack.IgnorePlugin(/^electron$/));
    return config
  }
};