"use client";

import { useState } from "react";
import { Link, useNavigate } from "../_lib/router";
import { authApi } from "@/lib/api/auth";
import { enterpriseAuthStore, userAuthStore } from "@/lib/stores/auth-store";
import type { CompanyRegisterRequest, PersonRegisterRequest } from "@/lib/types";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"jobseeker" | "recruiter">("jobseeker");
  const [agreed, setAgreed] = useState(false);

  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [unifiedSocialCreditCode, setUnifiedSocialCreditCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);
  const [verifyCodeCooldown, setVerifyCodeCooldown] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const extractErrorMessage = (err: unknown, fallback: string) => {
    if (err && typeof err === "object") {
      const maybeResponse = err as {
        code?: string;
        message?: string;
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      const rawMessage = maybeResponse.message;
      if (
        maybeResponse.code === "ECONNABORTED" ||
        (typeof rawMessage === "string" && rawMessage.toLowerCase().includes("timeout"))
      ) {
        return "请求超时，请稍后重试";
      }
      const message = maybeResponse.response?.data?.message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
    return err instanceof Error ? err.message : fallback;
  };

  const handleRoleSwitch = (nextRole: "jobseeker" | "recruiter") => {
    setRole(nextRole);
    setError("");
    setNotice("");
  };

  const handleSendVerifyCode = async () => {
    if (!email) {
      setError("请先输入邮箱地址");
      return;
    }

    setVerifyCodeLoading(true);
    setError("");
    setNotice("");

    try {
      await authApi.sendVerifyCode(email, "register");
      setVerifyCodeCooldown(60);
      const timer = setInterval(() => {
        setVerifyCodeCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "发送验证码失败"));
    } finally {
      setVerifyCodeLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!email) {
      setError("请输入邮箱地址");
      return;
    }
    if (!verifyCode) {
      setError("请输入验证码");
      return;
    }
    if (!password) {
      setError("请输入密码");
      return;
    }
    if (password.length < 8 || password.length > 20) {
      setError("密码长度应为 8-20 位");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (!agreed) {
      setError("请阅读并同意用户协议");
      return;
    }
    if (role === "recruiter") {
      if (!companyName) {
        setError("请输入公司全称");
        return;
      }
      if (!unifiedSocialCreditCode) {
        setError("请输入统一社会信用代码");
        return;
      }
    }

    setLoading(true);

    try {
      let response;
      if (role === "jobseeker") {
        const data: PersonRegisterRequest = { username: email, password, verifyCode };
        response = await authApi.personRegister(data);
      } else {
        const data: CompanyRegisterRequest = {
          username: email,
          password,
          verifyCode,
          companyName,
          unifiedSocialCreditCode,
        };
        response = await authApi.companyRegister(data);
      }

      const nextTokens = { accessToken: response.accessToken, refreshToken: response.refreshToken };
      const nextUser = { id: response.userId, username: email, type: response.userType };
      if (response.userType === "COMPANY") {
        enterpriseAuthStore.getState().setAuth(nextTokens, nextUser);
        navigate("/enterprise/dashboard");
      } else {
        userAuthStore.getState().setAuth(nextTokens, nextUser);
        navigate("/");
      }
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "注册失败，请稍后重试");
      if (role === "recruiter" && message.includes("该公司正在审核中，暂不可进入企业端")) {
        setNotice("注册成功，企业已提交管理员审核。审核通过后即可进入企业端。");
        window.setTimeout(() => {
          navigate("/login?review=pending");
        }, 1200);
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-[#fbf8ff] p-4 relative overflow-x-hidden antialiased">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-secondary-container/5 rounded-full blur-3xl" />
      </div>

      <main className="w-full max-w-[560px] z-10">
        <div className="bg-white/85 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-[0px_8px_32px_rgba(0,62,199,0.08)] overflow-hidden">
          <div className="px-8 pt-8 pb-4 text-center">
            <span className="text-2xl font-black text-primary tracking-tighter">GraphHire</span>
            <h1 className="text-2xl font-bold text-on-surface mt-3 mb-1">开启您的 AI 招聘之旅</h1>
            <p className="text-sm text-on-surface-variant font-medium">选择您的专属角色，体验数据驱动的精准匹配</p>
          </div>

          <div className="px-8 pb-8">
            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
            {notice && <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">{notice}</div>}

            <div className="flex bg-[#eef4ff] p-1 rounded-lg w-fit mb-8">
              <button
                type="button"
                onClick={() => handleRoleSwitch("jobseeker")}
                className={`shadow-sm rounded text-sm transition-all py-2 px-8 ${
                  role === "jobseeker"
                    ? "bg-white text-[#003da6] font-bold"
                    : "text-[#394851] hover:text-[#0e1c2c] font-medium"
                }`}
              >
                求职者
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch("recruiter")}
                className={`rounded text-sm transition-colors py-2 px-8 ${
                  role === "recruiter"
                    ? "bg-white text-[#003da6] font-bold shadow-sm"
                    : "text-[#394851] hover:text-[#0e1c2c] font-medium"
                }`}
              >
                招聘者
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5" htmlFor="mobile-register-email">
                  邮箱
                </label>
                <input
                  id="mobile-register-email"
                  className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                  placeholder="请输入邮箱地址"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5" htmlFor="mobile-register-code">
                  验证码
                </label>
                <div className="flex gap-3">
                  <input
                    id="mobile-register-code"
                    className="flex-1 px-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                    placeholder="6 位验证码"
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    required
                  />
                  <button
                    className="whitespace-nowrap px-4 py-2.5 bg-surface-container border border-outline-variant text-primary font-bold text-xs rounded-lg hover:bg-surface-variant transition-colors disabled:opacity-60"
                    type="button"
                    onClick={handleSendVerifyCode}
                    disabled={verifyCodeLoading || verifyCodeCooldown > 0}
                  >
                    {verifyCodeCooldown > 0 ? `${verifyCodeCooldown}s` : "获取验证码"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5" htmlFor="mobile-register-password">
                  密码
                </label>
                <input
                  id="mobile-register-password"
                  className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                  placeholder="设置 8-20 位密码，包含字母和数字"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5" htmlFor="mobile-register-confirm">
                  确认密码
                </label>
                <input
                  id="mobile-register-confirm"
                  className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                  placeholder="请再次输入密码"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {role === "recruiter" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5" htmlFor="mobile-register-company">
                      公司全称
                    </label>
                    <input
                      id="mobile-register-company"
                      className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      placeholder="请输入营业执照上的公司全称"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5" htmlFor="mobile-register-credit-code">
                      统一社会信用代码
                    </label>
                    <input
                      id="mobile-register-credit-code"
                      className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      placeholder="请输入 18 位信用代码"
                      type="text"
                      value={unifiedSocialCreditCode}
                      onChange={(e) => setUnifiedSocialCreditCode(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex items-start gap-2">
                <input
                  className="w-4 h-4 text-primary bg-white border-outline-variant rounded focus:ring-primary cursor-pointer mt-0.5"
                  id="mobile-register-agreement"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required
                />
                <label className="text-xs text-on-surface-variant font-medium leading-relaxed" htmlFor="mobile-register-agreement">
                  我已阅读并同意 <a className="text-primary font-black hover:underline" href="#">《用户协议》</a> 和{" "}
                  <a className="text-primary font-black hover:underline" href="#">《隐私政策》</a>
                </label>
              </div>

              <button
                className="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? "注册中..." : "创建账号"}
              </button>

              <div className="text-center">
                <span className="text-xs text-on-surface-variant font-medium">已有账号？</span>
                <Link to="/login" className="text-primary font-black text-xs ml-1 hover:underline underline-offset-2">
                  去登录
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
