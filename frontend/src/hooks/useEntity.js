import { useContext } from "react";
import EntityContext from "../context/EntityContext.jsx";

export const useEntity = () => {
  return useContext(EntityContext);
};
