'use client';

import React from 'react';
import { ArrowRight, BarChart3, Building2, CheckCircle2, Clock3, SearchCheck, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import MockUserShell from '@/app/(user)/_mock/components/MockUserShell';

const trustMetrics = [
  { label: '活跃企业', value: '10,000+' },
  { label: '活跃职位', value: '128,000+' },
  { label: '平均匹配时长', value: '2.3天' },
  { label: '投递响应率', value: '92.4%' },
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

            <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 md:grid-cols-2">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-primary"
                >
                  <Sparkles size={14} />
                  <span className="text-[12px] font-semibold tracking-wide">AI 图谱驱动的人岗精准连接</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="mb-5 text-4xl font-black leading-tight tracking-tight text-on-surface md:text-6xl"
                >
                  企业更快招到合适的人，
                  <br />
                  人才更快找到匹配的岗
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8 max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg"
                >
                  以能力图谱与语义匹配为核心，统一招聘效率、候选质量与投递体验，帮助企业和人才在同一条路径上高效完成匹配。
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex w-full flex-col gap-3 sm:flex-row"
                >
                  <Link href="/register?role=enterprise" className={`${primaryBtnCls} bg-primary text-white shadow-[0_10px_28px_rgba(0,62,199,0.28)] hover:bg-primary/90`}>
                    免费发布职位
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/jobs" className={`${primaryBtnCls} bg-surface-container text-on-surface border border-surface-mid hover:bg-surface-low`}>
                    立即找工作
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-outline">
                  <span className="rounded-full bg-surface-low px-3 py-1">面向招聘方</span>
                  <span className="rounded-full bg-surface-low px-3 py-1">面向求职者</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden md:block"
              >
                <div className="rounded-[32px] border border-surface-mid bg-[linear-gradient(150deg,#081730,#0d2348_48%,#0c2f63)] p-7 text-white shadow-[0_32px_64px_rgba(3,12,29,0.35)]">
                  <div className="mb-7 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">匹配执行看板</p>
                      <p className="mt-1 text-3xl font-black">98.7</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                      <SearchCheck size={20} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {trustMetrics.map((metric) => (
                      <div key={metric.label} className="flex items-center justify-between rounded-xl border border-white/20 bg-white/10 px-4 py-3">
                        <span className="text-sm text-white/80">{metric.label}</span>
                        <span className="text-lg font-black">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
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
                    <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(7,17,36,0.58),rgba(3,11,26,0.88))]" />
                    <div className="relative z-10">
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/70">Step {idx + 1}</p>
                      <h3 className="text-xl font-black text-white">{step.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/85">{step.desc}</p>
                    </div>
                    <div className="relative z-10 mt-4 flex items-start gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                      <span>{step.result}</span>
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
                    <img src={step.image} alt={`${step.title}背景图`} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(18,16,42,0.56),rgba(11,9,30,0.88))]" />
                    <div className="relative z-10">
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/70">Step {idx + 1}</p>
                      <h3 className="text-xl font-black text-white">{step.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/85">{step.desc}</p>
                    </div>
                    <div className="relative z-10 mt-4 flex items-start gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                      <span>{step.result}</span>
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
