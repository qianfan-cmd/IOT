<template>
  <div class="perf-page">
    <el-page-header content="性能分析" />
    <div class="page-meta">最后更新：{{ lastUpdated }}</div>

    <el-tabs v-model="activeTab" class="tabs">
      <el-tab-pane label="实时性能概览" name="realtime">
        <el-row :gutter="16" class="kpi-row">
          <el-col :span="6">
            <el-card class="kpi">
              <div class="kpi-title">设备总数</div>
              <div class="kpi-value">{{ kpis.totalDevices }}</div>
              <div class="kpi-trend up">+{{ kpis.totalDelta }}%</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="kpi">
              <div class="kpi-title">在线设备</div>
              <div class="kpi-value">{{ kpis.onlineDevices }}</div>
              <div class="kpi-trend up">+{{ kpis.onlineDelta }}%</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="kpi">
              <div class="kpi-title">异常设备</div>
              <div class="kpi-value warn">{{ kpis.abnormalDevices }}</div>
              <div class="kpi-trend down">-{{ kpis.abnormalDelta }}%</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="kpi">
              <div class="kpi-title">平均响应时间</div>
              <div class="kpi-value">{{ kpis.avgLatency }} ms</div>
              <div class="kpi-trend up">+{{ kpis.latencyDelta }}%</div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="16" class="charts-row">
          <el-col :span="12">
            <el-card class="panel" shadow="hover">
              <div class="panel-title">CPU/内存利用率</div>
              <div class="chart">
                <svg :width="chartW" :height="chartH">
                  <rect x="0" y="0" :width="chartW" :height="chartH" fill="#f7f8fa" />
                  <path :d="cpuPath" stroke="#409EFF" stroke-width="2" fill="rgba(64,158,255,0.15)" />
                  <path :d="memPath" stroke="#67C23A" stroke-width="2" fill="rgba(103,194,58,0.15)" />
                  <g v-for="(x,i) in xTicks" :key="i">
                    <text :x="x" :y="chartH-6" font-size="10" fill="#999" text-anchor="middle">{{ labels[i] }}</text>
                  </g>
                  <g v-for="p in yTicks" :key="p">
                    <text x="6" :y="chartH - p*chartH" font-size="10" fill="#999">{{ Math.round(p*100) }}%</text>
                  </g>
                </svg>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="panel" shadow="hover">
              <div class="panel-title">设备状态分布</div>
              <div class="chart donut">
                <svg :width="donutSize" :height="donutSize">
                  <g :transform="`translate(${donutSize/2},${donutSize/2})`">
                    <circle :r="donutR" cx="0" cy="0" fill="#f7f8fa" />
                    <template v-for="(seg,i) in donutSegments" :key="i">
                      <path :d="seg.d" :fill="seg.color" />
                    </template>
                    <circle :r="donutR*0.55" cx="0" cy="0" fill="#fff" />
                    <text x="0" y="4" font-size="14" fill="#333" text-anchor="middle">{{ kpis.onlineDevices }}/{{ kpis.totalDevices }}</text>
                  </g>
                </svg>
                <div class="legend">
                  <div class="legend-item"><span class="dot dot-online"></span> 在线</div>
                  <div class="legend-item"><span class="dot dot-offline"></span> 离线</div>
                  <div class="legend-item"><span class="dot dot-abnormal"></span> 异常</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="历史性能分析" name="history">
        <el-empty description="历史分析可接入后端数据" />
      </el-tab-pane>
      <el-tab-pane label="网关性能分析" name="gateway">
        <el-empty description="网关分析可接入后端数据" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const lastUpdated = ref(new Date().toISOString().slice(0,16).replace('T',' '))
const activeTab = ref('realtime')

const kpis = ref({ totalDevices: 352, totalDelta: 3.5, onlineDevices: 328, onlineDelta: 2.1, abnormalDevices: 17, abnormalDelta: 1.8, avgLatency: 142, latencyDelta: 5.3 })

const labels = ['10:00','10:10','10:20','10:30','10:40','10:50']
const cpuSeries = ref([42,55,63,58,52,57])
const memSeries = ref([36,44,49,51,47,50])
const chartW = 520
const chartH = 220
const xTicks = computed(() => {
  const step = chartW / (labels.length - 1)
  return labels.map((_,i) => i*step)
})
const toPath = (arr) => {
  const stepX = chartW / (arr.length - 1)
  const points = arr.map((v,i) => [i*stepX, chartH - (v/100)*chartH])
  const d = 'M' + points.map(p => p.join(',')).join(' L ')
  const area = d + ` L ${chartW},${chartH} L 0,${chartH} Z`
  return { line: d, area }
}
const cpuPath = computed(() => toPath(cpuSeries.value).area)
const memPath = computed(() => toPath(memSeries.value).area)
const yTicks = [0.25,0.5,0.75,1]

const donutSize = 240
const donutR = donutSize/2 - 10
const statusCounts = computed(() => {
  const online = kpis.value.onlineDevices
  const abnormal = kpis.value.abnormalDevices
  const offline = Math.max(0, kpis.value.totalDevices - online - abnormal)
  return { online, offline, abnormal }
})
const donutSegments = computed(() => {
  const total = kpis.value.totalDevices
  const parts = [
    { value: statusCounts.value.online, color: '#67C23A' },
    { value: statusCounts.value.offline, color: '#909399' },
    { value: statusCounts.value.abnormal, color: '#E6A23C' }
  ]
  let start = -Math.PI/2
  const segments = []
  parts.forEach(p => {
    const angle = total ? (p.value/total) * Math.PI*2 : 0
    const end = start + angle
    const large = angle > Math.PI ? 1 : 0
    const sx = Math.cos(start) * donutR
    const sy = Math.sin(start) * donutR
    const ex = Math.cos(end) * donutR
    const ey = Math.sin(end) * donutR
    const d = `M0,0 L${sx},${sy} A${donutR},${donutR} 0 ${large} 1 ${ex},${ey} Z`
    segments.push({ d, color: p.color })
    start = end
  })
  return segments
})
</script>

<style scoped>
.perf-page { padding: 20px; }
.page-meta { color: #666; margin-top: 6px; }
.tabs { margin-top: 10px; }
.kpi-row { margin-top: 8px; }
.kpi { height: 100px; display: flex; flex-direction: column; justify-content: center; }
.kpi-title { color: #666; font-size: 13px; }
.kpi-value { font-size: 22px; font-weight: 700; }
.kpi-value.warn { color: #E6A23C; }
.kpi-trend { font-size: 12px; }
.kpi-trend.up { color: #67C23A; }
.kpi-trend.down { color: #F56C6C; }
.charts-row { margin-top: 12px; }
.panel { min-height: 280px; }
.panel-title { font-weight: 600; margin-bottom: 8px; }
.chart { display: flex; align-items: center; justify-content: center; }
.chart svg { width: 100%; height: auto; }
.donut { display: flex; align-items: center; gap: 16px; }
.legend { display: flex; flex-direction: column; gap: 6px; }
.legend-item { font-size: 12px; color: #666; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px; }
.dot-online { background: #67C23A; }
.dot-offline { background: #909399; }
.dot-abnormal { background: #E6A23C; }
</style>
