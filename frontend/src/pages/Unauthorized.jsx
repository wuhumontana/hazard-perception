import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import "../styles/unauthorized.css";

function Unauthorized() {
  const navigate = useNavigate();
  document.body.id = "unauthorized";
  return (
    <>
      <header>
        You don't have the privilege to access this page. Please log in first.
      </header>
      <Button
        label="Go Login"
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

export default Unauthorized;
