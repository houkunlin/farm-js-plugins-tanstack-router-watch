# farm js-plugins-tanstack-router-watch

![npm](https://img.shields.io/npm/v/%40houkunlin%2Ffarm-js-plugin-tanstack-router-watch.svg)

> tanstack router 路由文件变更监听，然后重新生成 routeTree.gen.ts 文件

## 示例

```bash
npm i -D @houkunlin/farm-js-plugin-tanstack-router-watch
```

`farm.config.js`

```ts
import { defineConfig } from '@farmfe/core';
import * as path from 'node:path';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import farmJsPluginTanstackRouterWatch from '@houkunlin/farm-js-plugin-tanstack-router-watch';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  compilation: {
    input: {
      // 可以配置相对或者绝对路径
      index: './src/index.html',
    },
    output: {
      path: 'dist',
      publicPath: '/',
      targetEnv: 'browser',
      filename: 'assets/[name]_[hash].[ext]',
      assetsFilename: 'static/[name].[ext]',
    },
    resolve: {
      alias: {
        '@/': path.join(process.cwd(), 'src'),
      },
    },
    external: ['node:fs'],
    sourcemap: isDev ? 'all' : false,
  },
  // Dev Server 相关配置
  server: {
    port: 9000,
  },
  // 插件配置
  plugins: [
    [
      '@farmfe/plugin-react',
      {
        refresh: isDev,
        development: isDev,
        runtime: 'automatic',
      },
    ],
    farmJsPluginTanstackRouterWatch({
      watchEvents: ['add', 'unlink'],
      options: {
        target: 'react',
        routesDirectory: 'src/routes/',
      },
    }),
  ],
  vitePlugins: [
    tanstackRouter({
      target: 'react',
      routesDirectory: 'src/routes/',
      // 在开发环境下 autoCodeSplitting: true 会无法加载页面，但是 build 后就正常了
      autoCodeSplitting: isProd,
      // 禁用 tanstackRouter 插件的生成 routeTree.gen.ts 功能，使用 farmJsPluginTanstackRouterWatch 插件来达成此目的
      enableRouteGeneration: false,
    }),
  ],
});

```
