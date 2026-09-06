import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { SysDeptTreeResult } from '#/api';

import { $t } from '@vben/locales';

import { z } from '#/adapter/form';
import { getSysDeptTreeApi } from '#/api';
import { DictEnum, getDictOptions } from '#/utils/dict';

export const querySchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('system.dept.name'),
  },
  {
    component: 'Input',
    fieldName: 'leader',
    label: '负责人',
  },
  {
    component: 'Input',
    fieldName: 'phone',
    label: '手机号码',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      // options: [
      //   {
      //     label: '正常',
      //     value: 1,
      //   },
      //   {
      //     label: '停用',
      //     value: 0,
      //   },
      // ],
      options: getDictOptions(DictEnum.SYS_STATUS),
    },
    fieldName: 'status',
    label: $t('common.form.status'),
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<SysDeptTreeResult>,
): VxeGridProps['columns'] {
  return [
    {
      field: 'name',
      title: $t('system.dept.name'),
      align: 'left',
      treeNode: true,
    },
    { field: 'leader', title: $t('system.dept.leader') },
    { field: 'phone', title: $t('system.dept.phone') },
    { field: 'email', title: $t('system.dept.email') },
    { field: 'sort', title: $t('system.dept.sort') },
    {
      field: 'status',
      title: '状态',
      cellRender: {
        name: 'CellTag',
      },
    },
    {
      field: 'created_time',
      title: $t('common.table.created_time'),
      width: 168,
      formatter: 'formatDateTime',
    },
    {
      field: 'operation',
      title: $t('common.table.operation'),
      align: 'center',
      fixed: 'right',
      width: 200,
      cellRender: {
        attrs: {
          nameField: 'name',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'add',
            text: '新增下级',
          },
          'edit',
          {
            code: 'delete',
            disabled: (row: SysDeptTreeResult) => {
              return row.id === 1;
            },
          },
        ],
      },
    },
  ];
}

export const schema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('system.dept.name'),
    rules: 'required',
  },
  {
    component: 'ApiTreeSelect',
    componentProps: {
      allowClear: true,
      api: getSysDeptTreeApi,
      class: 'w-full',
      labelField: 'name',
      valueField: 'id',
      childrenField: 'children',
    },
    fieldName: 'parent_id',
    label: '父级部门',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: 'w-full',
      min: 0,
    },
    defaultValue: 0,
    fieldName: 'sort',
    label: $t('system.dept.sort'),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'leader',
    label: '负责人',
  },
  {
    component: 'Input',
    componentProps: {
      allowClear: true,
    },
    fieldName: 'phone',
    label: '手机号码',
  },
  {
    component: 'Input',
    componentProps: {
      allowClear: true,
    },
    fieldName: 'email',
    label: '邮箱地址',
    rules: z
      .string()
      .optional()
      .refine((val) => !val || z.string().email().safeParse(val).success, {
        message: $t('system.dept.invalidEmail'),
      }),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      // options: [
      //   { label: $t('common.enabled'), value: 1 },
      //   { label: $t('common.disabled'), value: 0 },
      // ],
      options: getDictOptions(DictEnum.SYS_STATUS),
      optionType: 'button',
    },
    defaultValue: 1,
    fieldName: 'status',
    label: '状态',
    rules: 'required',
  },
];
