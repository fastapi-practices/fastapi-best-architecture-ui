import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeGridProps } from '#/adapter/vxe-table';
import type { OnlineMonitorResult } from '#/api';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { z } from '#/adapter/form';
import { getPhoneCaptchaApi } from '#/plugins/aliyun_sms/api';
import { getEmailCaptchaApi } from '#/plugins/email/api';
import { DictEnum, getDictOptions } from '#/utils/dict';

export const nicknameSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'nickname',
    label: $t('page.profile.nickname'),
    rules: 'required',
  },
];

const CODE_LENGTH = 6;
const phoneValue = ref<string>('');
export const phoneSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'phone',
    label: $t('page.profile.phone'),
    rules: z
      .string()
      .min(1, { message: $t('authentication.mobileTip') })
      .refine((v) => /^\d{11}$/.test(v), {
        message: $t('authentication.mobileErrortip'),
      }),
  },
  {
    component: 'VbenPinInput',
    componentProps: {
      codeLength: CODE_LENGTH,
      createText: (countdown: number) => {
        return countdown > 0
          ? $t('authentication.sendText', [countdown])
          : $t('authentication.sendCode');
      },
      handleSendCode: async () => {
        if (!/^\d{11}$/.test(phoneValue.value)) {
          message.warning($t('authentication.mobileErrortip'));
          throw new Error('invalid phone');
        }
        await getPhoneCaptchaApi({ phone: phoneValue.value });
        message.success($t('page.profile.smsSent'));
      },
      placeholder: $t('authentication.code'),
    },
    dependencies: {
      trigger(values) {
        phoneValue.value = values.phone;
      },
      triggerFields: ['phone'],
    },
    fieldName: 'captcha',
    label: $t('page.profile.captcha'),
    rules: z.string().length(CODE_LENGTH, {
      message: $t('authentication.codeTip', [CODE_LENGTH]),
    }),
  },
];

const emailValue = ref<string>('');
export const emailSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'email',
    label: $t('page.profile.email'),
    rules: z.string().email({ message: '无效的邮箱地址' }),
  },
  {
    component: 'VbenPinInput',
    componentProps: {
      codeLength: CODE_LENGTH,
      createText: (countdown: number) => {
        return countdown > 0
          ? $t('authentication.sendText', [countdown])
          : $t('authentication.sendCode');
      },
      handleSendCode: async () => {
        if (!emailValue.value || !emailValue.value.includes('@')) {
          message.warning($t('page.profile.invalidEmail'));
          throw new Error('invalid email');
        }
        await getEmailCaptchaApi({ recipients: emailValue.value });
        message.success($t('page.profile.emailSent'));
      },
      placeholder: $t('authentication.code'),
    },
    dependencies: {
      trigger(values) {
        emailValue.value = values.email;
      },
      triggerFields: ['email'],
    },
    fieldName: 'captcha',
    label: $t('page.profile.captcha'),
    rules: z.string().length(CODE_LENGTH, {
      message: $t('authentication.codeTip', [CODE_LENGTH]),
    }),
  },
];

export const passwordSchema: VbenFormSchema[] = [
  {
    component: 'InputPassword',
    fieldName: 'old_password',
    label: $t('page.profile.currentPassword'),
    rules: z
      .string({ message: '请输入当前密码' })
      .min(6, '密码长度不能少于 6 个字符')
      .max(20, '密码长度不能超过 20 个字符'),
  },
  {
    component: 'InputPassword',
    fieldName: 'new_password',
    label: $t('page.profile.newPassword'),
    rules: z
      .string({ message: '请输入新密码' })
      .min(6, '密码长度不能少于 6 个字符')
      .max(20, '密码长度不能超过 20 个字符'),
  },
  {
    component: 'InputPassword',
    fieldName: 'confirm_password',
    label: $t('page.profile.confirmPassword'),
    dependencies: {
      rules(values) {
        return z
          .string({ message: '请输入确认密码' })
          .min(6, '密码长度不能少于 6 个字符')
          .max(20, '密码长度不能超过 20 个字符')
          .refine(
            (value) => value === values.new_password,
            $t('page.profile.passwordMismatch'),
          );
      },
      triggerFields: ['new_password', 'confirm_password'],
    },
  },
];

export function useColumns(
  onActionClick?: OnActionClickFn<OnlineMonitorResult>,
): VxeGridProps['columns'] {
  return [
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
      width: 120,
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
                row.ip || row.device || row.nickname,
              ]),
          },
        ],
      },
    },
  ];
}
