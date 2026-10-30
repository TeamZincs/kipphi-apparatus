
import { watch } from 'fs/promises';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

/**
 * 递归提取所有键路径
 */
function extractKeys(obj: Object, prefix = ''): Record<string, string[]> {
  let keys: Record<string, string[]>= {};
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 递归处理嵌套对象
      keys = Object.assign(keys,(extractKeys(value, fullKey)));
    } else {
      // 叶子节点，添加键路径
      keys[fullKey] = (value as string)
        .matchAll(/\{([A-z0-9]+?)\}/g)
        .map((arr) => {
          return arr[1]!;
        })
        .toArray();
    }
  }
  
  return keys;
}

/**
 * 生成TypeScript声明文件内容
 */
function generateTypeDefinitions(keyMapping: Record<string, string[]>) {
  return `// 从locale文件自动生成的类型定义
// 请勿手动修改此文件

// 导出类型以便其他地方使用
export interface I18nMapping {
    ${Object.entries(keyMapping).map(([key, value]) => `"${key}": ${
        value.length > 0
      ? value.map(v => `"${v}"`).join(' | ')
      : "never"
    }`).join(';\n')
    }
}

`;
}

/**
 * 主函数
 */
async function main() {
  try {
    const inputFile = resolve('src/locales/zh-Hans.json');
    const outputFile = resolve('src/i18n-types.d.ts');
    
    // 读取JSON文件
    const jsonData = JSON.parse(await readFile(inputFile, 'utf-8'));
    
    // 提取所有键
    const keyMapping = extractKeys(jsonData);
    
    // 生成类型定义
    const typeDefinitions = generateTypeDefinitions(keyMapping);
    
    // 写入文件
    await writeFile(outputFile, typeDefinitions);
    
    console.log(`成功生成类型定义文件: ${outputFile}`);
    console.log(`共找到 ${Object.keys(keyMapping).length} 个翻译键`);
  } catch (error) {
    console.error('处理过程中发生错误:', error.message);
  }
}

let lastTime = performance.now();

await main();

if (process.argv.includes("--watch")) {
    const watcher = watch("src/locales");
    for await (const event of watcher) {
      // 防抖
      if (performance.now() - lastTime < 500) {
        continue;
      }
      lastTime = performance.now();
      await main();
    }
}