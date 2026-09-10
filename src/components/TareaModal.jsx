import { useState } from "react";
import "../css/modal.css";

function aFechaLocalInput(fecha) {
    const d = new Date(fecha);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function TareaModal({ tarea, fechaPrellenada, onGuardar, onBorrar, onCerrar }) {
    const base = fechaPrellenada || new Date();
    const inicioPorDefecto = new Date(base);
    inicioPorDefecto.setHours(9, 0, 0, 0);
    const finPorDefecto = new Date(inicioPorDefecto);
    finPorDefecto.setHours(10, 0, 0, 0);

    const [titulo, setTitulo] = useState(tarea?.titulo || "");
    const [descripcion, setDescripcion] = useState(tarea?.descripcion || "");
    const [fecha_inicio, setFechaInicio] = useState(
        aFechaLocalInput(tarea?.fecha_inicio || inicioPorDefecto),
    );
    const [fecha_final, setFechaFin] = useState(
        aFechaLocalInput(tarea?.fecha_final || finPorDefecto),
    );

    const enviar = (e) => {
        e.preventDefault();
        if (e.nativeEvent.submitter.value == "borrar") {
            onGuardar([
                {
                    accion: "borrar",
                    titulo: titulo,
                    descripcion: descripcion,
                    fecha_inicio: fecha_inicio,
                    fecha_final: fecha_final,
                },
            ]);
        } else if (new Date(fecha_final) < new Date(fecha_inicio)) {
            alert("La fecha de fin no puede ser anterior a la de inicio");
            return;
        }
        if (!titulo.trim()) {
            alert("Ponele un título a la tarea");
            return;
        }
        if (e.nativeEvent.submitter.value == "modificar") {
            console.log("funcion modificar en modal");
            onGuardar([
                {
                    accion: "modificar",
                    titulo: titulo,
                    descripcion: descripcion,
                    fecha_inicio: fecha_inicio,
                    fecha_final: fecha_final,
                },
            ]);
        } else {
            onGuardar([
                {
                    accion: "crear",
                    titulo: titulo,
                    descripcion: descripcion,
                    fecha_inicio: fecha_inicio,
                    fecha_final: fecha_final,
                },
            ]);
        }
    };

    return (
        <div className="fondo_modal" onClick={onCerrar}>
            <form
                className="caja_modal"
                onClick={(e) => e.stopPropagation()}
                onSubmit={enviar}
            >
                <h2 id="h2_TEXTO">{tarea ? "Editar tarea" : "Nueva tarea"}</h2>

                <label>
                    Título
                    <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        autoFocus
                        required
                    />
                </label>

                <label>
                    Descripción
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={3}
                    />
                </label>

                <div className="fila_fechas">
                    <label>
                        Inicio
                        <input
                            type="datetime-local"
                            value={fecha_inicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Fin
                        <input
                            type="datetime-local"
                            value={fecha_final}
                            onChange={(e) => setFechaFin(e.target.value)}
                            required
                        />
                    </label>
                </div>

                <div className="fila_botones_modal">
                    {onBorrar && (
                        <button
                            type="submit"
                            className="boton_borrar"
                            value={"borrar"}
                        >
                            Borrar
                        </button>
                    )}
                    <div className="botones_derecha">
                        <button
                            type="button"
                            className="boton_secundario"
                            onClick={onCerrar}
                        >
                            Cancelar
                        </button>
                        {tarea ? (
                            <button
                                value={"modificar"}
                                type="submit"
                                className="boton_login"
                            >
                                Guardar
                            </button>
                        ) : (
                            <button type="submit" className="boton_login">
                                Guardar
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default TareaModal;
