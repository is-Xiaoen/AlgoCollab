import request from '../../utils/request';
import type {  ILoginData, ILoginResponse, IRefreshTokenData, IUserInfoResponse, IUserInfo, IRegisterData, IRegisterResponse } from './types';
import tokenManager from '../../utils/tokenManager';

/**
 * 认证服务API
 */
class AuthService {
  async login(email: string, password: string): Promise<ILoginResponse> {
    try {
      const response = await request.post<ILoginResponse>('/api/v1/auth/login', {
        email,
        password,
      });
      const Data = response.data as unknown as  ILoginData
      if (Data) {
        const { token, refresh_token } = Data;
        tokenManager.setTokenPair(token, refresh_token);
      }
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<IRegisterResponse> {
    try {
      const response = await request.post<IRegisterResponse>('/api/v1/auth/register', userData);

      // 注册成功后自动登录
      const Data = response.data as unknown as  IRegisterData
      if (Data) {
        const { access_token, refresh_token } = Data;
        tokenManager.setTokenPair(access_token, refresh_token);
      }

      return response.data;
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
      throw new Error('没有有效的令牌');
    }
    try {
      const response = await request.post<{
        code: number;
        data: { access_token: string; refresh_token: string };
      }>('/api/v1/auth/refresh', {
        refresh_token: refreshToken,
      });

      const Data = response.data as unknown as IRefreshTokenData

      if (Data) {
        const { access_token, refresh_token } = Data;
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
  async getCurrentUser(): Promise<IUserInfoResponse> {
    try {
      const response = await request.get<{ code: number; data: IUserInfo }>('/api/v1/auth/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
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