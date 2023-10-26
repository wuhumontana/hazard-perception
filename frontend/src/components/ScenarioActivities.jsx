import {
  IconAlertTriangleFilled,
  IconLoader2,
  IconPhoto,
  IconPlayerPlayFilled,
  IconRefresh,
} from "@tabler/icons-react";
import Tippy from "@tippyjs/react";
import axios from "axios";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ServerUrl,
  abbrevSkill,
  animateTooltip,
  isFunc,
  pause,
} from "../Utils";
import driverView from "../assets/driver-view.svg";
import topView from "../assets/top-view.svg";
import Card from "../components/Card";
import { Button } from "./Button";
import { InputHeader } from "./InputField";
import { SVG } from "./SVG";

/**
 * @param {{
 *    responseState: useState,
 *    completedState: useState,
 *    isDriverView: boolean,
 *    setFrame; function,
 *    activityState
 * }} props
 * @returns {React.JSX.Element}
 */
function ActivityHA(props) {
  const { activityState, responseState, completedState } = props;
  const [lastClick, setLastClick] = useState({ x: -1, y: -1 });
  const [clickRadii, setClickRadii] = useState({ x: -1, y: -1 });
  const [dragging, setDragging] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [marker, setMarker] = useState("");
  const [markerTimeout, setMarkerTimeout] = useState(null);
  const [responses, setResponses] = responseState;
  const [isCompleted, setIsCompleted] = completedState;
  const [isDriverView, setIsDriverView] = useState(false);
  const [activityAsset, setActivityAsset] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setIsCompleted(null);
    setIsDriverView(false);
    setClickRadii({ x: -1, y: -1 });
    setLastClick({ x: -1, y: -1 });
  }, [activityState]);

  useEffect(() => {
    if (markerTimeout) {
      clearTimeout(markerTimeout);
    }
    const newTimeout = setTimeout(() => {
      setMarker("");
    }, 500);
    setMarkerTimeout(newTimeout);
  }, [marker]);

  useEffect(() => {
    setClickRadii({ x: -1, y: -1 });
  }, [isDriverView]);

  useEffect(() => {
    // fetch activity img dynamically
    const module = activityState.moduleId;
    const scenario = activityState.scenarioId;
    const activity = activityState.activityId;
    if (isDriverView) {
      import(
        `../assets/module-content/${module}/${scenario}/${activity}/driver-view.png`
      )
        .then((response) => setActivityAsset(response.default))
        .catch((err) => console.log(err));
    } else {
      import(
        `../assets/module-content/${module}/${scenario}/${activity}/top-view.mp4`
      )
        .then((response) => setActivityAsset(response.default))
        .catch((err) => console.log(err));
    }
  });

  function drawEllipse(coordinates, radii) {
    const correctArea = document.querySelector(".correct-area");
    correctArea.style.opacity = 1;
    correctArea.style.position = "absolute";
    correctArea.style.left = `${coordinates.x * 100}%`;
    correctArea.style.top = `${coordinates.y * 100}%`;
    correctArea.style.width = `${radii.x * 200}%`;
    correctArea.style.height = `${radii.y * 200}%`;
    correctArea.style.backgroundColor = "transparent";
    correctArea.style.transform = "translate(-50%, -50%)";
    correctArea.style.borderRadius = "50%";
    correctArea.style.border = "2px solid green";
    correctArea.style.zIndex = 1;
  }

  // take coords of click with respect to scenario window
  async function getClickCoordinates(event) {
    setLastClick({ x: -1, y: -1 });
    setClickRadii({ x: -1, y: -1 });
    const rect = event.target.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) / rect.width;
    const clickY = (event.clientY - rect.top) / rect.height;
    setLastClick({ x: clickX, y: clickY });
    if (event.type !== "click") {
      // remove drag preview
      setDragging(true);
      setMarker("");
      clearTimeout(markerTimeout);
      event.dataTransfer.setDragImage(new Image(), 0, 0);
      return;
    }
    if (!isDriverView || responses.correct >= 2) return;
    const pid = location.state.participantId;
    const mid = activityState.moduleId;
    const sid = activityState.scenarioId;
    const aid = activityState.activityId;
    await axios
      .put(
        `${ServerUrl}/users/${pid}/modules/${mid}/scenarios/${sid}/activities/${aid}/add-answer/`,
        {
          coordinates: { x: clickX, y: clickY },
          timeStarted: location.state.timeStarted,
          timeEnded: Date.now(),
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        // determine correctness
        const activity = res.data.data.activities[aid];
        if (
          activity.isCompleted &&
          activity.lastCorrectIndex === activity.responseStartTimes.length - 1
        ) {
          setCorrect(true);
          setIsCompleted(true);
          setResponses({
            ...responses,
            correct: ++responses.correct,
            last: "correct",
          });
          drawEllipse(activity.hitboxCoordinates, activity.hitboxRadii);
        } else {
          setCorrect(false);
          setResponses({
            ...responses,
            incorrect: ++responses.incorrect,
            last: "incorrect",
          });
        }
        setAnswered(true);
        setMarker("visible");
      })
      .catch((err) => {
        console.log(err);
        // handle expired session
      });
  }

  function getClickRadii(event) {
    if (!isDriverView || responses.correct >= 2) return;
    if (!event.screenX && !event.screenY) return;
    const rect = event.target.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) / rect.width;
    const clickY = (event.clientY - rect.top) / rect.height;
    const radiusX = Math.abs(clickX - lastClick.x);
    const radiusY = Math.abs(clickY - lastClick.y);
    setClickRadii({ x: radiusX, y: radiusY });
  }

  return (
    <>
      <PlayerWindow
        src={activityAsset}
        animated={!isDriverView}
        onClick={getClickCoordinates}
        onDrag={getClickRadii}
        onDragStart={getClickCoordinates}
        onDragEnd={() => {
          if (clickRadii.x < 0 || clickRadii.y < 0) return;
          console.log("coords:", lastClick);
          console.log("radius:", clickRadii);
          setDragging(false);
        }}
        draggable={isDriverView}
        setFrame={props.setFrame}
        skillType="HA"
        autoStart
        loop
      >
        {clickRadii.x >= 0 && (
          <div
            className="correct-overlay"
            style={{
              top: `${lastClick.y * 100}%`,
              left: `${lastClick.x * 100}%`,
              height: `${clickRadii.y * 200}%`,
              width: `${clickRadii.x * 200}%`,
            }}
          />
        )}
        {
          <div
            className="correct-area"
            style={{
              opacity:
                isDriverView && responses.last === "correct" ? "100%" : "0%",
            }}
          />
        }
        {answered && !dragging && (
          <div
            className={clsx("click-marker", marker && "visible")}
            style={{
              top: `${lastClick.y * 100}%`,
              left: `${lastClick.x * 100}%`,
              backgroundColor: correct
                ? "var(--correct-bg-color)"
                : "var(--wrong-bg-color)",
            }}
          />
        )}
      </PlayerWindow>
      <Card
        className="scenario-views"
        height="auto"
        bgColor="var(--card-bg-color)"
      >
        <header>Views</header>
        <ViewSVG
          className="driver"
          label="Driver view"
          svgSrc={driverView}
          onClick={() => setIsDriverView(true)}
          styles={{
            btn: {
              outlineColor: isDriverView && "var(--main-fg-color)",
            },
            img: {
              opacity: isDriverView ? "100%" : "50%",
            },
          }}
        />
        <ViewSVG
          className="top"
          label="Top view"
          svgSrc={topView}
          onClick={() => setIsDriverView(false)}
          styles={{
            btn: {
              outlineColor: !isDriverView && "var(--main-fg-color)",
            },
            img: {
              opacity: isDriverView ? "50%" : "100%",
            },
          }}
        />
        {abbrevSkill(activityState.moduleId) === "AM" && (
          <>
            <header style={{ marginTop: "auto" }}>Rear View</header>
            <Button
              className="rvm-toggle"
              icon={<IconPhoto stroke={1.5} />}
              variant="dark"
              fontSize="4rem"
              bgColor="#a6c0f3"
              styles={{ width: "100%" }}
              onClick={() => setMirrorView(!mirrorView)}
              disabled={mirrorDisabled}
            />
          </>
        )}
      </Card>
    </>
  );
}

/**
 *
 * @param {{
 *    responseState: useState,
 *    completedState: useState,
 *    isDriverView: boolean,
 *    isMirrorView: boolean,
 *    setFrame: function,
 *    onPause: function,
 *    onPlay: function,
 *    activityState
 * }} props
 * @returns
 */
function ActivityAM(props) {
  const { activityState, responseState, completedState } = props;
  const [activityVid, setActivityVid] = useState(null);
  const [rearViewImg, setRearViewImg] = useState(null);
  const [mirrorView, setMirrorView] = useState(false);
  const [mirrorDisabled, setMirrorDisabled] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [retried, setRetried] = useState(false);

  const [currRvmTime, setCurrRvmTime] = useState(0);
  const [rvmIntervals, setRvmIntervals] = useState([]);
  const [rvmForbid, setRvmForbid] = useState(false);
  const [vidDuration, setVidDuration] = useState(20); // axios get
  const [startTime, setStartTime] = useState(-1);
  const [dangerAlert, setDangerAlert] = useState(null);
  const [activityError, setActivityError] = useState(null);

  const GlanceErr = {
    tooLong: "too long",
    duringDanger: "dangerous glance",
    tooLongAndDanger: "too long & dangerous glance",
  };

  const ResponseErr = {
    incorrectResponse: "incorrect response",
  };

  const forbiddenIntervals = [
    // axios get
  ];

  function radioBtn(option) {
    const optionStr = `${option}`;
    const onClick = () => setSelectedChoice(optionStr);
    return (
      <span
        className={clsx(
          "radio-btn",
          selectedChoice === optionStr && "selected"
        )}
        tabIndex={0}
        onClick={onClick}
      >
        <Button
          id={optionStr}
          className="choice"
          icon={<div className="indicator" />}
          depth="0.4rem"
          fontSize="1.4rem"
          variant={selectedChoice !== optionStr && "secondary"}
          tabIndex={-1}
          tag={selectedChoice === optionStr && "pressed"}
          toggle
        />
        <label htmlFor={optionStr}>{optionStr}</label>
      </span>
    );
  }

  useEffect(() => {
    console.log(activityError);
  }, [activityError]);

  useEffect(() => {
    if (mirrorView) {
      setCurrRvmTime(Date.now());
    } else if (currRvmTime) {
      const start = (currRvmTime - startTime) / 1000;
      const end = (Date.now() - startTime) / 1000;
      const newGlance = {
        start: +start.toFixed(3),
        end: +end.toFixed(3),
      };
      rvmIntervals.push(newGlance);
      checkGlance(newGlance);
    }
  }, [mirrorView]);

  useEffect(() => {
    // fetch activity img dynamically
    const module = activityState.moduleId;
    const scenario = activityState.scenarioId;

    async function importAssets() {
      setMirrorDisabled(true);
      if (mirrorView || showQuestion) {
        setMirrorView(false);
        setShowQuestion(false);
        await pause(700);
      }
      setSelectedChoice(null);
      setPlaying(false);
      setRetried(false);
      setActivityVid(null);
      setRearViewImg(null);
      await import(
        `../assets/module-content/${module}/${scenario}/driver-view.mp4`
      )
        .then((response) => setActivityVid(response.default))
        .catch((err) => console.log(err));

      await import(
        `../assets/module-content/${module}/${scenario}/rear-view.png`
      )
        .then((response) => setRearViewImg(response.default))
        .catch((err) => console.log(err));
    }
    importAssets();
    setCurrRvmTime(0);
    setRvmIntervals([]);
    setActivityError(null);
    clearInterval(dangerAlert);
    setRvmForbid(false);
  }, [activityState.scenarioId]);

  function startShowDanger(thisStartTime) {
    let idx = 0;
    let currDanger;
    setDangerAlert(
      setInterval(() => {
        currDanger = forbiddenIntervals[idx];
        const currProgress = (Date.now() - thisStartTime) / 1000;
        if (currDanger && currDanger.start > currProgress) {
          setRvmForbid(false);
        } else if (
          currDanger &&
          currDanger.start <= currProgress &&
          currDanger.end > currProgress
        ) {
          setRvmForbid(true);
        } else if (currDanger && currDanger.end < currProgress) {
          setRvmForbid(false);
          const nextDanger = forbiddenIntervals[idx + 1];
          if (nextDanger && nextDanger.start < currProgress) {
            idx++;
          }
        } else {
          setRvmForbid(false);
        }
      }, 100)
    );
  }

  function checkGlance(glance) {
    const glanceTime = +(glance.end - glance.start).toFixed(3);
    const firstForbid = forbiddenIntervals[0];
    const lastForbid = forbiddenIntervals.slice(-1)[0];

    if (!forbiddenIntervals.length) {
      if (glanceTime <= 2) {
        // no danger, good length (VALID)
        return true;
      } else {
        // no danger, too long
        setActivityError(GlanceErr.tooLong);
        return false;
      }
    }

    for (const forbidIdx in forbiddenIntervals) {
      const prevForbid = forbiddenIntervals[forbidIdx];
      const nextForbid = forbiddenIntervals[parseInt(forbidIdx) + 1];

      // glance before any dangerous interval
      const beforeFirst = !firstForbid || glance.end < firstForbid.start;

      // glance between dangerous intervals
      const startBetween = prevForbid && glance.start > prevForbid.end;
      const endBetween = nextForbid && glance.end < nextForbid.start;
      const fullyBetween = startBetween && endBetween;

      // glance after all dangerous interval
      const afterLast = !lastForbid || glance.start > lastForbid.end;

      if (beforeFirst || fullyBetween || afterLast) {
        if (glanceTime <= 2) {
          // good timing, good length (VALID)
          return true;
        } else {
          // good timing, too long
          setActivityError(GlanceErr.tooLong);
          return false;
        }
      }
    }

    if (glanceTime <= 2) {
      // bad timing, good length
      setActivityError(GlanceErr.duringDanger);
    } else {
      // bad timing, too long
      setActivityError(GlanceErr.tooLongAndDanger);
    }
    return false;
  }

  return (
    <>
      <PlayerWindow
        className={[mirrorView && "unfocused", showQuestion && "question"]}
        src={activityVid}
        setFrame={props.setFrame}
        skillType="AM"
        animated
        playState={[playing, setPlaying]}
        resetState={[retried, setRetried]}
        onPlay={() => {
          setMirrorDisabled(false);
          const time = Date.now();
          setStartTime(time);
          setActivityError(null);
          startShowDanger(time);
        }}
        onPause={() => {
          setMirrorView(false);
          setMirrorDisabled(true);
          clearInterval(dangerAlert);
          setRvmForbid(false);
        }}
        onEnded={() => {
          setStartTime(-1);
          if (!activityError) {
            pause(500).then(() => {
              setShowQuestion(true);
            });
          } else {
            // TODO: show error
            console.log("SHOW ERROR HERE");
          }
        }}
      >
        <div className={clsx("question-choices", showQuestion && "visible")}>
          <header className="Q">
            <h2>Review Question</h2>
            <p>
              Select the correct response below. Example question, did the quick
              brown fox jump over the lazy dog?
            </p>
          </header>
          <form className="choices">
            {radioBtn("Box 2")}
            {radioBtn("Box 7")}
            {radioBtn("Box 10")}
            {radioBtn("Box 5")}
            <Button
              type="submit"
              fontSize="1.5rem"
              label="Check Answer"
              className="submit-choice"
              variant={!selectedChoice && "secondary"}
              disabled={!selectedChoice}
              onClick={() => console.log(selectedChoice)} // TODO
            />
          </form>
        </div>
        <div className={clsx("rvm", mirrorView && "visible")}>
          <SVG id="rear-view-mirror" />
          <div className="rvm-grid">
            <img src={rearViewImg} />
          </div>
        </div>
        <Tippy
          className="tooltip view-tooltip"
          content="Eyes on the road!"
          onShow={animateTooltip}
          onHide={animateTooltip}
          disabled={!rvmForbid}
          hideOnClick={false}
          popperOptions={{
            modifiers: [
              {
                name: "preventOverflow",
                options: {
                  boundary: document.querySelector(".scenario-window"),
                },
              },
            ],
          }}
        >
          <IconAlertTriangleFilled
            className="danger-alert"
            style={{
              opacity: rvmForbid ? "100%" : 0,
            }}
            focusable
          />
        </Tippy>
      </PlayerWindow>
      <Card
        className="scenario-views"
        height="auto"
        bgColor="var(--card-bg-color)"
      >
        <header>Controls</header>
        <InputHeader
          className={mirrorView ? "on" : "off"}
          label={mirrorView ? "RVM On" : "RVM Off"}
          style={{ opacity: playing ? "100%" : 0, marginTop: "auto" }}
        />
        <Button
          className="rvm-toggle"
          icon={
            <SVG
              id={`rvm-icon-${
                mirrorDisabled ? "off" : mirrorView ? "off" : "on"
              }`}
            />
          }
          fontSize="4.5rem"
          variant="dark"
          bgColor="#a3c8de"
          styles={{ width: "100%" }}
          onClick={() => setMirrorView(!mirrorView)}
          disabled={mirrorDisabled || !playing}
          tippy={{
            content: mirrorView ? "Leave Rear-View" : "Check Rear-View",
          }}
        />
        <Button
          className={playing || showQuestion ? "reset" : "play"}
          fontSize="1.7rem"
          variant="dark"
          bgColor="#a6c0f3"
          styles={{ width: "100%" }}
          disabled={playing && retried}
          label={playing || showQuestion ? "Reset" : "Start"}
          icon={
            playing || showQuestion ? (
              <IconRefresh stroke={2.5} />
            ) : (
              <IconPlayerPlayFilled />
            )
          }
          onClick={() => {
            if (playing || showQuestion) {
              setRetried(true);
              setPlaying(false);
              setShowQuestion(false);
              setActivityError(null);
              setRvmIntervals([]);
              setStartTime(-1);
            } else {
              setPlaying(true);
            }
          }}
          tippy={{
            content: playing ? "Retry Activity" : "Begin Activity",
          }}
        />
      </Card>
    </>
  );
}

/**
 * @param {{
 *    src: string,
 *    skillType: "HA" | "AM",
 *    className: string,
 *    draggable: boolean,
 *    autoStart: boolean,
 *    resetState: useState,
 *    playState: useState,
 *    animated: boolean,
 *    loop: boolean,
 *    onClick: function,
 *    onDrag: function,
 *    onDragStart: function,
 *    onDragEnd: function,
 *    onPause: function,
 *    onPlay: function,
 *    onEnded: function,
 *    setFrame: function,
 *    seekable: boolean,
 *    styles: React.CSSProperties
 * }} props
 * @returns {React.JSX.Element}
 */
function PlayerWindow(props) {
  const [loading, setLoading] = useState(true);
  const [resetPlay, setResetPlay] = props.resetState || useState(false);
  const [playing, setPlaying] = props.playState || useState(props.autoStart);
  const [mediaPlayer, setMediaPlayer] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const stopDrag = { onDragStart: (event) => event.preventDefault() };

  useEffect(() => {
    setLoading(true);
    if (!props.src) {
      setMediaType(null);
      return;
    }
    const extension = props.src.split(".").pop();
    setMediaType(extension);
  }, [props.src]);

  useEffect(() => {
    if (!mediaPlayer) return;
    if (playing) {
      mediaPlayer.play();
    } else {
      mediaPlayer.pause();
    }
  }, [playing]);

  useEffect(() => {
    if (!mediaPlayer) return;
    if (mediaPlayer.currentTime === 0) {
      setResetPlay(false);
    } else if (resetPlay) {
      mediaPlayer.currentTime = 0;
    }
  }, [resetPlay]);

  return (
    <Card
      className={clsx(
        "scenario-window",
        props.className,
        playing && "playing",
        loading && "loading"
      )}
      bgColor="#A7BAD1"
      onClick={props.onClick}
      onDrag={props.onDrag}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
      draggable={props.src && props.draggable}
      styles={{
        ...props.styles,
        cursor: (props.animated || loading) && "auto",
      }}
      setRef={props.setFrame}
    >
      {mediaType === "png" && (
        <img
          className="media-player"
          src={props.src}
          alt="scenario image"
          draggable={false}
          onLoad={() => setLoading(false)}
        />
      )}
      {mediaType === "mp4" && (
        <video
          className="media-player"
          name="media"
          ref={setMediaPlayer}
          src={props.src}
          onPlay={props.onPlay}
          onPause={props.onPause}
          autoPlay={props.autoStart}
          onLoadedData={() => setLoading(false)}
          onEnded={(event) => {
            isFunc(props.onEnded) && props.onEnded(event);

            if (props.loop && mediaPlayer) {
              mediaPlayer.currentTime = 0;
              mediaPlayer.play();
            } else {
              setPlaying(false);
            }
          }}
          {...stopDrag}
          muted
        >
          <source src={props.src} type="video/mp4" />
        </video>
      )}
      <IconLoader2 className="player loader" style={{ opacity: 0 }} />
      {props.children}
    </Card>
  );
}

/**
 *
 * @param {{
 *    className: string,
 *    onClick: function,
 *    svgSrc: string,
 *    styles: {
 *      btn: React.CSSProperties,
 *      img: React.CSSProperties
 *    }
 * }} props
 * @returns {React.JSX.Element}
 */
function ViewSVG(props) {
  const click = (event) => {
    if (typeof props.onClick === "function") {
      props.onClick(event);
    }
  };

  return (
    <Tippy
      className="tooltip view-tooltip"
      content={props.label || "View"}
      onShow={animateTooltip}
      onHide={animateTooltip}
      duration={100}
    >
      <button
        className={clsx("scenario-view", props.className)}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 158 106.63"
        style={props.styles.btn}
        onClick={click}
      >
        <img src={props.svgSrc} style={props.styles.img} />
      </button>
    </Tippy>
  );
}

export { ActivityAM, ActivityHA };
