import request from '../../utils/request';
import type { ILoginData, ILoginResponse, IRefreshTokenData,IUser, IUserInfo, IRegisterData, IRegisterResponse, IRegisterUser } from './types';
import type { TokenPair, AuthResponse } from '../../types/token';

/**
 * 认证服务API - 只负责与后端通信，不管理token
 */
class AuthService {
  /**
   * 登录API调用
   * @returns 返回标准化的token对象
   */
  async login(email: string, password: string): Promise<AuthResponse<IUser>> {
    try {
      const response = await request.post<ILoginResponse>('/v1/auth/login', {
        email,
        password,
      });
      
      const data = response.data as unknown as ILoginData;
      if (data) {
        const { token, refresh_token, user } = data;
        return {
          user,
          tokens: {
            accessToken: token,
            refreshToken: refresh_token
          }
        };
      }
      
      throw new Error('Invalid login response');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * 注册API调用
   * @returns 返回标准化的token对象
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse<IRegisterUser>> {
    try {
      const response = await request.post<IRegisterResponse>('/v1/auth/register', userData);

      const data = response.data as unknown as IRegisterData;
      if (data) {
        const { access_token, refresh_token, user } = data;
        return {
          user,
          tokens: {
            accessToken: access_token,
            refreshToken: refresh_token
          }
        };
      }
      
      throw new Error('Invalid register response');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * 刷新Token API调用
   * @returns 返回新的token对
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const response = await request.post<{
        code: number;
        data: { access_token: string; refresh_token: string };
      }>('/v1/auth/refresh', {
        refresh_token: refreshToken,
      });

      const data = response.data as unknown as IRefreshTokenData;

      if (data) {
        const { access_token, refresh_token } = data;
        return {
          accessToken: access_token,
          refreshToken: refresh_token
        };
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * 登出API调用
   */
  async logout(): Promise<void> {
    try {
      await request.post('/v1/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // 即使API失败也不抛出错误，让调用者决定如何处理
    }
  }

  /**
   * 获取当前用户信息API调用
   */
  async getCurrentUser(): Promise<IUserInfo> {
    try {
      const response = await request.get<{ code: number; data: IUserInfo }>('/v1/auth/me');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  /**
   * 验证Token是否有效API调用
   */
  async validateToken(): Promise<boolean> {
    try {
      await request.get('/v1/auth/validate');
      return true;
    } catch {
      return false;
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
}

// 导出服务实例
export default new AuthService();