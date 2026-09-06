<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type {
  CreateSysDataScopeParams,
  SysDataRuleResult,
  SysDataScopeResult,
} from '#/api';

import { computed, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createSysDataScope,
  deleteSysDataScopeApi,
  getSysDataRulesApi,
  getSysDataScopeListApi,
  getSysDataScopeRulesApi,
  updateSysDataScope,
  updateSysDataScopeRulesApi,
} from '#/api';

import { drawerColumns, querySchema, schema, useColumns } from './data';

const formOptions: VbenFormProps = {
  showCollapseButton: false,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySchema,
};

const gridOptions: VxeTableGridOptions<SysDataScopeResult> = {
  rowConfig: {
    keyField: 'id',
  },
  checkboxConfig: {
    highlight: true,
  },
  height: 'auto',
  exportConfig: {},
  printConfig: {},
  toolbarConfig: {
    export: true,
    print: true,
    refresh: true,
    refreshOptions: {
      code: 'query',
    },
    custom: true,
    zoom: true,
  },
  columns: useColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getSysDataScopeListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function onRefresh() {
  gridApi.query();
}

function onActionClick({ code, row }: OnActionClickParams<SysDataScopeResult>) {
  switch (code) {
    case 'delete': {
      deleteSysDataScopeApi([row.id]).then(() => {
        message.success({
          content: $t('ui.actionMessage.deleteSuccess', [row.name]),
          key: 'action_process_msg',
        });
        onRefresh();
      });
      break;
    }
    case 'edit': {
      modalApi.setData(row).open();
      break;
    }
    case 'rule': {
      getSysDataScopeRulesApi(row.id).then((res) => {
        dataScopeRuleGridApi.setGridOptions({
          checkboxConfig: {
            checkRowKeys: res.rules.map((item) => item.id),
          },
        });
      });
      clickDataScope.value = row.id;
      drawerApi.open();
      break;
    }
  }
}

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema,
});

interface formSysDataScopeParams extends CreateSysDataScopeParams {
  id?: number;
}

const formData = ref<formSysDataScopeParams>();

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['数据范围'])
    : $t('ui.actionTitle.create', ['数据范围']);
});

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<CreateSysDataScopeParams>();
      try {
        await (formData.value?.id
          ? updateSysDataScope(formData.value?.id, data)
          : createSysDataScope(data));
        message.success($t('ui.actionMessage.operationSuccess'));
        await modalApi.close();
        onRefresh();
      } finally {
        modalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<formSysDataScopeParams>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        formApi.setValues(data);
      } else {
        formData.value = undefined;
      }
    }
  },
});

const clickDataScope = ref<number>(0);

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  closable: false,
  class: 'w-2/5',
  onConfirm() {
    const checkedRows = dataScopeRuleGridApi.grid.getCheckboxRecords(true);
    updateSysDataScopeRulesApi(
      clickDataScope.value,
      checkedRows.map((item: any) => item.id),
    ).then(() => {
      message.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
    });
  },
});

const dataScopeRulesGridOptions: VxeTableGridOptions<SysDataRuleResult> = {
  rowConfig: {
    keyField: 'id',
  },
  height: 'auto',
  virtualYConfig: {
    enabled: true,
    gt: 0,
  },
  checkboxConfig: {
    labelField: 'name',
    highlight: true,
    reserve: true,
    checkRowKeys: [],
  },
  pagerConfig: {
    enabled: false,
  },
  columns: drawerColumns,
  proxyConfig: {
    ajax: {
      query: async () => {
        return await getSysDataRulesApi();
      },
    },
  },
};

const [DataScopeRuleGrid, dataScopeRuleGridApi] = useVbenVxeGrid({
  gridOptions: dataScopeRulesGridOptions,
});
</script>

<template>
  <Page auto-content-height>
    <Grid
      :table-title="$t('system.dataScope.title')"
      :table-title-help="$t('system.dataScope.help')"
    >
      <template #toolbar-tools>
        <VbenButton @click="() => modalApi.setData(null).open()">
          <MaterialSymbolsAdd class="size-5" />
          {{ $t('system.dataScope.add') }}
        </VbenButton>
      </template>
    </Grid>
    <Modal :title="modalTitle">
      <Form />
    </Modal>
    <Drawer :title="$t('system.dataScope.bindRules')">
      <DataScopeRuleGrid />
    </Drawer>
  </Page>
</template>
