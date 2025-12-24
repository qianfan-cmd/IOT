<template>
  <!-- 路由出口：所有页面（登录页、首页、设备注册等）都会渲染到这里 -->
  <router-view />
</template>

<script setup>
// 无需额外逻辑，路由出口是核心，负责渲染所有路由对应的页面
// 登录页、首页的逻辑都在各自的 .vue 文件里，这里不用写额外代码
</script>

<style scoped>
/* 全局基础样式，避免页面布局错乱 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 解决 Element Plus 组件样式冲突问题（可选但推荐） */
:deep(.el-container),
:deep(.el-aside),
:deep(.el-main),
:deep(.el-header) {
  height: 100%;
}
</style>