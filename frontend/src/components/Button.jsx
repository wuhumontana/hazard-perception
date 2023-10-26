import Tippy from "@tippyjs/react";
import { clsx } from "clsx";
import { useState } from "react";
import { animateTooltip, isFunc, mouseClick, pause } from "../Utils";
import "../styles/button.css";
import "../styles/colors.css";
import "../styles/tooltips.css";

/**
 * Animated flat button with label and/or icon.
 * @param {{
 *    id: string,
 *    type: string,
 *    className: string,
 *    variant: "light" | "dark" | "secondary",
 *    tag: "pressed" | string,
 *    tippy: {
 *      className: str,
 *      content: str,
 *      hideAfter: number,
 *    }
 *    customRef: function,
 *    label: any,
 *    icon: object,
 *    depth: string,
 *    bgColor: string,
 *    fontSize: string,
 *    toggle: boolean,
 *    onClick: function,
 *    disabled: boolean,
 *    ariaLabel: string,
 *    tabIndex: number,
 *    reverse: boolean,
 *    styles: React.CSSProperties
 * }} props
 * @returns {React.JSX.Element}
 */
export function Button(props) {
  const [active, setActive] = useState("");
  let hoverTimeout = null;
  // check whether given icon is a valid, non-empty object or string
  const objIcon = props.icon && typeof props.icon === "object";
  const strIcon = props.icon && typeof props.icon === "string";
  const validIcon = strIcon || objIcon;
  const tippy = props.tippy || {};

  // parse label as string
  const strLabel = props.label ? `${props.label}` : "";

  // put together the button attributes
  const type = validIcon && props.label ? "icon-" : "";
  const variant = props.variant || "light";
  const emptyTag = !(props.label || validIcon) ? "btn-empty" : "";
  const attr = `${variant} ${emptyTag}`;

  const handleClick = async (event) => {
    event.preventDefault();
    if (!mouseClick(event) && !props.toggle) {
      setActive("active");
      await pause(200);
      setActive("");
    }
    if (!props.disabled && !props.tag) {
      !mouseClick(event) && (await pause(100));
      isFunc(props.onClick) && props.onClick(event);
    }
  };

  return (
    <Tippy
      className={clsx("tooltip btn-tooltip", tippy.className)}
      content={tippy.content}
      onShow={(instance) => {
        animateTooltip(instance, tippy.hideAfter || 2500).then(
          (timeout) => (hoverTimeout = timeout)
        );
      }}
      onHide={(instance) => {
        clearTimeout(hoverTimeout);
        animateTooltip(instance);
      }}
      disabled={!tippy.content}
      duration={100}
    >
      <button
        id={props.id}
        type={props.type || "button"}
        className={clsx("btn", `${type}btn-wrapper`, props.className, attr)}
        onClick={handleClick}
        aria-label={props.ariaLabel || strLabel}
        aria-disabled={props.disabled}
        style={{
          "--btn-depth": props.depth,
          "--btn-bg-color": props.bgColor,
          "--btn-font-size": props.fontSize,
          ...props.styles,
        }}
        disabled={props.disabled}
        tag={props.tag || active}
        tabIndex={props.tabIndex || 0}
        ref={props.customRef}
      >
        <span className="btn-foreground">
          {props.reverse && props.label && <span>{strLabel}</span>}
          {validIcon && <div className="btn-icon">{props.icon}</div>}
          {!props.reverse && props.label && <span>{strLabel}</span>}
          <div className="load-dots" />
        </span>
        <span className="btn-depth" />
        <span className="btn-background" />
      </button>
    </Tippy>
  );
}
