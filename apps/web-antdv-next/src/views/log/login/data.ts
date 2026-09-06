import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

import { DictEnum, getDictOptions } from '#/utils/dict';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'username',
    label: $t('log.username'),
  },
  {
    component: 'Input',
    fieldName: 'ip',
    label: $t('log.ip'),
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      // options: [
      //   {
      //     label: '成功',
      //     value: 1,
      //   },
      //   {
      //     label: '失败',
      //     value: 0,
      //   },
      // ],
      options: getDictOptions(DictEnum.SYS_LOGIN_STATUS),
    },
    fieldName: 'status',
    label: $t('common.form.status'),
  },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'checkbox', type: 'checkbox', align: 'left', width: 50 },
  {
    field: 'seq',
    title: $t('common.table.id'),
    type: 'seq',
    width: 50,
  },
  { field: 'username', title: $t('log.username') },
  {
    field: 'status',
    title: $t('log.status'),
    cellRender: {
      name: 'CellTag',
      // options: [
      //   { color: 'success', label: '成功', value: 1 },
      //   { color: 'error', label: '失败', value: 0 },
      // ],
      options: getDictOptions(DictEnum.SYS_LOGIN_STATUS),
    },
  },
  { field: 'ip', title: $t('log.ip') },
  { field: 'country', title: $t('log.country') },
  { field: 'region', title: $t('log.region') },
  { field: 'os', title: $t('log.os') },
  { field: 'browser', title: $t('log.browser') },
  { field: 'device', title: $t('log.device') },
  { field: 'msg', title: $t('log.msg'), width: 150 },
  { field: 'login_time', title: $t('log.loginTime'), width: 168 },
  {
    field: 'created_time',
    title: $t('common.table.created_time'),
    width: 168,
  },
];
