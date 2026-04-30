export const mockJobs = [
  {
    id: "1",
    title: "高级前端开发工程师",
    location: "北京",
    type: "全职",
    department: "技术部",
    status: "招聘中",
    salary: "35k - 50k · 15薪",
    experience: "3-5年",
    education: "本科及以上",
    candidates: 42,
    newApplications: 12,
    views: 1248,
    tags: ["React", "Vue", "TypeScript", "Node.js", "前端架构"],
    description: `1. 负责公司核心业务系统的Web前端开发；\n2. 参与前端架构设计，提升工程化、组件化水平；\n3. 优化前端性能，提升用户体验。`,
    requirements: `1. 计算机相关专业本科及以上学历；\n2. 熟练掌握React/Vue生态，有复杂系统开发经验；\n3. 熟悉前端构建工具，有性能优化经验。`
  },
  {
    id: "2",
    title: "产品经理 (B端)",
    location: "上海",
    type: "全职",
    department: "产品部",
    status: "招聘中",
    salary: "25-40k",
    experience: "3-5年",
    education: "本科",
    candidates: 28,
    newApplications: 5,
    views: 890,
    tags: ["B端产品", "SaaS", "需求分析", "原型设计"],
    description: `1. 负责核心SaaS产品的规划与设计；\n2. 深入理解业务需求，完成产品方案输出。`,
    requirements: `1. 3年以上B端产品经验；\n2. 极强的逻辑思维能力。`
  },
  {
    id: "3",
    title: "UI/UX 设计师",
    location: "深圳",
    type: "全职",
    department: "设计部",
    status: "暂停",
    salary: "20-35k",
    experience: "3-5年",
    education: "本科",
    candidates: 15,
    newApplications: 0,
    views: 560,
    tags: ["UI", "UX", "Web设计", "APP设计"],
    description: `1. 负责各产品线UI界面交互设计；\n2. 制定设计规范并推动实施。`,
    requirements: `1. 美术设计类相关专业；\n2. 熟练使用Figma、Sketch等设计工具。`
  },
  {
    id: "4",
    title: "资深前端工程师",
    location: "上海",
    type: "全职",
    department: "研发中心",
    status: "已关闭",
    salary: "30-50k",
    experience: "5-10年",
    education: "本科及以上",
    candidates: 142,
    newApplications: 0,
    views: 8420,
    highMatch: 28,
    tags: [],
    description: "",
    requirements: ""
  }
];

export const mockCandidates = [
  {
    id: "c1",
    name: "张伟 (David)",
    title: "前端技术专家 · 腾讯科技",
    matchScore: 98,
    matchReasons: [
      "5年+ React/Vue 大型复杂项目经验",
      "曾主导过微前端架构落地，性能优化成果显著",
      "有带队经验，符合资深岗位要求"
    ],
    skills: ["React", "TypeScript", "Webpack", "+3"],
    education: "浙江大学 · 计算机硕士",
    experience: "6年经验",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtWlBO6Uv2FRK-e8NuVww7V7yB5iXqa-heIX2nrrONu-NW8lAv9bofzOC2gFbznyaGRdlp28RulFq2x9KBRTG_5SDUYyaBmvymOgDlvi08LDnF_fEHrEyJJRI3Ve2Hu_iLiiMgmhwOwsZSvi-xgdUPd5zyFGPf8C1l_T1t6jWLgMiHMOcgG86I200QqKqFi9ocuLpRlk7DwJgBeIy9EEoU51Aik5EQRGiXqKIwnShvPUUTzla38b-3rVMRjEOq9Td_0oPtAb07vzZO"
  },
  {
    id: "c2",
    name: "李娜 (Anna)",
    title: "高级前端开发 · 字节跳动",
    matchScore: 85,
    matchReasonText: "扎实的 React 基础，丰富的 B 端组件库开发经验。薪资预期非常吻合。",
    skills: ["React", "Vue.js", "Node.js"],
    education: "上海交通大学 · 本科",
    experience: "4年经验",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8neo_lpAJJy5g_E5TzJmFlloFxUCie9HvJqUsCx7pg5li3hDd-g8WnvGovSjWxVRW2rG_KX8Cta1L1rIO8G7A5BmwbRiDu4cCbmYaIJFCaP0qR7mXkAT-yxpbwOaLdH9xR94PBqTv8btGaqGG2Sxsc9W9vNyvc1Y3MJiRvQQlbQf5kEPvQx-cHXMg0atTLfZCY1drEL94PoIQu3WFXj_D1g0e2ckKXJKR3Dsk8BZl7xOhuAlvYt_mSTyVaVgMkxWPnXcXUvZ9jHvM"
  },
  {
    id: "c3",
    name: "林晓云",
    title: "高级前端工程师 · 5年经验",
    company: "字节跳动",
    matchScore: 92,
    skillMatch: 95,
    experienceMatch: 88,
    tags: ["本科", "北京大学", "28岁", "随时到岗"],
    coreSkills: [
      { name: "React", level: "精通", emphasis: "text-primary" },
      { name: "Vue.js", level: "精通", emphasis: "text-primary" },
      { name: "TypeScript", level: "熟练", emphasis: "text-primary" },
      { name: "Node.js", level: "良好", emphasis: "text-secondary" },
      { name: "Webpack", level: "熟练", emphasis: "text-secondary" }
    ],
    workHistory: [
      {
        title: "高级前端开发工程师",
        company: "字节跳动",
        dates: "2021.06 - 至今",
        bullets: [
          "主导重构核心中后台管理系统，将页面加载时间缩短40%。",
          "带领3人小组完成微前端架构升级，提升团队多项目协同效率。",
          "编写并维护超过50个公共业务组件库。"
        ],
        active: true
      },
      {
        title: "前端开发工程师",
        company: "美团",
        dates: "2018.07 - 2021.05",
        bullets: [
          "参与美团外卖商家端小程序开发，实现日均百万级访问。",
          "优化长列表渲染性能，解决低端机型卡顿问题。"
        ],
        active: false
      }
    ],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwxmNoPIf6KFY9QxJEokDMs0CV2v3Q-nLmnfnl1KOD5-BKEgWNma-v5qM3EPb2cECDENXQ0mZsNaLoSk55wOo3goXm2F4m5bAG9cBegYrmukDvQazJsFxSFgap2-Muy5XT38Qv6DP-nf5cQOnE-ofStrvqYkA706M6JyED1Q6fvuaUKKwepSaTn_FPqRKL5ntoCkZczqQ3SyjeySnM23cwZNFU1R0tB6dQqYoizTkxlnxRPc6L-AodAGCWQhjMhyitMAlFVp8jvmxd"
  }
];

export const mockNotifications = [
  {
    id: "n1",
    type: "recommendation",
    title: "新候选人推荐匹配",
    message: "系统为您匹配了 3 位符合「资深前端工程师」要求的候选人，包含前大厂背景...",
    time: "10分钟前",
    unread: true,
    icon: "person_add",
    iconBg: "bg-primary-fixed",
    iconColor: "text-on-primary-fixed"
  },
  {
    id: "n2",
    type: "application",
    title: "简历投递更新",
    message: "候选人 张伟 已接受您的面试邀请，面试时间定于周三下午 2:00。",
    time: "1小时前",
    unread: true,
    icon: "work",
    iconBg: "bg-secondary-fixed",
    iconColor: "text-on-secondary-fixed"
  },
  {
    id: "n3",
    type: "system",
    title: "系统维护通知",
    message: "为提供更好的服务，平台将于本周六凌晨 2:00-4:00 进行例行升级维护，期间部分功能可能受限。",
    time: "昨天 18:30",
    unread: false,
    icon: "campaign",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface-variant"
  },
  {
    id: "n4",
    type: "team",
    title: "李明 (HR 总监)",
    message: "关于研发部新岗位的 HC 审批已经通过，请尽快开启招聘流程并同步 JD。",
    time: "星期一 09:15",
    unread: false,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBreudHdIqQYCnurb-EuymCSXjEAbLzb1JfLnIwyYC7kf8IETzEEXTFaBXseiwzGtnbi5ahQ0vomq6_m_cW8JG8Jf8VPE6fEE_Xo8z9Y2M6Mz_b5gkTg88HOs96YY7j88xj415Mt-XxjM_sJjuDPA5Z0x5z8TkdjcNU5THB-jcuFemK6rJkMCv5yYq13McODz8T3-FPD_OGExcXqpPc5hhRPbq9W2VHMT_DHDD7AAUxQdGRU2B3xErG4pAGHJ7G6Jgkgi3msUSNsSss"
  }
];
