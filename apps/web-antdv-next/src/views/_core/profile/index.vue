<script setup lang="ts">
import { computed, ref } from 'vue';

import { ColPage } from '@vben/common-ui';
import { $t } from '@vben/locales';

import BasicInfo from '#/views/_core/profile/basic-info.vue';
import Binding from '#/views/_core/profile/binding.vue';
import OnlineDevice from '#/views/_core/profile/online-device.vue';
import Security from '#/views/_core/profile/security.vue';

const tabList = computed(() => [
  {
    key: 'security',
    tab: $t('page.profile.securityTab'),
  },
  {
    key: 'binding',
    tab: $t('page.profile.bindingTab'),
  },
  {
    key: 'devices',
    tab: $t('page.profile.devicesTab'),
  },
]);
const tabKey = ref<string>('security');

const onTabChange = (value: string) => {
  tabKey.value = value;
};
</script>

<template>
  <ColPage
    auto-content-height
    :resizable="false"
    :left-width="30"
    :right-width="70"
  >
    <template #left>
      <div>
        <BasicInfo />
      </div>
    </template>
    <a-card
      :styles="{
        header: {
          borderBottom: 'none',
        },
      }"
      :tab-list="tabList"
      :active-tab-key="tabKey"
      @tab-change="(key: string) => onTabChange(key)"
    >
      <div v-if="tabKey === 'security'">
        <Security />
      </div>
      <div v-else-if="tabKey === 'binding'">
        <Binding />
      </div>
      <div v-else>
        <OnlineDevice />
      </div>
    </a-card>
  </ColPage>
</template>
