import { useContext, useState } from "react";
import "../css/login.css";
import { useNavigate } from "react-router-dom";
import { Context_user } from "../contexts/Context_usuario";

function Login() {
    const navegacion = useNavigate();
    const [modoRegistro, setModoRegistro] = useState(false);
    const [cargando, setCargando] = useState(false);
    const { usuario, login } = useContext(Context_user);
    const vaciar_textos = (e) => {
        if (e.target.nombre_completo != null) {
            e.target.nombre_completo.value = "";
        }
        e.target.email.value = "";
        e.target.contraseña.value = "";
    };
    const enviar = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const email = e.target.email.value;
            const contraseña = e.target.contraseña.value;

            if (modoRegistro) {
                const nombre_completo = e.target.nombre_completo.value;
                if (nombre_completo.length < 6) {
                    throw new Error(
                        "El nombre completo tiene que tener como mínimo 6 letras",
                    );
                }
                if (!email.includes("@") || !email.includes(".")) {
                    throw new Error("El correo no es válido");
                }
                if (contraseña.length < 6) {
                    throw new Error(
                        "La contraseña tiene que tener como mínimo 6 letras",
                    );
                }

                const usuario = {
                    nombre_completo: nombre_completo,
                    email: email,
                    contraseña: contraseña,
                };
                fetch(
                    "https://node-react-git-main-tomasmenecesfernandez.vercel.app/usuario/registro",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(usuario),
                    },
                ).then(() => {
                    alert("se registro su usuario con exito.");
                    vaciar_textos(e);
                });
            } else {
                const usuario = {
                    email: email,
                    contraseña: contraseña,
                };
                const respuesta = await fetch(
                    "https://node-react-git-main-tomasmenecesfernandez.vercel.app/usuario/login",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(usuario),
                    },
                );
                const texto = await respuesta.json();
                if (texto.respuesta === "valido") {
                    navegacion(`/principal/${texto.usuario_ingresado[0].id}`);
                    login(texto.usuario_ingresado[0]);
                    //login({
                    //  nombre_completo: texto.nombre_completo,
                    //id: texto.id,
                    //});
                } else if (texto.respuesta === "invalido") {
                    throw new Error("El usuario o contraseña es incorrecto");
                }
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div id="login">
            <form className="form_login" onSubmit={enviar}>
                <h2>{modoRegistro ? "Crear cuenta" : "Iniciar sesión"}</h2>

                {modoRegistro && (
                    <label>
                        Nombre Completo
                        <input name="nombre_completo" type="text" required />
                    </label>
                )}
                <label>
                    Email
                    <input name="email" type="email" required />
                </label>
                <label>
                    Contraseña
                    <input
                        name="contraseña"
                        type="password"
                        required
                        minLength={6}
                    />
                </label>

                <button
                    className="boton_login"
                    type="submit"
                    disabled={cargando}
                >
                    {cargando
                        ? "Cargando..."
                        : modoRegistro
                          ? "Registrarse"
                          : "Entrar"}
                </button>
                <button
                    type="button"
                    className="boton_secundario"
                    onClick={() => setModoRegistro(!modoRegistro)}
                >
                    {modoRegistro
                        ? "Ya tengo una cuenta"
                        : "Crear una cuenta nueva"}
                </button>
            </form>
        </div>
    );
}

export default Login;
