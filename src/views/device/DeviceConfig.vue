<template>
  <div class="device-config-page">
    <el-page-header content="设备配置" />
    <div class="toolbar">
      <el-button type="primary" @click="openTemplateDialog">新建配置模板</el-button>
      <el-button @click="applyTemplate" :disabled="!canApply">下发配置</el-button>
      <el-button type="warning" @click="rebootSelected" :disabled="selection.length===0">重启设备</el-button>
      <span class="summary">已选 {{ selection.length }} 台设备</span>
    </div>

    <el-row :gutter="20" class="content">
      <el-col :span="8">
        <el-card class="panel" shadow="hover">
          <div class="panel-title">配置模板</div>
          <el-radio-group v-model="selectedTemplateId" class="tpl-list">
            <el-radio v-for="t in templates" :key="t.id" :label="t.id" class="tpl-item">
              <div class="tpl-title">{{ t.name }}</div>
              <div class="tpl-meta">版本 {{ t.version }} · 更新 {{ t.updatedAt }}</div>
            </el-radio>
          </el-radio-group>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="panel" shadow="hover">
          <div class="panel-title">设备列表</div>
          <el-form inline class="filters">
            <el-form-item label="所属网关">
              <el-select v-model="filters.gateway" placeholder="所有网关" style="width: 150px">
                <el-option label="全部" value="" />
                <el-option label="GW-01" value="GW-01" />
                <el-option label="GW-02" value="GW-02" />
              </el-select>
            </el-form-item>
            <el-form-item label="设备类型">
              <el-select v-model="filters.type" placeholder="所有类型" style="width: 150px">
                <el-option label="全部" value="" />
                <el-option label="温湿度传感器" value="温湿度传感器" />
                <el-option label="智能网关设备" value="智能网关设备" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="filters.status" placeholder="全部状态" style="width: 150px">
                <el-option label="全部" value="" />
                <el-option label="在线" value="在线" />
                <el-option label="离线" value="离线" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input v-model="filters.keyword" placeholder="设备ID/名称" style="width: 200px" />
            </el-form-item>
          </el-form>

          <el-table :data="filteredDevices" border style="width: 100%" @selection-change="onSelectionChange">
            <el-table-column type="selection" width="48" />
            <el-table-column label="设备ID" prop="id" width="120" />
            <el-table-column label="设备名称" prop="name" />
            <el-table-column label="所属网关" prop="gateway" width="110" />
            <el-table-column label="设备类型" prop="type" width="140" />
            <el-table-column label="状态" width="110">
              <template #default="scope">
                <el-tag :type="statusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="配置版本" prop="cfgVersion" width="120" />
            <el-table-column label="操作" width="160">
              <template #default="scope">
                <el-button size="small" type="primary" @click="openDeviceConfig(scope.row)">配置</el-button>
                <el-button size="small" @click="rebootDevice(scope.row)">重启</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="templateDialog" title="配置模板" width="640px">
      <el-tabs>
        <el-tab-pane label="基本参数">
          <el-form :model="templateForm" label-width="120px">
            <el-form-item label="采样间隔(ms)">
              <el-input-number v-model="templateForm.sampleInterval" :min="100" :max="600000" />
            </el-form-item>
            <el-form-item label="阈值">
              <el-input-number v-model="templateForm.threshold" :min="0" :max="1000" />
            </el-form-item>
            <el-form-item label="日志级别">
              <el-select v-model="templateForm.logLevel" style="width: 200px">
                <el-option label="DEBUG" value="DEBUG" />
                <el-option label="INFO" value="INFO" />
                <el-option label="WARN" value="WARN" />
                <el-option label="ERROR" value="ERROR" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="网络配置">
          <el-form :model="templateForm" label-width="120px">
            <el-form-item label="IP地址">
              <el-input v-model="templateForm.ip" placeholder="192.168.x.x" />
            </el-form-item>
            <el-form-item label="MQTT主题">
              <el-input v-model="templateForm.mqttTopic" placeholder="/iot/devices/+/data" />
            </el-form-item>
            <el-form-item label="加密">
              <el-switch v-model="templateForm.encrypt" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="运行策略">
          <el-form :model="templateForm" label-width="120px">
            <el-form-item label="功耗模式">
              <el-select v-model="templateForm.powerMode" style="width: 200px">
                <el-option label="高性能" value="performance" />
                <el-option label="平衡" value="balanced" />
                <el-option label="省电" value="powersave" />
              </el-select>
            </el-form-item>
            <el-form-item label="定时任务(cron)">
              <el-input v-model="templateForm.cron" placeholder="*/5 * * * *" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="templateDialog=false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="deviceDrawer" title="设备配置" size="520px">
      <el-descriptions :column="2" border style="margin-bottom: 12px">
        <el-descriptions-item label="设备ID">{{ currentDevice?.id }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentDevice?.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentDevice?.type }}</el-descriptions-item>
        <el-descriptions-item label="网关">{{ currentDevice?.gateway }}</el-descriptions-item>
      </el-descriptions>
      <el-tabs>
        <el-tab-pane label="基本参数">
          <el-form :model="deviceForm" label-width="120px">
            <el-form-item label="采样间隔(ms)">
              <el-input-number v-model="deviceForm.sampleInterval" :min="100" :max="600000" />
            </el-form-item>
            <el-form-item label="阈值">
              <el-input-number v-model="deviceForm.threshold" :min="0" :max="1000" />
            </el-form-item>
            <el-form-item label="日志级别">
              <el-select v-model="deviceForm.logLevel" style="width: 200px">
                <el-option label="DEBUG" value="DEBUG" />
                <el-option label="INFO" value="INFO" />
                <el-option label="WARN" value="WARN" />
                <el-option label="ERROR" value="ERROR" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="网络配置">
          <el-form :model="deviceForm" label-width="120px">
            <el-form-item label="IP地址">
              <el-input v-model="deviceForm.ip" />
            </el-form-item>
            <el-form-item label="MQTT主题">
              <el-input v-model="deviceForm.mqttTopic" />
            </el-form-item>
            <el-form-item label="加密">
              <el-switch v-model="deviceForm.encrypt" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="运行策略">
          <el-form :model="deviceForm" label-width="120px">
            <el-form-item label="功耗模式">
              <el-select v-model="deviceForm.powerMode" style="width: 200px">
                <el-option label="高性能" value="performance" />
                <el-option label="平衡" value="balanced" />
                <el-option label="省电" value="powersave" />
              </el-select>
            </el-form-item>
            <el-form-item label="定时任务(cron)">
              <el-input v-model="deviceForm.cron" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <div style="text-align:right">
          <el-button @click="deviceDrawer=false">取消</el-button>
          <el-button type="primary" @click="saveDeviceConfig">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const templates = ref([
  { id: 'tpl-001', name: '默认模板', version: '1.0.0', updatedAt: '2025-12-01', config: { sampleInterval: 1000, threshold: 100, logLevel: 'INFO', ip: '192.168.1.100', mqttTopic: '/iot/devices/+/data', encrypt: true, powerMode: 'balanced', cron: '*/5 * * * *' } },
  { id: 'tpl-002', name: '低功耗策略', version: '1.1.0', updatedAt: '2025-12-02', config: { sampleInterval: 5000, threshold: 150, logLevel: 'WARN', ip: '192.168.1.101', mqttTopic: '/iot/devices/+/data', encrypt: true, powerMode: 'powersave', cron: '*/10 * * * *' } }
])
const selectedTemplateId = ref(templates.value[0].id)

const devices = ref([
  { id: 'dev-2A345B', name: '温湿度传感器A', gateway: 'GW-01', type: '温湿度传感器', status: '在线', cfgVersion: 'v1.0' },
  { id: 'dev-56C78D', name: '温湿度传感器B', gateway: 'GW-02', type: '温湿度传感器', status: '在线', cfgVersion: 'v1.0' },
  { id: 'dev-98F01R', name: '智能网关设备C', gateway: 'GW-01', type: '智能网关设备', status: '离线', cfgVersion: 'v0.9' },
  { id: 'dev-AB2XCD', name: '温湿度传感器D', gateway: 'GW-02', type: '温湿度传感器', status: '在线', cfgVersion: 'v1.0' },
  { id: 'dev-EF45GH', name: '智能网关设备E', gateway: 'GW-01', type: '智能网关设备', status: '在线', cfgVersion: 'v1.0' }
])

const filters = ref({ gateway: '', type: '', status: '', keyword: '' })
const filteredDevices = computed(() => {
  const kw = filters.value.keyword.toLowerCase()
  return devices.value.filter(d =>
    (filters.value.gateway ? d.gateway === filters.value.gateway : true) &&
    (filters.value.type ? d.type === filters.value.type : true) &&
    (filters.value.status ? d.status === filters.value.status : true) &&
    (kw ? (d.id.toLowerCase().includes(kw) || d.name.toLowerCase().includes(kw)) : true)
  )
})

const selection = ref([])
const onSelectionChange = (rows) => { selection.value = rows }

const statusTagType = (s) => {
  if (s === '在线') return 'success'
  if (s === '离线') return 'info'
  return ''
}

const templateDialog = ref(false)
const templateForm = ref({ sampleInterval: 1000, threshold: 100, logLevel: 'INFO', ip: '', mqttTopic: '', encrypt: true, powerMode: 'balanced', cron: '*/5 * * * *' })
const openTemplateDialog = () => {
  const tpl = templates.value.find(t => t.id === selectedTemplateId.value)
  templateForm.value = JSON.parse(JSON.stringify(tpl.config))
  templateDialog.value = true
}
const saveTemplate = () => {
  const tpl = templates.value.find(t => t.id === selectedTemplateId.value)
  tpl.config = JSON.parse(JSON.stringify(templateForm.value))
  tpl.version = '1.' + Math.floor(Math.random()*10) + '.0'
  tpl.updatedAt = new Date().toISOString().slice(0,10)
  templateDialog.value = false
  ElMessage.success('模板已保存')
}

const canApply = computed(() => selection.value.length > 0 && !!selectedTemplateId.value)
const applyTemplate = () => {
  const tpl = templates.value.find(t => t.id === selectedTemplateId.value)
  selection.value.forEach(d => { d.cfgVersion = 'v' + tpl.version })
  ElMessage.success('配置已下发到选中设备')
}

const deviceDrawer = ref(false)
const currentDevice = ref(null)
const deviceForm = ref({ sampleInterval: 1000, threshold: 100, logLevel: 'INFO', ip: '', mqttTopic: '', encrypt: true, powerMode: 'balanced', cron: '*/5 * * * *' })
const openDeviceConfig = (row) => {
  currentDevice.value = row
  const tpl = templates.value.find(t => t.id === selectedTemplateId.value)
  deviceForm.value = JSON.parse(JSON.stringify(tpl.config))
  deviceDrawer.value = true
}
const saveDeviceConfig = () => {
  currentDevice.value.cfgVersion = 'v' + templates.value.find(t => t.id === selectedTemplateId.value).version
  deviceDrawer.value = false
  ElMessage.success('设备配置已保存')
}

const rebootDevice = (row) => {
  if (row.status !== '在线') { ElMessage.warning('设备不在线'); return }
  ElMessage.success('重启命令已发送: ' + row.id)
}
const rebootSelected = () => {
  if (!selection.value.length) return
  const online = selection.value.filter(d => d.status === '在线')
  if (!online.length) { ElMessage.warning('选中设备均不在线'); return }
  ElMessage.success('重启命令已发送到 ' + online.length + ' 台设备')
}
</script>

<style scoped>
.device-config-page { padding: 20px; }
.toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.summary { color: #666; margin-left: auto; }
.content { margin-top: 10px; }
.panel { min-height: 420px; }
.panel-title { font-weight: 600; margin-bottom: 10px; }
.tpl-list { display: flex; flex-direction: column; gap: 8px; }
.tpl-item { display: flex; flex-direction: column; padding: 8px 10px; border: 1px solid #eee; border-radius: 6px; }
.tpl-title { font-size: 14px; font-weight: 600; }
.tpl-meta { font-size: 12px; color: #888; }
.filters { margin-bottom: 10px; }
</style>

