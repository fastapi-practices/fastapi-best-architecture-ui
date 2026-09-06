<script setup lang="ts">
import type {
  SysUpdatePasswordParams,
  SysUpdateUserEmailParams,
  SysUpdateUserPhoneParams,
} from '#/api';

import { computed } from 'vue';

import { useVbenModal, VbenButton } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  updateSysUserEmailApi,
  updateSysUserPasswordApi,
  updateSysUserPhoneApi,
} from '#/api';
import { useAuthStore } from '#/store';

import { emailSchema, passwordSchema, phoneSchema } from './data';

const authStore = useAuthStore();
const userStore = useUserStore();

function maskPhone(phone?: string) {
  if (!phone) {
    return $t('common.unbound');
  }
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function maskEmail(email?: string) {
  if (!email) {
    return $t('common.unbound');
  }
  const [name, domain] = email.split('@');
  if (!name || !domain) {
    return email;
  }
  const visible = name.slice(0, 2);
  return `${visible}***@${domain}`;
}

const securityOptions = computed(() => [
  {
    class: 'icon-[fluent--phone-48-regular]',
    title: $t('page.profile.securePhone'),
    description: $t('page.profile.securePhoneDesc'),
    type: 'phone',
    status: !!userStore.userInfo?.phone,
    statusString: maskPhone(userStore.userInfo?.phone),
  },
  {
    class: 'icon-[ic--outline-email]',
    title: $t('page.profile.secureEmail'),
    description: $t('page.profile.secureEmailDesc'),
    type: 'email',
    status: !!userStore.userInfo?.email,
    statusString: maskEmail(userStore.userInfo?.email),
  },
  {
    class: 'icon-[mdi--password-outline]',
    title: $t('page.profile.loginPassword'),
    description: $t('page.profile.loginPasswordDesc'),
    type: 'password',
    status: true,
    statusString: $t('page.profile.configured'),
  },
]);

const [phoneForm, phoneFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: phoneSchema,
});

const [phoneModal, phoneModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await phoneFormApi.validate();
    if (valid) {
      phoneModalApi.lock();
      const data = await phoneFormApi.getValues<SysUpdateUserPhoneParams>();
      try {
        await updateSysUserPhoneApi(data);
        message.success($t('page.profile.phoneUpdated'));
        await phoneModalApi.close();
        await authStore.fetchUserInfo();
      } finally {
        phoneModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = phoneModalApi.getData();
      phoneFormApi.resetForm();
      if (data) {
        phoneFormApi.setValues(data);
      }
    }
  },
});

const [emailForm, emailFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: emailSchema,
});

const [emailModal, emailModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await emailFormApi.validate();
    if (valid) {
      emailModalApi.lock();
      const data = await emailFormApi.getValues<SysUpdateUserEmailParams>();
      try {
        await updateSysUserEmailApi(data);
        message.success($t('page.profile.emailUpdated'));
        await emailModalApi.close();
        await authStore.fetchUserInfo();
      } finally {
        emailModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = emailModalApi.getData();
      emailFormApi.resetForm();
      if (data) {
        emailFormApi.setValues(data);
      }
    }
  },
});

const [passwordForm, passwordFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: passwordSchema,
});

const [passwordModal, passwordModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await passwordFormApi.validate();
    if (valid) {
      passwordModalApi.lock();
      const data = await passwordFormApi.getValues<SysUpdatePasswordParams>();
      try {
        await updateSysUserPasswordApi(data);
        message.success($t('page.profile.passwordUpdated'));
        await passwordModalApi.close();
        await authStore.logout(false);
      } finally {
        passwordModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = passwordModalApi.getData();
      passwordFormApi.resetForm();
      if (data) {
        passwordFormApi.setValues(data);
      }
    }
  },
});

const openModal = (type: string) => {
  if (type === 'phone') {
    phoneModalApi.setData({ phone: userStore.userInfo?.phone }).open();
  }
  if (type === 'email') {
    emailModalApi.setData({ email: userStore.userInfo?.email }).open();
  }
  if (type === 'password') {
    passwordModalApi.setData(null).open();
  }
};
</script>

<template>
  <div class="-ml-4">
    <div
      v-for="(item, index) in securityOptions"
      :key="index"
      class="flex items-center justify-between px-4 py-3"
    >
      <div class="flex items-center gap-4">
        <a-avatar size="large">
          <template #icon>
            <span :class="item.class"></span>
          </template>
        </a-avatar>
        <div>
          <div>
            {{ item.title }}
            <span
              class="ml-2 text-xs"
              :class="item.status ? 'text-green-500' : 'text-orange-500'"
            >
              {{ item.statusString }}
            </span>
          </div>
          <div class="text-sm text-gray-500">{{ item.description }}</div>
        </div>
      </div>
      <VbenButton
        :variant="item.status ? 'outline' : 'default'"
        @click="openModal(item.type)"
      >
        {{ item.status ? $t('common.edit') : $t('common.bind') }}
      </VbenButton>
    </div>
  </div>
  <phoneModal
    :title="
      userStore.userInfo?.phone
        ? $t('page.profile.editPhone')
        : $t('page.profile.bindPhone')
    "
  >
    <phoneForm />
  </phoneModal>
  <emailModal
    :title="
      userStore.userInfo?.email
        ? $t('page.profile.editEmail')
        : $t('page.profile.bindEmail')
    "
  >
    <emailForm />
  </emailModal>
  <passwordModal :title="$t('page.profile.editPassword')">
    <passwordForm />
  </passwordModal>
</template>
