import { createContext, useState } from "react";
export const Context_user = createContext();

export function Context_usuario({ children }) {
    // 💡 CAMBIO 1: El estado inicial intenta buscar si ya había un usuario guardado
    const [usuario, setUsuario] = useState(() => {
        const usuarioGuardado = localStorage.getItem("usuario_plataforma");
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    });

    const login = (datosUsuario) => {
        setUsuario(datosUsuario);
        // 💡 CAMBIO 2: Guardamos el usuario en el navegador (convertido a texto con stringify)
        localStorage.setItem(
            "usuario_plataforma",
            JSON.stringify(datosUsuario),
        );
    };

    const logout = () => {
        setUsuario(null);
        // 💡 CAMBIO 3: Limpiamos el localStorage al cerrar sesión
        localStorage.removeItem("usuario_plataforma");
    };
    return (
        <Context_user.Provider value={{ usuario, login, logout }}>
            {children}
        </Context_user.Provider>
    );
}
