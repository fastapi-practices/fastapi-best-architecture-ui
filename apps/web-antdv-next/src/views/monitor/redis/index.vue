<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { getRedisMonitorApi } from '#/api';
import ActiveSeries from '#/views/monitor/redis/components/active-series.vue';
import CommandsSeries from '#/views/monitor/redis/components/commands-series.vue';

const loading = ref<boolean>(false);
const redisInfo = ref<Record<string, any>>({});
const redisStats = ref<Record<string, any>[]>([]);
const usedMemory = ref<number>(0);
const redisUsedMemory = computed(() => [
  {
    name: $t('page.monitor.redis.info.used_memory_human'),
    value: usedMemory.value,
  },
]);

const fetching = ref(false);

const fetchRedisData = async () => {
  if (fetching.value) {
    return;
  }
  fetching.value = true;
  loading.value = true;
  try {
    const res = await getRedisMonitorApi();
    redisInfo.value = res.info;
    redisStats.value = res.stats;
  } catch (error) {
    console.error(error);
  } finally {
    fetching.value = false;
    loading.value = false;
  }
};

const REFRESH_INTERVAL = 5000;
let refreshTimer: null | ReturnType<typeof setInterval> = null;

function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimer = setInterval(() => {
    if (document.visibilityState === 'hidden') {
      return;
    }
    fetchRedisData();
  }, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

onMounted(() => {
  fetchRedisData();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});

const redisDescriptionItems = computed(() => [
  {
    key: 'redis_version',
    label: $t('page.monitor.redis.info.redis_version'),
    content: redisInfo.value?.redis_version,
  },
  {
    key: 'redis_mode',
    label: $t('page.monitor.redis.info.redis_mode'),
    content: redisInfo.value?.redis_mode,
  },
  {
    key: 'role',
    label: $t('page.monitor.redis.info.role'),
    content: redisInfo.value?.role,
  },
  {
    key: 'tcp_port',
    label: $t('page.monitor.redis.info.tcp_port'),
    content: redisInfo.value?.tcp_port,
  },
  {
    key: 'uptime',
    label: $t('page.monitor.redis.info.uptime'),
    content: redisInfo.value?.uptime,
  },
  {
    key: 'connected_clients',
    label: $t('page.monitor.redis.info.connected_clients'),
    content: redisInfo.value?.connected_clients,
  },
  {
    key: 'blocked_clients',
    label: $t('page.monitor.redis.info.blocked_clients'),
    content: redisInfo.value?.blocked_clients,
  },
  {
    key: 'used_memory_human',
    label: $t('page.monitor.redis.info.used_memory_human'),
    content: redisInfo.value?.used_memory_human,
  },
  {
    key: 'used_memory_rss_human',
    label: $t('page.monitor.redis.info.used_memory_rss_human'),
    content: redisInfo.value?.used_memory_rss_human,
  },
  {
    key: 'maxmemory_human',
    label: $t('page.monitor.redis.info.maxmemory_human'),
    content: redisInfo.value?.maxmemory_human,
  },
  {
    key: 'mem_fragmentation_ratio',
    label: $t('page.monitor.redis.info.mem_fragmentation_ratio'),
    content: redisInfo.value?.mem_fragmentation_ratio,
  },
  {
    key: 'total_commands_processed',
    label: $t('page.monitor.redis.info.total_commands_processed'),
    content: redisInfo.value?.total_commands_processed,
  },
  {
    key: 'instantaneous_ops_per_sec',
    label: $t('page.monitor.redis.info.instantaneous_ops_per_sec'),
    content: redisInfo.value?.instantaneous_ops_per_sec,
  },
  {
    key: 'rejected_connections',
    label: $t('page.monitor.redis.info.rejected_connections'),
    content: redisInfo.value?.rejected_connections,
  },
  {
    key: 'keys_num',
    label: $t('page.monitor.redis.info.keys_num'),
    content: redisInfo.value?.keys_num,
  },
]);

const parseMemoryToMB = (memStr: string): number => {
  if (!memStr) return 0;
  const match = memStr.match(/^([\d.]+)([BKMG]?)$/i);
  if (!match || !match[1]) return 0;
  const value = Number.parseFloat(match[1]);
  const unit = (match[2] || 'B').toUpperCase();
  switch (unit) {
    case 'G': {
      return value * 1024;
    }
    case 'K': {
      return value / 1024;
    }
    case 'M': {
      return value;
    }
    default: {
      return value / 1024 / 1024;
    }
  }
};

watch(redisInfo, (val) => {
  usedMemory.value = Number.parseFloat(
    parseMemoryToMB(val.used_memory_human).toFixed(2),
  );
});
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4">
      <a-card :title="$t('page.monitor.redis.info.title')" :loading="loading">
        <a-descriptions :items="redisDescriptionItems" />
      </a-card>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <a-card
          :title="$t('page.monitor.redis.cards.commands.title')"
          :loading="loading"
        >
          <CommandsSeries :stats="redisStats" />
        </a-card>
        <a-card
          :title="$t('page.monitor.redis.cards.memory.title')"
          :loading="loading"
        >
          <ActiveSeries :memory="redisUsedMemory" />
        </a-card>
      </div>
    </div>
  </Page>
</template>
