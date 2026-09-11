function DiaAgendaModal({ dia, tareas, onAbrirTarea, onCerrar }) {
    const tareasOrdenadas = [...tareas].sort(
        (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio),
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
                        const inicio = new Date(t.fecha_inicio);
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
