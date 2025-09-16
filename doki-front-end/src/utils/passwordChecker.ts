interface PasswordRules {
    minLength?: number;         // 最小长度
    maxLength?: number;         // 最大长度
    requireLetter?: boolean;    // 是否必须包含字母
    requireNumber?: boolean;    // 是否必须包含数字
    requireSpecialChar?: boolean; // 是否必须包含特殊字符
    forbidPureNumber?: boolean; // 是否禁止纯数字
}

interface ValidationResult {
    valid: boolean;
    message: string;
}

function validatePassword(password: string, rules: PasswordRules = {}): ValidationResult {
    const {
        minLength = 6,
        maxLength = 20,
        requireLetter = true,
        requireNumber = false,
        requireSpecialChar = false,
        forbidPureNumber = true,
    } = rules;

    if (password.length < minLength || password.length > maxLength) {
        return { valid: false, message: `密码长度需在 ${minLength}-${maxLength} 位之间` };
    }

    if (forbidPureNumber && /^\d+$/.test(password)) {
        return { valid: false, message: "密码不能为纯数字" };
    }

    if (requireLetter && !/[a-zA-Z]/.test(password)) {
        return { valid: false, message: "密码必须包含字母" };
    }

    if (requireNumber && !/\d/.test(password)) {
        return { valid: false, message: "密码必须包含数字" };
    }

    if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, message: "密码必须包含特殊字符" };
    }

    return { valid: true, message: "" };
}

export default{
    validatePassword
}
