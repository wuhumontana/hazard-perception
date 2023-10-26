import { IconTool } from "@tabler/icons-react";
import axios from "axios";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ServerUrl, pause, swapModalContent } from "../Utils";
import "../styles/modal.css";
import { Button } from "./Button";
import ChangePasswordForm from "./ChangePasswordForm";
import FeedbackForm from "./FeedbackForm";
import CustomModal from "./Modal";
import ProfilePhoto from "./ProfilePhoto";
import ResearcherTools from "./ResearcherTools";

function ProfileModal(isOpen, setIsOpen, userInfo) {
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [modalState, setModalState] = useState("initial");
  const [modalContent, setModalContent] = useState(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState(null);
  const navigate = useNavigate();

  function handleChangePw() {
    swapModalContent(modalContent, async () => {
      await pause(150);
      setChangePwOpen(true);
      await pause(100);
    });
  }

  function handleOpenTools() {
    swapModalContent(modalContent, async () => {
      await pause(100);
      setToolsOpen(true);
      await pause(100);
    });
  }

  async function handleHelp(event) {
    swapModalContent(modalContent, async () => {
      await pause(150);
      setFeedbackOpen(true);
      await pause(100);
    });
  }

  async function handleSignOut() {
    await axios
      .post(`${ServerUrl}/users/logout`, {}, { withCredentials: true })
      .catch();
    navigate("/home");
  }

  async function afterClose() {
    setModalState("initial");
    setChangePwOpen(false);
    setFeedbackOpen(false);
    setToolsOpen(false);
  }

  const firstName = (userInfo && userInfo.firstName) || "Anonymous";
  const lastName = (userInfo && userInfo.lastName) || "User";
  const email = (userInfo && userInfo.email) || "anon@email.com";
  const role = (userInfo && userInfo.role) || "STUDENT";
  const formattedRole = role[0] + role.slice(1).toLowerCase();

  useEffect(() => {
    if (!buttonRef || modalState !== "initial") return;
    pause(200).then(async () => {
      const height = buttonRef.scrollHeight;
      buttonRef.style.maxHeight = `calc(${height}px + 0.5rem)`;
      buttonRef.style.justifyContent = "end";
      buttonRef.style.opacity = "100%";
      await pause(400);
      setModalState(null);
      buttonRef.style.maxHeight = "";
    });
  }, [modalState, buttonRef]);

  return (
    <CustomModal
      className="profile-modal"
      title={
        changePwOpen
          ? "Change Your Password"
          : feedbackOpen
          ? "Help & Feedback"
          : "Your Account"
      }
      contentLabel="Profile Modal"
      getContent={setModalContent}
      isOpen={isOpen}
      close={() => setIsOpen(false)}
      customWidth="25rem"
      afterClose={afterClose}
    >
      <Helmet>
        <title>Profile | Dashboard</title>
      </Helmet>
      {!changePwOpen && !toolsOpen && !feedbackOpen && (
        <>
          <div className="profile-summary">
            <ProfilePhoto source="https://www.w3schools.com/howto/img_avatar.png" />
            <div className="userinfo">
              <header className="name">{`${firstName} ${lastName}`}</header>
              <p className="email">{email}</p>
              <p className="role">{formattedRole}</p>
            </div>
          </div>
          <div className={clsx("btn-group", modalState)} ref={setButtonRef}>
            <div className="separator" />
            {role === "RESEARCHER" && (
              <Button
                className="research-tools"
                variant="secondary"
                icon={<IconTool />}
                label="Researcher Tools"
                styles={{ width: "100%" }}
                fontSize="1.2rem"
                onClick={handleOpenTools}
              />
            )}
            <Button
              label="Change Password"
              variant="secondary"
              fontSize="1.2rem"
              styles={{ width: "100%" }}
              onClick={handleChangePw}
            />
            <Button
              label="Help & Feedback"
              variant="secondary"
              fontSize="1.2rem"
              styles={{ width: "100%" }}
              onClick={handleHelp}
            />
            <Button
              label="Sign Out"
              styles={{ width: "100%" }}
              fontSize="1.2rem"
              onClick={handleSignOut}
            />
          </div>
        </>
      )}
      <ChangePasswordForm isOpen={changePwOpen} setIsOpen={setChangePwOpen} />
      <ResearcherTools
        isOpen={toolsOpen}
        setIsOpen={setToolsOpen}
        userInfo={userInfo}
      />
      <FeedbackForm
        modalState={[isOpen, setIsOpen]}
        formOpenState={[feedbackOpen, setFeedbackOpen]}
        fromProfile
      />
    </CustomModal>
  );
}

export default ProfileModal;
