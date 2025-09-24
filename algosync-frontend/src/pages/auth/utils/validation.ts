import { z, ZodError } from 'zod';

// 邮箱验证规则
const emailSchema = z
  .string()
  .min(1, '邮箱不能为空')
  .email('请输入有效的邮箱地址');

// 密码验证规则
const passwordSchema = z
  .string()
  .min(1, '密码不能为空')
  .min(8, '密码至少需要8个字符')
  .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
  .regex(/[a-z]/, '密码必须包含至少一个小写字母')
  .regex(/[0-9]/, '密码必须包含至少一个数字');

// 用户名验证规则
const usernameSchema = z
  .string()
  .min(1, '用户名不能为空')
  .min(3, '用户名至少需要3个字符')
  .max(20, '用户名最多20个字符')
  .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '密码不能为空'),
});

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, '请确认密码'),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: '请同意服务条款',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

// 重置密码验证schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// 新密码验证schema
export const newPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, '请确认密码'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

// 类型导出
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

// 验证辅助函数
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  fieldName: keyof T,
  value: any
): string | null => {
  try {
    const partialSchema = z.object({ [fieldName]: (schema as any).shape[fieldName] });
    partialSchema.parse({ [fieldName]: value });
    return null;
  } catch (error) {
    if (error instanceof ZodError) {
      return error.issues[0]?.message || '验证失败';
    }
    return '验证失败';
  }
};

// 密码强度验证辅助函数
export const getPasswordStrengthErrors = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('至少8个字符');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('至少一个大写字母');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('至少一个小写字母');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('至少一个数字');
  }
  
  return errors;
};