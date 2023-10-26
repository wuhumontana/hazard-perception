import { IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { ClickScrollPlugin, OverlayScrollbars } from "overlayscrollbars";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  ModalContext,
  focusFirstField,
  isFunc,
  keyEnter,
  pause,
} from "../Utils";
import "../styles/colors.css";
import "../styles/modal.css";
import "../styles/scrollbar.css";

/**
 * Responsive, styled modal window.
 * @param {{
 *    id: string,
 *    className: string,
 *    contentClassName: string,
 *    title: string,
 *    customWidth: string,
 *    hideHeader: boolean,
 *    isOpen: boolean,
 *    close: function,
 *    afterOpen: function,
 *    afterClose: function,
 *    contentLabel: string,
 *    ariaHideApp: boolean,
 *    focusOnOpen: boolean,
 *    getContent: function,
 *    onScrollEnd: function,
 *    overlayStyles: React.CSSProperties,
 *    contentStyles: React.CSSProperties
 * }} props
 * @returns {React.JSX.Element}
 */
function CustomModal(props) {
  const [modalContent, setModalContent] = useState(null);
  OverlayScrollbars.plugin(ClickScrollPlugin);

  useEffect(() => {
    if (!modalContent) return;
    isFunc(props.getContent) && props.getContent(modalContent);
    if (!props.focusOnOpen) return;
    pause(350).then(() => {
      focusFirstField(modalContent);
    });
  }, [modalContent]);

  function getContent(modal) {
    const content = modal.querySelector(".modal-content");
    if (content) setModalContent(content);
  }

  function afterOpen(event) {
    getContent(event.contentEl);
    isFunc(props.afterOpen) && props.afterOpen(event);
  }

  return (
    <Modal
      id={props.id || ""}
      className="modal-container-shadow"
      isOpen={props.isOpen}
      onAfterOpen={afterOpen}
      onRequestClose={props.close}
      onAfterClose={props.afterClose}
      contentLabel={props.contentLabel}
      ariaHideApp={props.ariaHideApp || false}
      overlayClassName="modal modal-overlay"
      closeTimeoutMS={200}
      style={{
        overlay: {
          ...props.overlayStyles,
        },
        content: {
          ...props.contentStyles,
          "--modal-width": props.customWidth,
        },
      }}
    >
      <div className={clsx("modal modal-container", props.className)}>
        {!props.hideHeader && (
          <header>
            <p>{props.title || "Modal Title"}</p>
            <IconX
              onClick={props.close}
              tabIndex={0}
              stroke={2}
              onKeyDown={(event) => keyEnter(event, props.close)}
            />
          </header>
        )}
        <div className={clsx("modal-content", props.contentClassName)}>
          <ModalContext.Provider value={modalContent}>
            {props.children && (
              <OverlayScrollbarsComponent
                element={props.scrollElement || "form"}
                className="scroll-container"
                options={{
                  scrollbars: {
                    clickScroll: true,
                  },
                }}
                defer
              >
                <div className="modal-content-bounds">{props.children}</div>
              </OverlayScrollbarsComponent>
            )}
          </ModalContext.Provider>
        </div>
      </div>
    </Modal>
  );
}

export default CustomModal;
