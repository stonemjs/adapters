import babel from '@rollup/plugin-babel'
import multi from '@rollup/plugin-multi-entry'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeExternals from 'rollup-plugin-node-externals'

const inputs = {
  utils: 'src/utils.mjs',
  config: 'src/config/*.mjs',
  decorators: 'src/decorators/*.mjs',
  index: [
    'src/Mapper.mjs',
    'src/Adapter.mjs',
    'src/constants.mjs',
    'src/middleware/**/*.mjs',
    'src/NodeHttpAdapter.mjs',
  ],
}

export default Object.entries(inputs).map(([name, input]) => ({
	input,
	output: [
    { format: 'es', file: `dist/${name}.js` }
  ],
  plugins: [
    multi(),
    nodeExternals({
      include: ['@stone-js/adapters']
    }), // Must always be before `nodeResolve()`.
    nodeResolve({
      exportConditions: ['node', 'import', 'require', 'default']
    }),
    babel({ babelHelpers: 'bundled' }),
    commonjs()
  ]
}))