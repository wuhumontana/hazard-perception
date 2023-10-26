import {
  IconArrowLeft,
  IconCheck,
  IconExclamationCircle,
  IconFile,
  IconTrash,
  IconUpload,
  IconWorldCancel,
} from "@tabler/icons-react";
import Tippy from "@tippyjs/react";
import axios from "axios";
import clsx from "clsx";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BannerContext,
  ModalContext,
  ServerUrl,
  animateTooltip,
  getModalViewport,
  pause,
  setLoading,
  shake,
  stopLoading,
  swapLabel,
  swapModalContent,
  xlsxToJson,
} from "../Utils";
import "../styles/modal.css";
import { Button } from "./Button";
import { InputHeader } from "./InputField";

function ResearcherTools({ isOpen, setIsOpen, userInfo }) {
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteGroup, setdeleteGroup] = useState(null);
  const [uploadField, setUploadField] = useState(null);
  const [trashBtn, setTrashBtn] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [banner, setBanner] = useContext(BannerContext);

  const modalContent = useContext(ModalContext);
  const navigate = useNavigate();

  const bodyObserver = new ResizeObserver((entries) => {
    const rect = entries[0].contentRect;
    setIsMobile(rect.width < 450);
  });

  useEffect(() => {
    bodyObserver.observe(document.body);
  }, []);

  function handleUpload(event) {
    const btn = event.target;
    if (fileToUpload) {
      setLoading(btn);
      xlsxToJson(fileToUpload).then(async (data) => {
        await axios
          .post(
            `${ServerUrl}/users/upload`,
            {
              data,
            },
            {
              withCredentials: true,
            }
          )
          .then(async (res) => {
            clearFile();
            await pause(500);
            setUploadSuccess(true);
            stopLoading(btn);
            await pause(2500);
            swapLabel(btn, () => setUploadSuccess(false));
          })
          .catch((err) => {
            if (err.code === "ERR_NETWORK") {
              setBanner({
                icon: <IconWorldCancel />,
                text: "Upload failed due to network error",
              });
            }
            /* TODO: show error message */
            stopLoading(btn);
            shake(btn);
          });
      });
    } else {
      if (uploadField) {
        uploadField.click();
      }
    }
  }

  function handleFilePick(event) {
    const file = event.target.files[0];
    if (file) {
      setFileToUpload(file);
      if (trashBtn) {
        trashBtn.style.display = "flex";
      }
    }
  }

  async function clearFile() {
    if (trashBtn) {
      const uploadBtn = trashBtn.previousSibling.childNodes[0];
      if (uploadBtn) {
        swapLabel(uploadBtn, () => setFileToUpload(null));
      }
      trashBtn.style.maxWidth = trashBtn.clientWidth;
      await pause(10);
      trashBtn.style.maxWidth = 0;
      trashBtn.style.opacity = 0;
      await pause(200);
      trashBtn.style.display = "none";
      trashBtn.style.maxWidth = "";
      trashBtn.style.opacity = "";
    }
    if (uploadField) {
      uploadField.value = null;
    }
  }

  async function handleSignOut() {
    await axios
      .post(`${ServerUrl}/users/logout`, {}, { withCredentials: true })
      .catch();
    navigate("/home");
  }

  async function swapInDelete() {
    if (deleteGroup) {
      deleteGroup.style.display = "block";
      setConfirmDelete(true);
      deleteGroup.style.maxHeight = `${deleteGroup.scrollHeight}px`;
      await pause(100);
      deleteGroup.style.maxHeight = "";
      const viewport = getModalViewport(deleteGroup);
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }

  async function swapOutDelete() {
    if (deleteGroup) {
      setConfirmDelete(false);
      deleteGroup.style.maxHeight = `${deleteGroup.offsetHeight}px`;
      await pause(10);
      deleteGroup.style.maxHeight = "";
      await pause(100);
      deleteGroup.style.display = "none";
    }
  }

  async function handleDeleteAccount() {
    if (userInfo) {
      await axios
        .delete(`${ServerUrl}/users/${userInfo.participantId}`, {
          withCredentials: true,
        })
        .then(() => {
          handleSignOut();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  async function handleReturn() {
    if (confirmDelete) {
      swapOutDelete();
      await pause(250);
    }
    swapModalContent(modalContent, async () => {
      await pause(100);
      setIsOpen(false);
      setFileToUpload(null);
      setUploadSuccess(false);
      setConfirmDelete(false);
      await pause(100);
    });
  }

  return (
    isOpen && (
      <div className="btn-group">
        <InputHeader className="tools" label="Researcher Tools" />
        <Button
          variant="secondary"
          icon={
            <IconArrowLeft
              style={{ boxSizing: "border-box", paddingRight: "0.2rem" }}
              stroke={2.5}
            />
          }
          label="Return to Profile"
          styles={{ width: "100%" }}
          onClick={handleReturn}
        />
        <span className="file-upload">
          <Tippy
            className="tooltip file-tooltip"
            content={fileToUpload ? fileToUpload.name : "no file"}
            disabled={!fileToUpload}
            onShow={animateTooltip}
            onHide={animateTooltip}
            duration={100}
          >
            <span>
              <Button
                className="upload-xlsx"
                label={
                  uploadSuccess
                    ? "Upload Successful"
                    : fileToUpload
                    ? fileToUpload.name
                    : isMobile
                    ? "Upload Excel"
                    : "Upload Excel File"
                }
                variant="light"
                styles={{ width: "100%" }}
                icon={
                  fileToUpload ? (
                    <IconFile />
                  ) : uploadSuccess ? (
                    <IconCheck />
                  ) : (
                    <IconUpload />
                  )
                }
                onClick={!uploadSuccess && handleUpload}
              />
            </span>
          </Tippy>
          <Button
            className="upload-discard"
            variant="secondary"
            icon={<IconTrash />}
            onClick={clearFile}
            customRef={setTrashBtn}
          />
        </span>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx"
          style={{ display: "none" }}
          onChange={handleFilePick}
          ref={setUploadField}
        />
        <Button
          className={clsx("delete-acct", confirmDelete && "hidden")}
          icon={
            <IconTrash
              style={{ boxSizing: "border-box", paddingRight: "0.4rem" }}
              stroke={2.4}
            />
          }
          label="Delete Account"
          styles={{ width: "100%" }}
          fontSize="1.2rem"
          bgColor="var(--danger-color)"
          onClick={swapInDelete}
        />
        <div
          className={clsx("delete-account", !confirmDelete && "hidden")}
          ref={setdeleteGroup}
        >
          <header>
            <IconExclamationCircle height="3em" width="3em" stroke={1.3} />
            {isMobile
              ? "Delete account? This cannot be undone."
              : "Are you sure you want to delete your account? \
              This action cannot be undone."}
          </header>
          <div className="btn-row">
            <Button
              label="Delete"
              styles={{ width: "100%", flex: 2 }}
              fontSize="1.2rem"
              bgColor="var(--danger-color)"
              onClick={handleDeleteAccount}
            />
            <Button
              label="Cancel"
              variant="secondary"
              styles={{ width: "100%", flex: 1 }}
              fontSize="1.2rem"
              onClick={swapOutDelete}
            />
          </div>
        </div>
      </div>
    )
  );
}

export default ResearcherTools;
