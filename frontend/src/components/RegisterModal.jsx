import { IconMail } from "@tabler/icons-react";
import axios from "axios";
import clsx from "clsx";
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
  mask,
  pause,
  scrollToError,
  setLoading,
  shake,
  stopLoading,
  swapModalContent,
} from "../Utils";
import { Button } from "./Button";
import InputField, { InputHeader } from "./InputField";
import CustomModal from "./Modal";

/**
 *  @param {{
 *    state: [boolean, function]
 *  }} props
 *  @returns {React.JSX.Element}
 */
function RegisterModal(props) {
  let captcha = ReCAPTCHA; // prevent import removal
  const recaptchaRef = createRef();
  const navigate = useNavigate();
  const [modalContent, setModalContent] = useState(null);
  const [isOpen, setIsOpen] = props.state;

  // personal info is read-only,
  // account info is input by user
  const defaultPersonalState = copy(defaults.register.personal);
  const defaultAccountState = copy(defaults.register.account);
  const defaultState = { ...defaultPersonalState, ...defaultAccountState };
  const [personalInfo, setPersonalInfo] = useState(defaultPersonalState);
  const [accountInfo, setAccountInfo] = useState(defaultAccountState);
  // error states for account info
  const [formErr, setFormErr] = useState(defaultState);
  const lockedPlaceholder = "Not Available";
  const [encodedToken, setEncodedToken] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get("token");
    if (token) {
      try {
        token = atob(token);
        setEncodedToken(token);
        setPersonalInfo({
          ...personalInfo,
          participantId: JSON.parse(token).participantId,
        });
      } catch (err) {
        setEncodedToken("");
        return;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (formErr !== defaultState) {
      scrollToError();
    }
  }, [formErr]);

  async function autofill(event) {
    const btn = event.target;
    if (!accountInfo.drivingLicenseId) {
      setFormErr({
        ...formErr,
        drivingLicenseId: "Required field missing",
      });
      shake(btn);
      return;
    }
    setLoading(btn);
    await axios
      .post(`${ServerUrl}/users/${personalInfo.participantId}/verify-license`, {
        drivingLicenseId: accountInfo.drivingLicenseId,
      })
      .then((res) => {
        const user = res.data.data;
        swapModalContent(modalContent, async () => {
          await pause(150);
          setFormErr(defaultState);
          setPersonalInfo({
            ...personalInfo,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          });
          await pause(150);
        });
        stopLoading(btn);
        pause(650).then(() => focusFirstField(modalContent));
      })
      .catch((err) => {
        console.log(err);
        const error = err.response.data;
        setFormErr({
          ...defaultState,
          [error.data]: error.message,
        });
        setPersonalInfo({
          ...defaultPersonalState,
          participantId: personalInfo.participantId,
        });
        stopLoading(btn);
        shake(btn);
      });
  }

  const RegisterForm = (
    <>
      <div className="input-group">
        <div className="input-col">
          <InputHeader label="Account Info" />
          <InputField
            id="participantId"
            label="Participant ID"
            placeholder={lockedPlaceholder}
            value={personalInfo.participantId}
            error={formErr.participantId}
            disabled
          />
          <InputField
            id="drivingLicenseId"
            label="License ID (4d.DLN)"
            value={mask(accountInfo.drivingLicenseId)}
            placeholder={lockedPlaceholder}
            autoComplete="off"
            onChange={formInput}
            error={formErr.drivingLicenseId}
            disabled
          />
          <InputField
            type="password"
            id="password"
            label="Password"
            value={accountInfo.password}
            autoComplete="new-password"
            onChange={formInput}
            error={formErr.password}
          />
          <InputField
            type="password"
            id="confirmPassword"
            label="Confirm Password"
            value={accountInfo.confirmPassword}
            autoComplete="new-password"
            onChange={formInput}
            error={formErr.confirmPassword}
          />
        </div>
        <div className="input-col">
          <InputHeader label="Personal Info" />
          <InputField
            id="firstName"
            label="First Name"
            placeholder={lockedPlaceholder}
            value={personalInfo.firstName}
            error={formErr.firstName}
            disabled
          />
          <InputField
            id="lastName"
            label="Last Name"
            placeholder={lockedPlaceholder}
            value={personalInfo.lastName}
            error={formErr.lastName}
            disabled
          />
          <InputField
            id="email"
            label="Email"
            placeholder={lockedPlaceholder}
            value={personalInfo.email}
            error={formErr.email}
            disabled
          />
          <div className="discrepancy-link">
            <header>Found A Mistake?</header>
            <a
              href="mailto: support@hazardperception.org"
              style={{
                padding: "0 0.4rem",
                marginTop: "0.25rem",
              }}
            >
              {<IconMail />} Contact Us
            </a>
          </div>
        </div>
      </div>
      <Button
        type="submit"
        label="Create Account"
        onClick={handleRegister}
        styles={{
          marginBottom: "1rem",
        }}
      />
    </>
  );

  function formInput(event) {
    const input = event.target;
    if (input) {
      setAccountInfo({
        ...accountInfo,
        [input.id]: input.value,
      });
    }
  }

  async function handleRegister(event) {
    let validForm = true;
    let errors = defaultState;
    const btn = event.target;
    let user = {};
    for (let field in { ...accountInfo, ...personalInfo }) {
      if (!accountInfo[field] && !personalInfo[field]) {
        errors[field] = "Required field missing";
        validForm = false;
      }
    }
    setFormErr(errors);
    if (!validForm) {
      stopLoading(btn);
      shake(btn);
      return;
    }

    setLoading(btn);
    await axios
      .post(
        `${ServerUrl}/users/register`,
        {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          participantId: personalInfo.participantId,
          drivingLicenseId: accountInfo.drivingLicenseId,
          password: encryptWithPublicKey(accountInfo.password),
          confirmPassword: encryptWithPublicKey(accountInfo.confirmPassword),
          dateJoined: new Date().toISOString(),
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
        if (err.code === "ERR_NETWORK") {
          validForm = false;
          return;
        }
        const res = err.response;
        setFormErr({
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

  function handleCancel(event) {
    event.preventDefault();
    setFormErr(defaultState);
    closeModal();
  }

  async function closeModal() {
    document.body.onclick = null;
    await pause(100);
    setIsOpen(false);
  }

  const onReCAPTCHASubmit = () => {
    const token = recaptchaRef.current.getValue();
    console.log(token);
  };

  return (
    <CustomModal
      id="register-modal"
      className="register-modal"
      title="New Account"
      getContent={setModalContent}
      contentClassName={clsx("register-form", personalInfo.email && "full")}
      contentLabel="Register Modal"
      isOpen={isOpen}
      close={handleCancel}
      afterClose={() => setFormErr(defaultState)}
      customWidth={!personalInfo.email && "30rem"}
      focusOnOpen
    >
      <Helmet>
        <title>Register | Hazard Perception</title>
      </Helmet>
      {!personalInfo.email &&
        (encodedToken ? (
          <>
            <div className="input-group">
              <div className="input-col">
                <header className="message">
                  Please verify your Driver's License ID to continue to
                  registration.
                </header>
                <InputField
                  id="participantId"
                  label="Participant ID"
                  placeholder={lockedPlaceholder}
                  value={personalInfo.participantId}
                  error={formErr.participantId}
                  disabled
                />
                <InputField
                  id="drivingLicenseId"
                  label="License ID (4d.DLN)"
                  value={accountInfo.drivingLicenseId}
                  autoComplete="off"
                  onChange={formInput}
                  error={formErr.drivingLicenseId}
                  hideValue
                />
                <div
                  className="discrepancy-link inline"
                  style={{
                    flexDirection: "row",
                    justifyContent: "end",
                    marginBlock: "-0.4rem -0.7rem",
                    fontSize: "1.1rem",
                    padding: 0,
                  }}
                >
                  <header>Not Your Info?</header>
                  <a href="mailto: support@hazardperception.org">Contact Us</a>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              label="Verify License ID"
              onClick={autofill}
              styles={{
                marginBottom: "1rem",
              }}
            />
          </>
        ) : (
          <>
            <header className="message">
              You need a valid invitation to register. Please reach out to the
              study team for more information.
            </header>
            <Button
              type="submit"
              label="Contact Study Team"
              onClick={() => {
                window.location = "mailto: support@hazardperception.org";
                closeModal();
              }}
              styles={{
                marginBottom: "1rem",
              }}
            />
          </>
        ))}
      {personalInfo.email && RegisterForm}
      {/* <ReCAPTCHA
        ref={recaptchaRef}
        sitekey="6LeVQpQmAAAAALR80Je8if_SYDqY0h1ZYEV8jwMk"
        onChange={onReCAPTCHASubmit}
      /> */}
    </CustomModal>
  );
}

export default RegisterModal;
