"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "../_lib/router";
import { authApi } from "@/lib/api/auth";
import { enterpriseAuthStore, userAuthStore } from "@/lib/stores/auth-store";
import type { LoginRequest } from "@/lib/types";
import { resolveLoginRoleDecision } from "@/lib/auth/login-role";

const DEV_ACCOUNTS = {
  jobseeker: { username: "13800138001@phone.com", password: "password123" },
  recruiter: { username: "hr@techchina.com", password: "password123" },
} as const;

export default function Login() {
  const [role, setRole] = useState<"jobseeker" | "recruiter">("jobseeker");
  const [username, setUsername] = useState<string>(DEV_ACCOUNTS.jobseeker.username);
  const [password, setPassword] = useState<string>(DEV_ACCOUNTS.jobseeker.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewPending, setReviewPending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    setReviewPending(params.get("review") === "pending");
  }, []);

  const handleRoleSwitch = (nextRole: "jobseeker" | "recruiter") => {
    setRole(nextRole);
    setUsername(DEV_ACCOUNTS[nextRole].username);
    setPassword(DEV_ACCOUNTS[nextRole].password);
    setError("");
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data: LoginRequest = { username, password };
      const response = await authApi.login(data);
      const decision = resolveLoginRoleDecision(role, response.userType);
      if (!decision.allowed || !decision.authDomain || !decision.redirectPath) {
        setError(decision.errorMessage ?? "账号角色与当前登录入口不匹配");
        return;
      }

      const nextUser = { id: response.userId, username, type: response.userType };
      const nextTokens = { accessToken: response.accessToken, refreshToken: response.refreshToken };

      if (decision.authDomain === "enterprise") {
        enterpriseAuthStore.getState().setAuth(nextTokens, nextUser);
      } else if (decision.authDomain === "user") {
        userAuthStore.getState().setAuth(nextTokens, nextUser);
      } else {
        setError("当前账号请使用管理员登录入口");
        return;
      }

      navigate(decision.redirectPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "登录失败，请检查用户名和密码";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans text-on-surface antialiased bg-surface-background">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-[radial-gradient(var(--color-outline-variant)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[100px] z-0 pointer-events-none" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[100px] z-0 pointer-events-none" />

      <main className="relative z-10 w-full max-w-[440px] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-lowest/70 backdrop-blur-xl border border-outline-variant/30 rounded-[24px] p-8 shadow-[0px_16px_40px_rgba(0,62,199,0.08)] relative group"
        >
          <div className="absolute inset-0 rounded-[24px] border-[1.5px] border-transparent group-hover:border-primary/20 transition-colors duration-500 pointer-events-none" />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-primary tracking-tighter mb-2">GraphHire</h1>
            <p className="text-sm text-on-surface-variant">智慧连接，触达顶尖人才</p>
          </div>

          {reviewPending && (
            <div className="mb-4 rounded-lg bg-blue-50 text-blue-700 text-sm px-3 py-2">
              该公司正在审核中，当前无法进入企业端。请等待管理员审核通过后再登录。
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 text-red-600 text-sm px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex mb-8 border-b border-surface-variant/50 relative">
            <button
              type="button"
              onClick={() => handleRoleSwitch("jobseeker")}
              className={`flex-1 pb-3 text-center font-bold text-lg transition-all ${
                role === "jobseeker"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary/80"
              }`}
            >
              求职者
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch("recruiter")}
              aria-label="招聘者"
              className={`flex-1 pb-3 text-center font-bold text-lg transition-all ${
                role === "recruiter"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary/80"
              }`}
            >
              招聘者
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="mobile-login-username">
                用户名/邮箱
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-outline-variant" size={20} />
                </div>
                <input
                  id="mobile-login-username"
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface-lowest border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  placeholder="请输入用户名/邮箱"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="mobile-login-password">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-outline-variant" size={20} />
                </div>
                <input
                  id="mobile-login-password"
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface-lowest border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  placeholder="请输入密码"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end items-center px-1 pt-1">
              <Link className="text-xs text-primary font-bold hover:opacity-80 transition-opacity" to="#">
                忘记密码？
              </Link>
            </div>

            <div className="pt-2">
              <button
                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-lg shadow-[0px_4px_12px_rgba(0,62,199,0.3)] hover:shadow-[0px_6px_16px_rgba(0,62,199,0.4)] hover:-translate-y-[1px] hover:bg-primary/90 transition-all duration-200 relative overflow-hidden group flex justify-center items-center gap-2 disabled:opacity-60"
                aria-label="登录"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? "登录中..." : "立即登录"}</span>
                {!loading && <ArrowRight size={20} />}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-surface-variant/30 pt-6">
            <p className="text-xs text-on-surface-variant">
              还没有账号？
              <Link to="/register" className="text-primary font-black hover:underline underline-offset-4 ml-1 transition-all">
                立即注册
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
