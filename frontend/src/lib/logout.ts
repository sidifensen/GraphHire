import { authApi } from '@/lib/api/auth';
import { authStore } from '@/lib/stores/auth-store';

export async function logoutWithServerInvalidation(redirect: (path: string) => void, fallbackPath: string = '/') {
  try {
    await authApi.logout();
  } catch {
    // 服务端退出失败时，仍然清理本地登录态，避免用户卡在伪登录状态
  } finally {
    authStore.getState().logout();
    redirect(fallbackPath);
  }
}
