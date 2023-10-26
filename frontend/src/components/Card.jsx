import { IconLock } from "@tabler/icons-react";
import clsx from "clsx";
import { isFunc, keyEnter } from "../Utils";

/**
 *
 * @param {{
 *    id: string,
 *    className: string,
 *    tabIndex: number,
 *    onClick: function,
 *    draggable: boolean,
 *    onDrag: function,
 *    onDragStart: function,
 *    onDragEnd: function,
 *    onMouseOver: function,
 *    onMouseOut: function,
 *    bgColor: string,
 *    width: string,
 *    height: string,
 *    disabled: boolean,
 *    setRef: function,
 *    styles: React.CSSProperties
 * } & React.HTMLProps<HTMLDivElement>} props
 * @returns {React.JSX.Element}
 */
function Card(props) {
  const disabledTag = props.disabled ? "disabled" : "";

  function handleClick(event) {
    isFunc(props.onClick) && props.onClick(event);
  }

  function showDisabledBanner() {
    // TODO
  }

  return (
    <div
      id={props.id}
      className={clsx("card", props.className, disabledTag)}
      tabIndex={props.tabIndex}
      draggable={props.draggable}
      onDrag={props.onDrag}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
      onMouseOver={props.onMouseOver}
      onMouseOut={props.onMouseOut}
      onClick={props.disabled ? null : handleClick}
      onKeyDown={(event) =>
        keyEnter(event, (event) => {
          const btn = event.target.querySelector(".btn");
          if (btn) btn.click(event);
        })
      }
      style={{
        "--default-card-bg-color": props.bgColor,
        width: props.width,
        height: props.height,
        ...props.styles,
      }}
      ref={props.setRef}
    >
      {props.disabled && (
        <IconLock
          className="disabled-lock"
          color="var(--main-text-color)"
          stroke={2.5}
          size="1.7em"
        />
      )}
      {props.children}
    </div>
  );
}

export default Card;
