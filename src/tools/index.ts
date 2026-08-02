/** 工具注册表：汇总所有工具（Hello World、JSON Parser 及 7 个转换工具），供 extension 注册命令与 Tree View。 */
import { converterTools } from './converters';
import { helloWorldTool } from './helloWorld';
import { jsonParserTool } from './jsonParser';
import { Tool } from './tool';

export const tools: readonly Tool[] = [helloWorldTool, jsonParserTool, ...converterTools];

export type { Tool };
