import { Job, Company, Notification, Resume } from './types';

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: '高级前端研发工程师 - 抖音电商',
    company: '字节跳动',
    companyLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYsKFR4vMz4V7ENYHs-eh-Wp4oH_Tjmn3LZ-ytoHHTlrRMZRMZB9wzg_Eqn98px4RFkdUIcmojkiRbi-xy9SBKkwnAEbhv7hOyTRBbpVleHX08oxyiF9BGKlHz2Ir3HuFQ9wWySFJuLDKgJucyPZcyNM7Lorr__ADnrC5Vrniu7n0eLaJGsBhD8ObXJuJ_NfPOIZTInlZOncFHtotL27-AQCYKID7cKYX6nM1N1ilq_GYgbdYUdJc5EVHnRBHgHjuRaLZhw-DX50w',
    salary: '30-60K·15薪',
    location: '北京 · 海淀区',
    experience: '3-5年',
    education: '本科及以上',
    tags: ['北京 · 海淀区', '3-5年', '本科及以上'],
    hrName: '林女士 · HRBP',
    hrAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6zbFE9Oqb91rBTiJ8dmrbaCofrcVZ9GyxmuW-hc5hiqj3NLYr592aSjfUJdGjdwgVBbis-6H3JjYZndOLs-7prHW5Vju_R8OmoWKfcH-34iY8lmmCMRkHdvhOGAbHPluXvS5uXHvYtRilU_9l4mJ0NBeJH2rjC-E1yzCYv7moEZ85ZdS4jCdUdcBSOZ8F77I3SRRi6Yfi8of4k85xPMiILD1eCqW5tu33k6485s6w02kLMf-D94W_7kxjG4scxP3OU_Zk_NKejqM',
    postDate: '今天发布',
    matchScore: 98,
    description: '负责大规模语言模型（LLM）的微调与优化，提升在特定垂直领域的表现。设计并实现高效的推荐算法架构。',
    requirements: ['计算机、数学相关专业', '熟练掌握React/Vue', '有大规模系统架构经验']
  },
  {
    id: '2',
    title: '算法工程师 - 机器学习方向',
    company: '字节跳动',
    companyLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYsKFR4vMz4V7ENYHs-eh-Wp4oH_Tjmn3LZ-ytoHHTlrRMZRMZB9wzg_Eqn98px4RFkdUIcmojkiRbi-xy9SBKkwnAEbhv7hOyTRBbpVleHX08oxyiF9BGKlHz2Ir3HuFQ9wWySFJuLDKgJucyPZcyNM7Lorr__ADnrC5Vrniu7n0eLaJGsBhD8ObXJuJ_NfPOIZTInlZOncFHtotL27-AQCYKID7cKYX6nM1N1ilq_GYgbdYUdJc5EVHnRBHgHjuRaLZhw-DX50w',
    salary: '40-70K·15薪',
    location: '上海 · 杨浦区',
    experience: '经验不限',
    education: '硕士及以上',
    tags: ['上海 · 杨浦区', '经验不限', '硕士及以上'],
    hrName: '张先生 · 技术总监',
    hrAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdOU1ETLV4slMwycPbVHuGkIveZxdjBvA4aFDoZp5jzPpuGVbtzrNN5ZmqnFcLaeLmUondEGZf3dorqjfwFKXZrPBuu9TN7VDXcfFttAeKdk-QLS2UqvcfNPr2FSNX_9WRrUCizqRkU1PMC2eEvBh9YWPzoMrwKAX0NvLdoyx9gnv5C3tMzfOWCJgQq2xsV0_tuFQm8KKXqg474L4c60OzxMGo-JB1IErex9pWObUOJZILgU1TlMQGfIpDdK9FD7QS1T9NNvGdkKg',
    postDate: '刚刚活跃',
    matchScore: 85
  },
  {
    id: '3',
    title: '高级产品经理 - 商业化',
    company: '字节跳动',
    companyLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYsKFR4vMz4V7ENYHs-eh-Wp4oH_Tjmn3LZ-ytoHHTlrRMZRMZB9wzg_Eqn98px4RFkdUIcmojkiRbi-xy9SBKkwnAEbhv7hOyTRBbpVleHX08oxyiF9BGKlHz2Ir3HuFQ9wWySFJuLDKgJucyPZcyNM7Lorr__ADnrC5Vrniu7n0eLaJGsBhD8ObXJuJ_NfPOIZTInlZOncFHtotL27-AQCYKID7cKYX6nM1N1ilq_GYgbdYUdJc5EVHnRBHgHjuRaLZhw-DX50w',
    salary: '35-55K·15薪',
    location: '深圳 · 南山区',
    experience: '5-10年',
    education: '本科及以上',
    tags: ['深圳 · 南山区', '5-10年', '本科及以上'],
    hrName: '陈女士 · 招聘专员',
    hrAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBGjVzxbTVwtYJC47Z-cgDxbKecLXxWGnhrBrE3d1M6CO2rFaXnUUhnTsBy95HelQeHWu83ECnRv9WkDRHp0Mn702Otalp4dicQLt7Dz4jfQypILv8sP0K8wiwBDyIVrsqXL3KLkY39wWRSA46LuhU1GQHPOG0VGkd-LL02YJvlStxM607-b-w61j-zBQ8NY_h3M8x_UuhdXcijoGvGRApQiqvm808w5Ilpj547YR51fTHLFYjBj8PbxuVDcy5wdpF049P4LpZvZE',
    postDate: '3天前发布',
    matchScore: 72
  }
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'bytedance',
    name: '字节跳动',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYsKFR4vMz4V7ENYHs-eh-Wp4oH_Tjmn3LZ-ytoHHTlrRMZRMZB9wzg_Eqn98px4RFkdUIcmojkiRbi-xy9SBKkwnAEbhv7hOyTRBbpVleHX08oxyiF9BGKlHz2Ir3HuFQ9wWySFJuLDKgJucyPZcyNM7Lorr__ADnrC5Vrniu7n0eLaJGsBhD8ObXJuJ_NfPOIZTInlZOncFHtotL27-AQCYKID7cKYX6nM1N1ilq_GYgbdYUdJc5EVHnRBHgHjuRaLZhw-DX50w',
    industry: '互联网',
    stage: 'D轮及以上',
    size: '10000人以上',
    founded: '2012年',
    headquarters: '中国 · 北京',
    intro: '北京字节跳动科技有限公司，成立于2012年3月，是最早将人工智能应用于移动互联网场景的科技企业之一...',
    openPositions: 99
  },
  {
    id: 'xingyao',
    name: '星耀科技',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4sOhRSEnIhOK34pjnAeUaPmSIzcbBlNtxOH5msYMijz5TVkkzyhAWlieOkKQMV2DEzC5mA05usVc5o2hy9T0vi4DlyoejBUCf3COIL9cK8vtLf7Eh871zUf4YWrRDFjLcZqI2rUrIAFwAghtBk5RvA8hGRj9HiSCxL_JJ1Y7ZxlQ2dp874dpt91PusfZQ-GLB1ChrQO9HvhaFS4_UWyZK87mLT2C-uGEVBwuXNHhxcVxjUwN1QV9b-HAwnpYSMBvQlwhK7cYAPUs',
    industry: '人工智能',
    stage: 'C轮',
    size: '10000+人',
    founded: '2015年',
    headquarters: '北京',
    intro: '领先的人工智能企业...',
    openPositions: 342
  },
  {
    id: 'rongzhi',
    name: '融智集团',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVoRvrqBrpJkt7y31TgO-UhpvRlGJH0nYCvOuID1QpqIEcK3EE4SCIUCPS3r-bgI6URPZkT_ualOWJlSwz7fQ0bf0L0sxooiw-N1YSf1qmqMbs6igrpIEsVMXaoHOII1zHzYsT4Xs_nUG-KPINOd4CdBEuexTsVY9ztqNxJTESiyVg35qLkwsRvs3neiF-dWUOCLwsRvNZGXrThX1iSQWwVH1Fn2M2IknmgZu1bWkq-fvOnopAQsGNTIokxcWzIhJwt76LvFTSt58',
    industry: '金融科技',
    stage: 'B轮',
    size: '500-999人',
    founded: '2018年',
    headquarters: '上海',
    intro: '专注金融科技创新...',
    openPositions: 128
  },
  {
    id: 'yunduan',
    name: '云端动力网络科技',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmvZT644ecMvF9RJqIMwfIrzwIuuis3geiX9rtexDe2VUM2XnetBwDm6QHVl4UMfaOyaw9LYO0VwgiiAmYd5si-qu9QMn_E5eh1_apA9X8SiRQlGGfm7YyNN9nh2b-J1IoxiFatklTgszIsE_bbB7ax0pDrrhaH2qEW2RD2S1rJ_VjWwOLn_R82_q5BI2BBO_JLWg2Dwa4taBKAQcvFaDTM460kaP_gOPJQNtx5vFCk8642XNrksTBTpHtkfnIkHK4rErTV6TQNzo',
    industry: '互联网/企业服务',
    stage: 'D轮及以上',
    size: '1000-4999人',
    founded: '2014年',
    headquarters: '深圳',
    intro: '致力于为全球企业提供高效、安全的云计算基础设施服务...',
    openPositions: 45
  },
  {
    id: 'lvneng',
    name: '绿能新纪元',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2YRWYyDl-QB3wx-YUkxw4GQYONWFx5w-7VVz7og1GCanJbvnup_spiuckKuJacBAy4SAJ_5Zb4nbOQPMGgVTo6RzkEJM3bDGQr5f4vKGPdRMx3sh6YGcVYed5jfWJWqIKu6Cyih4ai4tAbASg0H1F8wD1TRxnvH4VB9zjSjT1pUJLQWSkzzo8sb5mY1uk2o390K3gE1l3kR8xHifHnuMfXVRwfZjfrS3-72U8L7XIEMIyJ5fCKTWhswOxoXJq3EcbvsX0qUCSy4E',
    industry: '新能源',
    stage: '已上市',
    size: '500-999人',
    founded: '2016年',
    headquarters: '上海',
    intro: '国内领先的清洁能源解决方案提供商...',
    openPositions: 89
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: '简历解析成功',
    content: '您的简历《高级前端工程师-张三.pdf》已成功解析，系统已自动提取您的技能标签和工作经历。',
    time: '刚刚',
    type: 'system',
    isRead: false,
    icon: 'description'
  },
  {
    id: '2',
    title: '面试邀请：字节跳动',
    content: '恭喜！字节跳动 HR 已向您发起【资深UI设计师】的视频面试邀请，请尽快确认时间。',
    time: '1小时前',
    type: 'feedback',
    isRead: false,
    icon: 'work'
  },
  {
    id: '3',
    title: 'HR 查看了您的简历',
    content: '腾讯科技的 HR 查看了您投递的【产品经理】岗位简历，匹配度高达92%。',
    time: '昨天 14:30',
    type: 'feedback',
    isRead: true,
    icon: 'visibility'
  }
];

export const MOCK_RESUMES: Resume[] = [
  {
    id: '1',
    name: '产品经理_张三_2024.pdf',
    date: '2024-05-20 14:30',
    size: '2.4 MB',
    status: 'parsed',
    isDefault: true
  },
  {
    id: '2',
    name: 'Senior_PM_Resume_En_v2.pdf',
    date: '2024-04-15 09:12',
    size: '1.8 MB',
    status: 'parsed',
    isDefault: false
  },
  {
    id: '3',
    name: '李四_项目经理_2024最新版.docx',
    date: '刚刚',
    size: '3.1 MB',
    status: 'parsing',
    isDefault: false
  }
];

export const MOCK_APPLICATIONS: Job[] = [
  {
    id: 'app1',
    title: '高级算法工程师 (AI方向)',
    company: '字节跳动 · 核心技术部',
    companyLogo: '',
    salary: '45k-65k',
    location: '北京',
    experience: '',
    education: '',
    tags: [],
    hrName: '',
    hrAvatar: '',
    postDate: '',
    matchScore: 95,
    status: 'interview',
    applyDate: '2023-10-24 14:30'
  },
  {
    id: 'app2',
    title: '资深 UI/UX 设计师',
    company: '腾讯 · PCG事业群',
    companyLogo: '',
    salary: '30k-50k',
    location: '深圳',
    experience: '',
    education: '',
    tags: [],
    hrName: '',
    hrAvatar: '',
    postDate: '',
    matchScore: 88,
    status: 'viewed',
    applyDate: '2023-10-23 09:15'
  }
];
