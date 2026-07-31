import { helloWorldTool } from './helloWorld';
import { jsonParserTool } from './jsonParser';
import { Tool } from './tool';

export const tools: readonly Tool[] = [helloWorldTool, jsonParserTool];

export type { Tool };
