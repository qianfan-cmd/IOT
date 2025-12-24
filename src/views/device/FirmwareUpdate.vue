<template>
  <div class="fw-update-page">
    <el-page-header content="固件更新" />
    <div class="toolbar">
      <el-button type="primary" @click="openUpload">上传固件版本</el-button>
      <el-button @click="openStrategy">升级策略设置</el-button>
      <el-button type="success" @click="startUpgrade" :disabled="!canStart">开始升级</el-button>
      <span class="summary">已选 {{ selection.length }} 台设备</span>
    </div>
    <el-row :gutter="20" class="content">
      <el-col :span="6">
        <el-card class="panel" shadow="hover">
          <div class="panel-title">固件版本管理</div>
          <el-radio-group v-model="selectedFirmwareId" class="fw-list">
            <el-radio v-for="f in firmwareList" :key="f.id" :label="f.id" class="fw-item">
              <div class="fw-title">V{{ f.version }}</div>
              <div class="fw-meta">{{ f.date }} · {{ f.size }}</div>
            </el-radio>
          </el-radio-group>
        </el-card>
      </el-col>
      <el-col :span="18">
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
                <el-option label="升级中" value="升级中" />
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
            <el-table-column label="当前版本" prop="currentVersion" width="110" />
            <el-table-column label="目标版本" width="110" :formatter="formatTargetVersion" />
            <el-table-column label="状态" width="120">
              <template #default="scope">
                <el-tag :type="statusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="进度" width="180">
              <template #default="scope">
                <el-progress :percentage="scope.row.progress" :status="progressStatus(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="最后上报时间" prop="lastUpload" width="170" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="uploadDialog" title="上传固件版本" width="520px">
      <el-form :model="uploadForm" label-width="90px">
        <el-form-item label="版本号">
          <el-input v-model="uploadForm.version" placeholder="例如 2.3.6" />
        </el-form-item>
        <el-form-item label="文件">
          <el-upload :auto-upload="false" :on-change="onUploadFileChange">
            <el-button>选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialog=false">取消</el-button>
        <el-button type="primary" @click="confirmUpload" :disabled="!uploadForm.version || !uploadForm.fileName">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="strategyDialog" title="升级策略设置" width="520px">
      <el-form :model="strategy" label-width="100px">
        <el-form-item label="批次大小">
          <el-input-number v-model="strategy.batchSize" :min="1" :max="50" />
        </el-form-item>
        <el-form-item label="允许回滚">
          <el-switch v-model="strategy.allowRollback" />
        </el-form-item>
        <el-form-item label="并发限制">
          <el-input-number v-model="strategy.concurrent" :min="1" :max="20" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="strategyDialog=false">关闭</el-button>
        <el-button type="primary" @click="saveStrategy">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const firmwareList = ref([
  { id: 'fw-235', version: '2.3.5', date: '2025-11-25', size: '85.1 MB' },
  { id: 'fw-217', version: '2.1.7', date: '2025-10-12', size: '76.3 MB' }
])
const selectedFirmwareId = ref(firmwareList.value[0].id)

const devices = ref([
  { id: 'dev-2A345B', name: '温湿度传感器A', gateway: 'GW-01', type: '温湿度传感器', currentVersion: '2.1.5', status: '在线', lastUpload: '2025-11-30 10:45', progress: 0 },
  { id: 'dev-56C78D', name: '温湿度传感器B', gateway: 'GW-02', type: '温湿度传感器', currentVersion: '2.3.2', status: '在线', lastUpload: '2025-11-30 09:30', progress: 0 },
  { id: 'dev-98F01R', name: '智能网关设备C', gateway: 'GW-01', type: '智能网关设备', currentVersion: '2.1.7', status: '离线', lastUpload: '2025-11-30 08:30', progress: 0 },
  { id: 'dev-AB2XCD', name: '温湿度传感器D', gateway: 'GW-02', type: '温湿度传感器', currentVersion: '2.2.7', status: '在线', lastUpload: '2025-11-30 08:15', progress: 0 },
  { id: 'dev-EF45GH', name: '智能网关设备E', gateway: 'GW-01', type: '智能网关设备', currentVersion: '2.3.1', status: '在线', lastUpload: '2025-11-30 10:05', progress: 0 }
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

const targetVersion = computed(() => {
  const f = firmwareList.value.find(x => x.id === selectedFirmwareId.value)
  return f ? f.version : ''
})
const formatTargetVersion = () => targetVersion.value

const statusTagType = (s) => {
  if (s === '在线') return 'success'
  if (s === '离线') return 'info'
  if (s === '升级中') return 'warning'
  if (s === '失败') return 'danger'
  if (s === '已升级') return 'primary'
  return ''
}
const progressStatus = (row) => {
  if (row.status === '失败') return 'exception'
  if (row.status === '已升级') return 'success'
  return undefined
}

const canStart = computed(() => selection.value.length > 0 && !!targetVersion.value)

const uploadDialog = ref(false)
const uploadForm = ref({ version: '', fileName: '' })
const openUpload = () => { uploadDialog.value = true }
const onUploadFileChange = (file) => { uploadForm.value.fileName = file.name }
const confirmUpload = () => {
  const id = 'fw-' + Math.random().toString(16).slice(2, 6)
  firmwareList.value.unshift({ id, version: uploadForm.value.version, date: new Date().toISOString().slice(0,10), size: '未知' })
  selectedFirmwareId.value = id
  uploadDialog.value = false
  uploadForm.value = { version: '', fileName: '' }
  ElMessage.success('固件版本已添加')
}

const strategyDialog = ref(false)
const strategy = ref({ batchSize: 3, allowRollback: true, concurrent: 3 })
const openStrategy = () => { strategyDialog.value = true }
const saveStrategy = () => { strategyDialog.value = false; ElMessage.success('策略已保存') }

const timers = new Map()
const startUpgrade = () => {
  const targets = selection.value.slice(0)
  if (!targets.length) return
  const busy = targets.filter(d => d.status === '升级中').length
  if (busy) { ElMessage.warning('存在正在升级的设备'); return }
  const batch = strategy.value.batchSize
  let idx = 0
  const launchNext = () => {
    const window = targets.slice(idx, idx + batch)
    window.forEach(d => runUpgrade(d))
    idx += batch
    if (idx < targets.length) setTimeout(launchNext, 1500)
  }
  launchNext()
}

const runUpgrade = (device) => {
  device.status = '升级中'
  device.progress = 0
  const t = setInterval(() => {
    if (device.status !== '升级中') { clearInterval(t); timers.delete(device.id); return }
    device.progress = Math.min(100, device.progress + Math.floor(Math.random()*20 + 10))
    if (device.progress >= 100) {
      clearInterval(t)
      timers.delete(device.id)
      const fail = device.id.endsWith('R')
      if (fail) {
        device.status = '失败'
        device.progress = 100
      } else {
        device.status = '已升级'
        device.currentVersion = targetVersion.value
        device.lastUpload = new Date().toISOString().slice(0,16).replace('T',' ')
      }
    }
  }, 600)
  timers.set(device.id, t)
}
</script>

<style scoped>
.fw-update-page { padding: 20px; }
.toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.summary { color: #666; margin-left: auto; }
.content { margin-top: 10px; }
.panel { min-height: 420px; }
.panel-title { font-weight: 600; margin-bottom: 10px; }
.fw-list { display: flex; flex-direction: column; gap: 8px; }
.fw-item { display: flex; flex-direction: column; padding: 8px 10px; border: 1px solid #eee; border-radius: 6px; }
.fw-title { font-size: 14px; font-weight: 600; }
.fw-meta { font-size: 12px; color: #888; }
.filters { margin-bottom: 10px; }
</style>

