<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NCard, useMessage } from 'naive-ui'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const auth = useAuthStore()
const message = useMessage()

const form = ref({ username: 'admin', password: 'admin123' })
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    await auth.login(form.value.username, form.value.password)
    router.push('/dashboard')
  } catch (e: any) {
    message.error(e.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    style="
      display: flex; align-items: center; justify-content: center;
      height: 100vh; min-height: 500px;
      background: var(--paper);
      padding: 16px;
    "
  >
    <div style="width: 380px; max-width: 100%">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 36px">
        <div style="font-size: 28px; font-weight: 800; letter-spacing: -1px; color: var(--ink)">
          IPMP
        </div>
        <div style="font-size: 13px; color: var(--ink-muted); margin-top: 4px">
          项目管理系统
        </div>
      </div>

      <NCard :bordered="true" content-style="padding: 28px 24px">
        <NForm :model="form" @submit.prevent="handleLogin">
          <NFormItem>
            <NInput
              v-model:value="form.username"
              placeholder="用户名"
              size="large"
              :input-props="{ autocomplete: 'username' }"
            />
          </NFormItem>
          <NFormItem>
            <NInput
              v-model:value="form.password"
              type="password"
              placeholder="密码"
              size="large"
              :input-props="{ autocomplete: 'current-password' }"
              @keyup.enter="handleLogin"
            />
          </NFormItem>
          <NButton
            type="primary"
            block
            size="large"
            :loading="loading"
            @click="handleLogin"
            style="margin-top: 4px"
          >
            登录
          </NButton>
        </NForm>
      </NCard>

      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: var(--ink-muted)">
        Copyright 2026 miaomiaopu
      </div>
    </div>
  </div>
</template>
