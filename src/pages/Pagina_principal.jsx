import {
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
    useContext,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import TareaModal from "../components/TareaModal";
import "../css/calendario.css";
import { Context_user } from "../contexts/Context_usuario.jsx";

// ... dentro de tu componente principal ...

// 1. Creamos las referencias para controlar los temporizadores de manera independiente

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

function Pagina_principal() {
    const { usuario, logout } = useContext(Context_user);
    const navegacion = useNavigate();

    const { id } = useParams();
    const [fechaVista, setFechaVista] = useState(new Date());
    const [tareas, setTareas] = useState([]);
    const [cargando, setCargando] = useState(false);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
    const [fechaPrellenada, setFechaPrellenada] = useState(null);

    const [escuchando, setEscuchando] = useState(false);
    const [textoParcial, setTextoParcial] = useState("");
    const reconocimientoRef = useRef(null);

    const [textoCompleto, setTextoCompleto] = useState("");
    const timersTareasRef = useRef({});

    const dobleClicTareaExistente = (tarea) => {
        console.log("¡Doble clic detectado en la tarea!", tarea);
        // 💡 AQUÍ VA TU NUEVO CÓDIGO DISTINTO
    };
    // --- FUNCIÓN PARA CARGAR LAS TAREAS DESDE EL SERVIDOR ---
    const cargarTareas = useCallback(async () => {
        setCargando(true);
        try {
            const respuesta_leer_calendario = await fetch(
                `https://node-react-git-main-tomasmenecesfernandez.vercel.app/calendario/tareas/${id}`,
            );
            const datos_lectura = await respuesta_leer_calendario.json();
            console.log("se leyo el calendario: ", datos_lectura);
            // Guardamos las tareas en el estado para que se rendericen en pantalla
            setTareas(Array.isArray(datos_lectura) ? datos_lectura : []);
        } catch (error) {
            console.error("Error al cargar tareas:", error);
        } finally {
            setCargando(false);
        }
    }, [id]);

    // Ejecuta la carga de tareas al iniciar o cuando cambie el ID
    useEffect(() => {
        cargarTareas();
    }, [cargarTareas]);

    // --- Construcción de la grilla del mes (Sincrónico) ---
    const diasDelMes = useMemo(() => {
        const año = fechaVista.getFullYear();
        const mes = fechaVista.getMonth();
        const primerDia = new Date(año, mes, 1);
        const inicioGrilla = new Date(primerDia);
        inicioGrilla.setDate(inicioGrilla.getDate() - primerDia.getDay());

        const dias = [];
        for (let i = 0; i < 42; i++) {
            const dia = new Date(inicioGrilla);
            dia.setDate(inicioGrilla.getDate() + i);
            dias.push(dia);
        }
        return dias;
    }, [fechaVista]);

    const tareasPorDia = (dia) => {
        return tareas.filter((t) => {
            let f = new Date(t.fecha_inicio);
            f = new Date(t.fecha_final);
            return (
                f.getFullYear() === dia.getFullYear() &&
                f.getMonth() === dia.getMonth() &&
                f.getDate() === dia.getDate()
            );
        });
    };

    const irMesAnterior = () =>
        setFechaVista(
            new Date(fechaVista.getFullYear(), fechaVista.getMonth() - 1, 1),
        );
    const irMesSiguiente = () =>
        setFechaVista(
            new Date(fechaVista.getFullYear(), fechaVista.getMonth() + 1, 1),
        );
    const irHoy = () => setFechaVista(new Date());

    const abrirNuevaTarea = (dia) => {
        setTareaSeleccionada(null);
        setFechaPrellenada(dia || new Date());
        setModalAbierto(true);
    };

    const abrirTareaExistente = (tarea) => {
        setTareaSeleccionada(tarea);
        setFechaPrellenada(null);
        setModalAbierto(true);
    };

    // --- Micrófono: Web Speech API ---
    const soportaVoz =
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

    const alternarMicrofono = () => {
        if (!soportaVoz) {
            alert(
                "Tu navegador no soporta reconocimiento de voz. Probá con Chrome.",
            );
            return;
        }

        if (escuchando) {
            reconocimientoRef.current?.stop();
            return;
        }

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const reconocimiento = new SpeechRecognition();
        reconocimiento.lang = "es-AR";
        reconocimiento.continuous = true;
        reconocimiento.interimResults = true;

        let textoAcumuladoSincronico = "";

        reconocimiento.onstart = () => {
            setEscuchando(true);
            setTextoCompleto("");
            setTextoParcial("");
            textoAcumuladoSincronico = ""; // Limpiamos al iniciar
        };

        reconocimiento.onresult = (evento) => {
            let textoIntermedio = "";

            for (let i = evento.resultIndex; i < evento.results.length; ++i) {
                const transcripcion = evento.results[i][0].transcript;

                if (evento.results[i].isFinal) {
                    // ¡AQUÍ ESTÁ EL TRUCO!: Guardamos instantáneamente en la variable local (Sincrónico)
                    textoAcumuladoSincronico += " " + transcripcion.trim();

                    // Y también actualizamos el estado de React para que se vea lindo en pantalla
                    setTextoCompleto(textoAcumuladoSincronico.trim());
                } else {
                    textoIntermedio += transcripcion;
                }
            }
            setTextoParcial(textoIntermedio);
        };

        reconocimiento.onend = async () => {
            setEscuchando(false);
            setTextoParcial("");

            // Usamos directamente la variable local que SI tiene todo el texto completo al instante
            const textoListoParaEnviar = textoAcumuladoSincronico.trim();

            if (!textoListoParaEnviar) {
                console.log("No se detectó ningún texto para enviar.");
                return;
            }

            try {
                // Ahora sí verás el texto completo exacto aquí en la consola
                console.log(
                    "Texto completo final capturado:",
                    textoListoParaEnviar,
                );

                const respuesta = await fetch(
                    "https://node-react-git-main-tomasmenecesfernandez.vercel.app/asistente",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        // Enviamos la variable local garantizada
                        body: JSON.stringify({ prompt: textoListoParaEnviar }),
                    },
                );
                const datos = await respuesta.json();
                let textoExtraido = "";
                if (datos.respuesta) {
                    console.log("caso 2");
                    textoExtraido = datos.respuesta;
                }
                console.log("Texto real extraído de la IA:", textoExtraido);
                if (!textoExtraido.includes("[" && "]")) {
                    textoExtraido = (await "[ ") + textoExtraido + " ]";
                }
                // Enviamos los datos procesados a tu backend del calendario
                //await fetch(`http://localhost:4000/calendario/tareas/${id}`, {

                const respuesta34 = await realizar_peticion_post(textoExtraido);

                // Recibimos la respuesta del backend

                // CORRECCIÓN 2: Ahora verás en tu consola exactamente { respuesta: "funciona" } o lo que retorne tu BD

                const textoRespuesta = await respuesta34.text();
                console.log(
                    "Respuesta recibida en el Frontend:",
                    textoRespuesta,
                );
                if (textoRespuesta.includes("no existe tarea")) {
                    alert(
                        "No existe ninguna tarea en ese horario y día, vuelva a intentarlo.",
                    );
                }
                global.location.reload();

                // Opcional: Limpiamos los textos del asistente en pantalla para terminar el ciclo
                setTextoCompleto("");
                setTextoParcial("");
                // Refrescamos el calendario en pantalla
            } catch (error) {
                console.error(
                    "Error en el flujo de asistencia por voz:",
                    error,
                );
            }
        };

        reconocimientoRef.current = reconocimiento;
        reconocimiento.start();
    };

    const hoy = new Date();
    const realizar_peticion_post = async (textoExtraido) => {
        console.log(textoExtraido);
        return await fetch(
            `https://node-react-git-main-tomasmenecesfernandez.vercel.app/calendario/tareas/${id}`,
            {
                method: "POST",
                headers: { "Content-type": "application/json" },
                // Enviamos el objeto JSON limpio en lugar del string con los "\n"
                body: JSON.stringify({
                    datos: textoExtraido,
                }),
            },
        );
    };
    const cambiar_estado_completado = async (tarea) => {
        const nuevoEstado = !tarea.completada;
        tarea.completada = nuevoEstado;
        tarea.accion = "modificar";
        const variable = [];
        variable.push(tarea);
        console.log(JSON.stringify(variable));
        alert(variable);
        await realizar_peticion_post(JSON.stringify(variable));
        //global.location.reload();
    };
    return (
        <div className="calendario_pagina">
            <header className="calendario_header">
                {usuario != null && (
                    <div className="texto_completo">
                        Bienvenido: {usuario.nombre_completo}
                    </div>
                )}
                <div className="header_izquierda">
                    <button className="boton_icono" onClick={irHoy}>
                        Hoy
                    </button>
                    <button className="boton_icono" onClick={irMesAnterior}>
                        ‹
                    </button>
                    <button className="boton_icono" onClick={irMesSiguiente}>
                        ›
                    </button>
                    <h1>
                        {MESES[fechaVista.getMonth()]}{" "}
                        {fechaVista.getFullYear()}
                    </h1>
                </div>
                <div className="header_derecha">
                    <span className="nombre_usuario"></span>
                    <button
                        className="boton_secundario"
                        onClick={async () => {
                            await logout();
                            navegacion("/login");
                        }}
                    >
                        Salir
                    </button>
                </div>
            </header>
            <div className="grilla_dias_semana">
                {DIAS_SEMANA.map((d) => (
                    <div key={d} className="etiqueta_dia_semana">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grilla_calendario">
                {diasDelMes.map((dia, i) => {
                    const esMesActual =
                        dia.getMonth() === fechaVista.getMonth();
                    const esHoy =
                        dia.getFullYear() === hoy.getFullYear() &&
                        dia.getMonth() === hoy.getMonth() &&
                        dia.getDate() === hoy.getDate();
                    const tareasDia = tareasPorDia(dia);

                    return (
                        <div
                            key={i}
                            className={`celda_dia ${esMesActual ? "" : "fuera_de_mes"} ${esHoy ? "es_hoy" : ""}`}
                            onClick={() => abrirNuevaTarea(dia)} // ⚡ La celda del día reacciona al instante como antes
                        >
                            <span className="numero_dia">{dia.getDate()}</span>
                            <div className="lista_tareas_dia">
                                {/* Ordenamos por fecha_inicio antes de hacer el slice */}
                                {tareasDia
                                    .sort(
                                        (a, b) =>
                                            new Date(a.fecha_inicio) -
                                            new Date(b.fecha_inicio),
                                    )
                                    .slice(0, 3)
                                    .map((t) => {
                                        // Extraemos de forma segura la hora y los minutos de la tarea
                                        const fechaObj = new Date(
                                            t.fecha_inicio,
                                        );
                                        const horaFormateada = !isNaN(fechaObj)
                                            ? fechaObj.toLocaleTimeString(
                                                  "es-AR",
                                                  {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                  },
                                              )
                                            : "";

                                        const idTarea = t.id || t._id; // ID único de la tarea para el temporizador

                                        return (
                                            <div
                                                key={idTarea}
                                                className="chip_tarea"
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    // 🎨 CAMBIO AQUÍ: Creamos una variable CSS que React controla dinámicamente
                                                    "--fondo-dinamico":
                                                        t.completada
                                                            ? "#2ecc71"
                                                            : "#46e",
                                                    backgroundColor:
                                                        "var(--fondo-dinamico)",
                                                    transition:
                                                        "background-color 0.2s ease",
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Evita que se abra una "nueva tarea" al tocar el fondo

                                                    // Si ya se hizo un primer clic en esta tarea específica...
                                                    if (
                                                        timersTareasRef.current[
                                                            idTarea
                                                        ]
                                                    ) {
                                                        clearTimeout(
                                                            timersTareasRef
                                                                .current[
                                                                idTarea
                                                            ],
                                                        ); // Cancelamos el clic simple
                                                        delete timersTareasRef
                                                            .current[idTarea]; // Limpiamos la referencia

                                                        cambiar_estado_completado(
                                                            t,
                                                        ); // 💥 EJECUTA TU SEGUNDA TAREA AQUÍ (Tachar/Completar)
                                                    } else {
                                                        // Primer clic: esperamos un instante por si viene el segundo
                                                        timersTareasRef.current[
                                                            idTarea
                                                        ] = setTimeout(() => {
                                                            abrirTareaExistente(
                                                                t,
                                                            ); // 🟦 EJECUTA EL CLIC SIMPLE TRADICIONAL (Ver detalles)
                                                            delete timersTareasRef
                                                                .current[
                                                                idTarea
                                                            ];
                                                        }, 250); // 250 milisegundos de ventana de tiempo
                                                    }
                                                }}
                                            >
                                                {/* El título se mantiene alineado a la izquierda */}
                                                <span
                                                    style={{
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {t.titulo}
                                                </span>
                                                {/* La hora se empuja y se fija firmemente a la derecha */}
                                                <strong
                                                    style={{
                                                        whiteSpace: "nowrap",
                                                        fontSize: "0.85em",
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    {horaFormateada}
                                                </strong>
                                            </div>
                                        );
                                    })}
                                {tareasDia.length > 3 && (
                                    <div className="chip_mas">
                                        +{tareasDia.length - 3} más
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <button
                className={`boton_microfono ${escuchando ? "escuchando" : ""}`}
                onClick={alternarMicrofono}
                title={
                    escuchando
                        ? "Escuchando... tocá para detener"
                        : "Tocá para hablar"
                }
            >
                🎤
            </button>
            {(escuchando || textoParcial) && (
                <div className="burbuja_transcripcion">
                    {escuchando
                        ? textoParcial || "Escuchando..."
                        : "Procesando..."}
                </div>
            )}
            {cargando && (
                <div className="indicador_cargando">Actualizando…</div>
            )}
            {modalAbierto && (
                <TareaModal
                    tarea={tareaSeleccionada}
                    fechaPrellenada={fechaPrellenada}
                    onGuardar={async (e) => {
                        const a = await realizar_peticion_post(
                            JSON.stringify(e),
                        );
                        if (a) {
                            global.location.reload();
                        }

                        setModalAbierto(false);
                    }}
                    onBorrar={
                        tareaSeleccionada
                            ? () => {
                                  // Refresca la pantalla al borrar una tarea desde el modal
                                  cargarTareas();
                                  setModalAbierto(false);
                              }
                            : null
                    }
                    onCerrar={() => setModalAbierto(false)}
                />
            )}
        </div>
    );
}

export default Pagina_principal;
