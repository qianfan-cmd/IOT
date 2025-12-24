<template>
  <el-container style="height: 100vh;">
    <!-- 侧边导航栏 -->
    <el-aside width="200px" style="background-color: #545c64;">
      <el-menu
        default-active="1"
        class="el-menu-vertical-demo"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <!-- 设备管理菜单组 -->
        <el-sub-menu index="1">
          <template #title>
            <el-icon><Device /></el-icon>
            <span>设备管理</span>
          </template>
          <el-menu-item index="1-1">
            <router-link to="/home/device/register">设备注册</router-link>
          </el-menu-item>
          <el-menu-item index="1-2">
            <router-link to="/home/device/auth">设备认证</router-link>
          </el-menu-item>
          <el-menu-item index="1-3">
            <router-link to="/home/device/config">设备配置</router-link>
          </el-menu-item>
          <el-menu-item index="1-4">
            <router-link to="/home/device/monitor">状态监控</router-link>
          </el-menu-item>
          <el-menu-item index="1-5">
            <router-link to="/home/device/firmware">固件更新</router-link>
          </el-menu-item>
        </el-sub-menu>

        <!-- 告警管理 -->
        <el-menu-item index="2">
          <el-icon><WarningFilled /></el-icon>
          <span>
            <router-link to="/home/alarm/manage">告警管理</router-link>
          </span>
        </el-menu-item>

        <!-- 库存管理 -->
        <el-menu-item index="3">
          <el-icon><Box /></el-icon>
          <span>
            <router-link to="/home/warehouse/inventory">库存管理</router-link>
          </span>
        </el-menu-item>

        <!-- 知识图谱查询 -->
        <el-menu-item index="4">
          <el-icon><ShareFromSquare /></el-icon>
          <span>
            <router-link to="/home/kg/query">知识图谱查询</router-link>
          </span>
        </el-menu-item>

        <!-- 性能分析 -->
        <el-menu-item index="6">
          <el-icon><TrendCharts /></el-icon>
          <span>
            <router-link to="/home/perf/analysis">性能分析</router-link>
          </span>
        </el-menu-item>

        <!-- 退出登录 -->
        <el-menu-item index="5" @click="logout">
          <el-icon><Logout /></el-icon>
          <span>退出登录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-header style="text-align: right; font-size: 12px; background-color: #fff; border-bottom: 1px solid #eee;">
        <span>欢迎您，{{ username }}</span>
      </el-header>
      <el-main style="padding: 20px;">
        <!-- 子路由出口：所有子页面（注册、监控等）渲染到这里 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// 引入 Element Plus 图标
import {
  Device,
  WarningFilled,
  Box,
  ShareFromSquare,
  TrendCharts,
  Logout
} from '@element-plus/icons-vue'

const router = useRouter()
const username = ref(localStorage.getItem('username') || '管理员') // 从本地存储获取用户名

// 退出登录
const logout = () => {
  localStorage.removeItem('token') // 清除 token
  localStorage.removeItem('username') // 清除用户名
  router.push('/login') // 跳转到登录页
}
</script>

<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
.el-header {
  height: 60px !important;
  line-height: 60px !important;
}
</style>
