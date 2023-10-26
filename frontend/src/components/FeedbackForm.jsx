import { IconThumbUp } from "@tabler/icons-react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ModalContext,
  ServerUrl,
  getentrance,
  pause,
  setLoading,
  shake,
  stopLoading,
  swapModalContent,
} from "../Utils";
import "../styles/dashboard.css";
import "../styles/input.css";
import { Button } from "./Button";
import InputField, { SelectField } from "./InputField";

/**
 * @template T
 * @typedef {[T, React.Dispatch<React.SetStateAction<T>>]} useState
 * @param {{
 *    modalState: useState<boolean>,
 *    formOpenState: useState<boolean>,
 *    fromProfile: boolean,
 *    activityState: {
 *      moduleId: str,
 *      scenarioId: str,
 *      activityId: str,
 *    },
 * }} props
 * @returns {React.JSX.Element}
 */
function FeedbackForm(props) {
  const options = ["Bug Report", "Suggestion", "Support", "Other"];
  const desc = {
    "Bug Report": [
      "Please describe the issue here.",
      "Provide as much detail as possible,",
      "however make sure not to include any",
      "personal info or sensitive data.",
    ],
    Suggestion: ["Tell us what's on your mind..."],
    Support: ["Let us know how we can help..."],
    Other: ["Please describe your concern."],
  };
  const defaultState = {
    form: { category: options[0], content: "" },
    error: { category: "", content: "" },
  };
  const [success, setSuccess] = useState(false);
  const [modalOpen, setModalOpen] = props.modalState;
  const [formOpen, setFormOpen] = props.formOpenState;
  const { moduleId, scenarioId, activityId } = props.activityState || {};

  // form input and errors for username, password
  const [feedbackForm, setFeedbackForm] = useState(defaultState.form);
  const [feedbackErr, setFeedbackErr] = useState(defaultState.error);
  const modalContent = useContext(ModalContext);

  useEffect(() => {
    if (!formOpen) {
      setFeedbackForm(defaultState.form);
      setFeedbackErr(defaultState.error);
      setSuccess(false);
    }
  }, [formOpen]);

  function formInput(event) {
    const input = event.target;
    if (input) {
      setFeedbackForm({
        ...feedbackForm,
        [input.id]: input.value,
      });
    }
  }

  async function handleCancel() {
    if (feedbackForm.content) {
      setFeedbackForm(defaultState.form);
      setFeedbackErr(defaultState.error);
      await pause(200);
    }
    const modalClass = modalContent.classList;
    if (modalClass.contains("feedback-form")) {
      setModalOpen(false);
    } else {
      swapModalContent(modalContent, async () => {
        await pause(150);
        setFormOpen(false);
        await pause(100);
      });
    }
  }

  async function handleSuccess() {
    setFeedbackErr(defaultState.error);
    await swapModalContent(modalContent, async () => {
      await pause(150);
      setSuccess(true);
      await pause(100);
    });
    await pause(2500);
    handleCancel();
  }

  async function submitFeedback(event) {
    let validForm = true;
    let errors = defaultState.error;
    const btn = event.target;
    for (let field in feedbackForm) {
      if (!feedbackForm[field]) {
        errors[field] = "Required field missing";
        validForm = false;
      }
    }

    setFeedbackErr(errors);
    if (!validForm) {
      stopLoading(btn);
      shake(btn);
      return;
    }
    setLoading(btn);
    await axios
      .post(
        `${ServerUrl}/feedbacks/`,
        {
          type: feedbackForm.category,
          content: feedbackForm.content,
          isProfileEntry: props.fromProfile,
          entrance: getentrance(props.fromProfile, props.activityState),
          moduleId: moduleId,
          scenarioId: scenarioId,
          activityId: activityId,
        },
        {
          withCredentials: true,
        }
      )
      .then(() => {
        handleSuccess();
      })
      .catch((err) => {
        console.log(err);
        // check network error
        if (err.code === "ERR_NETWORK") {
          setFeedbackErr({
            ...defaultState.form,
            email: "Feedback submission failed due to network error",
          });
          validForm = false;
          return;
        }
        const res = err.response;
        console.log(res);
        setFeedbackErr({
          ...defaultState.error,
          [res.data.data]: res.data.message,
        });
        validForm = false;
      });
    if (!validForm) {
      stopLoading(btn);
      shake(btn);
    }
  }

  return (
    formOpen &&
    (success ? (
      <div className="feedback-form success">
        <div className="feedback-message">
          <header>Thank You</header>
          <p>We've received your request, and will get back to you soon.</p>
          <IconThumbUp stroke={1.2} />
        </div>
      </div>
    ) : (
      <>
        <Helmet>
          <title>Feedback | Hazard Perception</title>
        </Helmet>
        <div className="feedback-form">
          <div className="feedback-message">
            <header>How can we help?</header>
            <p>
              Share your question or feedback with our support team to help
              improve our app.
            </p>
          </div>

          <div className="input-col">
            <SelectField
              id="category"
              label="Category"
              options={options}
              onChange={formInput}
              error={feedbackErr.category}
            />
            <InputField
              id="content"
              label="Feedback"
              autoComplete="content"
              error={feedbackErr.content}
              value={feedbackForm.content}
              onChange={formInput}
              placeholder={
                feedbackForm.category && desc[feedbackForm.category].join(" ")
              }
              textArea
            />
            <span className="button-row">
              <Button
                label="Cancel"
                className="btn-cancel"
                variant="secondary"
                onClick={handleCancel}
              />
              <Button
                type="submit"
                label="Submit"
                onClick={submitFeedback}
                styles={{ width: "100%" }}
              />
            </span>
          </div>
        </div>
      </>
    ))
  );
}

export default FeedbackForm;
