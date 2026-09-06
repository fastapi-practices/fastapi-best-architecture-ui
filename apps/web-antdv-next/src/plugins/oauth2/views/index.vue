<script lang="ts" setup>
import { $t } from '@vben/locales';
</script>

<template>
  <div class="grid min-h-screen place-items-center">
    <a-spin size="large" :tip="$t('page.auth.oauthCallback')" />
  </div>
</template>
