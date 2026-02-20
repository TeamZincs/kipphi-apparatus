import NotificationComponent from "#/components/Notification.svelte";
import { mount, unmount } from "svelte";

export function notify(message: string, type: 'info' | 'error' | 'warning') {
    const ins = mount(NotificationComponent, {
        target: document.getElementById('notifications') ?? document.body,
        props: {
            message,
            type,
            unmount: () => unmount(ins)
        }
    });
}
