/** 转换工具的注册表，按展示顺序导出 converterTools。 */
import { base64Tool } from './base64';
import { colorTool } from './color';
import { htmlEntityTool } from './htmlEntity';
import { jwtTool } from './jwt';
import { md5Tool } from './md5';
import { regexTool } from './regex';
import { shaTool } from './sha';
import { sqlTool } from './sql';
import { textCounterTool } from './textCounter';
import { unicodeTool } from './unicode';
import { unixTimeTool } from './unixTime';
import { urlEncodeTool } from './urlEncode';
import { uuidTool } from './uuid';
import { varNameTool } from './varName';
import { Tool } from '../tool';

/** 转换工具，顺序即 Tree View 中的展示顺序 */
export const converterTools: readonly Tool[] = [
  unixTimeTool,
  base64Tool,
  unicodeTool,
  uuidTool,
  md5Tool,
  urlEncodeTool,
  varNameTool,
  shaTool,
  jwtTool,
  colorTool,
  regexTool,
  htmlEntityTool,
  textCounterTool,
  sqlTool,
];
