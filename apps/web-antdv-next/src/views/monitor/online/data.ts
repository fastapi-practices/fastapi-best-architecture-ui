import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { OnlineMonitorResult } from '#/api';

import { $t } from '@vben/locales';

import { DictEnum, getDictOptions } from '#/utils/dict';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'username',
    label: $t('page.monitor.online.username'),
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<OnlineMonitorResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'seq',
      title: $t('common.table.id'),
      type: 'seq',
      width: 50,
    },
    {
      field: 'session_uuid',
      title: $t('page.monitor.online.sessionUuid'),
      width: 280,
    },
    { field: 'username', title: $t('page.monitor.online.username') },
    { field: 'nickname', title: $t('page.monitor.online.nickname') },
    { field: 'ip', title: $t('page.monitor.online.ip') },
    { field: 'os', title: $t('page.monitor.online.os') },
    { field: 'browser', title: $t('page.monitor.online.browser') },
    { field: 'device', title: $t('page.monitor.online.device') },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
        // options: [
        //   { color: 'success', label: '在线', value: 1 },
        //   { color: 'warning', label: '离线', value: 0 },
        // ],
        options: getDictOptions(DictEnum.USER_ONLINE_STATUS),
      },
    },
    {
      field: 'last_login_time',
      title: $t('page.monitor.online.lastLoginTime'),
    },
    { field: 'expire_time', title: $t('page.monitor.online.expireTime') },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 130,
      cellRender: {
        attrs: {
          nameField: 'nickname',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'delete',
            text: $t('page.monitor.online.kickOut'),
            confirmTitle: $t('page.monitor.online.kickOut'),
            confirmMessage: (row: OnlineMonitorResult) =>
              $t('page.monitor.online.kickOutConfirm', [
                row.nickname || row.username,
              ]),
          },
        ],
      },
    },
  ];
}
