// eslint-disable-next-line
const { override, fixBabelImports, addLessLoader } = require('customize-cra')

// eslint-disable-next-line
module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { '@primary-color': '#FF0000' },
  }),
)
