import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FiUsers,
  FiShield,
  FiShieldOff,
  FiSearch,
  FiAlertTriangle,
  FiRefreshCw,
  FiUserCheck,
  FiShoppingBag,
  FiFileText,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiLifeBuoy,
  FiMonitor,
  FiLock,
  FiBarChart2,
  FiTrendingUp
} from "react-icons/fi";
import { useGame } from "../context/GameContext";
import ModerationDashboard from '../components/ModerationDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import StoreAnalyticsDashboard from './StoreAnalyticsDashboard';

const ADMIN_TABS = [
  { id: "usuarios", icon: FiUsers, label: "Usuarios", activeClass: "bg-theme-neon/20 text-theme-neon border-theme-neon/50" },
  { id: "juegos", icon: FiMonitor, label: "Juegos", activeClass: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" },
  { id: "tienda", icon: FiShoppingBag, label: "Tienda", activeClass: "bg-[#c084fc]/20 text-[#c084fc] border-[#c084fc]/50" },
  { id: "estadisticas", icon: FiBarChart2, label: "Estadísticas", activeClass: "bg-amber-500/20 text-amber-400 border-amber-500/50" },
  { id: "analiticas", icon: FiTrendingUp, label: "Analíticas", activeClass: "bg-indigo-500/20 text-indigo-400 border-indigo-500/50" },
  { id: "moderacion", icon: FiShield, label: "Moderación", activeClass: "bg-red-500/20 text-red-400 border-red-500/50" },
  { id: "soporte", icon: FiLifeBuoy, label: "Soporte", activeClass: "bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/50" }
];

export default function AdminDashboard({ user }) {
  const { refreshCatalog } = useGame();

  const [activeTab, setActiveTab] = useState("usuarios"); // usuarios, tienda, noticias

  // States for Usuarios
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // States for Tienda / Noticias
  const [games, setGames] = useState([]);
  const [storeItems, setStoreItems] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [juegosList, setJuegosList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'store' or 'news'
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [editingItem, setEditingItem] = useState(null);


  // Auth Header
  const getHeaders = () => {
    const token = user?.token || localStorage.getItem("jwt_token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Base URL
  const getApiUrl = (path) => {
    const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/api$/, "");
    return `${base}/api${path}`;
  };

  // URL para archivos subidos (imágenes). Proxeado via Nginx o directo al backend.
  const getUploadsUrl = (relativePath) => {
    if (!relativePath || relativePath.startsWith('http') || relativePath.startsWith('blob')) return relativePath;
    const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/api$/, "");
    return `${base}${relativePath}`;
  };

  const getEditingColor = (themeData = "#00d2ff") => {
    let t = themeData;
    if (typeof t === "string" && t.startsWith("{")) {
      try {
        t = JSON.parse(t)["theme-neon"] || "#00d2ff";
      } catch (e) {
        console.error("Theme parse error:", e);
      }
    } else if (t && typeof t === "object") {
      t = t["theme-neon"] || "#00d2ff";
    }
    if (t === "theme-neon") return "#00d2ff";
    if (/^\d+\s+\d+\s+\d+$/.test(String(t).trim())) {
      const parts = String(t).trim().split(/\s+/);
      return (
        "#" +
        parts.map((x) => parseInt(x).toString(16).padStart(2, "0")).join("")
      );
    }
    if (typeof t === "string" && t.startsWith("#")) return t;
    return "#00d2ff";
  };

  const isValidImg = (img) => img && img !== "none" && img !== "not-found";

  const getEditingImage = (item) => {
    if (!item) return null;
    if (item.previewUrl) return item.previewUrl;

    if (isValidImg(item.image)) return getImageUrl(item.image);
    if (isValidImg(item.url_portada)) return getImageUrl(item.url_portada);

    let assetsObj = null;
    if (typeof item.assets === "object" && item.assets !== null) {
      assetsObj = item.assets;
    } else if (typeof item.assets === "string") {
      try {
        assetsObj = JSON.parse(item.assets);
      } catch (e) {
        console.error("Asset parse error:", e);
      }
    }

    if (assetsObj) {
      const img = assetsObj.portada || assetsObj.heroBackground;
      if (isValidImg(img)) return getImageUrl(img);
    }

    return null;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === "none" || imagePath === "not-found")
      return imagePath;
    if (imagePath.startsWith("http")) return imagePath;
    const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/api$/, "");
    return `${base}${imagePath}`;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Users
      const resUsers = await fetch(getApiUrl("/admin/users"), {
        headers: getHeaders(),
      });
      if (resUsers.ok) {
        const dataU = await resUsers.json();
        setUsers(dataU.users || []);
      }

      // Fetch Catalog (Games, Store, News)
      const resCatalog = await fetch(getApiUrl("/catalog/games"));
      if (resCatalog.ok) {
        const dataC = await resCatalog.json();
        setGames(dataC.games || []);

        // Flatten store items and news for easy table rendering
        let allStore = [];
        let allNews = [];
        (dataC.games || []).forEach((g) => {
          if (g.store) allStore = [...allStore, ...g.store];
          if (g.news) allNews = [...allNews, ...g.news];
        });
        setStoreItems(allStore);
      }

      // Fetch Juegos
      const resJuegos = await fetch(getApiUrl("/catalog/games"));
      if (resJuegos.ok) {
        const dataJ = await resJuegos.json();
        setJuegosList(dataJ.games || []);
      }

      // Fetch Tickets
      const resTickets = await fetch(getApiUrl("/admin/tickets"), {
        headers: getHeaders(),
      });
      if (resTickets.ok) {
        const dataT = await resTickets.json();
        setTickets(dataT.tickets || []);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter Users
  const filteredUsers = React.useMemo(() => {
    const term = search.toLowerCase();
    return users.filter(
      (u) =>
        u.nombre_usuario.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.rol.toLowerCase().includes(term),
    );
  }, [search, users]);

  // TICKETS ACTIONS
  const handleUpdateTicketStatus = async (id, newStatus) => {
    setActionLoading(`ticket-${id}`);
    try {
      const res = await fetch(getApiUrl(`/admin/tickets/${id}/status`), {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ estado: newStatus }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error("Error updating ticket:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // USUARIOS ACTIONS
  const handleToggleBan = async (u) => {
    setActionLoading(`ban-${u.id}`);
    const isBanning = !u.baneado;
    let reason = "Violación de los términos de servicio.";

    if (isBanning) {
      const promptReason = globalThis.prompt(
        "Ingrese el motivo de la suspensión administrativa:",
        "Incumplimiento de normas de conducta.",
      );
      if (promptReason === null) {
        setActionLoading(null);
        return;
      }
      reason = promptReason || reason;
    }

    try {
      const res = await fetch(getApiUrl(`/admin/users/${u.id}/ban`), {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          baneado: isBanning,
          motivo_ban: isBanning ? reason : null,
        }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error("Error toggling ban:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (u) => {
    setActionLoading(`role-${u.id}`);
    const newRole = u.rol === "admin" ? "user" : "admin";
    if (
      !globalThis.confirm(
        `¿Estás seguro de que deseas cambiar el rol de ${u.nombre_usuario} a ${newRole}?`,
      )
    ) {
      setActionLoading(null);
      return;
    }
    try {
      const res = await fetch(getApiUrl(`/admin/users/${u.id}/role`), {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ rol: newRole }),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error("Error toggling role:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // CRUD ACTIONS
  const openModal = (type, mode, item = null) => {
    setModalType(type);
    setModalMode(mode);
    if (item) {
      setEditingItem(item);
    } else if (type === "store") {
      setEditingItem({
        category: "aspectos",
        rarity: "Común",
        rarityColor: "text-theme-muted",
        game_id: games.length > 0 ? games[0].id : "",
      });
    } else if (type === "news") {
      setEditingItem({
        game_id: games.length > 0 ? games[0].id : "",
        status: "published",
      });
    } else if (type === "juegos") {
      setEditingItem({ displayname: "", tagline: "", subtagline: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (type, item) => {
    if (type === "juegos") {
      const confirmText = globalThis.prompt(
        `Para eliminar este juego, escribe su nombre exactamente: ${item.displayName}`,
      );
      if (confirmText !== item.displayName) {
        alert("Nombre incorrecto. No se eliminó el juego.");
        return;
      }
    } else if (
      !globalThis.confirm(
        "¿Seguro que deseas eliminar este elemento de forma permanente?",
      )
    ) {
      return;
    }
    setActionLoading(`del-${item.id}`);
    try {
      const endpoint =
        type === "juegos"
          ? `/catalog/games/${item.id}`
          : `/catalog/${type}/${item.id}`;
      const res = await fetch(getApiUrl(endpoint), {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error("Error deleting:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploadingImage(true);
    try {
      const res = await fetch(getApiUrl("/admin/upload"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Guardar URL completa para que funcione detrás de Nginx
        setEditingItem({ ...editingItem, image: getUploadsUrl(data.imageUrl) });
      } else {
        alert(
          "Error al subir la imagen: " + (data.message || "Error desconocido"),
        );
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error de conexión al subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleJuegosSubmit = async () => {
    const suffix = modalMode === "edit" ? "/" + editingItem.id : "";
    const endpoint = "/catalog/games" + suffix;
    const method = modalMode === "edit" ? "PUT" : "POST";

    // Si hay un archivo nuevo, subirlo primero al servidor para obtener URL persistente
    let imageUrl = editingItem.image || editingItem.previewUrl || null;
    if (editingItem.rawFile) {
      try {
        const imgFormData = new FormData();
        imgFormData.append("image", editingItem.rawFile);
        const uploadRes = await fetch(getApiUrl("/admin/upload"), {
          method: "POST",
          headers: { Authorization: `Bearer ${user?.token || localStorage.getItem("jwt_token")}` },
          body: imgFormData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) {
          imageUrl = getUploadsUrl(uploadData.imageUrl);
        }
      } catch (uploadErr) {
        console.error("Error uploading game image:", uploadErr);
      }
    }

    const formData = new FormData();
    formData.append(
      "displayname",
      editingItem.displayname || editingItem.displayName || "",
    );
    formData.append("tagline", editingItem.tagline || "");
    formData.append("subtagline", editingItem.subtagline || "");
    formData.append("theme", typeof editingItem.theme === 'object' ? JSON.stringify(editingItem.theme) : (editingItem.theme || ""));
    // Pasar la URL de imagen como campo de texto (ya fue subida arriba)
    if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }

    try {
      const res = await fetch(getApiUrl(endpoint), {
        method,
        headers: {
          Authorization: `Bearer ${user?.token || localStorage.getItem("jwt_token")}`,
        },
        body: formData,
      });
      if (res.ok) {
        closeModal();
        await fetchData();
        await refreshCatalog();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert("Error al guardar el juego: " + (errData.message || res.status));
      }
    } catch (err) {
      console.error("Error saving juego:", err);
    }
  };

  const handleCatalogSubmit = async () => {
    const suffix = modalMode === "edit" ? "/" + editingItem.id : "";
    const endpoint = "/catalog/" + modalType + suffix;
    const method = modalMode === "edit" ? "PUT" : "POST";

    const payload = { ...editingItem };
    if (modalMode === "create" && !payload.id) {
      payload.id = `${modalType}-${Date.now()}`;
    }

    try {
      const res = await fetch(getApiUrl(endpoint), {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        closeModal();
        await fetchData();
        await refreshCatalog();
      } else {
        alert("Error al guardar el elemento.");
      }
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (modalType === "juegos") {
        await handleJuegosSubmit();
      } else {
        await handleCatalogSubmit();
      }
    } finally {
      setIsSaving(false);
    }
  };


  if (loading && !users.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-theme-neon">
        <FiRefreshCw className="animate-spin text-4xl mb-4" />
        <h2 className="text-xl font-bold tracking-wider uppercase">
          Conectando con Servidor de Administración...
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-widest uppercase flex items-center gap-3">
            <FiShield className="text-theme-neon" />
            Terminal de Control
          </h1>
          <p className="text-theme-muted mt-2">
            Nivel de Autorización: Administrador Global
          </p>
        </div>
        {/* TABS & CONTROLS */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex space-x-2 bg-theme-dark/50 p-1 rounded-lg border border-white/5">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              if (tab.isLink) {
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className="px-4 py-2 rounded font-bold uppercase tracking-wider text-sm transition-colors flex items-center gap-2 text-gray-400 hover:text-white border border-transparent"
                  >
                    <Icon /> {tab.label}
                  </Link>
                );
              }
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded font-bold uppercase tracking-wider text-sm transition-colors flex items-center gap-2 ${activeTab === tab.id
                      ? `${tab.activeClass} border`
                      : "text-gray-400 hover:text-white border border-transparent"
                    }`}
                >
                  <Icon /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* CONDITIONAL CONTROLS */}
          <div className="flex justify-end gap-2 min-h-[40px]">
            {["usuarios", "soporte"].includes(activeTab) && (
              <button
                onClick={async () => {
                  const type = activeTab === "soporte" ? "tickets" : activeTab;
                  const res = await fetch(getApiUrl(`/reports/${type}/excel`), {
                    headers: getHeaders(),
                  });
                  if (res.ok) {
                    const blob = await res.blob();
                    const url = globalThis.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `reporte_${type}.xlsx`;
                    a.click();
                  } else {
                    alert("Error al descargar Excel");
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 text-sm"
              >
                <FiFileText /> Exportar Excel
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-200">
          <FiAlertTriangle className="text-xl" />
          <p>{error}</p>
        </div>
      )}

      {/* --- TAB: USUARIOS --- */}
      {activeTab === "usuarios" && (
        <div className="space-y-6 animate-slide-up">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                <FiUsers className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Registrados</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
            </div>
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
                <FiUserCheck className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Usuarios Activos</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter((u) => !u.baneado).length}
                </p>
              </div>
            </div>
            <div className="bg-black/40 border border-red-500/30 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-red-500/20 text-red-400 rounded-lg">
                <FiShieldOff className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Suspendidos</p>
                <p className="text-2xl font-bold text-red-400">
                  {users.filter((u) => u.baneado).length}
                </p>
              </div>
            </div>
            <div className="bg-black/40 border border-theme-neon/30 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-theme-neon/20 text-theme-neon rounded-lg">
                <FiShield className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Administradores</p>
                <p className="text-2xl font-bold text-theme-neon">
                  {users.filter((u) => u.rol === "admin").length}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-theme-neon transition-colors" />
              <input
                type="text"
                placeholder="Buscar por usuario, email o rol..."
                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-theme-neon focus:ring-1 focus:ring-theme-neon transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const token = localStorage.getItem("jwt_token");
                  if (!token) return;
                  try {
                    const res = await fetch(getApiUrl("/admin/report/users"), {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error("Error al generar PDF");
                    const blob = await res.blob();
                    const url = globalThis.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "reporte_usuarios.pdf";
                    a.click();
                    globalThis.URL.revokeObjectURL(url);
                  } catch (e) {
                    console.error(e);
                    alert("Error al descargar el PDF");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg transition-colors font-bold text-sm uppercase tracking-wider"
              >
                📄 PDF
              </button>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />{" "}
                Refrescar
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider border-b border-white/10">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Usuario</th>
                    <th className="p-4 font-semibold">Rol</th>
                    <th className="p-4 font-semibold">Estado</th>
                    <th className="p-4 font-semibold text-right">
                      Acciones de Comando
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        No se encontraron registros en la base de datos.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="p-4 text-gray-500 font-mono">#{u.id}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">
                              {u.nombre_usuario}
                            </span>
                            <span className="text-xs text-gray-500">
                              {u.email}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${u.rol === "admin" ? "bg-theme-neon/20 text-theme-neon border border-theme-neon/30" : "bg-gray-800 text-gray-400 border border-gray-700"}`}
                          >
                            {u.rol === "admin" ? <FiShield /> : <FiUsers />}{" "}
                            {u.rol}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.baneado ? (
                            <div className="flex flex-col">
                              <span className="inline-flex items-center gap-1 text-red-400 font-bold text-sm">
                                <FiShieldOff /> SUSPENDIDO
                              </span>
                              <span
                                className="text-xs text-red-500/70 truncate max-w-[150px]"
                                title={u.motivo_ban}
                              >
                                {u.motivo_ban}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-green-400 font-bold text-sm">
                              <FiUserCheck /> ACTIVO
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            {(() => {
                              const roleBtnText =
                                u.rol === "admin" ? "Degradar" : "Promover";
                              const banBtnText = u.baneado
                                ? "Activar"
                                : "Banear";
                              const banBtnClasses = u.baneado
                                ? "bg-green-900/30 text-green-400 border-green-500/30 hover:bg-green-900/50"
                                : "bg-red-900/30 text-red-400 border-red-500/30 hover:bg-red-900/50";

                              return (
                                <>
                                  <button
                                    onClick={() => handleToggleRole(u)}
                                    disabled={actionLoading !== null}
                                    className="px-3 py-1.5 text-xs font-bold rounded bg-gray-800 hover:bg-gray-700 text-white border border-white/10 transition-colors disabled:opacity-50"
                                  >
                                    {actionLoading === `role-${u.id}`
                                      ? "..."
                                      : roleBtnText}
                                  </button>
                                  <button
                                    onClick={() => handleToggleBan(u)}
                                    disabled={actionLoading !== null}
                                    className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors disabled:opacity-50 flex items-center gap-1 ${banBtnClasses}`}
                                  >
                                    {actionLoading === `ban-${u.id}`
                                      ? "..."
                                      : banBtnText}
                                  </button>
                                </>
                              );
                            })()}
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
      )}

      {/* --- TAB: JUEGOS --- */}
      {activeTab === "juegos" && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiMonitor className="text-cyan-400" /> Catálogo de Juegos Base
            </h2>
            <button
              onClick={() => openModal("juegos", "create")}
              className="flex items-center gap-2 bg-cyan-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-cyan-400 transition-colors"
            >
              <FiPlus /> Nuevo Juego
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {juegosList.map((juego) => (
              <div
                key={juego.id}
                className="bg-black/60 border border-white/10 rounded-xl overflow-hidden shadow-2xl group flex flex-col"
              >
                <div
                  className="h-40 bg-gray-900 relative overflow-hidden flex-shrink-0"
                  style={{
                    background: (() => {
                      const img = getEditingImage(juego);
                      const color = getEditingColor(juego.theme);
                      if (img) return "transparent";
                      return `radial-gradient(circle at center, ${color} 0%, #000 100%)`;
                    })(),
                  }}
                >
                  {(() => {
                    const img = getEditingImage(juego);
                    return img ? (
                      <>
                        <img
                          src={img}
                          alt={juego.displayName || juego.displayname}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.style.background = `radial-gradient(circle at center, ${getEditingColor(juego.theme)} 0%, #000 100%)`;
                            e.target.nextSibling.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 to-transparent"></div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center mix-blend-overlay opacity-30">
                        <FiMonitor className="text-6xl text-white" />
                      </div>
                    );
                  })()}
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <button
                      onClick={() => openModal("juegos", "edit", juego)}
                      className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-transform hover:scale-110 shadow-lg"
                    >
                      <FiEdit2 />
                    </button>
                    {juego.is_core ? (
                      <button
                        disabled
                        className="p-3 bg-gray-600/50 rounded-full text-white cursor-not-allowed group-hover:animate-pulse shadow-lg"
                        title="Juego Core (Bloqueado)"
                      >
                        <FiLock />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDelete("juegos", juego)}
                        className="p-3 bg-red-600 rounded-full text-white hover:bg-red-500 transition-transform hover:scale-110 shadow-lg"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3
                      className="text-lg font-bold text-white truncate"
                      title={juego.displayName}
                    >
                      {juego.displayName}
                    </h3>
                    <span className="text-xs font-bold uppercase px-2 py-1 bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 rounded">
                      {juego.subTagline || "ARCADE"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 flex-1 line-clamp-3">
                    {juego.tagline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB: TIENDA --- */}
      {activeTab === "tienda" && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FiShoppingBag className="text-[#c084fc]" /> Catálogo de Tienda
            </h2>
            <button
              onClick={() => openModal("store", "create")}
              className="flex items-center gap-2 bg-[#c084fc] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#a855f7] transition-colors"
            >
              <FiPlus /> Nuevo Objeto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {storeItems.map((item) => (
              <div
                key={item.id}
                className="bg-black/40 border border-white/10 rounded-lg p-4 flex flex-col gap-3 group relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-xs font-bold uppercase px-2 py-1 bg-black/60 rounded border border-white/10 ${item.rarityColor || "text-white"}`}
                  >
                    {item.rarity}
                  </span>
                  <span className="text-xs text-gray-500">{item.game_id}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/5 rounded border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image !== "none" && item.image !== "not-found" ? (
                      <img
                        src={item.image}
                        alt="icon"
                        className="w-full object-contain"
                      />
                    ) : (
                      <FiShoppingBag className="text-gray-600 text-2xl" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{item.title}</h3>
                    <p className="text-theme-neon font-bold">{item.price} EP</p>
                  </div>
                </div>
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <button
                    onClick={() => openModal("store", "edit", item)}
                    className="p-2 bg-blue-600 rounded text-white hover:bg-blue-500 transition-colors"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete("store", item)}
                    className="p-2 bg-red-600 rounded text-white hover:bg-red-500 transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* --- TAB: ESTADÍSTICAS --- */}
      {activeTab === "estadisticas" && (
        <StoreAnalyticsDashboard embedded={true} />
      )}

      {/* --- TAB: ANALÍTICAS --- */}
      {activeTab === "analiticas" && (
        <AnalyticsDashboard embedded={true} />
      )}

      {/* --- TAB: MODERACIÓN --- */}
          {activeTab === "moderacion" && (
            <ModerationDashboard />
          )}

          {/* --- TAB: SOPORTE --- */}
          {activeTab === "soporte" && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiLifeBuoy className="text-[#3b82f6]" /> Gestión de Tickets
                </h2>
              </div>

              <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider border-b border-white/10">
                        <th className="p-4 font-semibold">ID</th>
                        <th className="p-4 font-semibold">Jugador</th>
                        <th className="p-4 font-semibold">Asunto</th>
                        <th className="p-4 font-semibold">Estado</th>
                        <th className="p-4 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {tickets.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-gray-500">
                            No hay tickets registrados en el sistema.
                          </td>
                        </tr>
                      ) : (
                        tickets.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-white/5 transition-colors group"
                          >
                            <td className="p-4 text-gray-500 font-mono">#{t.id}</td>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-white">
                                  {t.usuarioNombre}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {t.usuarioEmail}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 max-w-xs">
                              <div className="flex flex-col">
                                <span
                                  className="font-bold text-white truncate"
                                  title={t.titulo}
                                >
                                  {t.titulo}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">
                                  {t.categoria} • Prioridad {t.prioridad}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              {(() => {
                                let statusClass = "text-gray-400 border-gray-600";
                                if (t.estado === "abierto")
                                  statusClass =
                                    "text-theme-neon border-theme-neon/30";
                                else if (t.estado === "en_progreso")
                                  statusClass =
                                    "text-[#c084fc] border-[#c084fc]/30";
                                else if (t.estado === "resuelto")
                                  statusClass =
                                    "text-green-400 border-green-500/30";

                                return (
                                  <select
                                    value={t.estado}
                                    onChange={(e) =>
                                      handleUpdateTicketStatus(t.id, e.target.value)
                                    }
                                    disabled={actionLoading !== null}
                                    className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-black border cursor-pointer focus:outline-none disabled:opacity-50 ${statusClass}`}
                                  >
                                    <option
                                      value="abierto"
                                      className="bg-black text-white"
                                    >
                                      Abierto
                                    </option>
                                    <option
                                      value="en_progreso"
                                      className="bg-black text-white"
                                    >
                                      En Progreso
                                    </option>
                                    <option
                                      value="resuelto"
                                      className="bg-black text-white"
                                    >
                                      Resuelto
                                    </option>
                                    <option
                                      value="cerrado"
                                      className="bg-black text-white"
                                    >
                                      Cerrado
                                    </option>
                                  </select>
                                );
                              })()}
                            </td>
                            <td className="p-4 text-right align-middle">
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs text-gray-500">
                                  {new Date(t.fecha_creacion).toLocaleDateString()}
                                </span>
                                {actionLoading === `ticket-${t.id}` && (
                                  <span className="text-xs text-theme-neon animate-pulse">
                                    Guardando...
                                  </span>
                                )}
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
          )}

          {/* --- CRUD MODAL --- */}
          {isModalOpen && createPortal(
            <div className="fixed inset-0 w-screen h-screen z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#0f172a] border border-white/20 p-6 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <FiX className="text-2xl" />
                </button>
                <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
                  {(() => {
                    const modeText = modalMode === "create" ? "Crear" : "Editar";
                    let typeText = "Juego";
                    if (modalType === "store") typeText = "Objeto";
                    else if (modalType === "news") typeText = "Noticia";
                    return `${modeText} ${typeText}`;
                  })()}
                </h2>

                <form onSubmit={handleSubmitModal} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {modalMode === "create" &&
                      (modalType === "store" || modalType === "news") && (
                        <div className="col-span-2 md:col-span-1">
                          <label
                            htmlFor="modalId"
                            className="block text-xs text-gray-400 font-bold mb-1"
                          >
                            ID Único (Opcional)
                          </label>
                          <input
                            id="modalId"
                            type="text"
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                            value={editingItem.id || ""}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem, id: e.target.value })
                            }
                            placeholder="ej: item-01"
                          />
                        </div>
                      )}
                    {(modalType === "store" || modalType === "news") && (
                      <div className="col-span-2 md:col-span-1">
                        <label
                          htmlFor="modalGameId"
                          className="block text-xs text-gray-400 font-bold mb-1"
                        >
                          Juego Destino (ID)
                        </label>
                        <select
                          id="modalGameId"
                          className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                          value={editingItem.game_id || games[0]?.id || ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              game_id: e.target.value,
                            })
                          }
                          required
                        >
                          {games.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.displayName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="modalTitle"
                      className="block text-xs text-gray-400 font-bold mb-1"
                    >
                      Título / Nombre
                    </label>
                    <input
                      id="modalTitle"
                      type="text"
                      className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                      value={
                        editingItem.title ||
                        editingItem.displayname ||
                        editingItem.displayName ||
                        ""
                      }
                      onChange={(e) => {
                        if (modalType === "juegos")
                          setEditingItem({
                            ...editingItem,
                            displayname: e.target.value,
                            displayName: e.target.value,
                          });
                        else
                          setEditingItem({ ...editingItem, title: e.target.value });
                      }}
                      required
                    />
                  </div>

                  {modalType === "juegos" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="modalGenre"
                          className="block text-xs text-gray-400 font-bold mb-1"
                        >
                          Género
                        </label>
                        <input
                          id="modalGenre"
                          type="text"
                          className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                          value={editingItem.tagline || editingItem.genero || ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              tagline: e.target.value,
                            })
                          }
                          placeholder="ej: Arcade / RPG"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="modalTheme"
                          className="block text-xs text-gray-400 font-bold mb-1"
                        >
                          Color Temático
                        </label>
                        <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded p-1">
                          <input
                            id="modalTheme"
                            type="color"
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                            value={getEditingColor(editingItem.theme)}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                theme: e.target.value,
                              })
                            }
                          />
                          <span className="text-white font-mono text-sm uppercase">
                            {getEditingColor(editingItem.theme)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {modalType === "store" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="modalPrice"
                            className="block text-xs text-gray-400 font-bold mb-1"
                          >
                            Precio (E-Points)
                          </label>
                          <input
                            id="modalPrice"
                            type="number"
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                            value={editingItem.price || 0}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                price: Number.parseInt(e.target.value, 10),
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="modalCategory"
                            className="block text-xs text-gray-400 font-bold mb-1"
                          >
                            Categoría
                          </label>
                          <select
                            id="modalCategory"
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                            value={editingItem.category || "aspectos"}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                category: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="aspectos">Aspectos</option>
                            <option value="armas">Armas</option>
                            <option value="iconos">Iconos</option>
                            <option value="monturas">Monturas</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="modalRarity"
                            className="block text-xs text-gray-400 font-bold mb-1"
                          >
                            Rareza
                          </label>
                          <select
                            id="modalRarity"
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                            value={editingItem.rarity || "Común"}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                rarity: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="Común">Común</option>
                            <option value="Raro">Raro</option>
                            <option value="Épico">Épico</option>
                            <option value="Legendario">Legendario</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="modalRarityColor"
                            className="block text-xs text-gray-400 font-bold mb-1"
                          >
                            Color de Rareza
                          </label>
                          <select
                            id="modalRarityColor"
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                            value={editingItem.rarityColor || "text-theme-muted"}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                rarityColor: e.target.value,
                              })
                            }
                            required
                          >
                            <option
                              value="text-theme-muted"
                              className="text-gray-400"
                            >
                              Gris (Común)
                            </option>
                            <option
                              value="text-[#f87171]"
                              className="text-[#f87171]"
                            >
                              Rojo (Raro)
                            </option>
                            <option
                              value="text-theme-neon"
                              className="text-green-400"
                            >
                              Verde (Épico)
                            </option>
                            <option
                              value="text-[#c084fc]"
                              className="text-[#c084fc]"
                            >
                              Morado (Legendario)
                            </option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {modalType === "news" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="modalDate"
                          className="block text-xs text-gray-400 font-bold mb-1"
                        >
                          Fecha
                        </label>
                        <input
                          id="modalDate"
                          type="date"
                          className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                          value={editingItem.date || ""}
                          onChange={(e) =>
                            setEditingItem({ ...editingItem, date: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="modalStatus"
                          className="block text-xs text-gray-400 font-bold mb-1"
                        >
                          Estado
                        </label>
                        <select
                          id="modalStatus"
                          className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                          value={editingItem.status || "draft"}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              status: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="draft">Borrador</option>
                          <option value="published">Publicado</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="modalDesc"
                      className="block text-xs text-gray-400 font-bold mb-1"
                    >
                      Descripción / Contenido
                    </label>
                    <textarea
                      id="modalDesc"
                      rows="3"
                      className="w-full bg-black/50 border border-white/10 rounded p-2 text-white"
                      value={
                        modalType === "juegos"
                          ? editingItem.subtagline || editingItem.desc || ""
                          : editingItem.description || editingItem.desc || ""
                      }
                      onChange={(e) => {
                        if (modalType === "store")
                          setEditingItem({
                            ...editingItem,
                            description: e.target.value,
                          });
                        else if (modalType === "juegos")
                          setEditingItem({
                            ...editingItem,
                            subtagline: e.target.value,
                          });
                        else
                          setEditingItem({ ...editingItem, desc: e.target.value });
                      }}
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label
                      htmlFor="modalImage"
                      className="block text-xs text-gray-400 font-bold mb-1"
                    >
                      Imagen / Portada
                    </label>
                    <p className="text-[10px] text-gray-500 mb-2">
                      Resolución recomendada: 1920x1080 (16:9), formato WebP/JPG,
                      máximo 2MB.
                    </p>
                    <div className="flex items-center gap-4">
                      {getEditingImage(editingItem) ? (
                        <div
                          className="w-32 h-20 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden relative shadow-lg"
                          style={{
                            background: (() => {
                              const img = getEditingImage(editingItem);
                              const color = getEditingColor(editingItem.theme);
                              if (img) return "transparent";
                              return `radial-gradient(circle at center, ${color} 0%, #000 100%)`;
                            })(),
                          }}
                        >
                          {getEditingImage(editingItem) ? (
                            <>
                              <img
                                src={getEditingImage(editingItem)}
                                alt="preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentElement.style.background = `radial-gradient(circle at center, ${getEditingColor(editingItem.theme)} 0%, #000 100%)`;
                                  e.target.nextSibling.style.display = "none";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 to-transparent"></div>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center mix-blend-overlay opacity-30">
                              <FiMonitor className="text-2xl text-white" />
                            </div>
                          )}
                        </div>
                      ) : null}
                      <div className="flex-1">
                        <input
                          id="modalImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (modalType === "juegos") {
                              const file = e.target.files[0];
                              if (file)
                                setEditingItem({
                                  ...editingItem,
                                  rawFile: file,
                                  previewUrl: globalThis.URL.createObjectURL(file),
                                });
                            } else {
                              handleImageUpload(e);
                            }
                          }}
                          disabled={uploadingImage}
                          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#c084fc]/10 file:text-[#c084fc] hover:file:bg-[#c084fc]/20"
                        />
                        {uploadingImage && (
                          <p className="text-xs text-theme-neon mt-2 animate-pulse">
                            Subiendo imagen...
                          </p>
                        )}
                        <input
                          type="hidden"
                          value={editingItem.image || editingItem.url_portada || ""}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2 rounded font-bold text-gray-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-6 py-2 rounded font-bold text-black transition-colors ${modalType === "store" ? "bg-[#c084fc] hover:bg-[#a855f7]" : "bg-[#4ade80] hover:bg-[#22c55e]"} ${isSaving ? "opacity-70 cursor-wait animate-pulse" : ""}`}
                    >
                      {isSaving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          , document.body)}
        </div>
      );
}

      AdminDashboard.propTypes = {
        user: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      token: PropTypes.string,
      rol: PropTypes.string,
  }),
};
