import { IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useContext, useEffect, useState } from "react";
import { BannerContext, pause } from "../Utils";
import "../styles/banner.css";

function Banner() {
  const defaultBanner = { icon: null, text: "" };
  const [nextContent, setNextContent] = useContext(BannerContext);
  const [bannerContent, setBannerContent] = useState(nextContent);
  const [timeoutId, setTimeoutId] = useState(null);
  const [empty, setEmpty] = useState(true);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (
      nextContent.icon === bannerContent.icon &&
      nextContent.text === bannerContent.text &&
      !empty
    ) {
      clearTimeout(timeoutId);
      setTimeoutId(delayClose());
      return;
    }
    if (!nextContent.icon && !nextContent.text) {
      setEmpty(true);
      pause(500).then(() => setBannerContent(defaultBanner));
    } else {
      loadNewContent();
    }
  }, [nextContent]);

  useEffect(() => {
    if (empty && timeoutId) {
      // banner closed manually
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [empty, timeoutId]);

  async function loadNewContent() {
    if (!empty) {
      setFlash(true);
      pause(200).then(() => setFlash(false));
    } else if (bannerContent.icon || bannerContent.text) {
      // wait for fare-out of previous
      await pause(500);
    }
    setBannerContent(nextContent);
    setEmpty(false);
    clearTimeout(timeoutId);
    setTimeoutId(delayClose());
  }

  function close() {
    setNextContent(defaultBanner);
  }

  function delayClose() {
    // auto close after 8s
    return setTimeout(() => {
      setTimeoutId(null);
      close();
    }, 8000);
  }

  return (
    <div
      className={clsx(
        "banner banner-wrapper",
        empty && "hidden",
        flash && "flash"
      )}
    >
      <span className="banner-content">
        <div className="banner-icon">{bannerContent.icon}</div>
        <OverlayScrollbarsComponent
          className="banner-text"
          options={{
            scrollbars: {
              autoHide: "move",
              autoHideDelay: 1000,
              clickScroll: true,
            },
          }}
        >
          {bannerContent.text}
        </OverlayScrollbarsComponent>
        <div className="banner-close" onClick={close}>
          <IconX stroke={2.2} pointerEvents="none" />
        </div>
        <span className="banner-overlay" />
      </span>
    </div>
  );
}

export default Banner;
