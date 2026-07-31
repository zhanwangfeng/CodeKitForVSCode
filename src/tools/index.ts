import { helloWorldTool } from './helloWorld';
import { Tool } from './tool';

export const tools: readonly Tool[] = [helloWorldTool];

export type { Tool };
