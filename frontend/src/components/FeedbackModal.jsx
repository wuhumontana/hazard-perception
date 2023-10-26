import React, { useState } from "react";
import { pause } from "../Utils";
import FeedbackForm from "./FeedbackForm";
import CustomModal from "./Modal";

/**
 * @template T
 * @typedef {[T, React.Dispatch<React.SetStateAction<T>>]} useState
 * @param {{
 *    modalState: useState<boolean>,
 *    activityState: {
 *      moduleId: str,
 *      scenarioId: str,
 *      activityId: str,
 *    }
 * }} props
 * @returns
 */
function FeedbackModal(props) {
  const [formOpen, setFormOpen] = useState(true);
  const [modalOpen, setModalOpen] = props.modalState;

  async function closeModal(event) {
    await pause(100);
    event.preventDefault();
    setModalOpen(false);
    await pause(200);
  }

  return (
    <CustomModal
      id="feedback-modal"
      className="feedback-modal"
      title={"Help & Feedback"}
      contentClassName="feedback-form"
      contentLabel="Feedback Modal"
      isOpen={modalOpen}
      close={closeModal}
      focusOnOpen
      scrollVisible="var(--show-scroll)"
    >
      <FeedbackForm
        modalState={[modalOpen, setModalOpen]}
        formOpenState={[formOpen, setFormOpen]}
        activityState={props.activityState}
      />
    </CustomModal>
  );
}

export default FeedbackModal;
