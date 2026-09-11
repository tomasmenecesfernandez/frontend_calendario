// El backend manda las fechas como texto con espacio ("2026-09-11 07:00:00"),
// y new Date() de JavaScript no siempre lo interpreta bien. Reemplazamos el
// espacio por "T" para que quede en formato ISO real.
function parsearFecha(fechaTexto) {
    if (!fechaTexto) return new Date(NaN);
    return new Date(String(fechaTexto).replace(" ", "T"));
}

function DiaAgendaModal({ dia, tareas, onAbrirTarea, onCerrar }) {
    const tareasOrdenadas = [...tareas].sort(
        (a, b) => parsearFecha(a.fecha_inicio) - parsearFecha(b.fecha_inicio),
    );

    const tituloDia = dia
        ? dia.toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
          })
        : "";

    return (
        <div className="fondo_modal_dia" onClick={onCerrar}>
            <div className="caja_modal_dia" onClick={(e) => e.stopPropagation()}>
                <div className="encabezado_modal_dia">
                    <h2>{tituloDia}</h2>
                    <button className="cerrar_modal_dia" onClick={onCerrar}>
                        ✕
                    </button>
                </div>
                <div className="lista_agenda_dia">
                    {tareasOrdenadas.map((t) => {
                        const inicio = parsearFecha(t.fecha_inicio);
                        const horaFormateada = !isNaN(inicio)
                            ? inicio.toLocaleTimeString("es-AR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })
                            : "";

                        return (
                            <div
                                key={t.id || t._id}
                                className="fila_agenda_dia"
                                onClick={() => onAbrirTarea(t)}
                            >
                                <span className="hora_agenda_dia">{horaFormateada}</span>
                                <div
                                    className={`tarjeta_agenda_dia ${t.completada ? "completada" : ""}`}
                                >
                                    <div className="titulo_agenda">{t.titulo}</div>
                                    {t.descripcion && (
                                        <div className="descripcion_agenda">
                                            {t.descripcion}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default DiaAgendaModal;
