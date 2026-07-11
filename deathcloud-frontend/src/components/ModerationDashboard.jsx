import React, { useState, useEffect, useCallback } from "react";
import { FiShield, FiTrash2, FiCheckCircle, FiRefreshCw, FiAlertTriangle, FiCalendar, FiUser, FiMessageSquare } from "react-icons/fi";

const getApiUrl = (path) => {
  const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/api$/, "");
  return `${base}/api${path}`;
};

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(getApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Error en la petición: ${res.status}`);
  }
  return res.json();
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (err) {
    console.warn("formatDate failed:", err);
    return dateStr;
  }
}

export default function ModerationDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/moderacion/lista");
      if (data.success) {
        setReports(data.data || []);
      } else {
        setError(data.message || "Error al obtener la lista de reportes.");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.message || "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleAprobarReporte = async (reportId) => {
    setActionLoading(`approve-${reportId}`);
    try {
      const data = await apiFetch(`/moderacion/aprobar/${reportId}`, {
        method: "PUT",
        body: JSON.stringify({ estado: "Aprobado" }),
      });
      if (data.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, estado: "Aprobado" } : r))
        );
      }
    } catch (err) {
      console.error("Error approving report:", err);
      alert(err.message || "Error al aprobar el reporte.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEliminarComentario = async (comentarioId, reportId) => {
    if (!globalThis.confirm("¿Estás seguro de que deseas eliminar permanentemente este comentario? Todos los reportes asociados serán eliminados en cascada.")) {
      return;
    }
    setActionLoading(`delete-${comentarioId}`);
    try {
      const data = await apiFetch(`/moderacion/comentario/${comentarioId}`, {
        method: "DELETE",
      });
      if (data.success) {
        // Al eliminar el comentario, se borran todos los reportes asociados
        setReports((prev) => prev.filter((r) => r.comentario_id !== comentarioId));
        alert("El comentario y sus reportes asociados han sido eliminados del sistema.");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert(err.message || "Error al eliminar el comentario.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Info */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiShield className="text-red-400" /> Moderación y Reportes
          </h2>
          <p className="text-theme-muted text-xs mt-1">
            Supervisa los comentarios reportados por la comunidad y aplica medidas correctivas.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors text-xs font-bold uppercase tracking-wider disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />{" "}
          Actualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-200 text-sm">
          <FiAlertTriangle className="text-xl text-red-500 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Grid de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-lg">
            <FiAlertTriangle className="text-xl" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Reportes Pendientes</p>
            <p className="text-2xl font-bold text-white">
              {reports.filter((r) => r.estado === "Pendiente").length}
            </p>
          </div>
        </div>
        <div className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
            <FiCheckCircle className="text-xl" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Reportes Aprobados</p>
            <p className="text-2xl font-bold text-white">
              {reports.filter((r) => r.estado === "Aprobado").length}
            </p>
          </div>
        </div>
        <div className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
            <FiMessageSquare className="text-xl" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Denuncias</p>
            <p className="text-2xl font-bold text-white">{reports.length}</p>
          </div>
        </div>
      </div>

      {/* Tabla de Reportes */}
      <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-semibold w-16">ID</th>
                <th className="p-4 font-semibold w-40">Denunciante</th>
                <th className="p-4 font-semibold">Comentario Original</th>
                <th className="p-4 font-semibold w-44">Motivo</th>
                <th className="p-4 font-semibold w-44">Fecha</th>
                <th className="p-4 font-semibold w-32">Estado</th>
                <th className="p-4 font-semibold text-right w-48">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-white/80">
              {loading && reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2 text-theme-neon">
                      <FiRefreshCw className="animate-spin" /> Cargando reportes de moderación...
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No se han registrado reportes en el sistema. ¡La comunidad está limpia!
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-gray-500 font-mono">#{report.id}</td>
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <FiUser className="text-theme-muted" size={12} />
                        <span>{report.username}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs md:max-w-sm lg:max-w-md">
                      <p className="italic text-gray-300 whitespace-normal break-words">
                        "{report.comment_text}"
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {report.motivo}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar size={12} />
                        <span>{formatDate(report.fecha_reporte)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          report.estado === "Pendiente"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : report.estado === "Aprobado"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}
                      >
                        {report.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-55 group-hover:opacity-100 transition-opacity">
                        {report.estado === "Pendiente" && (
                          <button
                            onClick={() => handleAprobarReporte(report.id)}
                            disabled={actionLoading !== null}
                            className="px-2.5 py-1 text-[10px] font-bold rounded bg-green-900/30 hover:bg-green-950 text-green-400 border border-green-500/30 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                            title="Aprobar reporte (Marca como verificado)"
                          >
                            <FiCheckCircle size={10} /> Aprobar
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminarComentario(report.comentario_id, report.id)}
                          disabled={actionLoading !== null}
                          className="px-2.5 py-1 text-[10px] font-bold rounded bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-500/30 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                          title="Eliminar comentario ofensivo de la plataforma"
                        >
                          <FiTrash2 size={10} /> Eliminar Comentario
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

ModerationDashboard.propTypes = {
  // Sin props obligatorias actualmente
};
