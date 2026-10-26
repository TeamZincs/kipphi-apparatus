import '#/app.css';

import { createRouter } from '@graints/runtime';
import routes from 'grain:routes';

import { initI18n } from '#/i18n';

const target = document.getElementById('app');

if (!target) throw new Error('#app is missing from index.html');

// 先把词典装好再挂载：所有 `_("a.b")` 都是普通函数调用，没有"加载完再刷一遍"这回事
await initI18n();

export const router = createRouter({
    routes,
    target,
    base: import.meta.env.BASE_URL
});

router.start();
