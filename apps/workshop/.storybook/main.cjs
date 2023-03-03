module.exports = {
  'stories': [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  'addons': [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions'
  ],
  core: {
    builder: '@storybook/builder-vite',
  },
  'framework': '@storybook/react'
}
