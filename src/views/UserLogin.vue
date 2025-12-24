<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="login-title">物联网设备知识图谱管理平台</h2>
      <el-form :model="loginForm" label-width="80px" class="login-form">
        <el-form-item label="用户名" required>
          <el-input v-model="loginForm.username" placeholder="输入用户名" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="loginForm.password" type="password" placeholder="输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" class="login-btn">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 引入路由实例，用于跳转页面
const router = useRouter()

// 登录表单数据
const loginForm = ref({
  username: 'admin', // 默认用户名（可直接用）
  password: '123456' // 默认密码（可直接用）
})

// 登录按钮点击事件
const login = () => {
  // 模拟登录成功：把 token 和用户名存到本地存储（让路由守卫放行）
  localStorage.setItem('token', 'fake-token-123456') // 模拟后端返回的 token
  localStorage.setItem('username', loginForm.value.username) // 存储当前登录用户名
  router.push('/home') // 登录成功后跳转到首页
}
</script>

<style scoped>
/* 登录页样式，确保居中显示 */
.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

/* 登录卡片样式 */
.login-card {
  width: 400px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 登录标题样式 */
.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #1989fa;
}

/* 表单样式 */
.login-form {
  margin-top: 20px;
}

/* 登录按钮样式（占满宽度） */
.login-btn {
  width: 100%;
}
</style>