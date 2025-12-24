import { createRouter, createWebHistory } from 'vue-router'




// 新增的 4 个核心用例页面
import DeviceMonitor from '@/views/device/DeviceMonitor.vue'
import FirmwareUpdate from '@/views/device/FirmwareUpdate.vue'
import DeviceConfig from '@/views/device/DeviceConfig.vue'
import AlarmManage from '@/views/alarm/AlarmManage.vue'
import InventoryManage from '@/views/warehouse/InventoryManage.vue'
import PictureManager from '@/views/warehouse/PictureManager.vue'
import PerformanceAnalysis from '@/views/performance/PerformanceAnalysis.vue'


// 可选：添加首页和登录页（完善系统流程）
import HomePage from '@/views/HomePage.vue'
import UserLogin from '@/views/UserLogin.vue'

// 路由规则
  const routes = [
  {
    path: '/',
    redirect: '/home' // 默认跳转到首页
  },
  {
    path: '/login',
    name: 'UserLogin', // 可选：同步改name
    component: UserLogin, // 改成UserLogin
    meta: { title: '登录 - 物联网设备知识图谱管理平台' }
  },
  {
    path: '/home',
    name: 'HomePage', // 可选：同步改name
    component: HomePage, // 改成HomePage
    meta: { title: '首页 - 物联网设备知识图谱管理平台', requiresAuth: true }, // requiresAuth：需要登录才能访问
    children: [
     
     
      {
        path: 'device/monitor',
        name: 'DeviceMonitor',
        component: DeviceMonitor,
        meta: { title: '设备状态监控' }
      },
      {
        path: 'device/config',
        name: 'DeviceConfig',
        component: DeviceConfig,
        meta: { title: '设备配置' }
      },
      {
        path: 'device/firmware',
        name: 'FirmwareUpdate',
        component: FirmwareUpdate,
        meta: { title: '固件更新' }
      },
      // 告警管理路由
      {
        path: 'alarm/manage',
        name: 'AlarmManage',
        component: AlarmManage,
        meta: { title: '告警管理' }
      },
      // 库存管理路由
      {
        path: 'warehouse/inventory',
        name: 'InventoryManage',
        component: InventoryManage,
        meta: { title: '库存管理' }
      },
      {
        path: 'kg/query',
        name: 'PictureManager',
        component: PictureManager,
        meta: { title: '知识图谱查询' }
      },
      {
        path: 'perf/analysis',
        name: 'PerformanceAnalysis',
        component: PerformanceAnalysis,
        meta: { title: '性能分析' }
      },
      
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // 路由模式：HTML5 History 模式（无 # 号）
  routes
})

// 路由守卫：1. 动态设置页面标题 2. 验证登录状态（拦截未登录访问需要权限的页面）
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 验证登录状态
  const isLogin = localStorage.getItem('token') // 假设登录成功后存储 token 到本地存储
  if (to.meta.requiresAuth) { // 需要登录的页面
    if (isLogin) {
      next() // 已登录，放行
    } else {
      next('/login') // 未登录，跳转到登录页
    }
  } else {
    next() // 不需要登录的页面（如登录页），直接放行
  }
})

export default router
