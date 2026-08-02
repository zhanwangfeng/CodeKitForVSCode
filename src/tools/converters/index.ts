/** 7 个转换工具的注册表，按展示顺序导出 converterTools。 */
import { base64Tool } from './base64';
import { md5Tool } from './md5';
import { unicodeTool } from './unicode';
import { unixTimeTool } from './unixTime';
import { urlEncodeTool } from './urlEncode';
import { uuidTool } from './uuid';
import { varNameTool } from './varName';
import { Tool } from '../tool';

/** 7 个转换工具，顺序即 Tree View 中的展示顺序 */
export const converterTools: readonly Tool[] = [
  unixTimeTool,
  base64Tool,
  unicodeTool,
  uuidTool,
  md5Tool,
  urlEncodeTool,
  varNameTool,
];
