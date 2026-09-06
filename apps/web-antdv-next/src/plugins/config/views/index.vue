<script setup lang="ts">
import { computed, h, nextTick, onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import Email from './email.vue';
import Login from './login.vue';
import UserSecurity from './user-security.vue';

const activeKey = ref('0');

const userSecurityRef = ref();
const loginRef = ref();
const emailRef = ref();

const tabItems = computed(() => [
  {
    key: '0',
    label: $t('config.security'),
    icon: () => h('span', { class: 'icon-[carbon--security] -mb-1 size-5' }),
  },
  {
    key: '1',
    label: $t('config.login'),
    icon: () =>
      h('span', { class: 'icon-[majesticons--lock-line] -mb-1 size-5' }),
  },
  {
    key: '2',
    label: $t('config.email'),
    icon: () => h('span', { class: 'icon-[ic--outline-email] -mb-1 size-5' }),
  },
]);

watch(activeKey, async (newValue) => {
  if (newValue === '0') {
    await nextTick();
    if (userSecurityRef.value) {
      await userSecurityRef.value.fetchConfigList();
    }
  }
  if (newValue === '1') {
    await nextTick();
    if (loginRef.value) {
      await loginRef.value.fetchConfigList();
    }
  }
  if (newValue === '2') {
    await nextTick();
    if (emailRef.value) {
      await emailRef.value.fetchConfigList();
    }
  }
});

onMounted(async () => {
  await nextTick();
  if (userSecurityRef.value) {
    await userSecurityRef.value.fetchConfigList();
  }
});
</script>

<template>
  <Page auto-content-height>
    <a-card
      class="h-full overflow-y-auto rounded-[var(--radius)]"
      variant="borderless"
    >
      <a-tabs
        class="h-full"
        v-model:active-key="activeKey"
        tab-placement="start"
        animated
        :tab-bar-style="{ width: '16%' }"
        :items="tabItems"
      >
        <template #contentRender="{ item }">
          <UserSecurity v-if="item.key === '0'" ref="userSecurityRef" />
          <Login v-else-if="item.key === '1'" ref="loginRef" />
          <Email v-else-if="item.key === '2'" ref="emailRef" />
        </template>
      </a-tabs>
    </a-card>
  </Page>
</template>

<style lang="scss" scoped>
:deep(.ant-card-body) {
  height: 100%;
  min-height: 100%;
}
</style>
