import clsx from "clsx";
import forge from "node-forge";
import { cloneElement, createContext } from "react";
import { read, utils } from "xlsx";

export const ServerUrl = "http://localhost:3000";

// Public Key
export const publicKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjU8t9z0UtiSaO7JUHvMp
ln1VFJ3QJgoKyOorhWvt2Xj0jZ9d1QpD2PjV/A5n3VoOsnLzkhHOlXooSqHbuB2D
n4g6fzbI2N+Y0KggtZGhjtwVVEyaI3LMWVI+S80gRrcY+sP/SvPniuMJoJDfc1Gf
KK5lmfB2CjTCV0LZBMWA9JSiN4ngRhVQ69sAOhAo1HaY7R+CXhlSPTKfcZqkpSjj
n6DyDaQXI5YeoQOsDxDWelqftfr8lTSDh+tOkjGL7irUStaxG5zYJyYAF1OMM4Ae
x2NLD373UGtdlOT7STi3UvsNdvDpDrY5O1HteNaxC1S815UZU3U/u5lvANQB16aO
pQIDAQAB
-----END PUBLIC KEY-----
`;

/**
 * @template T
 * @param {T} object
 * @returns {T}
 */
export function copy(object) {
  return Object.assign({}, object);
}

// default forms/states
export const defaults = {
  login: { email: "", password: "" },
  register: {
    personal: {
      firstName: "",
      lastName: "",
      email: "",
      participantId: "",
    },
    account: {
      drivingLicenseId: "",
      password: "",
      confirmPassword: "",
    },
  },
  changePassword: {
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  },
  resetPassword: {
    email: "",
    newPassword: "",
    confirmNewPassword: "",
  },
  instructionsHA: {
    instructions: {
      "top-view": [],
      "driver-view": [],
    },
    "correct-feedback": ["", ""],
    "incorrect-feedback": ["", "", "", ""],
  },
  responseHistory: {
    correct: 0,
    incorrect: 0,
    last: null,
  },
  activityState: {
    moduleId: null,
    scenarioId: null,
    activityId: null,
  },
  feedback: { type: "", content: "" },
};

export const ModalContext = createContext(null);

const emptyBanner = { icon: null, text: "" };
export const BannerContext = createContext([emptyBanner, null]);

// Function to encrypt the password with the public key
export function encryptWithPublicKey(password) {
  // Convert the public key to CryptoKey object
  const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
  // Encrypt the password using the public key
  const encrypted = publicKeyObj.encrypt(password, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });

  // Return the encrypted password as Base64 string
  return forge.util.encode64(encrypted);
}

export function mask(str = "") {
  // mask at most 4 characters, but at least 1/3 of the string
  const section = Math.ceil(Math.min(str.length / 3, 4));
  const hidden = str.slice(0, -section);
  const shown = str.slice(-section);
  return hidden.replace(/./g, "\u2022") + shown;
}

export async function pause(ms = 200) {
  return new Promise((res) => setTimeout(res, ms));
}

export function duplicate(element = <></>, count = 1) {
  return (
    <>
      {Array.from({ length: count }, (_v, key) => {
        return cloneElement(element, { key: key, idx: key + 1 });
      })}
    </>
  );
}

export function getSubset(obj = {}, filter = []) {
  return filter.reduce((subset, currKey) => {
    if (currKey in obj) {
      subset[currKey] = obj[currKey];
    }
    return subset;
  }, {});
}

export function isFunc(func) {
  return typeof func === "function";
}

export function mouseClick(event) {
  const pointerType = event.nativeEvent.pointerType;
  const mozInput = event.nativeEvent.mozInputSource;
  return pointerType === "mouse" || mozInput === 1;
}

export function keyEnter(event, func) {
  if (event && event.key === "Enter") {
    return isFunc(func) && func(event);
  }
}

export async function animateTooltip(instance, hideAfter) {
  const element = instance.popper.children[0];
  const opacity = instance.state.isVisible ? 0 : "100%";
  if (!(element && element.style)) return;
  await pause(10);
  element.style.setProperty("--tt-opacity", opacity);
  if (hideAfter) {
    return setTimeout(() => {
      element.style.setProperty("--tt-opacity", 0);
    }, hideAfter);
  }
}

export async function shake(btn) {
  if (!btn) return;
  const btnClass = btn.className;
  if (btnClass.includes("shaking")) return;
  btn.className = clsx(btnClass, "shaking");
  await pause(400);
  btn.className = btnClass;
}

export function setLoading(btn) {
  if (!btn) return;
  btn.style.minWidth = `${btn.clientWidth}px`;
  btn.style.height = `${btn.clientHeight}px`;
  btn.className += " loading";
}

export function stopLoading(btn) {
  if (!btn) return;
  btn.style.minWidth = "";
  btn.style.height = "";
  btn.className = btn.className.replace("loading", "");
}

export async function swapLabel(btn, toDo) {
  btn.classList.add("swapping");
  await pause(100);
  isFunc(toDo) && (await toDo(btn));
  await pause(100);
  btn.classList.remove("swapping");
}

async function isVisible(element) {
  return new Promise((resolve) => {
    const observer = new IntersectionObserver(([entry]) => {
      resolve(entry.intersectionRatio === 1);
      observer.disconnect();
    });
    observer.observe(element);
  });
}

export function focusFirstField(modal) {
  if (!modal) return;
  const firstInput = modal.querySelector("input:not(:disabled)");
  if (firstInput) {
    firstInput.focus();
  }
}

export async function scrollToError() {
  await pause(500);
  const field = document.querySelector(".field-error:not(.disabled)");
  if (field) {
    field.scrollIntoView({ behavior: "smooth" });
    let visible = false;
    while (!visible) {
      visible = await isVisible(field);
    }
    await pause(100);
    const input = field.querySelector("input");
    input.focus();
    return input;
  }
}

/**
 *
 * @param {HTMLElement} div
 * @returns {HTMLElement}
 */
export function getModalViewport(div) {
  while (!div.className.includes("modal-content-bounds")) {
    if (div === document.body) return;
    div = div.parentNode;
  }
  return div.parentNode;
}

export async function swapModalContent(modalContent, toDo) {
  modalContent.style.setProperty("--scrollbar-opacity", 0);
  await pause(100);
  const innerContent = modalContent.querySelector(
    "div[data-overlayscrollbars-viewport]"
  );
  const childBounds = innerContent.childNodes[0];
  innerContent.style.opacity = 0;
  innerContent.style.minHeight = `${innerContent.offsetHeight}px`;
  innerContent.style.maxHeight = `${innerContent.offsetHeight}px`;
  isFunc(toDo) && (await toDo());
  innerContent.style.opacity = "100%";
  innerContent.style.minHeight = `${childBounds.scrollHeight}px`;
  innerContent.style.maxHeight = `${childBounds.scrollHeight}px`;
  await pause(100);
  modalContent.style.setProperty("--scrollbar-opacity", "60%");
  await pause(50);
  innerContent.style.minHeight = null;
  innerContent.style.maxHeight = null;
}

export function getRootHeight(func) {
  document.body.style.setProperty(
    "--device-root-height",
    `${window.innerHeight}px`
  );
  isFunc(func) && func();
}

export function attachOnResize(func) {
  window.onresize = () => {
    document.body.style.setProperty(
      "--device-root-height",
      `${window.innerHeight}px`
    );
    isFunc(func) && func();
  };
}

export function xlsxToJson(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: "array" });
      const firstSheet = workbook.SheetNames[0];
      const jsonData = utils.sheet_to_json(workbook.Sheets[firstSheet]);
      resolve(jsonData);
    };
    reader.onerror = (e) => {
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });
}

export function areCookiesEnabled() {
  let cookieEnabled = navigator.cookieEnabled;
  if (!cookieEnabled) {
    document.cookie = "testcookie";
    cookieEnabled = document.cookie.indexOf("testcookie") !== -1;
    if (cookieEnabled) {
      document.cookie = "testcookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    return cookieEnabled;
  }
  return true;
}

export function toggleActivity(activityId) {
  return activityId === "S" ? "T" : "S";
}

export function prevScenario(moduleId, scenarioId) {
  const scenario = scenarioId.split("_");
  const scenarioNum = parseInt(scenario[1]);
  const moduleNum = parseInt(moduleId.split("_")[1]);
  if (scenarioNum > 1) {
    return `${scenario[0]}_${scenarioNum - 1}`;
  }
  let prevScenarioName = scenario[0];
  if (moduleNum === 5) {
    prevScenarioName = "rearends";
  } else if (moduleNum === 3) {
    prevScenarioName = "intersections";
  } else if (moduleNum === 1) {
    prevScenarioName = "curves";
  }
  return `${prevScenarioName}_6`;
}

export function prevModule(moduleId) {
  const module = moduleId.split("_");
  let prevModule = parseInt(module[1]) - 1;
  if (prevModule < 1) {
    prevModule = 6;
  }
  return `module_${Math.min(prevModule, 6)}`;
}

export function prev({ moduleId = "", scenarioId = "", activityId = "" }) {
  const scenarioNum = parseInt(scenarioId.split("_")[1]);
  const isAM = abbrevSkill(moduleId) === "AM";
  if (activityId === "S" || isAM) {
    if (scenarioNum <= 1) {
      // if first scenario of module, previous module
      return {
        moduleId: prevModule(moduleId),
        scenarioId: prevScenario(moduleId, scenarioId),
        activityId: isAM ? "T" : toggleActivity(activityId),
      };
    } else {
      // not first scenario of module, previous scenario
      return {
        moduleId,
        scenarioId: prevScenario(moduleId, scenarioId),
        activityId: toggleActivity(activityId),
      };
    }
    // not first activity of scenario, previous activity
  } else {
    return {
      moduleId,
      scenarioId,
      activityId: toggleActivity(activityId),
    };
  }
}

export function nextScenario(moduleId, scenarioId) {
  const scenario = scenarioId.split("_");
  const scenarioNum = parseInt(scenario[1]);
  const moduleNum = parseInt(moduleId.split("_")[1]);
  if (scenarioNum < 6) {
    return `${scenario[0]}_${scenarioNum + 1}`;
  }
  let nextScenarioName = scenario[0];
  if (moduleNum === 2) {
    nextScenarioName = "rearends";
  } else if (moduleNum === 4) {
    nextScenarioName = "curves";
  } else if (moduleNum === 6) {
    nextScenarioName = "intersections";
  }
  return `${nextScenarioName}_1`;
}

export function nextModule(moduleId) {
  const module = moduleId.split("_");
  let nextModule = parseInt(module[1]) + 1;
  if (nextModule > 6) {
    nextModule = 1;
  }
  return `module_${Math.max(nextModule, 1)}`;
}

export function next({ moduleId = "", scenarioId = "", activityId = "" }) {
  const scenarioNum = parseInt(scenarioId.split("_")[1]);
  const isAM = abbrevSkill(moduleId) === "AM";
  if (activityId === "T" || isAM) {
    if (scenarioNum >= 6) {
      // if last scenario of module, next module
      return {
        moduleId: nextModule(moduleId),
        scenarioId: nextScenario(moduleId, scenarioId),
        activityId: isAM ? "S" : toggleActivity(activityId),
      };
    } else {
      // not last scenario of module, next scenario
      return {
        moduleId,
        scenarioId: nextScenario(moduleId, scenarioId),
        activityId: toggleActivity(activityId),
      };
    }
    // not last activity of scenario, next activity
  } else {
    return {
      moduleId,
      scenarioId,
      activityId: toggleActivity(activityId),
    };
  }
}

export function calculateProgress(
  moduleId,
  scenarioId,
  activityId,
  isCompleted
) {
  const moduleNum = moduleId.split("_")[1] - 1;
  const scenarioNum = scenarioId.split("_")[1] - 1;
  const activityDone = activityId === "T";
  const percent = (2 * scenarioNum + activityDone) / 12;
  return {
    percentage: isCompleted ? 100 : Math.floor(percent * 100),
    overall: (100 * (moduleNum + percent)) / 6,
  };
}

export function getSkillType(moduleId = "") {
  if (!moduleId) return null;
  const skills = ["Hazard Anticipation", "Attention Maintenance"];
  const moduleNum = parseInt(moduleId.split("_")[1]);
  const skillIdx = moduleNum % 2 || 2;
  return skills[skillIdx - 1];
}

export function getModuleName(moduleId = "") {
  if (!moduleId) return null;
  const moduleNum = moduleId.split("_")[1];
  return `Module ${moduleNum}`;
}

export function getScenarioType(moduleId = "") {
  if (!moduleId) return null;
  const scenarioTypes = ["Intersections", "Rear-Ends", "Curves"];
  const moduleNum = parseInt(moduleId.split("_")[1]) - 1;
  const typeIdx = Math.floor(moduleNum / 2);
  return scenarioTypes[Math.min(typeIdx, 2)];
}

export function getScenarioName(scenarioId = "") {
  if (!scenarioId) return null;
  const scenario = scenarioId.split("_");
  let scenarioType = "";
  if (scenario[0] === "intersections") {
    scenarioType = "Intersections";
  } else if (scenario[0] === "rearends") {
    scenarioType = "Rear-Ends";
  } else {
    scenarioType = "Curves";
  }
  return `${scenarioType} ${scenario[1]}`;
}

export function getActivityName(activityId = "") {
  if (!activityId) return null;
  return activityId === "S" ? "Strategic Activity" : "Tactical Activity";
}

export function getModuleActivityNumber(scenarioId = "", activityId = "") {
  const scenarioNum = scenarioId.split("_")[1];
  return 2 * scenarioNum - (activityId === "S");
}

export function abbrevScenario(scenarioId) {
  const scenarioName = getScenarioName(scenarioId);
  return scenarioName[0] + scenarioName.slice(-1);
}

export function abbrevSkill(moduleId) {
  const skill = getSkillType(moduleId).split(" ");
  return skill[0][0] + skill[1][0];
}

export function getentrance(
  fromProfile = true,
  activityState = defaults.activityState
) {
  const { moduleId, activityId } = activityState;
  if (fromProfile) {
    return "Profile";
  } else {
    return `${getScenarioName(moduleId)}${
      activityId && " - " + getActivityName(activityId)
    }`;
  }
}
