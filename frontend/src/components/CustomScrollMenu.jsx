import clsx from "clsx";
import { ClickScrollPlugin, OverlayScrollbars } from "overlayscrollbars";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import { useState } from "react";
import { duplicate, pause } from "../Utils";
import "../styles/layout.css";

/**
 *
 * @param {{
 *    className: string,
 *    endPadding: string,
 *    defer: boolean
 * }} props
 * @returns
 */
function CustomScrollMenu(props) {
  const [opacity, setOpacity] = useState(0);
  OverlayScrollbars.plugin(ClickScrollPlugin);

  function getInstance(thisInstance) {
    if (!thisInstance) return;
    const element = thisInstance.getElement();
    if (element) {
      const container = element.querySelector(".container");
      if (container) animateCards(container);
    }
  }

  // fade in contents of list on load
  async function animateCards(container) {
    await pause(200);
    setOpacity("100%");
    for (let card of container.children) {
      let opacity = "100%";
      if (card.classList.contains("disabled")) {
        opacity = "70%";
      }
      card.style.opacity = opacity;
      await pause(20);
    }
  }

  return (
    <OverlayScrollbarsComponent
      className={clsx("scroll-list", props.className, props.direction)}
      options={{
        scrollbars: {
          autoHide: "move",
          autoHideDelay: 1000,
          clickScroll: true,
        },
      }}
      style={{
        "--end-padding": props.endPadding,
        opacity: opacity,
      }}
      ref={getInstance}
      defer={props.defer}
    >
      <div className="rounded-mask" />
      <div className={clsx("container", props.direction)}>{props.children}</div>
      <span className={clsx("scroll-list-edge", props.direction)}>
        {duplicate(<div />, 5)}
      </span>
    </OverlayScrollbarsComponent>
  );
}

export default CustomScrollMenu;
