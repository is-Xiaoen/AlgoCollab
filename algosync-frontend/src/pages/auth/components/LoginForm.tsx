import React, { useState } from 'react';
import FormField from '../../../components/common/FormField';
import PasswordInput from '../../../components/common/PasswordInput';
import { loginSchema } from '../utils/validation';
import type { LoginFormData } from '../utils/validation';

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => Promise<void>;
  onForgotPassword?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSubmit,
  onForgotPassword 
}) => {
  // 表单数据状态
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  // 错误信息状态
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 表单重置功能
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      rememberMe: false,
    });
    setErrors({});
    setTouched({});
  };

  // handleChange - 处理表单字段更新
  const handleChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value;
    // 2. 更新表单数据
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 当用户开始输入时，立即清除错误提示
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof LoginFormData) => () => {
    // 表示用户已经与该字段交互过
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    try {
      const fieldSchema = loginSchema.pick({ [field]: true });
      fieldSchema.parse({ [field]: formData[field] });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error: any) {
      if (error.errors && error.errors.length > 0) {
        const fieldError = error.errors.find((err: any) => err.path[0] === field);
        if (fieldError) {
          setErrors(prev => ({
            ...prev,
            [field]: fieldError.message
          }));
        }
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const validatedData = loginSchema.parse(formData);
      setErrors({});
      // 4. 调用提交回调（如果提供）
      if (onSubmit) {
        await onSubmit(validatedData);
      }
      resetForm(); // 完全重置表单
      setTouched({}); // 重置 touched 状态
      setFormData(prev => ({ ...prev, password: '' }));
      
    } catch (error: any) {
      // 6. 处理验证错误
      if (error.errors && error.errors.length > 0) {
        const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        // 7. 设置错误信息
        setErrors(fieldErrors);
        // 8. 将所有字段设置为 touched，以显示错误信息
        const allTouched: Partial<Record<keyof LoginFormData, boolean>> = {};
        Object.keys(formData).forEach(key => {
          allTouched[key as keyof LoginFormData] = true;
        });
        setTouched(allTouched);
      }
      // 处理网络错误或其他错误
      console.error('提交失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="邮箱地址"
        name="email"
        type="email"
        placeholder="请输入邮箱"
        value={formData.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        error={errors.email}
        touched={touched.email}
        required
        autoComplete="email"
        autoFocus
      />

      <PasswordInput
        label="密码"
        name="password"
        placeholder="请输入密码"
        value={formData.password}
        onChange={handleChange('password')}
        onBlur={handleBlur('password')}
        error={errors.password}
        touched={touched.password}
        required
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative">
            <input
              id="remember-me"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange('rememberMe')}
              className="sr-only"
              aria-label="记住我的登录状态"
              aria-describedby="remember-description"
            />    
            <label
              htmlFor="remember-me"
              className="group cursor-pointer flex items-center"
            >
              <span className={`
                relative inline-flex items-center justify-center
                h-5 w-5 rounded border-2 transition-all duration-200
                ${formData.rememberMe 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'bg-white border-gray-300 hover:border-blue-400'
                }
                group-hover:shadow-md
                focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
              `}>
                {formData.rememberMe && (
                  <svg 
                    className="h-3 w-3 text-white animate-[checkmark_200ms_ease-in-out]" 
                    fill="currentColor" 
                    viewBox="0 0 12 12"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                )}
              </span>
              
              <span className="ml-2 text-sm text-gray-700 select-none group-hover:text-gray-900">
                记住我
              </span>
            </label>
            <span id="remember-description" className="sr-only">
              选中后，下次访问时将自动填充您的登录信息
            </span>
          </div>
          <div className="ml-2 group relative">
            <svg 
              className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div className="
              invisible group-hover:visible opacity-0 group-hover:opacity-100
              absolute left-0 bottom-full mb-2 px-2 py-1
              bg-gray-800 text-white text-xs rounded
              whitespace-nowrap transition-all duration-200
              pointer-events-none z-10
            ">
              保持登录状态30天
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          忘记密码？
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          group relative w-full py-3 px-4 rounded-lg font-medium
          text-white overflow-hidden
          transform transition-all duration-200 ease-out
          ${isSubmitting 
            ? 'bg-gradient-to-r from-blue-400 to-blue-500 cursor-not-allowed opacity-90 scale-[0.99]' 
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] hover:shadow-lg'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
      >
        <span className="sr-only">
          {isSubmitting ? '正在登录，请稍候' : '点击登录'}
        </span>
    
        <span 
          className={`
            absolute inset-0 bg-white opacity-0
            ${!isSubmitting ? 'group-hover:opacity-10 group-active:opacity-20' : ''}
            transition-opacity duration-300
          `}
        />
        
        <span className="relative flex items-center justify-center">
          {isSubmitting ? (
            <>
              <svg 
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              
              {/* 文字带闪烁效果 */}
              <span className="animate-pulse">
                登录中
                <span className="inline-flex">
                  <span className="animate-[blink_1.4s_infinite_100ms]">.</span>
                  <span className="animate-[blink_1.4s_infinite_300ms]">.</span>
                  <span className="animate-[blink_1.4s_infinite_500ms]">.</span>
                </span>
              </span>
            </>
          ) : (
            <>
              <svg 
                className="w-5 h-5 mr-2 transform group-hover:translate-x-1 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                />
              </svg>
              
              <span className="font-semibold tracking-wide">
                登录
              </span>
              
              <svg 
                className="w-0 h-5 ml-0 opacity-0 group-hover:w-5 group-hover:ml-2 group-hover:opacity-100 transition-all duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
            </>
          )}
        </span>
        
        {!isSubmitting && (
          <span className="absolute inset-0 rounded-lg ring-0 group-active:ring-4 ring-blue-400 ring-opacity-30 transition-all duration-300" />
        )}
      </button>

      {/* 扩展学习任务：
          TODO(human): 添加社交媒体登录按钮
          - 实现 Google/GitHub 登录按钮
          - 添加分隔线 "或"
          - 处理第三方登录逻辑
      */}
    </form>
  );
};

export default LoginForm;