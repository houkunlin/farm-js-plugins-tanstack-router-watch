import type { JsPlugin } from '@farmfe/core';
import { Config, getConfig } from '@tanstack/router-plugin';
import { type FileEventType, Generator, type GeneratorEvent, resolveConfigPath, } from '@tanstack/router-generator';
import path, { normalize } from 'node:path';
import chokidar from 'chokidar';
import { EventName } from "chokidar/handler.js";

export interface TanstackRouterWatchOptions {
  /**
   * tanstackRouter 插件的配置
   */
  options?: Partial<Config>;
  /**
   * 监听文件变更事件类型
   */
  watchEvents?: ('add' | 'change' | 'unlink')[];
}

/**
 * TanStack Router 路由文件变更监听，并生成 routeTree.gen.ts 文件
 * @param options
 * @constructor
 */
export default function farmJsPluginTanstackRouterWatch(
  options: TanstackRouterWatchOptions = { options: {}, watchEvents: [] },
): JsPlugin {
  const ROOT: string = process.cwd();
  let userConfig = (options.options ?? {}) as Config;
  let generator: Generator;

  const initConfigAndGenerator = () => {
    userConfig = getConfig(options.options ?? {}, ROOT);
    generator = new Generator({
      config: userConfig,
      root: ROOT,
    });
  };

  const generate = async (opts?: { file: string; event: FileEventType }) => {
    let generatorEvent: GeneratorEvent | undefined = undefined;
    if (opts) {
      const filePath = normalize(opts.file);
      if (filePath === resolveConfigPath({ configDirectory: ROOT })) {
        initConfigAndGenerator();
        return;
      }
      generatorEvent = { path: filePath, type: opts.event };
    }

    try {
      await generator.run(generatorEvent);
      // @ts-ignore
      globalThis.TSR_ROUTES_BY_ID_MAP = generator.getRoutesByFileMap();
    } catch (e) {
      console.error(e);
      console.info();
    }
  };

  return {
    name: 'farm-js-plugin-tanstack-router-watch',
    configResolved: () => {
      initConfigAndGenerator();
    },
    configureDevServer: () => {
      const watchPath = path.join(ROOT, userConfig.routesDirectory);

      console.info(`TSR: Watching routes (${watchPath})...`);

      const watcher = chokidar.watch(watchPath, {
        // 忽略以点开头的隐藏文件
        ignored: /(^|[\/\\])\../,
        persistent: true,
        // 是否忽略初始化时的 add 事件
        ignoreInitial: false,
        // 默认递归深度，设置大点可以监听深层文件夹
        // depth: 99,
      });
      // @ts-ignore
      watcher.on('ready', async () => {
        // @ts-ignore
        watcher.on('all', (event: EventName, path: string) => {
          // @ts-ignore
          if ((options.watchEvents?.length ?? 0) === 0 || options.watchEvents?.includes(event)) {
            let type: FileEventType | undefined;
            switch (event) {
              case 'add':
                type = 'create';
                break;
              case 'change':
                type = 'update';
                break;
              case 'unlink':
                type = 'delete';
                break;
            }
            // console.log(`TSR: Watching routes (${watchPath}) --> ${type} : ${path}`);
            if (type) {
              generate({ file: path, event: type });
            }
          }
        });
      });
    },
    buildStart: {
      executor: async () => {
        await generate();
      },
    },
    // updateModules: {
    //   executor: async (param, context, hookContext) => {
    //     const updatePathContent = param.paths[0];
    //     const ModifiedPath = updatePathContent[0];
    //
    //     const watchEventChange = {
    //       Added: 'create',
    //       Updated: 'update',
    //       Removed: 'delete',
    //     };
    //
    //     // @ts-ignore
    //     const eventChange = watchEventChange[updatePathContent[1]];
    //
    //     console.log(`TSR: Watching routes updateModules --> ${eventChange} : ${ModifiedPath}`);
    //     // await generate({ file: ModifiedPath, event: eventChange });
    //   },
    // },
  };
}
