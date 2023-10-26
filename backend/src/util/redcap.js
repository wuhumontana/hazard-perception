import UserDao from "../data/UserDao.js";
import axios from "axios";
import { validateUserInformationComplete } from "./validators.js";
import REDCapRecord from "../model/REDCapRecord.js";

export function scheduleSyncREDCap() {
  setTimeout(() => {
    sycREDCap();
    setInterval(sycREDCap, 24 * 60 * 60 * 1000); // 24 hours
  }, getNextRunTime());
}

function getNextRunTime() {
  const now = new Date();
  const targetTime = new Date(now);
  targetTime.setDate(
    now.getHours() >= 4 ? targetTime.getDate() + 1 : targetTime.getDate()
  );
  targetTime.setHours(4, 0, 0, 0); // Setting time to 4:00 AM
  return targetTime - now;
}

async function sycREDCap() {
  console.log("Start sync information to REDCap...");
  const start = Date.now();
  try {
    const userDao = new UserDao();
    const users = await userDao.findAllUsers();
    let items = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      let record = new REDCapRecord(
        user.participantId,
        user.firstName,
        user.lastName,
        user.email,
        user.role,
        user.dateJoined,
        user.isActivated === true ? "1" : "0",
        validateUserInformationComplete(user) === true ? "2" : "0"
      );
      assignTestingProgress(record, user);
      items[i] = record;
    }
    const form = new FormData();
    form.append("token", process.env.REDCAP_API_TOKEN);
    form.append("content", "record");
    form.append("format", "json");
    form.append("data", JSON.stringify(items));
    axios
      .post(process.env.REDCAP_API_URL, form)
      .then((response) => {
        console.log("HTTP Status:", response.status);
        console.log(response.data);
        const end = Date.now();
        const timeTaken = end - start;
        console.log(`Sync was successful! Time consuming:${timeTaken} ms`);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } catch (error) {
    console.error("Error executing sync:", error);
  }
}

function assignTestingProgress(record, user) {
  let completedCount = 0;
  const moduleName = {
    1: "intersections_ha",
    2: "intersections_am",
    3: "rear_end_ha",
    4: "rear_end_am",
    5: "curves_ha",
    6: "curves_am",
  };
  const scenarioPrefixes = {
    1: "intersections_",
    2: "intersections_",
    3: "rearends_",
    4: "rearends_",
    5: "curves_",
    6: "curves_",
  };
  const activities = {
    1: "S",
    2: "T",
  };

  // Modules
  for (let i = 1; i <= 6; i++) {
    const moduleId = "module_" + i;
    const moduleField = "is_completed_" + moduleName[i];
    record[moduleField] = user.modules?.get(moduleId)?.isCompleted === true ? "1" : "0";
    
    // Scenarios
    for (let j = 1; j <= 6; j++) {
      const scenarioId = scenarioPrefixes[i] + j;
      if(i == 1 || i == 3 || i == 5){
        for (let k in activities) {
          const activityField = `${moduleName[i]}___${j}_${activities[k].toLowerCase()}`;
          const isCompleted =
            user.modules
              ?.get(moduleId)
              ?.get("scenarios")
              ?.get(scenarioId)
              ?.get("activities")
              ?.get(activities[k])?.isCompleted ?? false;
          if (isCompleted) {
            completedCount++;
            record[activityField] = "1";
          } else
              record[activityField] = "0";
        }
      }
      if(i == 2 || i == 4 || i == 6){
        const activityField = `${moduleName[i]}___${j}`;
        const isCompleted =
          user.modules
            ?.get(moduleId)
            ?.get("scenarios")
            ?.get(scenarioId)
            ?.get("activities")
            ?.isCompleted ?? false;
        if (isCompleted) {
          completedCount++;
          record[activityField] = "1";
        } else 
            record[activityField] = "0";
      }
    }
  }
  // Assign testing_progress_complete, is_completed_all, and percentage_completion
  if (completedCount == 54) {
    record.testing_progress_complete = "2";
    record.is_completed_all = "1";
  } else {
    record.testing_progress_complete = "0";
    record.is_completed_all = "0";
  }
  record.percentage_completion = ((completedCount / 54) * 100).toFixed(2) + "%";
  return completedCount;
}
