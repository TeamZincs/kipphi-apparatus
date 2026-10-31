import mime from './mime-types';

/** `a/b/c.ogg` → `ogg`（没有扩展名返回 null） */
export function getExtensionFromName(filename: string): string | null {
    return filename.match(/\.([^.]+)$/)?.[1] || null;
}

export function getMimeTypeFromName(filename: string): string {
    return mime.getType(filename) ?? 'application/octet-stream';
}
