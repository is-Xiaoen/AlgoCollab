import React, { useState } from 'react';
import FormField from '../../../components/common/FormField';
import PasswordInput from '../../../components/common/PasswordInput';
import { registerSchema, getPasswordStrengthErrors } from '../utils/validation';
import type { RegisterFormData } from '../utils/validation';
import {  ZodError } from 'zod'; 

interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => Promise<void>;
  onLoginClick?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSubmit,
  onLoginClick 
}) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 密码强度错误状态 - 使用 getPasswordStrengthErrors
  const [passwordStrengthErrors, setPasswordStrengthErrors] = useState<string[]>([]);

  const handleChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'agreeToTerms' ? e.target.checked : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    if (field === 'password') {
      const strengthErrors = getPasswordStrengthErrors(value as string);
      setPasswordStrengthErrors(strengthErrors);
      
      if (formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: '两次输入的密码不一致' }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.confirmPassword;
            return newErrors;
          });
        }
      }
    }
    
    if (field === 'confirmPassword') {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: '两次输入的密码不一致' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };

  const validateField = async (field: keyof RegisterFormData) => {
    try {
      const fieldSchema = registerSchema.pick({ [field]: true });
      if (field === 'confirmPassword') {
        if (formData.confirmPassword !== formData.password) {
          setErrors(prev => ({ ...prev, confirmPassword: '两次输入的密码不一致' }));
          return;
        }
      }
      
      fieldSchema.parse({ [field]: formData[field] });
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      if (field === 'username' && formData.username) {
        setTimeout(() => {
          if (formData.username === 'admin' || formData.username === 'test') {
            setErrors(prev => ({ ...prev, username: '用户名已被使用' }));
          }
        }, 500);
      }
      
      if (field === 'email' && formData.email) {
        setTimeout(() => {
          if (formData.email === 'test@example.com') {
            setErrors(prev => ({ ...prev, email: '邮箱已被注册' }));
          }
        }, 500);
      }
      
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

  const handleBlur = (field: keyof RegisterFormData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const touchAllFields = () => {
        const allTouched: Partial<Record<keyof RegisterFormData, boolean>> = {};
        Object.keys(formData).forEach(key => {
            allTouched[key as keyof RegisterFormData] = true;
        });
        setTouched(allTouched);
    };

    try {
      setIsSubmitting(true);
      
      const validatedData = registerSchema.parse(formData);
      setErrors({});
      
      if (onSubmit) {
        await onSubmit(validatedData);
      }
      
      setFormData({
        username: '', email: '', password: '', confirmPassword: '', agreeToTerms: false,
      });
      setTouched({});

    } catch (error: any) {
      touchAllFields(); // 确保所有错误都能显示

      if (error instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
        for (const issue of error.issues) {
          const fieldName = issue.path[0] as keyof RegisterFormData;
          if (fieldName) {
            fieldErrors[fieldName] = issue.message;
          }
        }
        setErrors(fieldErrors);
      } else {
        console.error('注册失败，非验证错误:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="用户名"
        name="username"
        placeholder="请输入用户名"
        value={formData.username}
        onChange={handleChange('username')}
        onBlur={handleBlur('username')}
        error={errors.username}
        touched={touched.username}
        required
        autoComplete="username"
        autoFocus
      />

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
      />
      <div>
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
          autoComplete="new-password"
          showStrengthIndicator
        />
        {formData.password && (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-gray-700">密码要求：</p>
            <ul className="text-xs space-y-1">
              <li className={`flex items-center ${
                !passwordStrengthErrors.includes('至少8个字符') ? 'text-green-600' : 'text-gray-400'
              }`}>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                至少 8 个字符
              </li>
              <li className={`flex items-center ${
                !passwordStrengthErrors.includes('至少一个小写字母') ? 'text-green-600' : 'text-gray-400'
              }`}>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                包含小写字母
              </li>
              <li className={`flex items-center ${
                !passwordStrengthErrors.includes('至少一个大写字母') ? 'text-green-600' : 'text-gray-400'
              }`}>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                包含大写字母
              </li>
              <li className={`flex items-center ${
                !passwordStrengthErrors.includes('至少一个数字') ? 'text-green-600' : 'text-gray-400'
              }`}>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                包含数字
              </li>
              <li className={`flex items-center ${
                /[!@#$%^&*]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
              }`}>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                包含特殊字符 (!@#$%^&*) [可选]
              </li>
            </ul>
            {passwordStrengthErrors.length > 0 && (
              <p className="text-xs text-red-500 mt-2">
                还需满足 {passwordStrengthErrors.length} 个要求
              </p>
            )}
          </div>
        )}
      </div>
      <PasswordInput
        label="确认密码"
        name="confirmPassword"
        placeholder="请再次输入密码"
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        onBlur={handleBlur('confirmPassword')}
        error={errors.confirmPassword}
        touched={touched.confirmPassword}
        required
        autoComplete="new-password"
      />

      <div className="space-y-2">
        <div className="flex items-start">
          <div className="relative">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange('agreeToTerms')}
              className="sr-only"
            />
            <label
              htmlFor="agreeToTerms"
              className="group cursor-pointer flex items-start"
            >
              <span className={`
                relative inline-flex items-center justify-center
                h-5 w-5 mt-0.5 rounded border-2 transition-all duration-200
                ${formData.agreeToTerms 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'bg-white border-gray-300 hover:border-blue-400'
                }
                group-hover:shadow-md
              `}>
                {formData.agreeToTerms && (
                  <svg 
                    className="h-3 w-3 text-white animate-[checkmark_200ms_ease-in-out]" 
                    fill="currentColor" 
                    viewBox="0 0 12 12"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                )}
              </span>
              <span className="ml-2 text-sm text-gray-600 select-none">
                我已阅读并同意
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('服务条款内容');
                  }}
                  className="text-blue-600 hover:text-blue-500 underline mx-1"
                >
                  服务条款
                </button>
                和
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('隐私政策内容');
                  }}
                  className="text-blue-600 hover:text-blue-500 underline mx-1"
                >
                  隐私政策
                </button>
              </span>
            </label>
          </div>
        </div>
        {errors.agreeToTerms && touched.agreeToTerms && (
          <p className="text-red-500 text-xs ml-7">{errors.agreeToTerms}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !formData.agreeToTerms}
        className={`
          group relative w-full py-3 px-4 rounded-lg font-medium
          text-white overflow-hidden
          transform transition-all duration-200 ease-out
          ${isSubmitting || !formData.agreeToTerms
            ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-90' 
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] hover:shadow-lg'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
      >
        <span className="sr-only">
          {isSubmitting ? '正在注册，请稍候' : '点击注册新账号'}
        </span>
        <span 
          className={`
            absolute inset-0 bg-white opacity-0
            ${!isSubmitting && formData.agreeToTerms ? 'group-hover:opacity-10 group-active:opacity-20' : ''}
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
              <span className="animate-pulse">注册中...</span>
            </>
          ) : (
            <>
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
                />
              </svg>
              <span className="font-semibold tracking-wide">创建账号</span>
            </>
          )}
        </span>
        
        {!isSubmitting && formData.agreeToTerms && (
          <span className="absolute inset-0 rounded-lg ring-0 group-active:ring-4 ring-blue-400 ring-opacity-30 transition-all duration-300" />
        )}
      </button>

      <div className="text-center text-sm text-gray-600">
        已有账号？
        <button
          type="button"
          onClick={onLoginClick}
          className="text-blue-600 hover:text-blue-500 ml-1"
        >
          立即登录
        </button>
      </div>

      {/* 扩展学习任务：
          TODO(human): 添加以下高级功能
          1. 头像上传预览
          2. 手机号验证（发送验证码）
          3. 邮箱验证流程
          4. 密码可见性切换
          5. 表单进度指示器
      */}
    </form>
  );
};

export default RegisterForm;