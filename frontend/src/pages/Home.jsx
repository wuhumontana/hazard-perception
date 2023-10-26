import { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { attachOnResize, getRootHeight } from "../Utils";
import { Button } from "../components/Button";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import "../styles/home.css";
import "../styles/layout.css";
import "../styles/scrollbar.css";
import "../styles/text.css";
import "../styles/tooltips.css";

function Home() {
  const urlParams = new URLSearchParams(window.location.search);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [stacked, setStacked] = useState(
    window.innerWidth < Math.max(600, window.innerHeight)
  );
  const linkText = "Sample text for help link";
  const buttons = [
    <Button
      key={1}
      id="register-button"
      label="Register"
      variant="secondary"
      fontSize={stacked ? "1.5rem" : "1.3rem"}
      onClick={() => setIsRegisterOpen(true)}
    />,
    <Button
      key={2}
      id="sign-in-button"
      label="Sign in"
      variant="light"
      fontSize={stacked ? "1.5rem" : "1.3rem"}
      onClick={() => setIsLoginOpen(true)}
    />,
  ];

  document.body.id = "home";

  useEffect(() => {
    const encodedToken = urlParams.get("token");
    if (encodedToken !== null) setIsRegisterOpen(true);
  }, []);

  getRootHeight();
  attachOnResize(() =>
    setStacked(window.innerWidth < Math.max(600, window.innerHeight))
  );

  return (
    <HelmetProvider>
      <Helmet>
        <title>Welcome | Hazard Perception</title>
      </Helmet>
      <header>Hazard Perception Training</header>
      <div className="button-group">
        {stacked ? buttons.reverse() : buttons}
        <a className="link" tabIndex={0}>
          {linkText}
        </a>
      </div>
      <RegisterModal state={[isRegisterOpen, setIsRegisterOpen]} />
      <LoginModal state={[isLoginOpen, setIsLoginOpen]} />
    </HelmetProvider>
  );
}

export default Home;
