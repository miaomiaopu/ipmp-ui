<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NCard, NForm, NFormItem, NInput, NButton, NSelect, NSpace, useMessage } from 'naive-ui'
import { changePassword } from '@/api/user'
import { getAIConfig, updateAIConfig, deleteAIConfig } from '@/api/aiConfig'

const message = useMessage()

// Password
const pwdForm = ref({ old_password: '', new_password: '', confirm: '' })
const pwdSaving = ref(false)
async function handleChangePwd() {
  if (pwdForm.value.new_password !== pwdForm.value.confirm) { message.error('两次密码不一致'); return }
  pwdSaving.value = true
  try { await changePassword({ old_password: pwdForm.value.old_password, new_password: pwdForm.value.new_password }); message.success('密码修改成功'); pwdForm.value = { old_password: '', new_password: '', confirm: '' } }
  catch (e: any) { message.error(e.response?.data?.message || '修改失败') }
  finally { pwdSaving.value = false }
}

// AI Config
const aiForm = ref({ provider: 'deepseek', api_key: '', model: 'deepseek-v4-flash', base_url: '' })
const aiLoading = ref(false)
const aiConfigured = ref(false)
const aiKeyPreview = ref('')
const aiSaving = ref(false)

async function loadAIConfig() {
  aiLoading.value = true
  try { const r = await getAIConfig(); const d = r.data.data; if (d.configured) { aiConfigured.value = true; aiForm.value.provider = d.provider; aiForm.value.model = d.model; aiForm.value.base_url = d.base_url || ''; aiKeyPreview.value = d.key_preview } }
  catch { /* not configured */ }
  finally { aiLoading.value = false }
}

async function handleSaveAI() {
  aiSaving.value = true
  try { await updateAIConfig(aiForm.value); message.success('AI 配置保存成功'); loadAIConfig() }
  catch (e: any) { message.error(e.message || '保存失败') }
  finally { aiSaving.value = false }
}

async function handleDeleteAI() {
  try { await deleteAIConfig(); aiConfigured.value = false; aiForm.value.api_key = ''; message.success('AI 配置已删除') }
  catch { message.error('删除失败') }
}

onMounted(loadAIConfig)
</script>

<template>
  <div>
    <div class="page-header">
      <h1>个人设置</h1>
    </div>

    <!-- Password -->
    <NCard
      title="修改密码"
      :bordered="true"
      style="margin-bottom: 24px"
    >
      <NForm
        :model="pwdForm"
        style="max-width: 360px"
      >
        <NFormItem
          label="当前密码"
          :show-feedback="false"
        >
          <NInput
            v-model:value="pwdForm.old_password"
            type="password"
          />
        </NFormItem>
        <NFormItem
          label="新密码"
          :show-feedback="false"
        >
          <NInput
            v-model:value="pwdForm.new_password"
            type="password"
            placeholder="至少6位"
          />
        </NFormItem>
        <NFormItem
          label="确认新密码"
          :show-feedback="false"
        >
          <NInput
            v-model:value="pwdForm.confirm"
            type="password"
          />
        </NFormItem>
        <NButton
          type="primary"
          :loading="pwdSaving"
          @click="handleChangePwd"
        >
          修改密码
        </NButton>
      </NForm>
    </NCard>

    <!-- AI Config -->
    <NCard
      title="AI 配置"
      :bordered="true"
    >
      <p
        v-if="aiConfigured"
        style="color: var(--success); margin-bottom: 12px"
      >
        已配置 {{ aiForm.provider }} ({{ aiForm.model }}) Key: {{ aiKeyPreview }}
      </p>
      <NForm
        :model="aiForm"
        style="max-width: 420px"
      >
        <NFormItem
          label="提供商"
          :show-feedback="false"
        >
          <NSelect
            v-model:value="aiForm.provider"
            :options="[{label:'DeepSeek',value:'deepseek'},{label:'OpenAI',value:'openai'},{label:'Claude',value:'claude'}]"
          />
        </NFormItem>
        <NFormItem
          label="API Key"
          :show-feedback="false"
        >
          <NInput
            v-model:value="aiForm.api_key"
            type="password"
            placeholder="sk-..."
          />
        </NFormItem>
        <NFormItem
          label="模型"
          :show-feedback="false"
        >
          <NInput
            v-model:value="aiForm.model"
            placeholder="deepseek-v4-flash"
          />
        </NFormItem>
        <NFormItem
          label="Base URL (可选)"
          :show-feedback="false"
        >
          <NInput
            v-model:value="aiForm.base_url"
            placeholder="留空使用默认"
          />
        </NFormItem>
        <NSpace>
          <NButton
            type="primary"
            :loading="aiSaving"
            @click="handleSaveAI"
          >
            保存
          </NButton>
          <NButton
            v-if="aiConfigured"
            type="error"
            secondary
            @click="handleDeleteAI"
          >
            删除配置
          </NButton>
        </NSpace>
      </NForm>
    </NCard>
  </div>
</template>
