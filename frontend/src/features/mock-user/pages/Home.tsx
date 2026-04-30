import React from 'react';
import { Share2, BarChart3, Users, Database, Target, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Top Header */}
      <header className="md:hidden flex justify-center items-center h-16 px-5 w-full bg-surface-lowest/90 backdrop-blur-md sticky top-0 z-40 border-b border-surface-mid shadow-[0_4px_20px_rgba(0,82,255,0.05)]">
        <span className="text-xl font-black text-primary tracking-tighter">GraphHire</span>
      </header>

      <main className="w-full">
        {/* 1. Hero Section */}
        <section className="relative w-full min-h-[600px] flex flex-col justify-center items-start overflow-hidden bg-surface-lowest h-auto py-24 px-5 md:px-margin-desktop">
          {/* Background Decoration */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl opacity-60 translate-x-1/4 -translate-y-1/4"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20"
              >
                <Share2 size={14} />
                <span className="text-[12px] font-semibold tracking-wide">GraphHire | 图谱智聘</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-black text-on-surface mb-6 leading-tight tracking-tight"
              >
                连接卓越，<br/>
                <span className="text-primary">图谱智聘领航未来</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-on-surface-variant mb-10 max-w-md leading-relaxed font-medium"
              >
                基于数据驱动与AI深度学习，重塑招聘体验。精准描绘人才图谱，让企业与顶尖人才实现无缝对接。
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <Link 
                  to="/jobs" 
                  className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-bold rounded-xl shadow-[0_8px_24px_rgba(0,62,199,0.25)] hover:shadow-[0_12px_32px_rgba(0,62,199,0.35)] transition-all flex items-center justify-center text-center"
                >
                  立即开启智能招聘
                </Link>
                <button className="w-full sm:w-auto px-10 py-4 bg-transparent border border-outline-variant text-on-surface font-bold rounded-xl hover:bg-surface-container transition-colors text-center">
                  了解更多
                </button>
              </motion.div>
            </div>

            {/* Desktop Hero Illustration/Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden md:block relative h-[520px]"
            >
              <div className="absolute -inset-4 rounded-[44px] bg-gradient-to-br from-primary/20 via-[#1d4ed8]/10 to-[#dbeafe] blur-2xl opacity-70"></div>
              <div className="relative h-full overflow-hidden rounded-[40px] border border-white/50 shadow-[0_28px_72px_rgba(15,23,42,0.28)]">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="GraphHire Platform"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020]/85 via-[#0b1020]/38 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(255,255,255,0.26),transparent_34%)]"></div>

                <div className="absolute left-6 top-6 z-20 rounded-3xl border border-white/35 bg-white/14 px-5 py-4 text-white backdrop-blur-xl shadow-[0_12px_35px_rgba(2,6,23,0.35)]">
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/25">
                    <Target size={18} />
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">AI匹配指数</div>
                  <div className="mt-1 text-3xl font-black tracking-tight">98.7</div>
                  <div className="text-xs font-semibold text-white/80">高潜候选人识别稳定提升</div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-20 rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur-xl">
                  <div className="grid grid-cols-3 gap-3 text-white">
                    <div className="rounded-xl border border-white/15 bg-black/10 p-3">
                      <div className="text-[11px] font-semibold text-white/75">企业活跃席位</div>
                      <div className="mt-1 text-xl font-black">12,480</div>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-black/10 p-3">
                      <div className="text-[11px] font-semibold text-white/75">候选人响应率</div>
                      <div className="mt-1 text-xl font-black">92.4%</div>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-black/10 p-3">
                      <div className="text-[11px] font-semibold text-white/75">7日成功匹配</div>
                      <div className="mt-1 text-xl font-black">3,286</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. Secondary Visual (Bento Grid) */}
        <section className="py-12 px-5 bg-surface-background">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto px-margin-mobile">
            <div className="rounded-[32px] overflow-hidden shadow-lg bg-surface-lowest aspect-[4/3] md:aspect-auto relative group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSscNpoWWn3-hk1OF_9Bkp1z37yLejBqoI-Hc4nRPjviTBYbNjLU5LYrjIUMr71VeAtpP6s2lMRMP1BZTXr422BshLnuC2JspQjDALbNrC0ATXZm2mdcaVVju9y7fi1HIt-0dHn2bZDNwwADMzeLzNybvyB06iMVIsKnWarP-ZcOfv2sGALkYJBqBDuUng05MGuNEJDQvSMn7EzKGLEjfbNNkyLHUABLPvtUx1G3cg-GgKrmSXmwA_UZ-H2ChhA6jmyuUv1qDG-u8" 
                alt="Meeting" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <Share2 className="text-white mb-6" size={48} />
                <h3 className="text-white font-black text-2xl mb-2">重塑组织连接</h3>
                <p className="text-white/80 text-base">在真实的业务场景中，洞察潜在的人才网络。</p>
              </div>
            </div>

            <div className="grid grid-rows-2 gap-6">
              <div className="rounded-[32px] p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBW6bnzaqVZxkNeSPJVU9UBcLiKMlgo0rRUgP-CQM2ewO565oa2MCeykqRuzzS1xstUA-swVVVbJ7ntTTkybpBiCrQ7vg46hfG6_xn-QbkDSYL02Es1ANExotc_oD7y6gRxtBTUpKd-6LW4-F3XixV8pgYN-q_Xx0-Br9KG7_ljsa1RHykHztiD8_0ueXmvhpcylgSlGWshl5SHOu9Bzun7CVRdpBi8apwc-jVz-JeMq3jeHppHClFzHuPMMzrgvpfJc9BV6dik1Po" 
                  alt="Data" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <BarChart3 className="relative z-10 text-white" size={48} />
                <div className="relative z-10">
                  <h3 className="text-white font-black text-2xl mb-2">数据驱动决策</h3>
                  <p className="text-white/90 text-base">超越直觉，用多维数据全景描绘候选人真实能力与潜力。</p>
                </div>
              </div>

              <div className="rounded-[32px] p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNG4mko2Yaqt0FGME4UgRVgDw9BsVyPtGkxf2s2n84VwRjXjwiaKglHBqTT_fXLjvmJTSUQxFmHo0L7QPH3g0t4_sV8oTs6vza_8SDjxIxUaqKoTjIE0FORrDSQL59tLyVasHGjiNcyQLcsXL8UshAg9-Yz270CgxHH4v9DVwPAhojaRZPfPSEjv3lpexRORNqU4FGcHQxbKBWa1PJuQFccBlap3d81wRBd42UZj8NrQyFuSivjdWZ1R730cvESQtq2cA3Qotkd14" 
                  alt="Talent" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <Users className="relative z-10 text-white" size={48} />
                <div className="relative z-10">
                  <h3 className="text-white font-black text-2xl mb-2">全息人才洞察</h3>
                  <p className="text-white/90 text-base">从技能栈到文化契合度，提供360度的立体评估报告。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Core Matrix */}
        <section className="py-20 px-5 md:px-margin-desktop bg-surface-lowest relative overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] opacity-70"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-on-surface mb-4">核心能力矩阵</h2>
              <p className="text-base md:text-lg text-on-surface-variant max-w-lg mx-auto leading-relaxed uppercase tracking-widest font-black">以技术赋能招聘全链路</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="relative p-10 rounded-[32px] bg-surface-lowest border border-surface-mid shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-transform duration-500 group-hover:scale-150"></div>
                <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-primary/20">
                  <Database size={32} />
                </div>
                <h3 className="text-2xl font-black text-on-surface mb-3 relative z-10">智能人才图谱</h3>
                <p className="text-base text-on-surface-variant mb-6 relative z-10 leading-relaxed font-medium">构建行业深度的知识图谱，挖掘隐藏的人脉网络与能力关联，让优秀人才无处遁形。</p>
                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className="px-4 py-1.5 rounded-full bg-surface-low text-on-surface-variant text-[12px] font-black tracking-wide uppercase">知识图谱</span>
                  <span className="px-4 py-1.5 rounded-full bg-surface-low text-on-surface-variant text-[12px] font-black tracking-wide uppercase">深度挖掘</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative p-10 rounded-[32px] bg-surface-lowest border border-surface-mid shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/10 rounded-bl-full transition-transform duration-500 group-hover:scale-150"></div>
                <div className="w-16 h-16 rounded-2xl bg-tertiary text-white flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-tertiary/20">
                  <Target size={32} />
                </div>
                <h3 className="text-2xl font-black text-on-surface mb-3 relative z-10">AI 精准匹配</h3>
                <p className="text-base text-on-surface-variant mb-6 relative z-10 leading-relaxed font-medium">采用领先的自然语言处理与机器学习算法，实现JD与简历的毫秒级双向精准匹配。</p>
                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className="px-4 py-1.5 rounded-full bg-surface-low text-on-surface-variant text-[12px] font-black tracking-wide uppercase">NLP解析</span>
                  <span className="px-4 py-1.5 rounded-full bg-surface-low text-on-surface-variant text-[12px] font-black tracking-wide uppercase">双向推荐</span>
                </div>
              </div>

              {/* Feature 3 (New for desktop) */}
              <div className="relative p-10 rounded-[32px] bg-surface-lowest border border-surface-mid shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full transition-transform duration-500 group-hover:scale-150"></div>
                <div className="w-16 h-16 rounded-2xl bg-secondary text-white flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-secondary/20">
                  <Megaphone size={32} />
                </div>
                <h3 className="text-2xl font-black text-on-surface mb-3 relative z-10">多端触达矩阵</h3>
                <p className="text-base text-on-surface-variant mb-6 relative z-10 leading-relaxed font-medium">覆盖全网主流社交与招聘媒体，一键发布，全网响应，极速缩短候选人到岗周期。</p>
                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className="px-4 py-1.5 rounded-full bg-surface-low text-on-surface-variant text-[12px] font-black tracking-wide uppercase">全网曝光</span>
                  <span className="px-4 py-1.5 rounded-full bg-surface-low text-on-surface-variant text-[12px] font-black tracking-wide uppercase">极速反馈</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Social Proof & Metrics */}
        <section className="py-20 px-5 bg-surface-background border-y border-surface-mid">
          <div className="max-w-6xl mx-auto px-margin-mobile">
            <p className="text-[12px] font-black text-center text-on-surface-variant mb-12 tracking-[0.3em] uppercase">业界领先的数据表现</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center justify-center p-6 bg-surface-lowest rounded-3xl shadow-sm border border-surface-mid/50">
                <span className="text-4xl font-black text-primary mb-2">10,000+</span>
                <span className="text-[14px] text-on-surface-variant font-black">合作企业</span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-surface-lowest rounded-3xl shadow-sm border border-surface-mid/50">
                <span className="text-4xl font-black text-primary mb-2">98%</span>
                <span className="text-[14px] text-on-surface-variant font-black">岗位匹配率</span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-surface-lowest rounded-3xl shadow-sm border border-surface-mid/50">
                <span className="text-4xl font-black text-primary mb-2">50M+</span>
                <span className="text-[14px] text-on-surface-variant font-black">人才图谱节点</span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-surface-lowest rounded-3xl shadow-sm border border-surface-mid/50">
                <span className="text-4xl font-black text-primary mb-2">3x</span>
                <span className="text-[14px] text-on-surface-variant font-black">招聘效率提升</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Final CTA */}
        <section 
          className="py-32 px-5 text-white text-center relative overflow-hidden" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuA2vNJVm-8iGPo6uhYZxd_U4DTvMCPX_wxcOvdSGiPJJlvhR8mOcfa4PgSst5aAdh2c8nrjFVl5Gzfj69GP-O8AtLEif5Jc-e5nSL3N3eTSzR64baSnaRDZd2e2oigOi2b5zEaBHnlBqXT8mu3dzbgT8r-lfImURYpgafRjjUVmqSqfo9k9Vx95O0GqCIKWd0sF3l6J7VwgMyKuMvto_cZ_Qjg9uc9Zv3YMIZLWeMrWQnp-27Ntzjyuqh4USYpNR4KMA1oNM_7uA8U")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-2xl mx-auto px-margin-mobile"
          >
            <h2 className="text-4xl font-black mb-6 leading-tight">准备好升级您的招聘引擎了吗？</h2>
            <p className="text-xl text-white/80 mb-12 font-medium">加入领先企业的行列，用科技重塑人才获取方式。</p>
            <Link 
              to="/jobs" 
              className="inline-block px-12 py-5 bg-primary text-white font-black text-xl rounded-2xl shadow-2xl hover:scale-105 hover:bg-primary/90 transition-all border border-white/20"
            >
              立即开启智能招聘
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer Safe Space */}
      <div className="h-24 md:hidden"></div>
    </div>
  );
}
