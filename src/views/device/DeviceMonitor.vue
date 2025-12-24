<template>
  <div class="device-monitor-page">
    <el-page-header content="设备状态监控" />
    <el-form inline @submit.prevent class="search-form">
      <el-form-item label="设备编码">
        <el-input v-model="searchForm.deviceCode" placeholder="输入设备编码" />
      </el-form-item>
      <el-form-item label="设备状态">
        <el-select v-model="searchForm.status" placeholder="选择状态">
          <el-option label="全部" value="" />
          <el-option label="在线" value="2" />
          <el-option label="离线" value="3" />
          <el-option label="故障" value="4" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchDeviceStatus">查询</el-button>
        <el-button @click="refreshStatus">刷新</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="deviceStatusList" border style="width: 100%; margin-top: 20px">
      <el-table-column prop="deviceCode" label="设备编码" />
      <el-table-column prop="deviceName" label="设备名称" />
      <el-table-column
        prop="onlineStatus"
        label="在线状态"
        :formatter="formatOnlineStatus"
      />
      <el-table-column prop="cpuUsage" label="CPU使用率" />
      <el-table-column prop="memoryUsage" label="内存使用率" />
      <el-table-column prop="dataUploadTime" label="最后上报时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" type="primary" @click="viewDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 查询表单
const searchForm = ref({
  deviceCode: '',
  status: ''
})
// 设备状态列表
const deviceStatusList = ref([
  {
    deviceCode: 'DEV2025001',
    deviceName: '温湿度传感器',
    onlineStatus: 1,
    cpuUsage: '12.5%',
    memoryUsage: '28.3%',
    dataUploadTime: '2025-11-30 14:20:15'
  },
  {
    deviceCode: 'DEV2025002',
    deviceName: '智能网关',
    onlineStatus: 0,
    cpuUsage: '-',
    memoryUsage: '-',
    dataUploadTime: '2025-11-30 10:05:33'
  }
])

// 格式化在线状态
const formatOnlineStatus = (row) => {
  return row.onlineStatus === 1 ? '在线' : '离线'
}

// 查询设备状态
const fetchDeviceStatus = () => {
  // 实际项目中这里调用接口，传入searchForm
  console.log('查询条件：', searchForm.value)
}

// 刷新状态
const refreshStatus = () => {
  // 实际项目中这里调用刷新接口
  deviceStatusList.value[0].cpuUsage = (Math.random() * 30 + 10).toFixed(1) + '%'
}

// 查看详情
const viewDetail = (row) => {
  // 实际项目中跳转到详情页
  console.log('查看设备详情：', row)
}
</script>

<style scoped>
.device-monitor-page {
  padding: 20px;
}
.search-form {
  margin-bottom: 10px;
}
</style>