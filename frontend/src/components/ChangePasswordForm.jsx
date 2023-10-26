import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import {
  ModalContext,
  ServerUrl,
  copy,
  defaults,
  encryptWithPublicKey,
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

/**
 *  @param {boolean} isOpen
 *  @param {function} setIsOpen
 *  @returns {React.JSX.Element}
 */
function ChangePasswordForm({ isOpen, setIsOpen }) {
  const location = useLocation();
  // form input and erros for changing password
  const defaultState = copy(defaults.changePassword);
  const [changePwForm, setChangePwForm] = useState(defaultState);
  const [changePwErr, setChangePwErr] = useState(defaultState);
  const [successful, setSuccessful] = useState(false);
  const modalContent = useContext(ModalContext);

  useEffect(() => {
    if (!isOpen) {
      setChangePwForm(defaultState);
      setChangePwErr(defaultState);
    } else {
      pause(300).then(() => {
        focusFirstField(modalContent);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (changePwErr !== defaultState) {
      scrollToError();
    }
  }, [changePwErr]);

  function formInput(event) {
    const input = event.target;
    if (input) {
      setChangePwForm({
        ...changePwForm,
        [input.id]: input.value,
      });
    }
  }

  async function handleChangePassword(event) {
    const btn = event.target;
    let validForm = true;
    let errors = defaultState;
    for (let field in changePwForm) {
      if (!changePwForm[field]) {
        errors[field] = "Required field missing";
        validForm = false;
      }
    }
    setChangePwErr(errors);
    if (!validForm) {
      shake(btn);
      return;
    }
    setLoading(btn);
    const encryptedOldPw = encryptWithPublicKey(changePwForm.oldPassword);
    const encryptedNewPw = encryptWithPublicKey(changePwForm.newPassword);
    const encryptedNewConfirmPw = encryptWithPublicKey(
      changePwForm.confirmNewPassword
    );
    await axios
      .post(
        `${ServerUrl}/users/reset-password/profile-reset`,
        {
          email: location.state.email,
          oldPassword: encryptedOldPw,
          newPassword: encryptedNewPw,
          confirmNewPassword: encryptedNewConfirmPw,
        },
        {
          withCredentials: true,
        }
      )
      .then(() => {
        stopLoading(btn);
        swapModalContent(modalContent, async () => {
          await pause(100);
          setChangePwForm(defaultState);
          setSuccessful(true);
          await pause(100);
        });
      })
      .catch((err) => {
        // check network error
        if (err.code === "ERR_NETWORK") {
          setChangePwErr({
            ...defaultState,
            oldPassword: "Password change failed due to network error",
          });

          validForm = false;
          return;
        }
        const res = err.response;
        setChangePwErr({
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
  }

  async function handleReturn(event) {
    event.preventDefault();
    swapModalContent(modalContent, async () => {
      await pause(100);
      setIsOpen(false);
      setSuccessful(false);
      await pause(100);
    });
  }

  const successContent = (
    <center className="change-pw-success">
      <IconCheck stroke={3} />
      <span>
        Password Change
        <br />
        Successful!
      </span>
    </center>
  );

  return (
    isOpen && (
      <>
        <Helmet>
          <title>Change Password</title>
        </Helmet>
        {successful ? (
          successContent
        ) : (
          <>
            <div className="input-col">
              <InputField
                type="password"
                id="oldPassword"
                label="Old Password"
                autoComplete="current-password"
                error={changePwErr.oldPassword}
                value={changePwForm.oldPassword}
                onChange={formInput}
              />
              <InputField
                type="password"
                id="newPassword"
                label="New Password"
                autoComplete="new-password"
                error={changePwErr.newPassword}
                value={changePwForm.newPassword}
                onChange={formInput}
              />
              <InputField
                type="password"
                id="confirmNewPassword"
                label="Confirm New Password"
                autoComplete="new-password"
                error={changePwErr.confirmNewPassword}
                value={changePwForm.confirmNewPassword}
                onChange={formInput}
              />
            </div>
          </>
        )}
        <span className="button-row">
          {!successful && (
            <Button
              label="Cancel"
              className="btn-cancel"
              variant="secondary"
              onClick={handleReturn}
            />
          )}
          <Button
            type="submit"
            icon={
              successful && (
                <IconArrowLeft
                  stroke={2.5}
                  style={{ boxSizing: "border-box", paddingRight: "0.2rem" }}
                />
              )
            }
            label={successful ? "Return to Profile" : "Change Password"}
            onClick={successful ? handleReturn : handleChangePassword}
            styles={{ width: "100%" }}
          />
        </span>
      </>
    )
  );
}

export default ChangePasswordForm;
