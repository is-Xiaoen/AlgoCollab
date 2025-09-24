import request from '../../utils/request';
import type { ILoginData, ILoginResponse, IRefreshTokenData,IUser, IUserInfo, IRegisterData, IRegisterResponse, IRegisterUser } from './types';
import type { TokenPair, AuthResponse } from '../../types/token';

//登录相关api
class AuthService {
  //登录
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

  //注册
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

  // 刷新token
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

  //登出
  async logout(): Promise<void> {
    try {
      await request.post('/v1/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    }
  }

  //通过token获取当前用户信息
  async getCurrentUser(): Promise<IUserInfo> {
    try {
      const response = await request.get<{ code: number; data: IUserInfo }>('/v1/auth/me');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }
}

// 导出服务实例
export default new AuthService();