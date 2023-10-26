import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import "../styles/page-not-found.css";

function PageNotFound() {
  const navigate = useNavigate();
  document.body.id = "page-not-found";
  return (
    <>
      <header>It looks like the page you're looking for doesn't exist.</header>
      <Button
        label="Go Home"
        variant="light"
        depth="1.5rem"
        onClick={() => {
          navigate("/home");
        }}
        fontSize="2rem"
      />
    </>
  );
}

export default PageNotFound;
