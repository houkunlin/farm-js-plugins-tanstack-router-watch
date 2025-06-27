/**
 * MIT License
 *
 * Copyright (c) 2022 farm-fe
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * @see https://github.com/farm-fe/farm/blob/main/configs/farm-js-plugin.base.config.mjs
 */
import { builtinModules } from 'module';

const format = process.env.FARM_FORMAT || 'cjs';
const ext = format === 'esm' ? 'mjs' : 'cjs';

export function createFarmJsPluginBuildConfig(plugins, options = {}) {
  return {
    compilation: {
      input: {
        index: './src/index.ts',
      },
      output: {
        path: `build/${format}`,
        entryFilename: `[entryName].${ext}`,
        targetEnv: 'node',
        format,
      },
      external: [
        '@farmfe/core',
        ...builtinModules.map((m) => `^${m}$`),
        ...builtinModules.map((m) => `^node:${m}$`),
        ...(options.external || []),
      ],
      partialBundling: {
        enforceResources: [
          {
            name: 'index.js',
            test: ['.+'],
          },
        ],
      },
      minify: false,
      sourcemap: false,
      presetEnv: false,
      persistentCache: {
        envs: {
          FARM_FORMAT: format,
        },
      },
    },
    server: {
      hmr: false,
    },
    plugins,
  };
}
