import React, { useState, useEffect, useRef } from 'react';
import {
  FiArrowLeft,
  FiFileText,
  FiDownload,
  FiRefreshCw,
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiCheckCircle,
  FiTrendingUp,
  FiAward
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

// Registrar componentes de Chart.js necesarios para react-chartjs-2
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function StoreAnalyticsDashboard({ embedded = false }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const dashboardRef = useRef(null);

  // Helper para obtener URL base de la API
  const getApiUrl = (path) => {
    const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
    return `${base}/api${path}`;
  };

  // Helper para cabeceras con autenticación JWT
  const getHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchStatsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl('/analytics/dashboard'), {
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('No tienes autorización de Administrador para ver este panel.');
        }
        throw new Error('Error al conectar con el servidor de estadísticas.');
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Error desconocido.');
      }
    } catch (err) {
      console.error('Error fetching analytics stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para exportar a PDF (Formato Business Intelligence)
  const exportToPDF = async () => {
    if (isExportingPDF) return;
    setIsExportingPDF(true);
    try {
      const doc = new jsPDF();
      let cursorY = 20;
      const marginX = 14;

      // --- PORTADA Y CABECERA ---
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      doc.text('Informe de Business Intelligence: Tienda y Conexiones', marginX, cursorY);

      cursorY += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha del reporte: ${new Date().toLocaleDateString()} | Analista: Senior Data Analyst & BI`, marginX, cursorY);

      // --- SECCIÓN 1: RESUMEN EJECUTIVO ---
      cursorY += 15;
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text('1. Resumen Ejecutivo (Tienda)', marginX, cursorY);

      cursorY += 8;
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      const text1 = `El presente informe detalla el rendimiento comercial de la plataforma Deathcloud Runner. Actualmente, contamos con ${stats?.totalRegistros || 0} usuarios registrados. Se han realizado ${stats?.comprasTienda || 0} transacciones en la tienda, involucrando a ${stats?.compradoresUnicos || 0} compradores únicos. El total de E-Points en circulación o gastados asciende a ${stats?.ePointsGastados || 0}. Este volumen indica una participación sostenida en la economía virtual del juego.`;
      const split1 = doc.splitTextToSize(text1, 180);
      doc.text(split1, marginX, cursorY);
      cursorY += split1.length * 6 + 10;

      // --- SECCIÓN 2: GRÁFICOS (Captura) ---
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text('2. Análisis de Tráfico y Rendimiento de Ítems', marginX, cursorY);
      cursorY += 8;

      const element = dashboardRef.current;
      if (element) {
        // Ocultar botones antes de capturar
        const buttons = element.querySelector('#store-export-buttons');
        if (buttons) buttons.style.display = 'none';

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#09090b',
          logging: false
        });

        if (buttons) buttons.style.display = 'flex';

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 180;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (cursorY + pdfHeight > 280) {
          doc.addPage();
          cursorY = 20;
        }

        doc.addImage(imgData, 'PNG', marginX, cursorY, pdfWidth, pdfHeight);
        cursorY += pdfHeight + 10;
      }

      // --- SECCIÓN 3: CONCLUSIONES COMERCIALES ---
      if (cursorY > 230) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text('3. Conclusiones Comerciales', marginX, cursorY);
      cursorY += 8;
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);

      let topItemText = "No hay suficientes datos de ítems vendidos.";
      if (stats?.topItems && stats.topItems.length > 0) {
        topItemText = `El ítem más vendido es "${stats.topItems[0].name}" con un valor de ${stats.topItems[0].cost_epoints} E-Points. Se recomienda enfocar las futuras campañas de marketing en cosméticos o mejoras de características similares, dado su comprobado éxito de ventas.`;
      }

      const textConclusions = `Para capitalizar las ventas y aumentar el engagement comercial, se recomiendan las siguientes acciones:\n\n1. Promoción de Ítems: ${topItemText}\n\n2. Optimización de Horarios: Analizar los picos de tráfico mostrados en la gráfica de conexiones para lanzar ofertas flash (descuentos en E-Points) exactamente en los momentos de mayor afluencia de usuarios.\n\n3. Retención de Compradores: Se ha identificado a ${stats?.compradoresUnicos || 0} compradores únicos. Es vital implementar un sistema de recompensas o fidelidad para asegurar que vuelvan a adquirir E-Points en futuras temporadas.`;

      const splitConcl = doc.splitTextToSize(textConclusions, 180);
      doc.text(splitConcl, marginX, cursorY);

      // Método robusto para forzar la descarga y el nombre
      const pdfOutput = doc.output('blob');
      const pdfBlob = new Blob([pdfOutput], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `Informe_BI_Tienda_${Date.now()}.pdf`);
      document.body.appendChild(link);

      // Simular click
      link.click();

      // Limpiar asyncronamente para evitar race conditions
      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(blobUrl);
      }, 250);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Ocurrió un error al exportar a PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Función para exportar a Excel (Generar XLSX con datos de la tabla)
  const exportToExcel = () => {
    if (!stats?.recentPurchases || stats.recentPurchases.length === 0) {
      alert('No hay datos en la tabla para exportar.');
      return;
    }

    try {
      // Mapear los datos para mejor formato de columnas en Excel
      const excelRows = stats.recentPurchases.map(row => ({
        'ID de Registro': row.id,
        'Usuario': row.usuario,
        'Artículo Adquirido': row.item,
        'Costo (E-Points)': row.costo_epoints,
        'Fecha de Adquisición': new Date(row.fecha).toLocaleString('es-ES')
      }));

      // Crear hoja de cálculo y libro de Excel
      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial de Compras');

      // Calcular anchos automáticos de columnas para que no se corten los textos
      const colWidths = Object.keys(excelRows[0]).map(key => {
        const maxLength = Math.max(
          key.length,
          ...excelRows.map(row => (row[key] ? row[key].toString().length : 0))
        );
        return { wch: maxLength + 3 };
      });
      worksheet['!cols'] = colWidths;

      // Descargar archivo Excel
      XLSX.writeFile(workbook, `reporte-compras-tienda-${Date.now()}.xlsx`);
    } catch (err) {
      console.error('Error generando Excel:', err);
      alert('Ocurrió un error al exportar a Excel.');
    }
  };

  // Opciones base de estilizado oscuro para gráficos de Chart.js
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e0f2fe',
          font: { family: 'sans-serif', weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(9, 9, 11, 0.95)',
        titleColor: '#00d2ff',
        bodyColor: '#fff',
        borderColor: 'rgba(0, 210, 255, 0.3)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#7dd3fc' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#7dd3fc', precision: 0 }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-theme-neon">
        <FiRefreshCw className="animate-spin text-4xl mb-4" />
        <h2 className="text-xl font-bold tracking-wider uppercase">Cargando métricas del sistema...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 glass-panel border border-red-500/40 shadow-red bg-black/40 rounded-2xl text-center">
        <h2 className="text-2xl font-black text-red-400 tracking-wider uppercase mb-4">Acceso Denegado / Error de Carga</h2>
        <p className="text-theme-text opacity-90 mb-6">{error}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={fetchStatsData}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-bold"
          >
            <FiRefreshCw /> Reintentar
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-lg transition-colors font-bold"
          >
            <FiArrowLeft /> Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  const { generalStats, topItemsChart, trafficChart, recentPurchases } = stats;

  return (
    <div className="space-y-6 pb-16 animate-fade-in">

      {/* Botón de Retorno y Título */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-theme-neon/20 pb-4">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-black text-theme-neon uppercase tracking-widest hover:underline mb-2">
            <FiArrowLeft /> Volver al panel de control
          </Link>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <FiAward className="text-theme-neon animate-pulse" />
            METRICAS Y REPORTES ANALITICOS
          </h1>
          <p className="text-theme-muted text-sm mt-1">Monitoreo de rendimiento de tienda, conexiones y comportamiento en tiempo real.</p>
        </div>

        {/* Acciones de Exportación */}
        <div id="store-export-buttons" className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-theme-dark rounded-lg text-sm font-bold transition-all shadow-[0_0_8px_rgba(16,185,129,0.15)]"
          >
            <FiDownload /> Exportar a Excel
          </button>
          <button
            onClick={exportToPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-theme-neon/10 border border-theme-neon/30 text-theme-neon hover:bg-theme-neon hover:text-theme-dark rounded-lg text-sm font-bold transition-all disabled:opacity-50 shadow-[0_0_8px_rgba(0,210,255,0.15)]"
          >
            {isExportingPDF ? (
              <>
                <FiRefreshCw className="animate-spin" /> Procesando...
              </>
            ) : (
              <>
                <FiFileText /> Exportar a PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Contenido Completo del Dashboard (Contenedor Capturable) */}
      <div ref={dashboardRef} id="dashboard-content" className="space-y-6 p-4 rounded-2xl bg-theme-dark/40">

        {/* Fila de Tarjetas (General Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel border border-white/5 bg-black/35 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-theme-muted uppercase tracking-widest font-mono">Usuarios Registrados</p>
              <h3 className="text-3xl font-black text-white font-mono">{generalStats.totalUsers}</h3>
            </div>
            <div className="p-3 bg-theme-neon/15 text-theme-neon rounded-xl"><FiUsers size={22} /></div>
          </div>

          <div className="glass-panel border border-white/5 bg-black/35 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-theme-muted uppercase tracking-widest font-mono">Compras en Tienda</p>
              <h3 className="text-3xl font-black text-white font-mono">{generalStats.totalSales}</h3>
            </div>
            <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl"><FiShoppingBag size={22} /></div>
          </div>

          <div className="glass-panel border border-white/5 bg-black/35 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-theme-muted uppercase tracking-widest font-mono">E-Points Gastados</p>
              <h3 className="text-3xl font-black text-white font-mono">{generalStats.totalEpointsSpent.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl"><FiDollarSign size={22} /></div>
          </div>

          <div className="glass-panel border border-white/5 bg-black/35 p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-theme-muted uppercase tracking-widest font-mono">Compradores Unicos</p>
              <h3 className="text-3xl font-black text-white font-mono">{generalStats.uniqueBuyers}</h3>
            </div>
            <div className="p-3 bg-purple-500/15 text-purple-400 rounded-xl"><FiCheckCircle size={22} /></div>
          </div>
        </div>

        {/* Sección de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Top Items */}
          <div className="glass-panel border border-white/5 bg-black/35 p-5 rounded-2xl flex flex-col h-96">
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp className="text-theme-neon text-lg" />
              <h3 className="text-md font-bold text-white uppercase tracking-wider">TOP 5 ITEMS MAS VENDIDOS</h3>
            </div>
            <div className="flex-1 relative">
              <Bar data={topItemsChart} options={chartOptions} />
            </div>
          </div>

          {/* Gráfico de Líneas - Tráfico de Conexiones */}
          <div className="glass-panel border border-white/5 bg-black/35 p-5 rounded-2xl flex flex-col h-96">
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp className="text-theme-success text-lg" />
              <h3 className="text-md font-bold text-white uppercase tracking-wider">HISTORIAL DE TRAFICO DE CONEXIONES</h3>
            </div>
            <div className="flex-1 relative">
              <Line data={trafficChart} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Tabla de Datos de Compras */}
        <div className="glass-panel border border-white/5 bg-black/35 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FiFileText className="text-theme-neon" />
              Tabla de Reportes: Transacciones de Tienda
            </h3>
            <span className="text-[10px] bg-theme-neon/10 text-theme-neon border border-theme-neon/30 px-2 py-1 rounded font-mono font-bold uppercase">
              Se muestran las últimas 100 compras
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/50 text-[10px] text-theme-muted uppercase tracking-widest font-mono border-b border-white/10">
                  <th className="px-6 py-4 font-bold">ID Registro</th>
                  <th className="px-6 py-4 font-bold">Usuario</th>
                  <th className="px-6 py-4 font-bold">Artículo</th>
                  <th className="px-6 py-4 font-bold text-right">Costo (E-Points)</th>
                  <th className="px-6 py-4 font-bold text-right">Fecha de Compra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-theme-text/90 font-mono">
                {recentPurchases.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5 text-theme-muted">#{row.id}</td>
                    <td className="px-6 py-3.5 font-bold text-white">{row.usuario}</td>
                    <td className="px-6 py-3.5 text-sky-300 font-sans font-medium">{row.item}</td>
                    <td className="px-6 py-3.5 text-right text-amber-400 font-bold">{row.costo_epoints} EP</td>
                    <td className="px-6 py-3.5 text-right text-theme-muted">{new Date(row.fecha).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
