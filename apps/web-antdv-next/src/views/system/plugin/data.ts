import type { VbenFormSchema } from '#/adapter/form';

import { h } from 'vue';

import { $t } from '@vben/locales';

import { Button, message } from 'antdv-next';

import { DictEnum, getDictOptions } from '#/utils/dict';

export function getZipFile(value: unknown): File | undefined {
  const item = Array.isArray(value) ? value[0] : value;
  if (!item) {
    return undefined;
  }
  if (item instanceof File) {
    return item.name.toLowerCase().endsWith('.zip') ? item : undefined;
  }
  const origin = (item as { originFileObj?: File }).originFileObj;
  if (origin instanceof File && origin.name.toLowerCase().endsWith('.zip')) {
    return origin;
  }
  return undefined;
}

export function createInstallSchema(): VbenFormSchema[] {
  return [
    {
      component: 'RadioGroup',
      defaultValue: 0,
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: getDictOptions(DictEnum.SYS_PLUGIN_TYPE),
      },
      fieldName: 'installType',
      label: $t('system.plugin.installType'),
      rules: 'required',
    },
    {
      component: 'Upload',
      componentProps: {
        accept: '.zip,application/zip,application/x-zip-compressed',
        maxCount: 1,
        multiple: false,
        beforeUpload: (file: File) => {
          if (!file.name.toLowerCase().endsWith('.zip')) {
            message.warning($t('system.plugin.zipInvalid'));
            return false;
          }
          return false;
        },
      },
      dependencies: {
        show: (values) => Number(values.installType) === 0,
        triggerFields: ['installType'],
      },
      fieldName: 'uploadField',
      help: $t('system.plugin.zipHelp'),
      label: $t('system.plugin.zip'),
      renderComponentContent: () => ({
        default: () => {
          return h(Button, {}, { default: () => $t('system.plugin.upload') });
        },
      }),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('system.plugin.gitPlaceholder'),
      },
      dependencies: {
        show: (values) => Number(values.installType) === 1,
        triggerFields: ['installType'],
      },
      fieldName: 'repo_url',
      help: $t('system.plugin.gitHelp'),
      label: $t('system.plugin.git'),
      rules: 'required',
    },
  ];
}
