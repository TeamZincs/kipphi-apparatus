import '#/app.css';

import { createRouter } from '@graints/runtime';
import routes from 'grain:routes';

import { initI18n } from '#/i18n';
import '#/theme';

const target = document.getElementById('app');

if (!target) throw new Error('#app is missing from index.html');

export const router = createRouter({
    routes,
    target,
    base: import.meta.env.BASE_URL
});

/*
 * 先把词典装好再挂载界面 —— 否则首屏会闪一下"键名"（`main.xxx.yyy`）。
 */
await initI18n();

router.start();
