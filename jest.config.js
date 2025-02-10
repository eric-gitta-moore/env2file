/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  globals: {
    'process.env.SHELL': process.env.SHELL
  }
};