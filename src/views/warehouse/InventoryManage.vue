<template>
  <div class="inventory-manage-page">
    <el-page-header content="库存管理" />
    <el-button type="primary" style="margin-bottom: 10px" @click="openStockModal">
      库存操作
    </el-button>

    <el-table :data="inventoryList" border style="width: 100%">
      <el-table-column prop="inventoryId" label="库存ID" width="120" />
      <el-table-column prop="deviceCode" label="设备编码" />
      <el-table-column prop="deviceName" label="设备名称" />
      <el-table-column prop="quantity" label="库存数量" />
      <el-table-column
        prop="inventoryStatus"
        label="库存状态"
        :formatter="formatInventoryStatus"
      />
      <el-table-column prop="inTime" label="入库时间" />
      <el-table-column prop="managerName" label="管理员" />
    </el-table>

    <!-- 库存操作弹窗 -->
    <el-dialog v-model="stockModalVisible" title="库存操作" width="500px">
      <el-form :model="stockForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="stockForm.operationType">
            <el-radio label="入库" />
            <el-radio label="出库" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设备编码">
          <el-input v-model="stockForm.deviceCode" placeholder="输入设备编码" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input v-model.number="stockForm.quantity" placeholder="输入数量" />
        </el-form-item>
        <el-form-item label="操作备注">
          <el-input type="textarea" v-model="stockForm.remark" placeholder="输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockModalVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStockOperation">确认操作</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 库存列表
const inventoryList = ref([
  {
    inventoryId: 'INV2025001',
    deviceCode: 'DEV2025001',
    deviceName: '温湿度传感器',
    quantity: 50,
    inventoryStatus: 1,
    inTime: '2025-11-25 09:30:15',
    managerName: '刘烁桐'
  }
])
// 库存操作弹窗
const stockModalVisible = ref(false)
// 库存操作表单
const stockForm = ref({
  operationType: '入库',
  deviceCode: '',
  quantity: 0,
  remark: ''
})

// 格式化库存状态
const formatInventoryStatus = (row) => {
  return row.inventoryStatus === 1 ? '正常' : '库存不足'
}

// 打开库存操作弹窗
const openStockModal = () => {
  stockModalVisible.value = true
}

// 确认库存操作
const confirmStockOperation = () => {
  // 实际项目中调用接口更新库存
  console.log('库存操作：', stockForm.value)
  stockModalVisible.value = false
}
</script>

<style scoped>
.inventory-manage-page {
  padding: 20px;
}
</style>