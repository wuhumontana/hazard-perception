import axios from "axios";
import { createRef, useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  ServerUrl,
  copy,
  defaults,
  encryptWithPublicKey,
  focusFirstField,
  keyEnter,
  pause,
  scrollToError,
  setLoading,
  shake,
  stopLoading,
  swapModalContent,
} from "../Utils";
import { Button } from "./Button";
import ForgotPasswordRequest from "./ForgotPasswordRequest";
import InputField from "./InputField";
import CustomModal from "./Modal";

/**
 *  @param {{
 *    state: [boolean, function]
 *  }} props
 *  @returns {React.JSX.Element}
 */
function LoginModal(props) {
  let captcha = ReCAPTCHA; // prevent import removal
  const recaptchaRef = createRef();
  const defaultState = copy(defaults.login);
  const [isOpen, setIsOpen] = props.state;

  // form input and erros for username, password
  const [loginForm, setLoginForm] = useState(defaultState);
  const [loginErr, setLoginErr] = useState(defaultState);
  const resetPwState = useState(false);
  const [resetPwOpen, setResetPwOpen] = resetPwState;
  const navigate = useNavigate();

  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    if (loginErr !== defaultState) {
      scrollToError();
    }
  }, [loginErr]);

  const setEmail = (email) => setLoginForm({ ...loginForm, email: email });
  const emailState = [loginForm.email, setEmail];

  function formInput(event) {
    const input = event.target;
    if (input) {
      setLoginForm({
        ...loginForm,
        [input.id]: input.value,
      });
    }
  }

  async function handleLogin(event) {
    let validForm = true;
    let errors = defaultState;
    const btn = event.target;
    let user = {};
    for (let field in loginForm) {
      if (!loginForm[field]) {
        errors[field] = "Required field missing";
        validForm = false;
      }
    }
    setLoginErr(errors);
    if (!validForm) {
      stopLoading(btn);
      shake(btn);
      return;
    }
    setLoading(btn);
    const encryptedPassword = encryptWithPublicKey(loginForm.password);
    console.log(ServerUrl);
    await axios
      .post(
        `${ServerUrl}/users/login`,
        {
          email: loginForm.email,
          password: encryptedPassword,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        user = res.data.data;
      })
      .catch((err) => {
        console.log(err);
        // check network error
        if (err.code === "ERR_NETWORK") {
          setLoginErr({
            ...defaultState,
            email: "Login failed due to network error",
          });
          validForm = false;
          return;
        }
        const res = err.response;
        setLoginErr({
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
    closeModal();
    navigate("/dashboard", {
      state: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        participantId: user.participantId,
      },
    });
  }

  async function openForgotPassword() {
    // fade out/in and smoothly fit modalContent
    await swapModalContent(modalContent, async () => {
      await pause(100);
      setResetPwOpen(true);
      setLoginForm({ ...loginForm, password: "" });
      setLoginErr(defaultState);
      await pause(100);
    });
    await pause(200);
    focusFirstField(modalContent);
  }

  async function handleCancel(event) {
    event.preventDefault();
    setLoginForm(defaultState);
    closeModal();
  }

  async function closeModal() {
    await pause(100);
    setIsOpen(false);
    await pause(200);
    setResetPwOpen(false);
  }

  const onReCAPTCHASubmit = () => {
    const token = recaptchaRef.current.getValue();
    console.log(token);
  };

  return (
    <CustomModal
      id="login-modal"
      className="login-modal"
      title={resetPwOpen ? "Password Reset" : "Account Login"}
      getContent={setModalContent}
      contentClassName="login-form"
      contentLabel="Login Modal"
      isOpen={isOpen}
      close={handleCancel}
      afterClose={() => setLoginErr(defaultState)}
      focusOnOpen
    >
      <Helmet>
        <title>Login | Hazard Perception</title>
      </Helmet>
      {!resetPwOpen && (
        <>
          <div className="input-col">
            <InputField
              id="email"
              label="Email"
              autoComplete="email"
              error={loginErr.email}
              value={loginForm.email}
              onChange={formInput}
            />
            <InputField
              type="password"
              id="password"
              label="Password"
              autoComplete="current-password"
              error={loginErr.password}
              value={loginForm.password}
              onChange={formInput}
            />
            <a
              className="forgot-pw"
              onClick={openForgotPassword}
              onKeyDown={(event) => {
                keyEnter(event, openForgotPassword);
              }}
              tabIndex={0}
            >
              Forgot Password?
            </a>
          </div>
          <Button
            type="submit"
            label="Sign in"
            onClick={handleLogin}
            styles={{
              marginBottom: "1rem",
            }}
          />
        </>
      )}
      <ForgotPasswordRequest openState={resetPwState} emailState={emailState} />
      {/* <ReCAPTCHA
        ref={recaptchaRef}
        sitekey="6LeVQpQmAAAAALR80Je8if_SYDqY0h1ZYEV8jwMk"
        onChange={onReCAPTCHASubmit}
      /> */}
    </CustomModal>
  );
}

export default LoginModal;
