import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'PluginNotice',
    path: '/plugins/notice',
    component: () => import('../views/index.vue'),
    meta: {
      title: $t('notice.menu'),
      icon: 'fe:notice-push',
    },
  },
];

export default routes;
