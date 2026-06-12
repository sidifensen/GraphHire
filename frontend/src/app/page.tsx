'use client';

import React from 'react';
import { BarChart3, Building2, CheckCircle2, Clock3, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import Type1Button from '@/components/home/Type1Button';
import HeroJobButton from '@/components/home/HeroJobButton';
import MockUserShell from '@/app/(user)/_mock/components/MockUserShell';

const trustMetrics = [
  { label: '活跃企业', value: '10,000+' },
  { label: '活跃职位', value: '128,000+' },
  { label: '平均匹配时长', value: '2.3天' },
  { label: '投递响应率', value: '92.4%' },
];

const logoCompanies = [
  { name: 'Google', logo: 'https://cdn.simpleicons.org/google' },
  { name: 'Meta', logo: 'https://cdn.simpleicons.org/meta' },
  { name: 'Netflix', logo: 'https://cdn.simpleicons.org/netflix' },
  { name: 'Spotify', logo: 'https://cdn.simpleicons.org/spotify' },
  { name: 'Alibaba.com', logo: 'https://cdn.simpleicons.org/alibabadotcom' },
  { name: 'ByteDance', logo: 'https://cdn.simpleicons.org/bytedance' },
  { name: 'HUAWEI', logo: 'https://cdn.simpleicons.org/huawei' },
  { name: 'Tesla', logo: 'https://cdn.simpleicons.org/tesla' },
];

const enterpriseFlow = [
  {
    title: '发布职位',
    desc: '结构化 JD 一键发布，自动同步关键画像字段。',
    result: '平均发布耗时缩短 63%',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'AI 推荐候选人',
    desc: '基于能力图谱进行语义匹配，优先输出高契合候选池。',
    result: '首批候选准确率提升 41%',
    image:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '面试协同转化',
    desc: '标准化流程看板追踪每个环节，减少沟通与等待损耗。',
    result: '到岗周期平均缩短 2.1 天',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
  },
];

const candidateFlow = [
  {
    title: '上传简历',
    desc: '自动解析工作经历、技能结构和目标岗位方向。',
    result: '建立可检索能力档案仅需 1 分钟',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '图谱诊断',
    desc: '识别优势技能与缺口能力，给出可执行补强建议。',
    result: '岗位匹配命中率提升 35%',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '精准岗位推荐',
    desc: '按城市、薪资与成长路径推送更高相关岗位。',
    result: '无效投递比例下降 48%',
    image:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
  },
];

const enterpriseMatrix = [
  '候选筛选效率看板',
  '多角色面试协同',
  '渠道曝光与反馈追踪',
  '招聘漏斗复盘分析',
];

const candidateMatrix = [
  '岗位匹配优先级排序',
  '能力缺口智能建议',
  '投递进度实时回传',
  '成长路径连续推荐',
];

const primaryBtnCls =
  'inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35';

const cardCls = 'rounded-2xl border border-surface-mid bg-surface-lowest p-6 shadow-sm';
const flowCardOverlayCls = 'absolute inset-0 bg-[linear-gradient(160deg,rgba(7,17,36,0.46),rgba(3,11,26,0.72))]';
const candidateFlowOverlayCls = 'absolute inset-0 bg-[linear-gradient(160deg,rgba(7,17,36,0.34),rgba(3,11,26,0.58))]';

const heroFlipImage =
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1600&q=80';

const heroSiteIntro = [
  'GraphHire 图谱智聘是一个基于能力图谱与语义匹配的双侧招聘平台。',
  '它帮助企业更快找到合适候选人，也帮助求职者更快命中匹配岗位。',
];
export default function HomePage() {
  return (
    <MockUserShell>
      <div className="flex min-h-screen flex-col">
        <header className="md:hidden flex justify-center items-center h-16 px-5 w-full bg-surface-lowest/90 backdrop-blur-md sticky top-0 z-40 border-b border-surface-mid shadow-[0_4px_20px_rgba(0,82,255,0.05)]">
          <span className="text-xl font-black text-primary tracking-tighter">GraphHire</span>
        </header>

        <main className="w-full">
          <section className="relative overflow-hidden bg-surface-lowest px-5 py-20 md:px-margin-desktop" aria-label="首屏双入口">
            <div className="absolute inset-0">
              <div className="absolute -top-24 right-[-10%] h-[460px] w-[460px] rounded-full bg-primary/12 blur-3xl" />
              <div className="absolute bottom-[-180px] left-[-60px] h-[340px] w-[340px] rounded-full bg-tertiary/10 blur-3xl" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl">
              {/* 业务意图：首屏右侧通过翻转卡补足视觉与介绍信息，避免仅文字布局导致的信息承载不足。 */}
              <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,390px)] lg:gap-12">
                <div className="max-w-4xl text-center md:text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-primary"
                  >
                    <Sparkles size={14} />
                    <span className="text-[12px] font-semibold tracking-wide">AI智能匹配招聘</span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mb-6 text-3xl font-black leading-[1.18] tracking-tight text-on-surface md:text-4xl lg:text-5xl"
                  >
                    GraphHire 图谱智聘
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 max-w-3xl text-lg font-bold leading-[1.6] text-on-surface md:text-xl"
                  >
                    企业更快招到合适的人，人才更快找到匹配的岗
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-10 mx-auto max-w-2xl text-sm leading-[1.9] text-on-surface-variant md:mx-0 md:text-base"
                  >
                    基于能力图谱与语义匹配，统一提升招聘效率、候选质量与投递体验。
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-center md:w-auto md:items-start"
                  >
                    <Type1Button href="/register?role=enterprise" text="免费发布职位" />
                    <HeroJobButton href="/jobs" text="开始找工作" />
                  </motion.div>

                  <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs font-bold text-outline md:justify-start">
                    <span className="rounded-full bg-surface-low px-3 py-1">面向招聘方</span>
                    <span className="rounded-full bg-surface-low px-3 py-1">面向求职者</span>
                  </div>
                </div>

                <HeroFlipCard />
              </div>
            </div>
          </section>

          <section className="border-y border-surface-mid bg-surface-background px-5 py-10" aria-label="信任背书">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 md:grid-cols-4">
              {trustMetrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-surface-mid bg-surface-lowest p-4 text-center shadow-sm">
                  <div className="text-3xl font-black text-primary">{metric.value}</div>
                  <div className="mt-1 text-sm font-bold text-on-surface-variant">{metric.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface-lowest px-5 py-16 md:px-margin-desktop" aria-label="企业招聘流程">
            <div className="mx-auto w-full max-w-7xl">
              <div className="mb-8 flex items-center gap-3">
                <Building2 className="text-primary" size={22} />
                <h2 className="text-2xl font-black text-on-surface md:text-3xl">企业招聘流程</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {enterpriseFlow.map((step, idx) => (
                  <article key={step.title} className={`${cardCls} relative min-h-[320px] overflow-hidden border-white/10 text-white md:min-h-[360px]`}>
                    <img src={step.image} alt={`${step.title}背景图`} className="absolute inset-0 h-full w-full object-cover" />
                    <div className={flowCardOverlayCls} />
                    <div className="relative z-10 flex h-full flex-col justify-end">
                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/70">Step {idx + 1}</p>
                        <h3 className="text-xl font-black text-white">{step.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-white/85">{step.desc}</p>
                      </div>
                      <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                        <span>{step.result}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-surface-background px-5 py-16 md:px-margin-desktop" aria-label="求职者流程">
            <div className="mx-auto w-full max-w-7xl">
              <div className="mb-8 flex items-center gap-3">
                <Users className="text-tertiary" size={22} />
                <h2 className="text-2xl font-black text-on-surface md:text-3xl">求职者流程</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {candidateFlow.map((step, idx) => (
                  <article key={step.title} className={`${cardCls} relative min-h-[320px] overflow-hidden border-white/10 text-white md:min-h-[360px]`}>
                    <img src={step.image} alt={`${step.title}背景图`} className="absolute inset-0 h-full w-full object-cover contrast-125" />
                    <div className={candidateFlowOverlayCls} />
                    <div className="relative z-10 flex h-full flex-col justify-end">
                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/70">Step {idx + 1}</p>
                        <h3 className="text-xl font-black text-white">{step.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-white/85">{step.desc}</p>
                      </div>
                      <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                        <span>{step.result}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-surface-lowest px-5 py-16 md:px-margin-desktop" aria-label="能力矩阵对照">
            <div className="mx-auto w-full max-w-7xl">
              <div className="mb-8 flex items-center gap-3">
                <BarChart3 className="text-primary" size={22} />
                <h2 className="text-2xl font-black text-on-surface md:text-3xl">企业能力 vs 求职能力</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <article className={`${cardCls} border-primary/20`}>
                  <h3 className="text-lg font-black text-on-surface">企业侧能力</h3>
                  <ul className="mt-4 space-y-3">
                    {enterpriseMatrix.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <ShieldCheck size={16} className="text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
                <article className={`${cardCls} border-tertiary/25`}>
                  <h3 className="text-lg font-black text-on-surface">求职侧能力</h3>
                  <ul className="mt-4 space-y-3">
                    {candidateMatrix.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <ShieldCheck size={16} className="text-tertiary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>
          </section>

          <section className="bg-surface-background px-5 py-16 md:px-margin-desktop" aria-label="双侧案例">
            <div className="mx-auto w-full max-w-7xl">
              <h2 className="mb-8 text-2xl font-black text-on-surface md:text-3xl">双侧案例</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <article className={cardCls}>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-outline">企业案例</p>
                  <h3 className="mt-2 text-xl font-black text-on-surface">某智能制造集团 45 天完成关键岗位补齐</h3>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                    通过图谱筛选与流程协同，候选首轮匹配准确率提升至 89%，核心岗位平均到岗周期缩短 2.4 天。
                  </p>
                </article>
                <article className={cardCls}>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-outline">求职案例</p>
                  <h3 className="mt-2 text-xl font-black text-on-surface">产品经理候选人 2 周内获得 3 轮面试机会</h3>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                    基于能力图谱补全建议优化简历后，投递命中率提升 38%，并持续收到更高相关度岗位推荐。
                  </p>
                </article>
              </div>
            </div>
          </section>

          <section className="bg-surface-lowest px-5 pb-8 pt-6 md:px-margin-desktop md:pt-10" aria-label="谁在使用">
            <div className="mx-auto w-full max-w-7xl rounded-2xl border border-surface-mid bg-surface-background/70 px-5 py-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className="font-black uppercase tracking-[0.16em] text-outline">谁在使用</span>
                <span className="text-on-surface-variant">已有 10,000+ 企业团队使用 GraphHire 完成招聘协同</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
                {logoCompanies.map((item) => (
                  <div
                    key={item.name}
                    className="flex h-14 items-center gap-2.5 rounded-lg border border-surface-mid bg-surface-low px-3 text-left text-sm font-bold text-on-surface-variant"
                  >
                    <img src={item.logo} alt={`${item.name} logo`} className="h-7 w-7 shrink-0 object-contain" />
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            className="relative overflow-hidden px-5 py-20 text-center md:px-margin-desktop"
            aria-label="最终行动"
          >
            <div className="absolute inset-0 bg-[linear-gradient(132deg,#05132e,#0b2b5b_45%,#103b79)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_78%_80%,rgba(59,130,246,0.24),transparent_40%)]" />
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10 mx-auto w-full max-w-3xl text-white">
              <h2 className="text-3xl font-black md:text-4xl">现在开始，让匹配更快发生</h2>
              <p className="mt-4 text-base text-white/80 md:text-lg">3 分钟完成初始设置，立即进入企业招聘或求职匹配流程。</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/register?role=enterprise" className={`${primaryBtnCls} bg-white text-[#0a2a58] hover:bg-white/90`}>
                  免费发布职位
                </Link>
                <Link href="/jobs" className={`${primaryBtnCls} border border-white/45 bg-white/10 text-white hover:bg-white/20`}>
                  立即找工作
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/75">
                <Clock3 size={15} />
                <span>本周新增 6,240 个岗位，新增 182 家企业入驻</span>
              </div>
            </motion.div>
          </section>
        </main>

        <div className="h-24 md:hidden" />
      </div>
    </MockUserShell>
  );
}

function HeroFlipCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="mx-auto w-full max-w-[390px]"
    >
      {/* 业务意图：按 tricky-cheetah-78 的交互还原，首面为图片，hover 后旋入介绍内容。 */}
      <article
        data-testid="hero-flip-card"
        className="group relative h-[260px] w-full overflow-hidden rounded-2xl bg-white [backface-visibility:hidden] [contain:paint] transform-gpu transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:[transform:rotate(-4deg)_scale(1.04)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.24)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(-45deg,#f89b29_0%,#ff0f7b_100%)] opacity-100 transition-opacity duration-[520ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:opacity-0" />
        <img
          src={heroFlipImage}
          alt="GraphHire 平台预览图"
          className="h-full w-full object-cover transform-gpu [backface-visibility:hidden] transition-[transform,opacity] duration-[600ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:opacity-0 group-hover:[transform:scale(0.03)_rotate(-45deg)]"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(5,15,35,0.12),rgba(5,15,35,0.42))] transition-opacity duration-[520ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:opacity-0" />
        <div className="absolute left-1/2 top-1/2 box-border h-[calc(100%+2px)] w-[calc(100%+2px)] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-[15px] bg-white p-5 opacity-0 transform-gpu [backface-visibility:hidden] [will-change:transform,opacity] transition-[transform,opacity] duration-[600ms] [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:rotate-0 group-hover:opacity-100">
          <p className="m-0 text-xl font-black text-[#202020]">GraphHire 是什么？</p>
          <p className="mt-2 text-sm leading-6 text-[#595959]">{heroSiteIntro[0]}</p>
          <p className="mt-2 text-sm leading-6 text-[#595959]">{heroSiteIntro[1]}</p>
          <p className="mt-2 text-sm leading-6 text-[#595959]">
            企业端与求职端共享同一能力图谱，让岗位发布、候选筛选与投递反馈在一个流程里闭环。
          </p>
        </div>
      </article>
    </motion.div>
  );
}

