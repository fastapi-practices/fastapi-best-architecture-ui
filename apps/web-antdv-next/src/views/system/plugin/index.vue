<script setup lang="ts">
import type { PluginResult } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { confirm, Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { IconifyIcon, MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';
import { downloadFileFromBlobPart } from '@vben/utils';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  downloadPluginApi,
  getPluginChangedApi,
  getPluginListApi,
  installGitPluginApi,
  installZipPluginApi,
  uninstallPluginApi,
  updatePluginStatus,
} from '#/api';

import { createInstallSchema, getZipFile } from './data';

const pluginChanged = ref<boolean>(false);
const localPluginChanged = ref(false);
const pluginInfo = ref<PluginResult[]>();
const pageLoading = ref(false);
const deletingPlugin = ref('');
const downloadingPlugin = ref('');
const switchingPlugin = ref('');
const showPluginChangedAlert = computed(() => {
  return pluginChanged.value || localPluginChanged.value;
});

const fetchPluginChanged = async () => {
  try {
    pluginChanged.value = await getPluginChangedApi();
  } catch (error) {
    console.error(error);
  }
};

const fetchPlugin = async () => {
  try {
    pluginInfo.value = await getPluginListApi();
  } catch (error) {
    console.error(error);
  }
};

const refreshPluginData = async (showLoading = false) => {
  if (showLoading) {
    pageLoading.value = true;
  }
  try {
    await Promise.all([fetchPluginChanged(), fetchPlugin()]);
    localPluginChanged.value = false;
  } finally {
    if (showLoading) {
      pageLoading.value = false;
    }
  }
};

type PluginEnableValue = '0' | '1';
type PluginSwitchValue = boolean | PluginEnableValue;

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: createInstallSchema(),
});

function downloadConfirm(plugin: string) {
  confirm({
    icon: 'success',
    content: $t('system.plugin.downloadConfirm'),
  }).then(async () => {
    downloadingPlugin.value = plugin;
    try {
      const res = await downloadPluginApi(plugin);
      downloadFileFromBlobPart({ fileName: `${plugin}.zip`, source: res });
      message.success($t('system.plugin.downloadStarted'));
    } catch (error) {
      console.error(error);
    } finally {
      downloadingPlugin.value = '';
    }
  });
}

function deleteConfirm(plugin: string) {
  confirm({
    icon: 'warning',
    content: $t('system.plugin.deleteConfirm'),
  }).then(async () => {
    deletingPlugin.value = plugin;
    try {
      await uninstallPluginApi(plugin);
      message.success($t('ui.actionMessage.deleteSuccess'));
      await refreshPluginData();
    } catch (error) {
      console.error(error);
    } finally {
      deletingPlugin.value = '';
    }
  });
}

const editPluginStatus = async (
  info: PluginResult,
  checked: PluginSwitchValue,
) => {
  const plugin = info.plugin.name;
  const nextEnableValue: PluginEnableValue =
    checked === true || checked === '1' ? '1' : '0';
  switchingPlugin.value = plugin;
  try {
    await updatePluginStatus(plugin);
    info.plugin.enable = nextEnableValue;
    localPluginChanged.value = true;
    await fetchPluginChanged();
    message.success($t('ui.actionMessage.operationSuccess'));
  } catch (error) {
    console.error(error);
  } finally {
    switchingPlugin.value = '';
  }
};

function onPluginStatusChange(info: PluginResult, checked: PluginSwitchValue) {
  editPluginStatus(info, checked);
}

const failedIcons = ref<Set<string>>(new Set());
const DEFAULT_PLUGIN_ICON = 'lucide:puzzle';

function isImageIcon(icon?: string) {
  if (!icon) {
    return false;
  }
  return (
    /^(https?:\/\/|data:)/i.test(icon) ||
    /\.(svg|png|jpe?g|webp|gif|ico)(\?.*)?$/i.test(icon)
  );
}

function onPluginIconError(name: string) {
  const next = new Set(failedIcons.value);
  next.add(name);
  failedIcons.value = next;
}

function showPluginImage(info: PluginResult) {
  const icon = info.plugin.icon;
  return (
    Boolean(icon) &&
    isImageIcon(icon) &&
    !failedIcons.value.has(info.plugin.name)
  );
}

function pluginIconify(icon?: string) {
  if (!icon || isImageIcon(icon)) {
    return DEFAULT_PLUGIN_ICON;
  }
  return icon;
}

const [Modal, modalApi] = useVbenModal({
  class: 'w-[520px]',
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    const values = await formApi.getValues<{
      installType: number;
      repo_url?: string;
      uploadField?: unknown;
    }>();

    if (Number(values.installType) === 0) {
      const file = getZipFile(values.uploadField);
      if (!file || !file.name.toLowerCase().endsWith('.zip')) {
        message.warning($t('system.plugin.selectZip'));
        return;
      }
      modalApi.lock();
      try {
        await installZipPluginApi(file);
        message.success($t('ui.actionMessage.operationSuccess'));
        await modalApi.close();
        await refreshPluginData();
      } finally {
        modalApi.unlock();
      }
      return;
    }

    const repoUrl = values.repo_url?.trim();
    if (!repoUrl) {
      message.warning($t('system.plugin.gitInvalid'));
      return;
    }

    modalApi.lock();
    try {
      await installGitPluginApi(repoUrl);
      message.success($t('ui.actionMessage.operationSuccess'));
      await modalApi.close();
      await refreshPluginData();
    } finally {
      modalApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      formApi.resetForm();
    }
  },
});

onMounted(() => {
  refreshPluginData(true);
});
</script>

<template>
  <Page>
    <div class="mb-4">
      <VbenButton @click="() => modalApi.open()">
        <MaterialSymbolsAdd class="size-5" />
        {{ $t('system.plugin.install') }}
      </VbenButton>
    </div>
    <Modal
      content-class="px-4 py-4 md:px-5 md:py-5"
      :title="$t('system.plugin.install')"
    >
      <Form />
    </Modal>
    <a-spin class="block" :spinning="pageLoading">
      <a-alert
        v-if="showPluginChangedAlert"
        :title="$t('system.plugin.changed')"
        type="warning"
        show-icon
      />
      <div class="mt-4">
        <a-empty
          v-if="!pageLoading && (!pluginInfo || pluginInfo.length === 0)"
          :description="$t('system.plugin.empty')"
        />
        <div
          v-else
          class="grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          <a-card
            v-for="info in pluginInfo"
            :key="info.plugin.name"
            class="flex h-full flex-col"
            :styles="{
              body: {
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                height: '100%',
              },
            }"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted"
              >
                <img
                  v-if="showPluginImage(info)"
                  :src="info.plugin.icon"
                  :alt="info.plugin.summary"
                  class="size-full object-contain p-1"
                  @error="onPluginIconError(info.plugin.name)"
                />
                <IconifyIcon
                  v-else
                  :icon="pluginIconify(info.plugin.icon)"
                  class="size-6 text-muted-foreground"
                />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="truncate font-medium">
                      {{ info.plugin.summary }}
                    </div>
                    <div class="truncate text-xs text-muted-foreground">
                      @{{ info.plugin.author }}
                    </div>
                  </div>
                  <a-switch
                    :checked="info.plugin.enable"
                    checked-value="1"
                    un-checked-value="0"
                    :checked-children="$t('system.plugin.enable')"
                    :un-checked-children="$t('system.plugin.disable')"
                    :loading="switchingPlugin === info.plugin.name"
                    @change="onPluginStatusChange(info, $event)"
                  />
                </div>
              </div>
            </div>
            <p
              class="mb-0 mt-3 line-clamp-2 min-h-10 flex-1 text-sm text-muted-foreground"
            >
              {{ info.plugin.description }}
            </p>
            <div
              v-if="info.plugin.tags && info.plugin.tags.length > 0"
              class="mt-3 flex flex-wrap gap-1"
            >
              <a-tag v-for="tag in info.plugin.tags" :key="tag">
                {{ tag }}
              </a-tag>
            </div>
            <div class="mt-4 flex items-center justify-between gap-2">
              <span class="text-xs text-muted-foreground">
                v{{ info.plugin.version }}
              </span>
              <div class="flex gap-2">
                <a-button
                  size="small"
                  danger
                  :loading="deletingPlugin === info.plugin.name"
                  @click="deleteConfirm(info.plugin.name)"
                >
                  {{ $t('system.plugin.uninstall') }}
                </a-button>
                <a-button
                  size="small"
                  :loading="downloadingPlugin === info.plugin.name"
                  @click="downloadConfirm(info.plugin.name)"
                >
                  {{ $t('system.plugin.pack') }}
                </a-button>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    </a-spin>
  </Page>
</template>
