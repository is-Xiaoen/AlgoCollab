import request from '../../utils/request';
import { ILoginResponse, IUser } from './types';
import tokenManager from '../../utils/tokenManager';

/**
 * 认证服务API
 */
class AuthService {
  /**
   * 用户登录
   * @param email 邮箱
   * @param password 密码
   */
  async login(email: string, password: string): Promise<ILoginResponse> {
    try {
      const response = await request.post<ILoginResponse>('/api/v1/auth/login', {
        email,
        password,
      });

      // 存储Token
      if (response.data) {
        const { token, refresh_token } = response.data;
        tokenManager.setTokenPair(token, refresh_token);
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * TODO(human): 实现记住我功能
   * 要求：
   * 1. 添加 rememberMe 参数到登录方法
   * 2. 根据 rememberMe 决定Token存储策略
   * 3. 记住的用户信息加密存储
   * 
   * 提示：
   * - rememberMe=true: 使用localStorage
   * - rememberMe=false: 使用sessionStorage或内存
   */

  /**
   * 用户注册
   * @param userData 注册信息
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<ILoginResponse> {
    try {
      const response = await request.post<ILoginResponse>('/api/v1/auth/register', userData);

      // 注册成功后自动登录
      if (response.data) {
        const { token, refresh_token } = response.data;
        tokenManager.setTokenPair(token, refresh_token);
      }

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * TODO(human): 实现邮箱验证功能
   * 功能：发送验证邮件到用户邮箱
   * 要求：
   * 1. 创建 sendVerificationEmail 方法
   * 2. 创建 verifyEmail 方法（验证邮箱token）
   * 3. 处理验证状态更新
   * 
   * async sendVerificationEmail(email: string): Promise<void> {
   *   // 你的实现
   * }
   * 
   * async verifyEmail(token: string): Promise<boolean> {
   *   // 你的实现
   * }
   */

  /**
   * 刷新Token
   */
  async refreshToken(): Promise<{ access_token: string; refresh_token: string }> {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await request.post<{
        code: number;
        data: { access_token: string; refresh_token: string };
      }>('/api/v1/auth/refresh', {
        refresh_token: refreshToken,
      });

      if (response.data) {
        const { access_token, refresh_token } = response.data;
        tokenManager.setTokenPair(access_token, refresh_token);
        return { access_token, refresh_token };
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      // 刷新失败，清除本地Token
      tokenManager.clearAll();
      throw error;
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      // TODO(human): 实现后端登出接口调用
      // 提示：调用后端撤销Token的接口
      // await request.post('/api/v1/auth/logout');
      
      // 清除本地Token
      tokenManager.clearAll();
    } catch (error) {
      // 即使后端调用失败，也要清除本地Token
      tokenManager.clearAll();
      console.error('Logout error:', error);
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<IUser> {
    try {
      const response = await request.get<{ code: number; data: IUser }>('/api/v1/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  /**
   * TODO(human): 实现密码重置功能
   * 功能：通过邮箱重置密码
   * 要求：
   * 1. 创建 requestPasswordReset 方法（发送重置邮件）
   * 2. 创建 resetPassword 方法（使用token重置密码）
   * 3. 创建 validateResetToken 方法（验证重置token是否有效）
   * 
   * async requestPasswordReset(email: string): Promise<void> {
   *   // 你的实现
   * }
   * 
   * async resetPassword(token: string, newPassword: string): Promise<void> {
   *   // 你的实现
   * }
   */

  /**
   * 更新用户信息
   */
  async updateProfile(userData: Partial<IUser>): Promise<IUser> {
    try {
      const response = await request.put<{ code: number; data: IUser }>(
        '/api/v1/auth/profile',
        userData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * TODO(human): 实现账号安全功能
   * 功能：增强账号安全性
   * 要求：
   * 1. 创建 changePassword 方法（修改密码）
   * 2. 创建 enableTwoFactor 方法（启用双因素认证）
   * 3. 创建 getLoginHistory 方法（获取登录历史）
   * 4. 创建 revokeSession 方法（撤销特定会话）
   * 
   * 示例：
   * async changePassword(oldPassword: string, newPassword: string): Promise<void> {
   *   // 你的实现
   * }
   */

  /**
   * 检查邮箱是否已注册
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await request.get<{ code: number; data: { exists: boolean } }>(
        `/api/v1/auth/check-email?email=${encodeURIComponent(email)}`
      );
      return response.data.exists;
    } catch (error) {
      console.error('Failed to check email:', error);
      return false;
    }
  }

  /**
   * 验证Token是否有效
   */
  async validateToken(): Promise<boolean> {
    try {
      await request.get('/api/v1/auth/validate');
      return true;
    } catch {
      return false;
    }
  }
}

// 导出服务实例
export default new AuthService();