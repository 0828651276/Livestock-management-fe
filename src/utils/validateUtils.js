/**
 * Utility functions for form validation
 */

/**
 * Validates that a string is not empty
 * @param {string} value - The value to check
 * @param {string} errorMessage - Custom error message
 * @returns {string} Error message or empty string if valid
 */
export const validateRequired = (value, errorMessage = "Trường này không được để trống") => {
    return value && value.toString().trim() !== "" ? "" : errorMessage;
};

/**
 * Validates that a date is not in the future
 * @param {string} dateString - The date string to validate
 * @param {string} errorMessage - Custom error message
 * @returns {string} Error message or empty string if valid
 */
export const validateNotFutureDate = (dateString, errorMessage = "Ngày không thể là ngày trong tương lai") => {
    if (!dateString) return "";

    const inputDate = new Date(dateString);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return inputDate > currentDate ? errorMessage : "";
};

/**
 * Validates that a date is after another date
 * @param {string} laterDateString - The date that should be later
 * @param {string} earlierDateString - The date that should be earlier
 * @param {string} errorMessage - Custom error message
 * @returns {string} Error message or empty string if valid
 */
export const validateDateOrder = (
    laterDateString,
    earlierDateString,
    errorMessage = "Ngày này phải sau ngày trước đó"
) => {
    if (!laterDateString || !earlierDateString) return "";

    const laterDate = new Date(laterDateString);
    const earlierDate = new Date(earlierDateString);

    return laterDate < earlierDate ? errorMessage : "";
};

/**
 * Validates that a number is positive or zero
 * @param {number} value - The number to validate
 * @param {string} errorMessage - Custom error message
 * @returns {string} Error message or empty string if valid
 */
export const validateNonNegative = (value, errorMessage = "Giá trị không thể là số âm") => {
    return value < 0 ? errorMessage : "";
};

/**
 * Validates that a number is within a specified range
 * @param {number} value - The number to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} errorMessage - Custom error message template
 * @returns {string} Error message or empty string if valid
 */
export const validateRange = (
    value,
    min,
    max,
    errorMessage = `Giá trị phải từ {min} đến {max}`
) => {
    if (value < min || value > max) {
        return errorMessage.replace("{min}", min).replace("{max}", max);
    }
    return "";
};

/**
 * Validates a string doesn't exceed max length
 * @param {string} value - The string to validate
 * @param {number} maxLength - Maximum allowed length
 * @param {string} errorMessage - Custom error message
 * @returns {string} Error message or empty string if valid
 */
export const validateMaxLength = (
    value,
    maxLength,
    errorMessage = `Không được vượt quá {max} ký tự`
) => {
    if (!value) return "";
    return value.length > maxLength ? errorMessage.replace("{max}", maxLength) : "";
};

/**
 * Validates that a person is at least a certain age
 * @param {string} birthDateString - The birth date string to validate
 * @param {number} minAge - Minimum required age
 * @param {string} errorMessage - Custom error message
 * @returns {string} Error message or empty string if valid
 */
export const validateMinimumAge = (birthDateString, minAge = 18, errorMessage = `Phải đủ ${minAge} tuổi trở lên`) => {
    if (!birthDateString) return "";

    const birthDate = new Date(birthDateString);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birth month has not occurred yet this year or if birth day has not occurred yet this month
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age < minAge ? errorMessage : "";
};

/**
 * Validates ID card format (supports all Vietnamese ID formats)
 * @param {string} idCardNumber - The ID card number to validate
 * @param {string} errorMessage - Custom error message
 * @returns {string} Error message or empty string if valid
 */
export const validateIdCard = (idCardNumber, errorMessage = "Số CCCD/CMND không hợp lệ") => {
    if (!idCardNumber) return "";

    // Old format CMND: 9 digits
    const oldFormatRegex = /^\d{9}$/;

    // New format CCCD: 12 digits
    const newFormatRegex = /^\d{12}$/;

    // Format bắt đầu bằng số 0 và 11 số sau (tổng 12 số)
    const zeroPrefix11Digits = /^0\d{11}$/;

    if (oldFormatRegex.test(idCardNumber) ||
        newFormatRegex.test(idCardNumber) ||
        zeroPrefix11Digits.test(idCardNumber)) {
        return "";
    }

    return errorMessage;
};

/**
 * Validates a form field has valid format
 * @param {Object} validationResults - Object to store validation results
 * @param {string} field - Field name to validate
 * @param {*} value - Field value
 * @param {Function[]} validators - Array of validator functions
 * @returns {boolean} Whether the field is valid
 */
export const validateField = (validationResults, field, value, validators) => {
    for (const validator of validators) {
        const error = validator(value);
        if (error) {
            validationResults[field] = error;
            return false;
        }
    }
    validationResults[field] = "";
    return true;
};

/**
 * Validates all fields in a pig pen form
 * @param {Object} pigPen - The pig pen data
 * @returns {Object} Object containing validation errors
 */
export const validatePigPenForm = (pigPen) => {
    const errors = {};
    let isValid = true;

    // Kiểm tra tên
    if (!validateField(errors, "name", pigPen.name, [
        (value) => validateRequired(value, "Tên chuồng không được để trống"),
        (value) => validateMaxLength(value, 100, "Tên chuồng không được vượt quá 100 ký tự")
    ])) {
        isValid = false;
    }

    // Kiểm tra ngày tạo - đảm bảo cho phép ngày hôm nay
    if (!validateField(errors, "createdDate", pigPen.createdDate, [
        (value) => validateRequired(value, "Ngày tạo không được để trống"),
        (value) => validateDateNotAfterToday(value, "Ngày tạo không thể là ngày trong tương lai")
    ])) {
        isValid = false;
    }

    // Kiểm tra ngày đóng nếu có
    if (pigPen.closedDate) {
        if (!validateField(errors, "closedDate", pigPen.closedDate, [
            (value) => validateDateOrder(value, pigPen.createdDate, "Ngày đóng phải sau ngày tạo")
        ])) {
            isValid = false;
        }
    }

    // Kiểm tra số lượng
    if (!validateField(errors, "quantity", pigPen.quantity, [
        validateNonNegative,
        (value) => validateRange(value, 0, 1000, "Số lượng phải từ 0 đến 1000")
    ])) {
        isValid = false;
    }

    return { isValid, errors };
};

// Hàm hỗ trợ để kiểm tra ngày không sau ngày hôm nay
const validateDateNotAfterToday = (value, errorMessage) => {
    if (!value) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt lại thời gian về đầu ngày

    const inputDate = new Date(value);
    inputDate.setHours(0, 0, 0, 0); // Đặt lại thời gian về đầu ngày

    return inputDate > today ? errorMessage : null;
};
/**
 * Validates an employee form
 * @param {Object} employee - The employee data
 * @returns {Object} Object containing validation result and errors
 */
export const validateEmployeeForm = (employee) => {
    const errors = {};
    let isValid = true;

    // Validate required fields
    const requiredFields = ['fullName', 'username', 'email', 'birthDate', 'idCardNumber'];
    requiredFields.forEach(field => {
        if (!validateField(errors, field, employee[field], [
            (value) => validateRequired(value, `${field === 'fullName' ? 'Họ tên' :
                field === 'username' ? 'Tên đăng nhập' :
                    field === 'email' ? 'Email' :
                        field === 'birthDate' ? 'Ngày sinh' :
                            'CCCD/CMND'} không được để trống`)
        ])) {
            isValid = false;
        }
    });

    // Validate email format
    if (employee.email && !validateField(errors, 'email', employee.email, [
        (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value) ? "" : "Email không hợp lệ";
        }
    ])) {
        isValid = false;
    }

    // Validate ID card format
    if (employee.idCardNumber && !validateField(errors, 'idCardNumber', employee.idCardNumber, [
        (value) => validateIdCard(value, "CCCD/CMND không đúng định dạng (9 số hoặc 12 số)")
    ])) {
        isValid = false;
    }

    // Validate minimum age (18 years)
    if (employee.birthDate && !validateField(errors, 'birthDate', employee.birthDate, [
        (value) => validateMinimumAge(value, 18, "Nhân viên phải đủ 18 tuổi trở lên")
    ])) {
        isValid = false;
    }

    return { isValid, errors };
};


/**
 * Validates an animal form with separate health and raising status
 * @param {Object} animal - The animal data
 * @returns {Object} Object containing validation result and errors
 */
export const validateAnimalForm = (animal) => {
    const errors = {};
    let isValid = true;

    // Validate required fields
    // Nếu raisingStatus là EXPORTED thì không bắt buộc penId
    const requiredFields = animal.raisingStatus === 'EXPORTED'
        ? ['name', 'entryDate', 'healthStatus', 'raisingStatus', 'weight', 'quantity']
        : ['name', 'entryDate', 'healthStatus', 'raisingStatus', 'weight', 'penId', 'quantity'];

    const fieldLabels = {
        name: 'Tên',
        entryDate: 'Ngày nhập',
        healthStatus: 'Trạng thái sức khỏe',
        raisingStatus: 'Trạng thái nuôi',
        weight: 'Cân nặng',
        penId: 'Chuồng nuôi',
        quantity: 'Số lượng'
    };

    requiredFields.forEach(field => {
        if (!validateField(errors, field, animal[field], [
            (value) => validateRequired(value, `${fieldLabels[field]} không được để trống`)
        ])) {
            isValid = false;
        }
    });

    // Validate name length
    if (animal.name && !validateField(errors, 'name', animal.name, [
        (value) => validateMaxLength(value, 100, "Tên không được vượt quá 100 ký tự")
    ])) {
        isValid = false;
    }

    // Validate entry date is not in the future
    if (animal.entryDate && !validateField(errors, 'entryDate', animal.entryDate, [
        (value) => {
            const today = new Date();
            const entryDate = new Date(value);
            return entryDate > today ? "Ngày nhập không được là ngày trong tương lai" : "";
        }
    ])) {
        isValid = false;
    }

    // Validate exit date is after entry date if provided
    if (animal.exitDate && animal.entryDate && !validateField(errors, 'exitDate', animal.exitDate, [
        (value) => {
            const entryDate = new Date(animal.entryDate);
            const exitDate = new Date(value);
            return exitDate < entryDate ? "Ngày xuất phải sau ngày nhập" : "";
        }
    ])) {
        isValid = false;
    }

    // Validate weight is positive
    if (animal.weight !== undefined && !validateField(errors, 'weight', animal.weight, [
        (value) => value <= 0 ? "Cân nặng phải lớn hơn 0" : "",
        (value) => value > 1000 ? "Cân nặng không được vượt quá 1000" : ""
    ])) {
        isValid = false;
    }

    // Validate quantity
    if (animal.quantity !== undefined && !validateField(errors, 'quantity', animal.quantity, [
        (value) => value < 1 ? "Số lượng phải lớn hơn hoặc bằng 1" : "",
        (value) => value > 1000 ? "Số lượng không được vượt quá 1000" : ""
    ])) {
        isValid = false;
    }

    // Validate healthStatus
    if (animal.healthStatus && !validateField(errors, 'healthStatus', animal.healthStatus, [
        (value) => {
            const validHealthStatuses = ['ACTIVE', 'SICK', 'UNVACCINATED'];
            return validHealthStatuses.includes(value) ? "" : "Trạng thái sức khỏe không hợp lệ";
        }
    ])) {
        isValid = false;
    }

    // Validate raisingStatus
    if (animal.raisingStatus && !validateField(errors, 'raisingStatus', animal.raisingStatus, [
        (value) => {
            const validRaisingStatuses = ['RAISING', 'EXPORTED'];
            return validRaisingStatuses.includes(value) ? "" : "Trạng thái nuôi không hợp lệ";
        }
    ])) {
        isValid = false;
    }

    // Validate consistency between raisingStatus and exitDate
    if (animal.raisingStatus === 'EXPORTED' && !animal.exitDate) {
        errors.exitDate = "Động vật đã xuất chuồng phải có ngày xuất";
        isValid = false;
    }

    // Validate consistency between exitDate and raisingStatus
    if (animal.exitDate && animal.raisingStatus !== 'EXPORTED') {
        errors.raisingStatus = "Động vật có ngày xuất phải có trạng thái đã xuất chuồng";
        isValid = false;
    }

    return { isValid, errors };
};