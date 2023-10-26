import { IconMailCheck } from "@tabler/icons-react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ModalContext,
  ServerUrl,
  focusFirstField,
  pause,
  scrollToError,
  setLoading,
  shake,
  stopLoading,
  swapModalContent,
} from "../Utils";
import { Button } from "./Button";
import InputField from "./InputField";

function ForgotPasswordRequest({ openState, emailState }) {
  const [isOpen, setIsOpen] = openState;
  const [email, setEmail] = emailState;
  const [emailErr, setEmailErr] = useState("");
  const [successfulSend, setSuccessfulSend] = useState(false);
  const modalContent = useContext(ModalContext);

  useEffect(() => {
    if (!isOpen) {
      setEmailErr("");
      setSuccessfulSend(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (emailErr) {
      scrollToError();
    }
  }, [emailErr]);

  async function handleRequestPwReset(event) {
    event.preventDefault();
    let validForm = true;
    const btn = event.target;
    if (!email) {
      shake(btn);
      setEmailErr("Email must be provided");
      return;
    }
    setLoading(btn);
    await axios
      .post(`${ServerUrl}/users/reset-password/url`, {
        email: email,
      })
      .then(() => {
        swapModalContent(modalContent, async () => {
          await pause(100);
          setSuccessfulSend(true);
          await pause(100);
        });
        stopLoading(btn);
        setEmailErr("");
      })
      .catch((err) => {
        // check network error
        if (err.code === "ERR_NETWORK") {
          setEmailErr("Login failed due to network error");
          validForm = false;
          return;
        }
        const error = err.response.data;
        setEmailErr(error.message);
        validForm = false;
      });
    if (!validForm) {
      stopLoading(btn);
      shake(btn);
      return;
    }
  }

  async function handleReturn(event) {
    event.preventDefault();
    await swapModalContent(modalContent, async () => {
      await pause(100);
      setIsOpen(false);
      await pause(100);
    });
    const pwField = modalContent.querySelector("#password");
    await pause(200);
    if (successfulSend) {
      pwField && pwField.focus();
    } else {
      focusFirstField(modalContent);
    }
  }

  return (
    isOpen && (
      <>
        <Helmet>
          <title>Request Password Reset</title>
        </Helmet>
        {successfulSend ? (
          <>
            <div className="forgot-pw-message">
              <header>
                <IconMailCheck height="125%" style={{ width: "auto" }} />
                Check Your Inbox!
              </header>
              <p>
                We sent a link with instructions for resetting your account
                password to the email
              </p>
              <span className="email-given">{email}</span>
            </div>
            <span className="button-row">
              <Button label="Return to Login" onClick={handleReturn} />
            </span>
          </>
        ) : (
          <>
            <div className="forgot-pw-message">
              <header>Forgot Your Password?</header>
              <p>
                Enter the email address associated with your account and we will
                send you a link to reset your password.
              </p>
            </div>
            <div className="input-col">
              <InputField
                id="email"
                label="Email"
                autoComplete="email"
                error={emailErr}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <span className="button-row">
              <Button
                label="Cancel"
                variant="secondary"
                onClick={handleReturn}
              />
              <Button
                type="submit"
                label="Request Link"
                onClick={handleRequestPwReset}
                styles={{ width: "100%" }}
              />
            </span>
          </>
        )}
      </>
    )
  );
}

/* 
  <IconMailCheck size={80} style={{ color: "green" }} />
  <p style={{ color: "white" }}>
    Please check your email inbox for a link to complete the password
    reset.
  </p>
  <Button type="submit" label="Go To Login" onClick={goToLogin} />
 */

export default ForgotPasswordRequest;
