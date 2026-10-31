import '#/app.css';

import { createRouter } from '@graints/runtime';
import routes from 'grain:routes';

import '#/theme';

const target = document.getElementById('app');

if (!target) throw new Error('#app is missing from index.html');

export const router = createRouter({
    routes,
    target,
    base: import.meta.env.BASE_URL
});

router.start();
