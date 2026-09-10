import "./App.css";
import { Route, Routes } from "react-router-dom";
import Pagina_principal from "./pages/Pagina_principal";
import Login from "./pages/Login";
import { Context_usuario } from "./contexts/Context_usuario";

function App() {
    return (
        <Context_usuario>
            <Routes>
                <Route path="/principal/:id" element={<Pagina_principal />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Context_usuario>
    );
}

export default App;
