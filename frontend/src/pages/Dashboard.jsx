import { IconArrowRight, IconCheck, IconSignRight } from "@tabler/icons-react";
import axios from "axios";
import { ClickScrollPlugin, OverlayScrollbars } from "overlayscrollbars";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ServerUrl,
  attachOnResize,
  calculateProgress,
  getActivityName,
  getModuleName,
  getRootHeight,
  getScenarioName,
  getScenarioType,
  getSkillType,
  pause,
} from "../Utils";
import { Button } from "../components/Button";
import ButtonToggle from "../components/ButtonToggle";
import Card from "../components/Card";
import CustomScrollMenu from "../components/CustomScrollMenu";
import ProfileModal from "../components/ProfileModal";
import ProfilePhoto from "../components/ProfilePhoto";
import {
  ContinuousProgressBar,
  CustomCircularProgressBar,
} from "../components/ProgressBar";
import { SVG } from "../components/SVG";
import "../styles/dashboard.css";

function Dashboard() {
  const defaultActivityState = {
    activityId: undefined,
    moduleId: undefined,
    scenarioId: undefined,
    progress: undefined,
  };
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cardListType, setCardlistType] = useState("up-next");
  const [tablet, setTablet] = useState(window.innerWidth <= 690);
  const [mobile, setMobile] = useState(window.innerWidth <= 460);
  const [cardList, setCardList] = useState([]);
  const [activityState, setActivityState] = useState(defaultActivityState);
  const [overallProgress, setOverallProgress] = useState(undefined);
  const navigate = useNavigate();
  const location = useLocation();

  const [userInfo, setUserInfo] = useState(location.state);
  const name = (userInfo && userInfo.firstName) || "";
  OverlayScrollbars.plugin(ClickScrollPlugin);
  document.body.id = "dashboard";
  getRootHeight();

  useEffect(() => {
    if (!userInfo) {
      axios
        .post(
          `${ServerUrl}/users/current-user`,
          {},
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          setUserInfo(res.data.data);
        })
        .catch((err) => console.log(err));
    }
  }, []);

  useEffect(() => {
    async function fetchActivityInfo() {
      if (!userInfo || !userInfo.participantId) return;
      await axios
        .get(`${ServerUrl}/users/${userInfo.participantId}/current-activity`, {
          withCredentials: true,
        })
        .then((res) => {
          const moduleId = res.data.data.moduleId;
          const scenarioId = res.data.data.scenarioId;
          const activityId = res.data.data.activityId;
          const isCompleted = res.data.data.isCompleted;
          const { percentage, overall } = calculateProgress(
            moduleId,
            scenarioId,
            activityId,
            isCompleted
          );
          setActivityState({
            moduleId: moduleId,
            scenarioId: scenarioId,
            activityId: activityId,
            progress: percentage,
          });
          setOverallProgress(overall);
        })
        .catch((err) => {
          if (err.response.status === 404) {
            setActivityState({
              moduleId: "module_1",
              scenarioId: "intersections_1",
              activityId: "S",
              progress: 100,
            });
          }
        });
    }
    fetchActivityInfo();
  }, [userInfo]);

  useEffect(() => {
    getRootHeight();
    attachOnResize(() => {
      setTablet(window.innerWidth <= 690);
      setMobile(window.innerWidth <= 460);
      if (window.innerWidth <= 690) {
        window.scrollTo(0, 0);
      }
    });
  }, []);

  useEffect(() => {
    if (activityState.moduleId) {
      loadSampleCards();
    }
  }, [cardListType, activityState]);

  function loadSampleCards() {
    let include = cardListType === "complete";
    const cards = [];
    for (let i = 1; i <= 6; i++) {
      const module = "module_" + i;
      if (module === activityState.moduleId) {
        include = !include;
        continue;
      }
      if (!include) continue;
      cards.push(
        <Card
          key={i}
          id={module}
          className="dashboard-modules-card"
          bgColor="lightgrey"
          disabled={cardListType === "up-next"}
          onClick={() => {
            const scenario = getScenarioType(module).replace(/-/, "");
            navigate("/scenario", {
              state: {
                ...userInfo,
                timeStarted: Date.now(),
                moduleId: module,
                scenarioId: `${scenario.toLowerCase()}_1`,
                activityId: "S",
              },
            });
          }}
          tabIndex={0}
        >
          <header>{getModuleName(module)}</header>
          <p>{getScenarioType(module)}</p>
        </Card>
      );
    }
    if (!cards.length) {
      // TODO: add placeholder
    }
    fadeCards("out").then(async (list) => {
      await pause(150);
      setCardList([]);
      await pause(100);
      setCardList(cards);
      fadeCards("in", list);
    });
  }

  async function fadeCards(direction, thisList) {
    const list = thisList || document.querySelector(".modules-list");
    const opacity = direction === "out" ? 0 : "100%";
    if (list) {
      list.style.opacity = opacity;
    }
    return list;
  }

  async function continueModule() {
    navigate("/scenario", {
      state: {
        ...userInfo,
        timeStarted: Date.now(),
        ...activityState,
      },
    });
  }

  return (
    <HelmetProvider>
      <OverlayScrollbarsComponent
        className="scroll-container"
        options={{
          scrollbars: {
            clickScroll: true,
          },
        }}
      >
        <Helmet>
          <title>Dashboard | Hazard Perception</title>
        </Helmet>
        <div className="dashboard-cards">
          <div className="dashboard-title">
            <ProfilePhoto
              source="https://www.w3schools.com/howto/img_avatar.png"
              onClick={() => setIsProfileOpen(true)}
            />
            <header
              style={{ opacity: name ? "100%" : 0, transition: "100ms ease" }}
            >
              {tablet ? "Welcome!" : `Welcome, ${name}!`}
            </header>
          </div>
          <Card
            id={activityState.moduleId}
            className="dashboard-main-card"
            height={tablet && "16rem"}
            tabIndex={0}
          >
            <CustomCircularProgressBar
              className="main-card-progress"
              stroke={tablet ? 18 : 13}
              width={tablet ? "7rem" : "15rem"}
              hideSymbol={tablet}
              percentage={activityState.progress}
              variant="light"
            />
            <div
              className="main-card-info"
              style={{ opacity: activityState.moduleId ? "100%" : 0 }}
            >
              <header>{getSkillType(activityState.moduleId)}</header>
              <section>{getScenarioName(activityState.scenarioId)}</section>
              <p>{getActivityName(activityState.activityId)}</p>
            </div>
            <Button
              className="btn-continue-module"
              icon={activityState.moduleId && <IconArrowRight />}
              reverse
              label={
                activityState.moduleId
                  ? (activityState.progress === 0
                      ? "Start"
                      : activityState.progress === 100
                      ? "Review"
                      : "Continue") + (mobile ? "" : " Module")
                  : "Loading..."
              }
              variant="dark"
              bgColor="var(--default-card-bg-color)"
              fontSize={mobile ? "1.7rem" : "1.8rem"}
              onClick={() => continueModule()}
            />
          </Card>
          <Card
            className="dashboard-avatar"
            width="auto"
            height="auto"
            bgColor="transparent"
          >
            <SVG id="avatar-default" />
            <Card className="platform" bgColor="var(--avatar-platform-color)" />
          </Card>
        </div>
        {!tablet && <div className="separator" />}
        <div className="dashboard-modules">
          <div className="dashboard-modules-title">
            <header>
              {tablet ? (
                <span>
                  Your <br /> Activity
                </span>
              ) : (
                <span>
                  Your Trainings <br /> & Activity
                </span>
              )}
            </header>
            <ButtonToggle
              choices={
                mobile
                  ? [<IconCheck stroke={2.6} />, <IconSignRight />]
                  : ["Complete", "Up Next"]
              }
              firstOn={cardListType === "complete"}
              actions={[
                () => setCardlistType("complete"),
                () => setCardlistType("up-next"),
              ]}
              className="modules-button-toggle"
            />
          </div>
          <CustomScrollMenu
            className="modules-list"
            direction={tablet ? "vertical" : "horizontal"}
            defer
          >
            {cardList}
          </CustomScrollMenu>
        </div>
        {!tablet && (
          <Card className="dashboard-modules-progress">
            <span>Progress</span>
            <ContinuousProgressBar initAnimate percentage={overallProgress} />
          </Card>
        )}
        {ProfileModal(isProfileOpen, setIsProfileOpen, userInfo)}
      </OverlayScrollbarsComponent>
    </HelmetProvider>
  );
}

export default Dashboard;
