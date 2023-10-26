// ================= User Input Validation =================

export function checkForPasswordMatch(password, confirmPassword) {
  if (!password || !confirmPassword) {
    return false;
  }
  return password === confirmPassword;
}

export function checkForPasswordValidation(password) {
  if (!password) {
    return false;
  }
  return password.length >= 8;
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ================= Module Validation =================

export function validateModuleId(id) {
  if (!id) {
    return false;
  }
  const moduleIdRegex = /^module_[1-9]$/;
  return moduleIdRegex.test(id);
}

export function validateScenarioType(type) {
  if (!type) {
    return false;
  }
  const moduleTypeRegex = /^(HA|AM)$/;
  return moduleTypeRegex.test(type);
}

export function validateScenarioId(id) {
  if (!id) {
    return false;
  }
  const scenarioIdRegex = /^(intersections|rearends|curves)_[1-6]$/;
  return scenarioIdRegex.test(id);
}

export function validateActivityId(id) {
  if (!id) {
    return false;
  }
  const activityIdRegex = /^(S|T)$/;
  return activityIdRegex.test(id);
}

export function validateModule(module) {
  if (!module) {
    return false;
  }
  return module && validateModuleId(module.id);
}

// ================= REDCap Validation =================
export function validateUserInformationComplete(user) {
  return !!(
    user.participantId &&
    user.firstName &&
    user.lastName &&
    user.email &&
    user.role &&
    user.dateJoined
  )
}
  
// ================= Feedback Input Validation =================
export function validateType(type) {
  const typeArray = ["Bug Report", "Suggestion", "Support", "Other"];
  return typeArray.includes(type);
}

export function validateContent(content) {
  if (!content) {
    return false;
  }
  return content.length >= 10 && content.length <= 1000;
}

export function validateEntrance(entrance) {
  if (!entrance) {
    return false;
  }
  return entrance.length >= 7 && entrance.length <= 60;
}
