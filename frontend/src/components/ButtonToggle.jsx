import clsx from "clsx";
import { isFunc } from "../Utils";
import { Button } from "./Button";

/**
 *
 * @param {{
 *    id: string,
 *    className: string,
 *    choices: any[],
 *    firstOn: boolean,
 *    actions: function[],
 *    variant: "light" | "dark" | "secondary",
 *    chosenColor: string,
 *    tabIndex: number,
 *    styles: React.CSSProperties
 * }} props
 * @returns {React.JSX.Element}
 */
function ButtonToggle(props) {
  const variant = props.variant || "secondary";

  // ensure choices is valid array
  let choices = props.choices || ["option 1", "option 2"];
  if (props.choices && !Array.isArray(props.choices)) {
    choices = Array.from(choices);
  }

  // handle choices as labels or icons
  let labels = ["", ""];
  let icons = [null, null];
  for (let i in choices) {
    typeof choices[i] === "string"
      ? (labels[i] = choices[i])
      : (icons[i] = choices[i]);
  }

  // get given functions for choices
  let [func1, func2] = [null, null];
  if (props.actions) {
    func1 = props.actions[0] || props.actions;
    func2 = props.actions[1] || func1;
  }

  function toggle(func, event) {
    isFunc(func) && func(event);
  }

  return (
    <div
      id={props.id}
      className={clsx("btn-toggle", props.className, variant)}
      style={props.styles}
    >
      <Button
        className="choice1"
        label={labels[0]}
        icon={icons[0]}
        onClick={(event) => toggle(func1, event)}
        depth="1.2rem"
        tag={props.firstOn ? "pressed" : null}
        variant={props.variant || (props.firstOn ? "light" : "secondary")}
        styles={{ "--btn-bg-color": props.firstOn && props.chosenColor }}
        tabIndex={props.tabIndex}
      />
      <Button
        className="choice2"
        label={labels[1]}
        icon={icons[1]}
        onClick={(event) => toggle(func2, event)}
        depth="1.2rem"
        tag={!props.firstOn ? "pressed" : null}
        variant={props.variant || (!props.firstOn ? "light" : "secondary")}
        styles={{ "--btn-bg-color": !props.firstOn && props.chosenColor }}
        tabIndex={props.tabIndex + 1}
      />
    </div>
  );
}

export default ButtonToggle;
