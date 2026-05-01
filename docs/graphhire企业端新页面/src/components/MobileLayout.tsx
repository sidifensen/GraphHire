import { BottomNav } from "../components/BottomNav";
import { TopNav } from "../components/TopNav";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

export function MobileLayout() {
  const location = useLocation();

  const variants = {
    initial: {
      opacity: 0,
      y: 10,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const getTopNavProps = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'GraphHire 图谱智聘', userAvatar: true };
    if (path === '/jobs') return { title: '职位管理', userAvatar: true };
    if (path === '/jobs/create') return { title: '发布职位', showBack: true };
    if (path.startsWith('/jobs/') && path.endsWith('/edit')) return { title: '编辑职位', showBack: true };
    if (path.startsWith('/jobs/')) return { title: '职位详情', showBack: true };
    if (path.startsWith('/candidate/')) return { title: '简历详情', showBack: true };
    if (path.startsWith('/recommendations')) return { title: '智能推荐', userAvatar: true };
    if (path.startsWith('/team')) return { title: '团队管理', userAvatar: true };
    if (path.startsWith('/messages')) return { title: '消息中心', showBack: true };
    return { title: 'GraphHire', userAvatar: true };
  };

  return (
    <div className="bg-surface-dim min-h-screen flex justify-center">
      <div className="w-full max-w-[375px] md:max-w-none bg-background min-h-screen relative shadow-2xl overflow-hidden flex flex-col font-body-md text-body-md text-on-surface mx-auto">
        <TopNav {...getTopNavProps()} />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col min-h-0 w-full overflow-y-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        <BottomNav />
      </div>
    </div>
  );
}
