<template>
  <div class="picture-manager-page">
    <el-page-header content="知识图谱查询" />
    <el-form inline @submit.prevent class="search-form">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="设备/网关/传感器名称或ID" />
      </el-form-item>
      <el-form-item label="节点类型">
        <el-select v-model="searchForm.nodeType" placeholder="选择类型" style="width: 180px">
          <el-option label="全部" value="" />
          <el-option label="设备" value="device" />
          <el-option label="网关" value="gateway" />
          <el-option label="传感器" value="sensor" />
          <el-option label="厂商" value="vendor" />
          <el-option label="区域" value="area" />
          <el-option label="参数" value="param" />
        </el-select>
      </el-form-item>
      <el-form-item label="最大深度">
        <el-slider v-model="searchForm.maxDepth" :min="1" :max="4" :show-input="true" style="width: 240px" />
      </el-form-item>
      <el-form-item label="关系类型">
        <el-select v-model="searchForm.relationTypes" multiple collapse-tags placeholder="选择关系" style="width: 260px">
          <el-option label="连接" value="connected_to" />
          <el-option label="依赖" value="depends_on" />
          <el-option label="同属网络" value="in_network" />
          <el-option label="包含传感器" value="contains_sensor" />
          <el-option label="厂商" value="manufactured_by" />
          <el-option label="部署区域" value="deployed_in" />
          <el-option label="传感器参数" value="has_param" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="queryGraph">查询</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="success" @click="exportJSON" :disabled="!graphData">导出JSON</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="20" style="margin-top: 10px">
      <el-col :span="12">
        <el-card shadow="hover" class="panel">
          <template #header>
            <div class="card-header">关系结构图</div>
          </template>
          <el-empty description="请先查询" v-if="!graphData" />
          <div v-else class="graph-wrap">
            <svg :width="svgW" :height="svgH">
              <g>
                <line
                  v-for="(e, idx) in edgesToDraw"
                  :key="'e-'+idx"
                  :x1="positions.get(e.source)?.x || 0"
                  :y1="positions.get(e.source)?.y || 0"
                  :x2="positions.get(e.target)?.x || 0"
                  :y2="positions.get(e.target)?.y || 0"
                  stroke="#c0c4cc"
                  stroke-width="2"
                />
              </g>
              <g>
                <g
                  v-for="n in visibleNodes"
                  :key="n.id"
                  class="node"
                  :transform="`translate(${positions.get(n.id)?.x || 0},${positions.get(n.id)?.y || 0})`"
                  @click="onNodeClickSvg(n)"
                  style="cursor: pointer"
                >
                  <circle :r="nodeRadius(n)" :fill="nodeFill(n)" stroke="#fff" stroke-width="2" />
                  <text x="0" :y="-(nodeRadius(n) + 12)" text-anchor="middle" font-size="12" fill="#666">{{ formatType(n.type) }}</text>
                  <text x="0" y="4" text-anchor="middle" font-size="12" fill="#333">{{ n.label }}</text>
                </g>
              </g>
            </svg>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="panel">
          <template #header>
            <div class="card-header">节点详情</div>
          </template>
          <el-empty description="选择左侧节点查看详情" v-if="!selectedNode" />
          <template v-else>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="ID">{{ selectedNode.id }}</el-descriptions-item>
              <el-descriptions-item label="名称">{{ selectedNode.label }}</el-descriptions-item>
              <el-descriptions-item label="类型">{{ formatType(selectedNode.type) }}</el-descriptions-item>
              <el-descriptions-item label="最近更新时间">{{ selectedNode.updatedAt }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ selectedNode.status }}</el-descriptions-item>
            </el-descriptions>
            <el-tabs style="margin-top: 16px">
              <el-tab-pane label="关系列表">
                <el-table :data="relationsOfSelected" border>
                  <el-table-column prop="type" label="关系类型" :formatter="formatRelation" />
                  <el-table-column prop="targetLabel" label="目标节点" />
                  <el-table-column prop="targetType" label="目标类型" :formatter="formatType" />
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="属性JSON">
                <pre class="json-view">{{ JSON.stringify(selectedNode, null, 2) }}</pre>
              </el-tab-pane>
            </el-tabs>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </div>
  </template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const searchForm = ref({
  keyword: '',
  nodeType: '',
  maxDepth: 2,
  relationTypes: []
})

const sampleGraphData = ref({
  nodes: [
    { id: 'DEV-A1', label: '设备A1', type: 'device', status: '在线', updatedAt: '2025-12-01 10:20:00', registeredAt: '2025-11-01 09:12:00' },
    { id: 'GW-01', label: '网关01', type: 'gateway', status: '在线', updatedAt: '2025-12-01 10:22:10' },
    { id: 'S-TEMP-01', label: '温度传感器', type: 'sensor', status: '在线', updatedAt: '2025-12-01 10:05:12', sampleFreq: '1Hz' },
    { id: 'S-HUM-02', label: '湿度传感器', type: 'sensor', status: '在线', updatedAt: '2025-12-01 10:06:40', sampleFreq: '0.5Hz' },
    { id: 'P-TEMP-FREQ', label: '采样频率', type: 'param', value: '1Hz' },
    { id: 'P-HUM-FREQ', label: '采样频率', type: 'param', value: '0.5Hz' },
    { id: 'V-ACME', label: 'ACME 厂商', type: 'vendor', status: '合作' },
    { id: 'AREA-01', label: 'A区·2楼', type: 'area', status: '运行' }
  ],
  edges: [
    { source: 'DEV-A1', target: 'GW-01', type: 'connected_to' },
    { source: 'DEV-A1', target: 'S-TEMP-01', type: 'contains_sensor' },
    { source: 'DEV-A1', target: 'S-HUM-02', type: 'contains_sensor' },
    { source: 'S-TEMP-01', target: 'P-TEMP-FREQ', type: 'has_param' },
    { source: 'S-HUM-02', target: 'P-HUM-FREQ', type: 'has_param' },
    { source: 'DEV-A1', target: 'V-ACME', type: 'manufactured_by' },
    { source: 'DEV-A1', target: 'AREA-01', type: 'deployed_in' }
  ]
})

const graphData = ref(null)
const selectedNode = ref(null)

const queryGraph = () => {
  const kw = (searchForm.value.keyword || '').toLowerCase()
  const nodeType = searchForm.value.nodeType
  const relSet = new Set(searchForm.value.relationTypes || [])
  const nodesAll = sampleGraphData.value.nodes
  const nodesMatched = nodesAll.filter(n => {
    const byKw = kw ? (n.label.toLowerCase().includes(kw) || n.id.toLowerCase().includes(kw)) : true
    const byType = nodeType ? n.type === nodeType : true
    return byKw && byType
  })
  if (!nodesMatched.length) {
    ElMessage.warning('未找到匹配节点')
    graphData.value = null
    selectedNode.value = null
    return
  }
  const root = nodesMatched.find(n => n.type === 'device') || nodesMatched[0]
  const edgesAll = sampleGraphData.value.edges.filter(e => {
    const byRel = relSet.size ? relSet.has(e.type) : true
    return byRel
  })
  const adj = new Map()
  edgesAll.forEach(e => {
    if (!adj.has(e.source)) adj.set(e.source, [])
    if (!adj.has(e.target)) adj.set(e.target, [])
    adj.get(e.source).push({ id: e.target, type: 'out', edge: e })
    adj.get(e.target).push({ id: e.source, type: 'in', edge: { source: e.target, target: e.source, type: e.type } })
  })
  const visited = new Set([root.id])
  const queue = [{ id: root.id, depth: 0 }]
  const maxDepth = searchForm.value.maxDepth
  const nodesSet = new Set([root.id])
  const edgesSet = []
  while (queue.length) {
    const cur = queue.shift()
    if (cur.depth >= maxDepth) continue
    const neighbors = adj.get(cur.id) || []
    neighbors.forEach(n => {
      if (!visited.has(n.id)) {
        visited.add(n.id)
        nodesSet.add(n.id)
        queue.push({ id: n.id, depth: cur.depth + 1 })
      }
      if (!edgesSet.find(x => x.source === n.edge.source && x.target === n.edge.target && x.type === n.edge.type)) {
        edgesSet.push(n.edge)
      }
    })
  }
  const nodes = nodesAll.filter(n => nodesSet.has(n.id))
  const edges = edgesSet.filter(e => nodesSet.has(e.source) && nodesSet.has(e.target))
  graphData.value = { nodes, edges, rootId: root.id }
  selectedNode.value = root
}

const resetForm = () => {
  searchForm.value = { keyword: '', nodeType: '', maxDepth: 2, relationTypes: [] }
  graphData.value = null
  selectedNode.value = null
}

const formatType = (t) => {
  if (t === 'device') return '设备'
  if (t === 'gateway') return '网关'
  if (t === 'sensor') return '传感器'
  if (t === 'network') return '网络'
  if (t === 'vendor') return '厂商'
  if (t === 'area') return '区域'
  if (t === 'param') return '参数'
  return t
}

const formatRelation = (row) => {
  const t = row.type || row
  if (t === 'connected_to') return '连接'
  if (t === 'depends_on') return '依赖'
  if (t === 'in_network') return '同属网络'
  if (t === 'contains_sensor') return '包含传感器'
  if (t === 'manufactured_by') return '厂商'
  if (t === 'deployed_in') return '部署区域'
  if (t === 'has_param') return '传感器参数'
  return t
}

const svgW = 700
const svgH = 420
const columnCount = computed(() => searchForm.value.maxDepth + 1)
const columnGap = computed(() => svgW / Math.max(2, columnCount.value))
const nodeRadius = (n) => n.type === 'device' ? 24 : n.type === 'sensor' ? 20 : n.type === 'param' ? 14 : 18
const nodeFill = (n) => {
  if (n.type === 'device') return '#409EFF'
  if (n.type === 'sensor') return '#E6A23C'
  if (n.type === 'gateway') return '#67C23A'
  if (n.type === 'vendor') return '#909399'
  if (n.type === 'area') return '#8cc5ff'
  if (n.type === 'param') return '#ffd04b'
  return '#a6a9ad'
}
const visibleNodes = computed(() => {
  if (!graphData.value) return []
  return graphData.value.nodes
})
const positions = computed(() => {
  const pos = new Map()
  if (!graphData.value) return pos
  const idToDepth = new Map()
  const rootId = graphData.value.rootId
  idToDepth.set(rootId, 0)
  const adj = new Map()
  graphData.value.edges.forEach(e => {
    if (!adj.has(e.source)) adj.set(e.source, [])
    if (!adj.has(e.target)) adj.set(e.target, [])
    adj.get(e.source).push(e.target)
    adj.get(e.target).push(e.source)
  })
  const q = [rootId]
  while (q.length) {
    const cur = q.shift()
    const depth = idToDepth.get(cur)
    const nexts = adj.get(cur) || []
    nexts.forEach(n => {
      if (!idToDepth.has(n)) {
        idToDepth.set(n, Math.min(depth + 1, searchForm.value.maxDepth))
        q.push(n)
      }
    })
  }
  const groups = {}
  graphData.value.nodes.forEach(n => {
    const d = idToDepth.get(n.id) ?? searchForm.value.maxDepth
    if (!groups[d]) groups[d] = []
    groups[d].push(n)
  })
  Object.keys(groups).forEach(k => {
    const i = Number(k)
    const colX = (i + 0.5) * columnGap.value
    const arr = groups[k]
    const gapY = svgH / (arr.length + 1)
    arr.forEach((n, idx) => {
      pos.set(n.id, { x: colX, y: (idx + 1) * gapY })
    })
  })
  return pos
})
const edgesToDraw = computed(() => {
  if (!graphData.value) return []
  return graphData.value.edges
})

const onNodeClickSvg = (n) => {
  selectedNode.value = n
}

const relationsOfSelected = computed(() => {
  if (!graphData.value || !selectedNode.value) return []
  const idToNode = new Map(graphData.value.nodes.map(n => [n.id, n]))
  const outs = graphData.value.edges
    .filter(e => e.source === selectedNode.value.id)
    .map(e => ({ type: e.type, targetLabel: idToNode.get(e.target)?.label || e.target, targetType: idToNode.get(e.target)?.type || '-' }))
  const ins = graphData.value.edges
    .filter(e => e.target === selectedNode.value.id)
    .map(e => ({ type: e.type, targetLabel: idToNode.get(e.source)?.label || e.source, targetType: idToNode.get(e.source)?.type || '-' }))
  return outs.concat(ins)
})

const exportJSON = () => {
  if (!graphData.value) return
  const blob = new Blob([JSON.stringify(graphData.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'kg-query-result.json'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.picture-manager-page {
  padding: 20px;
}
.search-form {
  margin-bottom: 10px;
}
.panel {
  min-height: 420px;
}
.card-header {
  font-weight: 600;
}
.json-view {
  background: #f7f8fa;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow: auto;
}
.graph-wrap {
  width: 100%;
  overflow: auto;
}
</style>
