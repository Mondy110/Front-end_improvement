<template>
  <div class="dashboard-container">
    <!-- 顶部欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="banner-text">
          <h1 class="banner-title">医学动作智能评测系统</h1>
          <p class="banner-desc">基于深度学习与计算机视觉技术，实现医学动作智能识别与评测</p>
        </div>
        <div class="banner-decoration">
          <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 L30,60 L40,60 L50,20 L60,100 L70,5 L80,110 L90,60 L110,60 L130,60 L140,60 L150,25 L160,95 L170,10 L180,105 L190,60 L200,60" 
              stroke="currentColor" stroke-width="2" fill="none" opacity="0.25" class="ecg-wave"/>
            <circle cx="100" cy="60" r="40" stroke="currentColor" stroke-width="1" opacity="0.1"/>
            <line x1="85" y1="60" x2="115" y2="60" stroke="currentColor" stroke-width="2.5" opacity="0.3" stroke-linecap="round"/>
            <line x1="100" y1="45" x2="100" y2="75" stroke="currentColor" stroke-width="2.5" opacity="0.3" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6" v-for="item in statCards" :key="item.key">
        <div class="stat-card" :style="{ '--card-accent': item.color }">
          <div class="stat-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="stat-icon">
              <path :d="item.icon" />
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ item.value }}</span>
            <span class="stat-label">{{ item.label }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="content-row">
      <!-- 左侧：评测动态 -->
      <el-col :xs="24" :lg="14">
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">最近评测动态</h3>
            <span class="panel-badge">实时</span>
          </div>
          <div class="panel-body">
            <div class="activity-list">
              <div class="activity-item" v-for="(item, idx) in recentActivities" :key="idx">
                <div class="activity-dot" :style="{ background: item.statusColor }"></div>
                <div class="activity-content">
                  <div class="activity-main">
                    <span class="activity-name">{{ item.name }}</span>
                    <el-tag :type="item.tagType" size="small" effect="light" round>{{ item.status }}</el-tag>
                  </div>
                  <div class="activity-meta">
                    <span>{{ item.subject }}</span>
                    <span class="activity-score" v-if="item.score">得分：{{ item.score }}</span>
                    <span class="activity-time">{{ item.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧：快捷操作 + 能力分布 -->
      <el-col :xs="24" :lg="10">
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title">快捷操作</h3>
          </div>
          <div class="panel-body">
            <div class="quick-grid">
              <div class="quick-item" v-for="item in quickActions" :key="item.label" @click="handleQuickAction(item.route)">
                <div class="quick-icon" :style="{ background: item.bg }">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path :d="item.icon" />
                  </svg>
                </div>
                <span class="quick-label">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel" style="margin-top: 16px;">
          <div class="panel-header">
            <h3 class="panel-title">评测能力概览</h3>
          </div>
          <div class="panel-body">
            <div class="skill-bars">
              <div class="skill-item" v-for="item in skillOverview" :key="item.name">
                <div class="skill-header">
                  <span class="skill-name">{{ item.name }}</span>
                  <span class="skill-val">{{ item.value }}%</span>
                </div>
                <div class="skill-track">
                  <div class="skill-fill" :style="{ width: item.value + '%', background: item.color }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const router = useRouter()

const statCards = ref([
  { key: 'students', label: '评测学员', value: '1,286', color: '#0D9488', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { key: 'subjects', label: '评测科目', value: '36', color: '#06B6D4', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4' },
  { key: 'evaluations', label: '本月评测', value: '892', color: '#F59E0B', icon: 'M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z' },
  { key: 'passRate', label: '合格率', value: '94.6%', color: '#10B981', icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3' }
])

const recentActivities = ref([
  { name: '张明远', subject: '心肺复苏操作', status: '优秀', statusColor: '#10B981', tagType: 'success', score: '96', time: '5分钟前' },
  { name: '李思涵', subject: '外科洗手消毒', status: '合格', statusColor: '#0D9488', tagType: '', score: '82', time: '12分钟前' },
  { name: '王建国', subject: '穿脱隔离衣', status: '评测中', statusColor: '#F59E0B', tagType: 'warning', score: null, time: '18分钟前' },
  { name: '陈晓琳', subject: '静脉穿刺术', status: '待评测', statusColor: '#64748B', tagType: 'info', score: null, time: '25分钟前' },
  { name: '赵宇飞', subject: '无菌操作技术', status: '合格', statusColor: '#0D9488', tagType: '', score: '85', time: '32分钟前' },
  { name: '刘芳华', subject: '心肺复苏操作', status: '不合格', statusColor: '#EF4444', tagType: 'danger', score: '58', time: '1小时前' }
])

const quickActions = ref([
  { label: '视频评测', bg: 'rgba(13,148,136,0.1)', icon: 'M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z', route: '/video/video' },
  { label: '科目管理', bg: 'rgba(6,182,212,0.1)', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', route: '/subject/subject' },
  { label: '学员管理', bg: 'rgba(245,158,11,0.1)', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', route: '/student/student' },
  { label: '分组管理', bg: 'rgba(139,92,246,0.1)', icon: 'M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z', route: '/group/group' }
])

const skillOverview = ref([
  { name: '心肺复苏', value: 92, color: '#0D9488' },
  { name: '无菌操作', value: 87, color: '#06B6D4' },
  { name: '外科洗手', value: 83, color: '#F59E0B' },
  { name: '穿脱隔离衣', value: 78, color: '#8B5CF6' },
  { name: '静脉穿刺', value: 71, color: '#EC4899' }
])

function handleQuickAction(route) {
  if (route) {
    router.push(route)
  }
}
</script>
<style lang="scss" scoped>
$primary: #0D9488;
$primary-light: #14B8A6;
$bg-deep: #0C1222;
$bg-panel: #F8FAFC;
$text-heading: #0F172A;
$text-body: #475569;
$text-muted: #94A3B8;
$border-color: #E2E8F0;

.dashboard-container {
  padding: 20px;
  background: var(--med-bg-panel, #F8FAFC);
  min-height: calc(100vh - 110px);
}

/* ===== 欢迎横幅 ===== */
.welcome-banner {
  background: linear-gradient(135deg, var(--med-banner-from, #0F766E) 0%, var(--med-banner-via, #0D9488) 40%, var(--med-banner-to, #14B8A6) 100%);
  border-radius: 12px;
  padding: 32px 36px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    background: radial-gradient(circle at 80% 50%, var(--med-banner-glow, rgba(255,255,255,0.15)) 0%, transparent 70%);
    pointer-events: none;
  }

  .banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .banner-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--med-banner-title, #FFFFFF);
    margin: 0 0 8px;
    letter-spacing: 1px;
  }

  .banner-desc {
    font-size: 14px;
    color: var(--med-banner-desc, rgba(255,255,255,0.85));
    margin: 0;
    letter-spacing: 0.5px;
  }

  .banner-decoration {
    color: var(--med-banner-deco, rgba(255,255,255,0.5));
    width: 200px;
    flex-shrink: 0;

    svg {
      width: 100%;
    }

    .ecg-wave {
      stroke-dasharray: 800;
      stroke-dashoffset: 800;
      animation: ecgDash 4s linear infinite;
    }
  }
}

@keyframes ecgDash {
  to { stroke-dashoffset: 0; }
}

/* ===== 统计卡片 ===== */
.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  background: var(--el-bg-color, #fff);
  border: 1px solid var(--med-border, #E2E8F0);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
  cursor: default;

  &:hover {
    border-color: var(--card-accent);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }

  .stat-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--card-accent) 10%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .stat-icon {
      width: 24px;
      height: 24px;
      color: var(--card-accent);
    }
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: var(--med-text-heading, #0F172A);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 13px;
    color: var(--med-text-muted, #94A3B8);
    margin-top: 4px;
  }
}

/* ===== 面板通用 ===== */
.panel {
  background: var(--el-bg-color, #fff);
  border: 1px solid var(--med-border, #E2E8F0);
  border-radius: 10px;
  overflow: hidden;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--med-border, #E2E8F0);
  }

  .panel-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--med-text-heading, #0F172A);
    margin: 0;
  }

  .panel-badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    background: rgba($primary, 0.1);
    color: $primary;
    font-weight: 500;
  }

  .panel-body {
    padding: 16px 20px;
  }
}

/* ===== 评测动态列表 ===== */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--med-border, #E2E8F0);

  &:last-child {
    border-bottom: none;
  }
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.activity-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--med-text-heading, #0F172A);
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--med-text-muted, #94A3B8);
}

.activity-score {
  color: $primary;
  font-weight: 500;
}

.activity-time {
  margin-left: auto;
}

/* ===== 快捷操作 ===== */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    background: var(--med-bg-panel, #F8FAFC);
    transform: translateY(-2px);
  }

  .quick-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 22px;
      height: 22px;
      color: $primary;
    }
  }

  .quick-label {
    font-size: 13px;
    color: var(--med-text-body, #475569);
    font-weight: 500;
  }
}

/* ===== 能力概览 ===== */
.skill-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.skill-item {
  .skill-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .skill-name {
    font-size: 13px;
    color: var(--med-text-body, #475569);
  }

  .skill-val {
    font-size: 13px;
    font-weight: 600;
    color: var(--med-text-heading, #0F172A);
  }

  .skill-track {
    height: 6px;
    border-radius: 3px;
    background: var(--med-border, #E2E8F0);
    overflow: hidden;
  }

  .skill-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 1s ease;
  }
}

/* ===== 响应式 ===== */
@media screen and (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
  }

  .welcome-banner {
    padding: 20px;

    .banner-title {
      font-size: 18px;
    }

    .banner-decoration {
      display: none;
    }
  }

  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ===== 暗黑模式 ===== */
:global(html.dark) {
  .dashboard-container {
    background: var(--el-bg-color, #0F172A);
  }

  .welcome-banner {
    --med-banner-from: #0C1222;
    --med-banner-via: #111B2E;
    --med-banner-to: #0F1B2D;
    --med-banner-glow: rgba(20, 184, 166, 0.12);
    --med-banner-title: #F0FDFA;
    --med-banner-desc: #94A3B8;
    --med-banner-deco: #14B8A6;
  }

  .stat-card {
    background: var(--el-bg-color-overlay, #1E293B);
    border-color: #334155;
  }

  .panel {
    background: var(--el-bg-color-overlay, #1E293B);
    border-color: #334155;

    .panel-header {
      border-bottom-color: #334155;
    }
  }

  .activity-item {
    border-bottom-color: #334155;
  }

  .skill-track {
    background: #334155;
  }
}
</style>
