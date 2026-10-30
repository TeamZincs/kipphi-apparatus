import Notification from '#/components/Notification.grain';

export function notify(message: string, type: 'info' | 'error' | 'warning') {
    const target = document.getElementById('notifications') ?? document.body;

    // grain 没有 unmount：把这一次弹出来占的节点记下来，自己收
    const before = new Set<Node>(Array.from(target.childNodes));

    // 第三个参数是插入点（挂到哪个节点里），`*.grain` 的环境声明里没写它，转成 any
    (Notification.create as any)(
        {
            message,
            type,
            unmount: () => {
                for (const node of Array.from(target.childNodes)) {
                    if (!before.has(node)) node.parentNode?.removeChild(node);
                }
            }
        },
        null,
        { parent: target, before: null }
    );
}
