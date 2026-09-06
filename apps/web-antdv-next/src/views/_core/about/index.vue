<script lang="ts" setup>
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

defineOptions({ name: 'About' });

const FBA_DOC_URL =
  'https://fastapi-practices.github.io/fastapi_best_architecture_docs';
const FBA_GITHUB_URL =
  'https://github.com/fastapi-practices/fastapi_best_architecture';
const FBA_UI_GITHUB_URL =
  'https://github.com/fastapi-practices/fastapi_best_architecture_ui';

const {
  authorEmail,
  authorName,
  authorUrl,
  buildTime,
  dependencies = {},
  devDependencies = {},
  homepage,
  license,
  version,
} = __VBEN_ADMIN_METADATA__ || {};

const descriptionItems = [
  {
    title: $t('page.about.version'),
    text: version,
  },
  {
    title: $t('page.about.license'),
    text: license,
  },
  {
    title: $t('page.about.buildTime'),
    text: buildTime,
  },
  {
    title: $t('page.about.homepage'),
    href: homepage || FBA_UI_GITHUB_URL,
    text: $t('page.about.view'),
  },
  {
    title: $t('page.about.docs'),
    href: FBA_DOC_URL,
    text: $t('page.about.view'),
  },
  {
    title: $t('page.about.preview'),
    href: FBA_UI_GITHUB_URL,
    text: $t('page.about.view'),
  },
  {
    title: $t('page.about.github'),
    href: FBA_GITHUB_URL,
    text: $t('page.about.view'),
  },
  {
    title: $t('page.about.author'),
    href: authorUrl || FBA_GITHUB_URL,
    text: authorName || 'FBA',
    extraHref: authorEmail ? `mailto:${authorEmail}` : undefined,
    extraText: authorEmail,
  },
];

const dependenciesItems = Object.keys(dependencies).map((key) => ({
  content: dependencies[key],
  title: key,
}));

const devDependenciesItems = Object.keys(devDependencies).map((key) => ({
  content: devDependencies[key],
  title: key,
}));
</script>

<template>
  <Page :title="$t('page.about.title')">
    <template #description>
      <p class="mt-3 text-sm/6 text-foreground">
        <a :href="FBA_GITHUB_URL" class="vben-link" target="_blank">
          {{ $t('page.about.name') }}
        </a>
        {{ $t('page.about.description') }}
      </p>
    </template>
    <div class="card-box p-5">
      <div>
        <h5 class="text-lg text-foreground">
          {{ $t('page.about.basicInfo') }}
        </h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="item in descriptionItems"
            :key="item.title"
            class="border-t border-border px-4 py-6 sm:col-span-1 sm:px-0"
          >
            <dt class="text-sm/6 font-medium text-foreground">
              {{ item.title }}
            </dt>
            <dd class="mt-1 text-sm/6 text-foreground sm:mt-2">
              <a
                v-if="item.href"
                :href="item.href"
                class="vben-link"
                target="_blank"
              >
                {{ item.text }}
              </a>
              <span v-else>{{ item.text }}</span>
              <a
                v-if="item.extraHref"
                :href="item.extraHref"
                class="vben-link ml-2"
              >
                {{ item.extraText }}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <div class="card-box mt-6 p-5">
      <div>
        <h5 class="text-lg text-foreground">{{ $t('page.about.prodDeps') }}</h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="item in dependenciesItems"
            :key="item.title"
            class="border-t border-border px-4 py-3 sm:col-span-1 sm:px-0"
          >
            <dt class="text-sm text-foreground">
              {{ item.title }}
            </dt>
            <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">
              {{ item.content }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
    <div class="card-box mt-6 p-5">
      <div>
        <h5 class="text-lg text-foreground">{{ $t('page.about.devDeps') }}</h5>
      </div>
      <div class="mt-4">
        <dl class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="item in devDependenciesItems"
            :key="item.title"
            class="border-t border-border px-4 py-3 sm:col-span-1 sm:px-0"
          >
            <dt class="text-sm text-foreground">
              {{ item.title }}
            </dt>
            <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">
              {{ item.content }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </Page>
</template>
