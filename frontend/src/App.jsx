import React from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import { EntityProvider } from "./context/EntityContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

const App = () => {
  return (
    <AuthProvider>
      <EntityProvider>
        <AppRoutes />
      </EntityProvider>
    </AuthProvider>
  );
};

export default App;
