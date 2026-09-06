<script setup lang="ts">
import type { SysUpdateUserNicknameParams } from '#/api';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  updateSysUserAvatarApi,
  updateSysUserNicknameApi,
  upload_file,
} from '#/api';
import { useAuthStore } from '#/store';

import { nicknameSchema } from './data';

const authStore = useAuthStore();
const userStore = useUserStore();
const avatarInputRef = ref<HTMLInputElement>();
const avatarUploading = ref(false);

function triggerAvatarSelect() {
  if (avatarUploading.value) {
    return;
  }
  avatarInputRef.value?.click();
}

function resolveUploadUrl(data: any): string {
  return data?.url ?? data?.data?.url ?? data?.file_url ?? '';
}

async function onAvatarFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) {
    return;
  }
  if (!file.type.startsWith('image/')) {
    message.warning($t('page.profile.avatarTypeInvalid'));
    return;
  }
  if (file.size / 1024 / 1024 > 2) {
    message.warning($t('ui.formRules.sizeLimit', [2]));
    return;
  }

  avatarUploading.value = true;
  try {
    await upload_file({
      file,
      onSuccess: async (data) => {
        const url = resolveUploadUrl(data);
        if (!url) {
          message.error($t('page.profile.avatarUploadFailed'));
          return;
        }
        await updateSysUserAvatarApi({ avatar: url });
        message.success($t('page.profile.avatarUpdated'));
        await authStore.fetchUserInfo();
      },
      onError: (error) => {
        message.error(error.message || $t('page.profile.avatarUploadFailed'));
      },
    });
  } finally {
    avatarUploading.value = false;
  }
}

const [NicknameForm, nicknameFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: nicknameSchema,
});

const [nicknameModal, nicknameModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await nicknameFormApi.validate();
    if (valid) {
      nicknameModalApi.lock();
      const data =
        await nicknameFormApi.getValues<SysUpdateUserNicknameParams>();
      try {
        await updateSysUserNicknameApi(data);
        message.success($t('page.profile.nicknameUpdated'));
        await nicknameModalApi.close();
        await authStore.fetchUserInfo();
      } finally {
        nicknameModalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      nicknameFormApi.resetForm();
      nicknameFormApi.setValues({
        nickname: userStore.userInfo?.nickname,
      });
    }
  },
});

function emptyText(value?: null | string) {
  return value || $t('common.none');
}

const basicInfoItems = computed(() => [
  {
    key: 'username',
    label: $t('page.profile.username'),
    content: userStore.userInfo?.username,
  },
  {
    key: 'phone',
    label: $t('page.profile.phone'),
    content: emptyText(userStore.userInfo?.phone),
  },
  {
    key: 'email',
    label: $t('page.profile.email'),
    content: emptyText(userStore.userInfo?.email),
  },
  {
    key: 'dept',
    label: $t('page.profile.dept'),
  },
  {
    key: 'roles',
    label: $t('page.profile.roles'),
  },
]);
</script>

<template>
  <a-card
    :title="$t('page.profile.basicInfo')"
    :styles="{ header: { borderBottom: 'none' } }"
  >
    <div class="mb-8 mt-2 text-center">
      <input
        ref="avatarInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onAvatarFileChange"
      />
      <a-tooltip>
        <template #title>{{ $t('page.profile.clickUploadAvatar') }}</template>
        <a-avatar
          class="cursor-pointer"
          :size="128"
          :src="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
          @click="triggerAvatarSelect"
        />
      </a-tooltip>
      <p class="mt-5 text-lg">
        {{ userStore.userInfo?.nickname }}
        <a-button
          ghost
          size="small"
          :aria-label="$t('page.profile.editNickname')"
          @click="nicknameModalApi.open()"
        >
          <span class="icon-[cuida--edit-outline]"></span>
        </a-button>
      </p>
    </div>
    <a-descriptions class="ml-6" :column="1" :items="basicInfoItems">
      <template #contentRender="{ item }">
        <template v-if="item.key === 'dept'">
          <span v-if="userStore.userInfo?.dept">
            <a-tag :key="userStore.userInfo?.dept" color="green">
              {{ userStore.userInfo?.dept }}
            </a-tag>
          </span>
          <span v-else>{{ $t('common.unbound') }}</span>
        </template>
        <template v-else-if="item.key === 'roles'">
          <div class="flex flex-wrap gap-2">
            <a-tag
              v-for="role in userStore.userInfo?.roles"
              :key="role"
              color="purple"
              class="whitespace-nowrap"
            >
              {{ role }}
            </a-tag>
          </div>
        </template>
      </template>
    </a-descriptions>
    <template #actions>
      {{ $t('page.profile.lastLoginTime') }}：{{
        userStore.userInfo?.last_login_time || '-'
      }}
    </template>
  </a-card>
  <nicknameModal :title="$t('page.profile.updateNickname')">
    <NicknameForm />
  </nicknameModal>
</template>
