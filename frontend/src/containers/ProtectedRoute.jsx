import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServerUrl } from "../Utils";

export const ProtectedRoute = ({ children }) => {
  const [isValidToken, setIsValidToken] = useState(false);
  const [isEffectComplete, setIsEffectComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axios.post(
          `${ServerUrl}/users/current-user/`,
          {},
          {
            withCredentials: true,
          }
        );
        setIsValidToken(true);
      } catch (error) {
        setIsValidToken(false);
      } finally {
        setIsEffectComplete(true);
      }
    };
    verifyToken();
  }, []);

  useEffect(() => {
    if (isEffectComplete && !isValidToken) {
      navigate("/unauthorized");
    }
  }, [isEffectComplete]);

  return isValidToken && children;
};

export default ProtectedRoute;
