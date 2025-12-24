<template>
  <div class="alarm-manage-page">
    <el-page-header content="告警管理" />
    <el-tabs v-model="activeTab" type="card" style="margin-top: 20px">
      <!-- 告警列表 -->
      <el-tab-pane label="告警列表">
        <el-table :data="alarmList" border style="width: 100%">
          <el-table-column prop="alarmId" label="告警ID" width="120" />
          <el-table-column prop="deviceCode" label="设备编码" />
          <el-table-column prop="alarmType" label="告警类型" />
          <el-table-column
            prop="alarmLevel"
            label="告警级别"
            :formatter="formatAlarmLevel"
          />
          <el-table-column prop="occurTime" label="发生时间" />
          <el-table-column
            prop="handleStatus"
            label="处理状态"
            :formatter="formatHandleStatus"
          />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="handleAlarm(scope.row)"
                v-if="scope.row.handleStatus === 0"
              >
                处理
              </el-button>
              <span v-else>已处理</span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 告警阈值配置 -->
      <el-tab-pane label="阈值配置">
        <el-form :model="thresholdForm" label-width="120px" style="max-width: 600px">
          <el-form-item label="设备类型">
            <el-select v-model="thresholdForm.deviceType" placeholder="选择设备类型">
              <el-option label="温湿度传感器" value="sensor" />
              <el-option label="智能网关" value="gateway" />
            </el-select>
          </el-form-item>
          <el-form-item label="CPU使用率阈值">
            <el-input v-model="thresholdForm.cpuThreshold" placeholder="输入阈值（%）" />
          </el-form-item>
          <el-form-item label="内存使用率阈值">
            <el-input v-model="thresholdForm.memoryThreshold" placeholder="输入阈值（%）" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveThreshold">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 激活的标签页
const activeTab = ref('0')
// 告警列表
const alarmList = ref([
  {
    alarmId: '告警信息1',
    deviceCode: '设备1',
    alarmType: 'CPU过高',
    alarmLevel: 2,
    occurTime: '2025-11-30 14:10:22',
    handleStatus: 0
  },
  {
    alarmId: '告警信息2',
    deviceCode: '设备2',
    alarmType: 'CPU过高',
    alarmLevel: 2,
    occurTime: '2025-11-28 14:10:22',
    handleStatus: 0
  }
])
// 阈值配置表单
const thresholdForm = ref({
  deviceType: 'sensor',
  cpuThreshold: '80',
  memoryThreshold: '85'
})

// 格式化告警级别
const formatAlarmLevel = (row) => {
  const levelMap = { 1: '低', 2: '中', 3: '高' }
  return levelMap[row.alarmLevel]
}

// 格式化处理状态
const formatHandleStatus = (row) => {
  const statusMap = { 0: '未处理', 1: '处理中', 2: '已处理' }
  return statusMap[row.handleStatus]
}

// 处理告警
const handleAlarm = (row) => {
  // 实际项目中弹出处理窗口
  row.handleStatus = 2
  console.log('处理告警：', row)
}

// 保存阈值配置
const saveThreshold = () => {
  // 实际项目中调用接口保存
  console.log('保存阈值配置：', thresholdForm.value)
}
</script>

<style scoped>
.alarm-manage-page {
  padding: 20px;
}
</style>