module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@plantao/shared': '../../packages/shared/src',
        },
      },
    ],
  ],
};
