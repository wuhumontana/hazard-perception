import axios from "axios";
import { ClickScrollPlugin, OverlayScrollbars } from "overlayscrollbars";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  ServerUrl,
  attachOnResize,
  copy,
  defaults,
  encryptWithPublicKey,
  getRootHeight,
  scrollToError,
  setLoading,
  shake,
  stopLoading,
} from "../Utils";
import { Button } from "../components/Button";
import InputField from "../components/InputField";
import "../styles/layout.css";
import "../styles/reset-password.css";
import "../styles/text.css";

function ResetPassword() {
  const defaultState = copy(defaults.resetPassword);
  const [resetPwForm, setResetPwForm] = useState(defaultState);
  const [resetPwErr, setResetPwErr] = useState(defaultState);
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const encodedToken = urlParams.get("token");

  getRootHeight();
  attachOnResize();
  OverlayScrollbars.plugin(ClickScrollPlugin);

  useEffect(() => {
    if (!encodedToken) return;
    const token = atob(encodedToken);
    const { participantId } = JSON.parse(token);
    autofill(participantId);
  }, []);

  useEffect(() => {
    if (resetPwErr !== defaultState) {
      scrollToError();
    }
  }, [resetPwErr]);

  document.body.id = "reset-password";

  function formInput(event) {
    const input = event.target;
    if (input) {
      setResetPwForm({
        ...resetPwForm,
        [input.id]: input.value,
      });
    }
  }

  async function autofill(participantId) {
    await axios
      .post(`${ServerUrl}/users/reset-password/verify-url`, {
        participantId: participantId,
      })
      .then((res) => {
        const email = res.data.data;
        setResetPwForm({
          ...defaultState,
          email: email,
        });
      })
      .catch((err) => {
        console.log(err);
        const error = err.response.data;
        navigate("*"); // go to page not found
      });
  }

  async function handleResetPassword(event) {
    let validForm = true;
    let errors = defaultState;
    const btn = event.target;
    for (let field in resetPwForm) {
      if (!resetPwForm[field]) {
        errors[field] = "Required field missing";
        validForm = false;
      }
    }
    setResetPwErr(errors);
    if (!validForm) {
      stopLoading(btn);
      shake(btn);
      return;
    }
    setLoading(btn);

    // encrypt the password
    const encryptedPassword = encryptWithPublicKey(resetPwForm.newPassword);
    const encryptedConfirmPassword = encryptWithPublicKey(
      resetPwForm.confirmNewPassword
    );

    await axios
      .post(`${ServerUrl}/users/reset-password/forgot-reset`, {
        email: resetPwForm.email,
        password: encryptedPassword,
        confirmPassword: encryptedConfirmPassword,
      })
      .then((res) => {
        //user = res.data.data;
      })
      .catch((err) => {
        // check network error
        if (err.code === "ERR_NETWORK") {
          setResetPwErr({
            ...defaultState,
            email: "Signin failed due to network error",
          });
          validForm = false;
          return;
        }
        const res = err.response;
        setResetPwErr({
          ...defaultState,
          [res.data.data]: res.data.message,
        });
        validForm = false;
      });
    if (!validForm) {
      stopLoading(btn);
      shake(btn);
      return;
    }
    navigate("/home");
  }

  return (
    <HelmetProvider>
      <Helmet>
        <title>Reset Password | Hazard Perception</title>
      </Helmet>
      <OverlayScrollbarsComponent
        className="scroll-form"
        options={{
          scrollbars: {
            clickScroll: true,
          },
        }}
      >
        <header>Create New Password</header>
        <div className="input-col reset-pw-form">
          <p>
            Please provide your Participant ID to verify your identity for the
            password reset. Make sure the new password is strong and has not
            been used before.
          </p>
          <InputField
            id="email"
            label="Email"
            autoComplete="email"
            error={resetPwErr.email}
            value={resetPwForm.email}
            onChange={formInput}
            disabled
          />
          <InputField
            type="password"
            id="newPassword"
            label="Password"
            autoComplete="new-password"
            error={resetPwErr.newPassword}
            value={resetPwForm.newPassword}
            onChange={formInput}
            disabled={!encodedToken}
          />
          <InputField
            type="password"
            id="confirmNewPassword"
            label="Confirm Password"
            autoComplete="new-password"
            error={resetPwErr.confirmNewPassword}
            value={resetPwForm.confirmNewPassword}
            onChange={formInput}
            disabled={!encodedToken}
          />
        </div>
        <Button
          type="submit"
          fontSize="1.4rem"
          label="Reset Password"
          onClick={handleResetPassword}
        />
      </OverlayScrollbarsComponent>
    </HelmetProvider>
  );
}

export default ResetPassword;
