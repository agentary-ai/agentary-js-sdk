import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

const baseConfig = {
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: ['> 1%', 'last 2 versions', 'not dead']
          },
          modules: false
        }]
      ]
    })
  ],
  external: []
};

// Web worker configuration
const workerConfig = {
  ...baseConfig,
  input: 'src/core/webllm-worker.js',
  output: {
    file: 'dist/webllm-worker.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    ...baseConfig.plugins,
    ...(isProduction ? [terser()] : [])
  ]
};

// Service worker configuration
const serviceWorkerConfig = {
  ...baseConfig,
  input: 'src/core/webllm-service-worker.js',
  output: {
    file: 'dist/webllm-service-worker.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    ...baseConfig.plugins,
    ...(isProduction ? [terser()] : [])
  ]
};

// Main SDK configurations
const mainConfig = {
  ...baseConfig,
  input: 'src/index.js'
};

const configs = [
  workerConfig,
  serviceWorkerConfig,
  
  // ES Module build
  {
    ...mainConfig,
    output: {
      file: 'dist/agentary.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      ...baseConfig.plugins,
      ...(isProduction ? [terser()] : [])
    ]
  },
  
  // CommonJS build
  {
    ...mainConfig,
    output: {
      file: 'dist/agentary.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    plugins: [
      ...baseConfig.plugins,
      ...(isProduction ? [terser()] : [])
    ]
  },
  
  // UMD build for browsers
  {
    ...mainConfig,
    output: {
      file: 'dist/agentary.umd.js',
      format: 'umd',
      name: 'Agentary',
      sourcemap: true
    },
    plugins: [
      ...baseConfig.plugins,
      ...(isProduction ? [terser()] : [])
    ]
  }
];

export default configs; 