import ProgressBar from "@ramonak/react-progress-bar";
import { IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import { pause } from "../Utils";
import "../styles/progress.css";

/**
 *
 * @param {{
 *    id: string,
 *    className: string,
 *    data: string[],
 *    height: string,
 *    styles: React.CSSProperties
 * }} props
 * @returns {React.JSX.Element}
 */
export function SectionedProgressBar(props) {
  // parse sections to render
  const sectionElements = [];
  const data = props.data || [];
  for (let i = 0; i < data.length; i++) {
    const incorrect = data[i] === "incorrect";
    const state = data[i] || "incomplete";
    sectionElements.push(
      <span className={`section block-${state}`} key={`block-${i}`}>
        {incorrect && <IconX className="incorrect" stroke={3} />}
      </span>
    );
  }

  return (
    <div
      id={props.id}
      className={clsx("section-progress", props.className)}
      num-sections={props.data.length}
      role="progressbar"
      style={{
        ...props.styles,
        "--section-progress-height": props.height,
      }}
    >
      {sectionElements}
    </div>
  );
}

/**
 *
 * @param {{
 *    className: string,
 *    percentage: number,
 *    initPercent: number,
 *    initAnimate: boolean
 * }} props
 * @returns {React.JSX.Element}
 */
export function ContinuousProgressBar(props) {
  const empty = props.percentage === 0 ? "empty" : "";
  const loading = !props.percentage && props.percentage !== 0;
  const loadingTag = loading ? "loading" : "";
  const tags = `${empty} ${loadingTag}`;

  return (
    <ProgressBar
      completed={props.percentage || 0}
      className={clsx("linear-progress", props.className, tags)}
      initCompletedOnAnimation={props.initPercent}
      animateOnRender={props.initAnimate}
      isLabelVisible={false}
    />
  );
}

/**
 *
 * @param {{
 *    id: string,
 *    className: string,
 *    width: string,
 *    stroke: number,
 *    percentage: number,
 *    variant: "light" | "dark",
 *    fgColor: string,
 *    bgColor: string,
 *    hideSymbol: boolean,
 *    counterClockwise: boolean,
 *    styles: React.CSSProperties
 * }} props
 * @returns {React.JSX.Element}
 */
export function CustomCircularProgressBar(props) {
  const variant = props.variant || "light";
  const loading = typeof props.percentage !== "number";
  const loadingTag = loading ? "loading" : "";
  const classTags = `${variant} ${loadingTag}`;
  const [value, setValue] = useState(loading ? 15 : 0);
  const [labelVal, setLabelVal] = useState(-1);
  const [transition, setTransition] = useState("");

  function clamp(num) {
    const lowerBound = Math.max(num, 0);
    return Math.min(lowerBound, 100);
  }

  useEffect(() => {
    async function renderInit() {
      if (!transition) {
        setValue(0);
        await pause(500);
      }
      setTransition("500ms ease");
      setLabelVal(clamp(props.percentage));
      setValue(clamp(props.percentage));
    }
    async function renderLoad() {
      if (value !== 15) {
        setValue(15);
      }
      await pause(500);
      setTransition("");
    }

    if (loading) {
      renderLoad();
    } else {
      renderInit();
    }
  }, [props.percentage]);

  return (
    <div
      id={props.id}
      className={clsx("circular-progress", props.className, classTags)}
      style={{
        ...props.styles,
        "--circular-progress-fg": props.fgColor,
        "--circular-progress-bg": props.bgColor,
        "--circ-max-width": props.width,
        "--circ-stroke-width": props.stroke,
      }}
    >
      <CircularProgressbar
        value={value}
        role="progressbar"
        strokeWidth={props.stroke || 12}
        counterClockwise={props.counterClockwise}
        styles={{
          root: {
            transition: "stroke-dashoffset 500ms ease",
          },
          path: {
            stroke: "var(--circular-progress-fg)",
            transition: transition,
            transformOrigin: "center center",
          },
          trail: {
            stroke: "var(--circular-progress-bg)",
            transformOrigin: "center center",
          },
        }}
      />
      <span className="circular-progress-label">
        <span className="number">
          {loading || labelVal < 0 ? "--" : labelVal}
        </span>
        {!props.hideSymbol && !loading && labelVal > -1 && (
          <span className="percent">%</span>
        )}
      </span>
    </div>
  );
}
