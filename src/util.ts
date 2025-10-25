

/**
 * 获取文件的扩展名。
 * 如果文件名中包含扩展名，则提取扩展名；否则根据文件的MIME类型推断扩展名。
 *
 * @param file - 需要获取扩展名的文件对象。
 * @returns - 文件的扩展名，如果无法获取则返回null。
 */
export function getExtension(file: File) {
    const filename = file.name;
    const match = filename.match(/\.([^.]+)$/);
    if (match) {
        return match[1];
    } else {
        // 没有扩展名，提取文件的MIME类型
        const mimeType = file.type;
        if (mimeType.startsWith("image/")) {
            return mimeType.substring(6);
        } else if (mimeType.startsWith("audio/")) {
            return mimeType.substring(6);
        } else {
            return null;
        }
    }
}

export function getExtensionFromName(filename: string) {
    return filename.match(/\.([^.]+)$/)?.[1] || null;
}

 

export function getMimeTypeFromName(basicType:string, filename: string) {
    return basicType + "/" + getExtensionFromName(filename)
}
