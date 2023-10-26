import {
  IconChevronLeft,
  IconChevronRight,
  IconHelp,
  IconLogout2,
} from "@tabler/icons-react";
import axios from "axios";
import { ClickScrollPlugin, OverlayScrollbars } from "overlayscrollbars";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ServerUrl,
  abbrevScenario,
  abbrevSkill,
  attachOnResize,
  copy,
  defaults,
  getActivityName,
  getModuleActivityNumber,
  getModuleName,
  getRootHeight,
  getScenarioName,
  getSubset,
  next,
  pause,
  prev,
} from "../Utils";
import { Button } from "../components/Button";
import Card from "../components/Card";
import FeedbackModal from "../components/FeedbackModal";
import { SectionedProgressBar } from "../components/ProgressBar";
import { SVG } from "../components/SVG";
import { ActivityAM, ActivityHA } from "../components/ScenarioActivities";
import TextBubble from "../components/TextBubble";
import "../styles/layout.css";
import "../styles/scenario.css";
import "../styles/scrollbar.css";
import "../styles/text.css";

function Scenario() {
  const location = useLocation();
  const navigate = useNavigate();

  const defaultActivity = location.state
    ? {
        moduleId: location.state.moduleId,
        scenarioId: location.state.scenarioId,
        activityId: location.state.activityId,
      }
    : {
        moduleId: null,
        scenarioId: null,
        activityId: null,
      };
  const defaultResponseHistory = copy(defaults.responseHistory);
  const defaultInstHA = copy(defaults.instructionsHA);
  const [frameBounds, setFrameBounds] = useState({ height: 0, width: 0 });
  const [frameOpacity, setFrameOpacity] = useState(0);
  const [isDriverView, setIsDriverView] = useState(false);
  const [avatarVariant, setAvatarVariant] = useState("default");
  const [activityState, setActivityState] = useState(defaultActivity);
  const [isCompleted, setIsCompleted] = useState(null);
  const [responses, setResponses] = useState(defaultResponseHistory);
  const [instructionJSON, setInstructionJSON] = useState(defaultInstHA);
  const [currInstructions, setCurrInstructions] = useState([]);
  const [progressBarData, setProgressBarData] = useState([]);
  const [scenarioWindow, setScenarioWindow] = useState(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  document.body.id = "scenario";
  getRootHeight();
  OverlayScrollbars.plugin(ClickScrollPlugin);

  useEffect(() => {
    if (!scenarioWindow) return;
    new ResizeObserver(() => resizeFrame(scenarioWindow)).observe(
      scenarioWindow
    );
    resizeFrame(scenarioWindow).then(() => {
      setFrameOpacity("100%");
      resizeFrame(scenarioWindow);
    });
    attachOnResize(() => {
      resizeFrame(scenarioWindow);
    });
  }, [scenarioWindow]);

  useEffect(() => {
    // fetch instructions for module
    const mid = activityState.moduleId;
    const sid = activityState.scenarioId;
    const aid = activityState.activityId;
    const view = isDriverView ? "driver-view" : "top-view";
    import(`../assets/module-content/${mid}/${sid}/${aid}/instructions.json`)
      .then((response) => {
        setInstructionJSON(response.default);
        const firstInstructions = response.default.instructions[view];
        setCurrInstructions(firstInstructions);
      })
      .catch((err) => {
        /* handle error */
      });
  }, [activityState]);

  useEffect(() => {
    if (!location.state) {
      navigate("/dashboard");
    }
  }, [location.state]);

  useEffect(() => {
    if (!responses.last) return;
    let newInstructions;
    // HA activity
    if (responses.last === "correct") {
      const idx = Math.min(responses.correct, 2) - 1;
      newInstructions = instructionJSON["correct-feedback"][idx];
    } else if (responses.last === "incorrect") {
      const idx = Math.min(responses.incorrect, 4) - 1;
      newInstructions = instructionJSON["incorrect-feedback"][idx];
    }
    // TODO: AM activity
    setCurrInstructions(newInstructions || [""]);
  }, [responses]);

  useEffect(() => {
    if (!activityState.moduleId) return;
    fetchIsCompleted();
    fetchProgressBarData();
    setAvatarVariant(responses.last === "incorrect" ? "incorrect" : "default");
  }, [activityState, responses]);

  useEffect(() => {
    const view = isDriverView ? "driver-view" : "top-view";
    setCurrInstructions(instructionJSON.instructions[view]);
  }, [isDriverView, activityState]);

  async function fetchIsCompleted() {
    const mid = activityState.moduleId;
    const sid = activityState.scenarioId;
    const aid = activityState.activityId;
    const pid = location.state.participantId;
    if (pid && mid && sid && aid) {
      await axios
        .get(
          `${ServerUrl}/users/${pid}/modules/${mid}/scenarios/${sid}/activities/${aid}/`,
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          setIsCompleted(res.data.data.isCompleted);
        })
        .catch((err) => {
          console.log(err);
          /* handle error */
        });
    }
  }

  async function fetchProgressBarData() {
    const mid = activityState.moduleId;
    const pid = location.state.participantId;
    if (mid && pid) {
      await axios
        .get(`${ServerUrl}/users/${pid}/modules/${mid}/status`, {
          withCredentials: true,
        })
        .then((res) => {
          setProgressBarData(res.data.data);
        })
        .catch((err) => {
          console.log(err);
          const isHA = abbrevSkill(activityState.moduleId) === "HA";
          setProgressBarData(Array(isHA ? 12 : 6).fill(null));
          /* handle error */
        });
    }
  }

  function clampFrame(frame) {
    const container = frame.parentNode;
    if (!container) return frameBounds;
    let widthOffset = 0;
    const elementsX = container.childNodes;
    for (let element of elementsX) {
      if (element.style.display === "none") continue;
      if (element && element.offsetWidth && element !== frame) {
        widthOffset += element.offsetWidth;
      }
    }
    let heightOffset = 0;
    const elementsY = container.parentNode.childNodes;
    for (let element of elementsY) {
      if (element && element.offsetHeight && !element.contains(frame)) {
        heightOffset += element.offsetHeight;
      }
    }
    const newBounds = {
      height: window.innerHeight - heightOffset,
      width: window.innerWidth - widthOffset,
    };
    setFrameBounds(newBounds);
    return newBounds;
  }

  async function resizeFrame(frame) {
    let prevBounds = frameBounds;
    let currBounds = clampFrame(frame);
    while (
      prevBounds.height !== currBounds.height ||
      prevBounds.width !== currBounds.width
    ) {
      await pause(10);
      prevBounds = currBounds;
      currBounds = clampFrame(frame);
    }
    clampFrame(frame);
    await pause(10);
    clampFrame(frame);
  }

  async function handleNavigate(event) {
    const btnClass = event.target.className;
    const filter = ["moduleId", "scenarioId", "activityId"];
    const currActivity = getSubset(location.state, filter);
    let newActivity = null;
    if (btnClass.includes("nav-prev")) {
      newActivity = prev(currActivity);
    } else if (btnClass.includes("nav-next")) {
      newActivity = next(currActivity);
    }
    setActivityState(newActivity);
    // we still need this navigate call to keep the state on refresh
    navigate("/scenario", {
      state: {
        ...location.state,
        ...newActivity,
      },
      replace: true,
    });
    setResponses(defaultResponseHistory);
  }

  function handleExit() {
    const filter = ["email", "firstName", "lastName", "participantId", "role"];
    navigate("/dashboard", {
      state: getSubset(location.state, filter),
    });
  }

  return (
    location.state && (
      <HelmetProvider>
        <OverlayScrollbarsComponent
          className="scroll-container"
          options={{
            scrollbars: {
              clickScroll: true,
            },
          }}
          style={{
            opacity: frameOpacity,
            transition: "100ms ease opacity",
          }}
        >
          <Helmet>
            <title>
              {getModuleName(activityState.moduleId) + " - "}
              {abbrevScenario(activityState.scenarioId)}
            </title>
          </Helmet>
          <div className="portrait-content-block">
            <IconMobilePhone />
            <span>Please turn your device</span>
          </div>
          <header className="main">
            <span className="module">
              {getModuleName(activityState.moduleId)}
            </span>
            <span className="scenario">
              <IconChevronRight stroke={2.5} />
              <span>
                {getScenarioName(activityState.scenarioId)}
                {abbrevSkill(activityState.moduleId) === "HA" && (
                  <>
                    <span className="bul">{" \u2022 "}</span>
                    {getActivityName(activityState.activityId)}
                  </>
                )}
              </span>
            </span>
          </header>
          <div
            className="scenario-frame"
            style={{
              "--frame-height": `calc(${frameBounds.height}px - 4.6rem)`,
              "--frame-width": `${frameBounds.width}px`,
            }}
          >
            <Card
              className="mobile-control-left"
              height="auto"
              bgColor="var(--card-bg-color)"
            >
              <Button
                className="scenario-exit"
                variant="dark"
                fontSize="1.5rem"
                bgColor="var(--exit-bg-color)"
                icon={<IconLogout2 stroke={2.2} />}
                label={window.innerWidth > 990 && "Exit"}
                onClick={handleExit}
              />
              <Button
                className="nav-prev"
                variant="dark"
                fontSize="1.5rem"
                bgColor="#a3c8de"
                icon={<IconChevronLeft stroke={2.7} />}
                label={window.innerWidth > 990 && "Prev"}
                onClick={handleNavigate}
              />
            </Card>
            <Card
              className="instructions"
              height="auto"
              bgColor="var(--card-bg-color)"
              styles={{
                flexGrow: frameOpacity ? 1 : 0,
              }}
            >
              <TextBubble
                innerHtml={currInstructions.join("")}
                percentOffset={55}
              />
              <SVG id={`avatar-${avatarVariant}`} className="avatar-model" />
            </Card>
            {abbrevSkill(activityState.moduleId) === "HA" ? (
              <ActivityHA
                setFrame={setScenarioWindow}
                completedState={[isCompleted, setIsCompleted]}
                responseState={[responses, setResponses]}
                activityState={activityState}
                isDriverView={isDriverView}
              />
            ) : (
              <ActivityAM
                setFrame={setScenarioWindow}
                completedState={[isCompleted, setIsCompleted]}
                responseState={[responses, setResponses]}
                activityState={activityState}
              />
            )}
            <Card
              className="mobile-control-right"
              height="auto"
              bgColor="var(--card-bg-color)"
            >
              <Button
                className="nav-next"
                variant="dark"
                fontSize="1.5rem"
                icon={<IconChevronRight stroke={2.7} />}
                label={window.innerWidth > 990 && "Next"}
                onClick={handleNavigate}
                disabled={
                  location.state.role !== "RESEARCHER" &&
                  (isCompleted === false ||
                    getModuleActivityNumber(
                      activityState.scenarioId,
                      activityState.activityId
                    ) === 12)
                }
                reverse
              />
            </Card>
          </div>
          <div className="footer">
            <Button
              className="scenario-exit"
              variant="dark"
              fontSize="1.5rem"
              bgColor="var(--exit-bg-color)"
              icon={<IconLogout2 stroke={2.2} />}
              onClick={handleExit}
              label="Exit"
            />
            <SectionedProgressBar
              className="progress-bar"
              data={progressBarData}
            />
            <Button
              className="feedback-btn"
              variant="dark"
              fontSize="1.5rem"
              bgColor="var(--exit-bg-color)"
              icon={<IconHelp stroke={2.3} />}
              onClick={() => setIsFeedbackOpen(true)}
              tippy={{
                content: "Help & Support",
              }}
              label="Help"
            />
            <div className="separator" />
            <div className="navigation">
              <Button
                className="nav-prev"
                variant="dark"
                fontSize="1.5rem"
                bgColor="#a3c8de"
                icon={<IconChevronLeft stroke={2.7} />}
                onClick={handleNavigate}
              />
              <Button
                className="nav-next"
                variant="dark"
                fontSize="1.5rem"
                icon={<IconChevronRight stroke={2.7} />}
                label="Next"
                onClick={handleNavigate}
                disabled={
                  location.state.role !== "RESEARCHER" &&
                  (isCompleted === false ||
                    getModuleActivityNumber(
                      activityState.scenarioId,
                      activityState.activityId
                    ) === 12)
                }
                reverse
              />
            </div>
          </div>
          <FeedbackModal
            modalState={[isFeedbackOpen, setIsFeedbackOpen]}
            activityState={activityState}
          />
        </OverlayScrollbarsComponent>
      </HelmetProvider>
    )
  );
}

function IconMobilePhone() {
  return (
    <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 265 485">
      <rect x="6.5" y="6.5" width="252" height="472" rx="30.28" ry="30.28" />
      <line x1="72.83" y1="455" x2="192.83" y2="455" />
      <path
        d="M86.83,9h94v12.16c0,3.23-2.62,5.84-5.84,5.84H92.68c-3.23,0-5.84-2.62-5.84-5.84V9h0Z"
        fill="var(--main-fg-color)"
      />
    </svg>
  );
}

export default Scenario;
