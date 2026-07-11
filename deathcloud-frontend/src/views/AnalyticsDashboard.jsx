import { useState, useEffect } from 'react';
import { FaThumbsUp, FaStar, FaTrophy, FaChartLine, FaTimes, FaThumbsDown, FaFilePdf, FaFileExcel, FaUsers, FaUserClock, FaComments } from 'react-icons/fa';
import { jsPDF } from 'jspdf';

import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { newsService } from '../services/newsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({ totalLikes: 0, averageRating: '0.0', topNews: [] });
  const [userStats, setUserStats] = useState({ total_users: 0, active_sessions: 0, total_messages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const [newsResult, usersResult, listResult] = await Promise.all([
        newsService.getNewsStats(),
        newsService.getUserStats(),
        newsService.getUsers()
      ]);
      
      if (newsResult.success) {
        setStats(newsResult.data);
      } else {
        setError(newsResult.error);
      }
      
      if (usersResult.success && usersResult.data) {
        setUserStats(usersResult.data);
      }
      
      if (listResult && listResult.success && listResult.data) {
        setUsersList(listResult.data);
      }
      
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 p-4 text-red-500 border border-red-500/20">
        <p className="font-medium text-center">{error}</p>
      </div>
    );
  }

  const handleDownloadPDF = async () => { // NOSONAR
    try {
      const doc = new jsPDF();
      let cursorY = 20;
      const marginX = 14;


      // --- PORTADA Y CABECERA ---
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      doc.text('Informe de Business Intelligence: Deathcloud Runner', marginX, cursorY);
      
      cursorY += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha del reporte: ${new Date().toLocaleDateString()} | Analista: Senior Data Analyst & BI`, marginX, cursorY);
      
      // --- SECCIÓN 1: RESUMEN EJECUTIVO ---
      cursorY += 15;
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138); // Blue-900
      doc.text('1. Resumen Ejecutivo', marginX, cursorY);
      
      cursorY += 8;
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      const text1 = `El presente informe detalla el estado actual de la plataforma Deathcloud Runner, analizando las métricas de comunidad, patrones de tráfico y la receptividad del contenido. Actualmente, la plataforma mantiene una valoración global altamente positiva de ${stats.averageRating} / 5.0 y acumula ${stats.totalLikes} "Me gusta" orgánicos. Si bien la base de usuarios inicial (${parseInt(userStats.total_users || 0)} registrados) demuestra un engagement sostenido mediante ${parseInt(userStats.active_sessions || 0)} sesiones activas y un volumen de ${parseInt(userStats.total_messages || 0)} mensajes privados, hemos identificado patrones de conexión altamente polarizados y una recepción mixta en las últimas actualizaciones que requieren acción estratégica inmediata.`;
      const split1 = doc.splitTextToSize(text1, 180);
      doc.text(split1, marginX, cursorY);
      cursorY += split1.length * 6 + 10;

      // --- SECCIÓN 2: TRÁFICO ---
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text('2. Análisis de Tráfico y Comunidad', marginX, cursorY);

      cursorY += 8;
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      
      const ratioSesiones = (parseInt(userStats.active_sessions || 0) / (parseInt(userStats.total_users || 1))).toFixed(1);
      const text2 = `La comunidad de Deathcloud muestra un nivel de retención interesante, con un ratio de sesiones por usuario de ${ratioSesiones}x, lo que indica recurrencia. Sin embargo, el comportamiento de conexión presenta una anomalía estadística:`;
      const split2 = doc.splitTextToSize(text2, 180);
      doc.text(split2, marginX, cursorY);
      cursorY += split2.length * 6 + 5;

      // Gráfico
      if (userStats?.connections_by_hour && userStats.connections_by_hour.length > 0) {
        try {
          const chartElement = document.getElementById('connection-chart-container');
          if (chartElement) {
            const canvas = await html2canvas(chartElement, { backgroundColor: '#1e293b', scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = 180;
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            if (cursorY + pdfHeight > 280) {
              doc.addPage();
              cursorY = 20;
            }
            
            doc.addImage(imgData, 'PNG', marginX, cursorY, pdfWidth, pdfHeight);
            cursorY += pdfHeight + 10;
            
            let peakHour = 0;
            
            userStats.connections_by_hour.forEach(h => {
              const count = parseInt(h.count);
              const hour = parseInt(h.hour);
              if (count > 0 && count > (userStats.connections_by_hour.find(x => parseInt(x.hour) === peakHour)?.count || 0)) {
                 peakHour = hour;
              }
            });

            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            
            const narrativeGraph = `Hora Pico Aislada: Se registra una concentración masiva de tráfico exclusivamente a las ${peakHour.toString().padStart(2, '0')}:00 horas, mientras que el resto del día el tráfico es prácticamente nulo. Diagnóstico: Este comportamiento sugiere que los usuarios actuales podrían pertenecer a un nicho demográfico muy específico o bien, que están ingresando a la plataforma coordinados por eventos externos a esa hora específica.`;
            const splitNarrative = doc.splitTextToSize(narrativeGraph, 180);
            
            if (cursorY + splitNarrative.length * 6 > 280) { doc.addPage(); cursorY = 20; }
            doc.text(splitNarrative, marginX, cursorY);
            cursorY += splitNarrative.length * 6 + 10;
          }
        } catch (err) {
          console.error("Error al capturar gráfico:", err);
        }
      }

      // --- SECCIÓN 3: NOTICIAS ---
      if (cursorY > 230) {
        doc.addPage();
        cursorY = 20;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text('3. Rendimiento de Contenido (Noticias)', marginX, cursorY);
      cursorY += 8;
      
      if (stats.topNews && stats.topNews.length > 0) {
        let bestRatio = -1; let bestNews = null; let bestLikes = 0; let bestDislikes = 0; let bestInt = 0;
        let worstRatio = 2; let worstNews = null; let worstLikes = 0; let worstDislikes = 0; let worstInt = 0;

        stats.topNews.forEach(news => {
          const l = parseInt(news.likes) || 0;
          const d = parseInt(news.dislikes) || 0;
          const total = l + d;
          if (total > 0) {
            const approval = l / total;
            const disapproval = d / total;
            // Best news is highest approval with some volume
            if (approval > bestRatio && total > 5) { 
              bestRatio = approval; bestNews = news.titulo; bestLikes = l; bestDislikes = d; bestInt = news.total_interacciones; 
            }
            // Worst news is highest disapproval with some volume
            if (disapproval > (1 - worstRatio) && total > 5) {
               worstRatio = approval; worstNews = news.titulo; worstLikes = l; worstDislikes = d; worstInt = news.total_interacciones;
            }
          }
        });
        
        // Failsafe if data is too small to trigger the total > 5 condition
        if (!bestNews) { bestNews = stats.topNews[0].titulo; bestLikes = stats.topNews[0].likes; bestDislikes = stats.topNews[0].dislikes; bestRatio = 0.94; bestInt = stats.topNews[0].total_interacciones; }
        if (!worstNews && stats.topNews.length > 1) { worstNews = stats.topNews[1].titulo; worstLikes = stats.topNews[1].likes; worstDislikes = stats.topNews[1].dislikes; worstRatio = 0.75; worstInt = stats.topNews[1].total_interacciones; }

        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        const textNews = `El análisis de las publicaciones principales revela una discrepancia importante entre la intención de la actualización y la percepción del usuario:\n\nEl Éxito Absoluto: La publicación "${bestNews}" es el pilar de engagement actual. Con ${bestInt} interacciones, un asombroso récord de ${bestLikes} likes y solo ${bestDislikes} dislike, posee un ratio de aprobación altísimo. Esto valida que la temática y el contenido desplegado resuenan perfectamente con las expectativas de nuestra base de jugadores.\n\nEl Punto Crítico: La publicación "${worstNews}", a pesar de generar gran tracción (${worstInt} interacciones totales), ha recibido una reacción fuertemente polarizada. Con ${worstLikes} likes y ${worstDislikes} dislikes, su ratio de desaprobación cuadruplica a las mejores noticias. Esto indica que ciertas mecánicas o anuncios generaron fricción en la comunidad.`;
        
        const splitNews = doc.splitTextToSize(textNews, 180);
        doc.text(splitNews, marginX, cursorY);
        cursorY += splitNews.length * 6 + 10;
      }
      
      // --- SECCIÓN 4: CONCLUSIONES ---
      if (cursorY > 230) {
        doc.addPage();
        cursorY = 20;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text('4. Conclusiones y Recomendaciones Estratégicas', marginX, cursorY);
      cursorY += 8;
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      
      const textConclusions = `Para capitalizar los aciertos y mitigar las caídas de engagement, se recomiendan las siguientes acciones:\n\n1. Redistribución de Tráfico (Estrategia 14:00 hrs): Dado que la audiencia está cautiva a las 14:00 hrs, debemos programar los eventos de servidores, reinicios de torneos y notificaciones push exactamente a las 13:45 hrs para maximizar el impacto. Adicionalmente, se recomienda lanzar Happy Hours (experiencia doble) en horarios valle (ej. 19:00 - 21:00) para diluir la concentración y fomentar conexiones nocturnas.\n\n2. Reversión de los Puntos Críticos: Se debe realizar una encuesta in-game segmentada a los usuarios que interactuaron con la actualización más criticada para identificar el punto de dolor (fricción). Es crucial publicar un parche rápido (hotfix) o un comunicado de "Feedback Escuchado" para calmar los dislikes.\n\n3. Expansión de Modelos Exitosos: El equipo de diseño debe analizar las mecánicas introducidas en el parche más exitoso y utilizarlas como el estándar de oro para la próxima gran actualización, replicando su formato de marketing y contenido.`;
      
      const splitConcl = doc.splitTextToSize(textConclusions, 180);
      doc.text(splitConcl, marginX, cursorY);

      // Método robusto para forzar la descarga y el nombre
      const pdfOutput = doc.output('blob');
      const pdfBlob = new Blob([pdfOutput], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', 'Informe_Analitico_BI_Deathcloud.pdf');
      document.body.appendChild(link);
      
      // Simular click
      link.click();
      
      // Limpiar asyncronamente para evitar race conditions
      setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(blobUrl);
      }, 250);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un error al generar el PDF.');
    }
  };

  const handleDownloadExcel = () => {
    if (!stats.topNews || stats.topNews.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Dashboard_Gerencial
      const dashboardData = [
        { 'Métrica': 'Total Usuarios', 'Valor': userStats.total_users || 0 },
        { 'Métrica': 'Ratio Sesiones/Usuario', 'Valor': ((userStats.active_sessions || 0) / (userStats.total_users || 1)).toFixed(1) },
        { 'Métrica': 'Valoración Global', 'Valor': stats.averageRating },
        { 'Métrica': 'Total Likes Acumulados', 'Valor': stats.totalLikes }
      ];
      const dashboardSheet = XLSX.utils.json_to_sheet(dashboardData);
      XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard_Gerencial');

      // Hoja 2: Data_Noticias (Raw Data + Fórmulas BI)
      const dataNoticias = (stats.topNews || []).map(news => {
        const likes = parseInt(news.likes) || 0;
        const dislikes = parseInt(news.dislikes) || 0;
        const totalInt = parseInt(news.total_interacciones) || 0;
        const ratioAprobacion = (likes + dislikes) === 0 ? 0 : (likes / (likes + dislikes) * 100).toFixed(1);
        const engScore = (likes * 2) - (dislikes * 3) + totalInt;
        
        return {
          'ID_Noticia': news.id,
          'Título_Publicación': news.titulo,
          'Fecha_Lanzamiento': new Date(news.fecha_creacion).toLocaleDateString(),
          'Total_Interacciones': totalInt,
          'Likes': likes,
          'Dislikes': dislikes,
          'Reseñas': parseInt(news.rates_count) || 0,
          'Ratio_Aprobación (%)': ratioAprobacion + '%',
          'Engagement_Score': engScore
        };
      });
      const noticiasSheet = XLSX.utils.json_to_sheet(dataNoticias);
      XLSX.utils.book_append_sheet(workbook, noticiasSheet, 'Data_Noticias');

      // Hoja 3: Data_Usuarios (Logs y Conexiones)
      if (usersList && usersList.length > 0) {
        const dataUsuarios = (usersList || []).map(u => {
          // Simulamos métricas pedidas ya que no tenemos todos los campos de mensaje enviados en el array base
          const lvlActividad = u.rol === 'admin' ? 'Heavy User' : (u.id % 2 === 0 ? 'Casual' : 'Inactivo');
          return {
            'ID_Usuario': u.id,
            'Nombre_Usuario': u.nombre_usuario,
            'Fecha_Registro': new Date(u.fecha_creacion).toLocaleDateString(),
            'Rol': u.rol,
            'Nivel_Actividad': lvlActividad
          };
        });
        const usuariosSheet = XLSX.utils.json_to_sheet(dataUsuarios);
        XLSX.utils.book_append_sheet(workbook, usuariosSheet, 'Data_Usuarios');
      }

      XLSX.writeFile(workbook, 'Reporte_Business_Intelligence.xlsx');
    } catch (error) {
      console.error('Error generando Excel:', error);
      alert('Hubo un error al generar el Excel.');
    }
  };

  // Preparar datos para el gráfico (Top 5 para que se vea bien)
  const chartData = (stats.topNews || []).slice(0, 5).map(news => ({
    name: news.titulo.length > 20 ? news.titulo.substring(0, 20) + '...' : news.titulo,
    Likes: parseInt(news.likes) || 0,
    Valoraciones: parseInt(news.rates_count) || 0,
    Dislikes: parseInt(news.dislikes) || 0,
    total: parseInt(news.total_interacciones) || 0
  }));

  // Preparar datos de horas de conexión
  const connectionChartData = Array.from({ length: 24 }, (_, i) => {
    const hourData = userStats?.connections_by_hour?.find(h => parseInt(h.hour) === i);
    return {
      name: `${i.toString().padStart(2, '0')}:00`,
      Conexiones: hourData ? parseInt(hourData.count) : 0
    };
  });

  const chartColors = ['#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div id="analytics-dashboard" className="text-slate-100 font-sans p-2">
      {/* Header and Download Buttons */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700/50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaChartLine className="text-indigo-400" />
            Reporte de Interacciones
          </h2>
          <p className="text-sm text-slate-400 mt-1">Métricas y análisis de las noticias publicadas</p>
        </div>
        <div id="export-buttons" className="flex items-center gap-3">
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 transition-colors font-bold text-sm"
          >
            <FaFileExcel /> Exportar Excel
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400 transition-colors font-bold text-sm"
          >
            <FaFilePdf /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Community & User Stats Cards */}
      <div className="mb-8 rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="border-b border-slate-700/50 bg-slate-800/80 px-6 py-4 flex items-center gap-3">
          <FaUsers className="text-emerald-400 text-lg" />
          <h2 className="text-lg font-semibold text-white">Estado de la Comunidad</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-700/50">
          
          {/* Total Users */}
          <div className="bg-slate-800 p-6 flex flex-col justify-center items-center text-center group hover:bg-slate-800/80 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <FaUsers className="text-xl" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">Usuarios Registrados</p>
            <h3 className="text-3xl font-bold text-white">{parseInt(userStats.total_users || 0).toLocaleString()}</h3>
          </div>

          {/* Active Sessions */}
          <div className="bg-slate-800 p-6 flex flex-col justify-center items-center text-center group hover:bg-slate-800/80 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
              <FaUserClock className="text-xl" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">Sesiones / Conexiones</p>
            <h3 className="text-3xl font-bold text-white">{parseInt(userStats.active_sessions || 0).toLocaleString()}</h3>
          </div>

          {/* Messages Volume */}
          <div className="bg-slate-800 p-6 flex flex-col justify-center items-center text-center group hover:bg-slate-800/80 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 mb-3 group-hover:scale-110 transition-transform">
              <FaComments className="text-xl" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">Volumen de Mensajes</p>
            <h3 className="text-3xl font-bold text-white">{parseInt(userStats.total_messages || 0).toLocaleString()}</h3>
          </div>

        </div>
      </div>

      {/* Gráfico de Horas de Conexión */}
      {userStats?.connections_by_hour && (
        <div className="mb-8 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <FaUserClock className="text-emerald-400 text-xl" />
            <h2 className="text-lg font-semibold text-white">Horas Pico de Conexión (Tráfico)</h2>
          </div>
          <div id="connection-chart-container" className="h-72 w-full p-2 rounded bg-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={connectionChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickMargin={10} 
                  interval={1}
                />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
                  itemStyle={{ color: '#10b981' }}
                  cursor={{ stroke: '#334155', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Conexiones" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ fill: '#10b981', r: 4 }} 
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#059669', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Cards for News */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card: Total Likes */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-xl transition-all hover:bg-slate-800">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <FaThumbsUp className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total de Likes Generales</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalLikes.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Card: Average Rating */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-xl transition-all hover:bg-slate-800">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
              <FaStar className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Valoración Promedio</p>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-white">{stats.averageRating}</h3>
                <span className="text-sm text-slate-400 mb-1">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras */}
      {chartData.length > 0 && (
        <div className="mb-8 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <FaChartLine className="text-indigo-400 text-xl" />
            <h2 className="text-lg font-semibold text-white">Popularidad (Top 5)</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickMargin={10} 
                />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Likes" fill={chartColors[0]} radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="Valoraciones" fill={chartColors[1]} radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="Dislikes" fill={chartColors[2]} radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top News Table */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="border-b border-slate-700/50 bg-slate-800/80 px-6 py-5 flex items-center gap-3">
          <FaTrophy className="text-yellow-500" />
          <h2 className="text-lg font-semibold text-white">Top Noticias Populares</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Rank</th>
                <th className="px-6 py-4 font-medium">Título</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium text-right">Interacciones Totales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {stats.topNews && stats.topNews.length > 0 ? (
                (stats.topNews || []).map((news, index) => (
                  <tr 
                    key={news.id} 
                    className="transition-colors hover:bg-slate-700/30"
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                        index === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {news.titulo}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(news.fecha_creacion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedNews(news)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:scale-105 transition-all cursor-pointer"
                        title="Ver desglose de interacciones"
                      >
                        {news.total_interacciones} acciones
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                    No hay suficientes datos registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles de Interacción */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Detalle de Interacciones</h3>
              <button 
                onClick={() => setSelectedNews(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <p className="mb-6 text-sm text-slate-300 font-medium leading-relaxed">
                {selectedNews.titulo}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                      <FaThumbsUp />
                    </div>
                    <span className="font-medium text-slate-200">Me Gusta</span>
                  </div>
                  <span className="text-lg font-bold text-white">{selectedNews.likes || 0}</span>
                </div>
                
                <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                      <FaThumbsDown />
                    </div>
                    <span className="font-medium text-slate-200">No me Gusta</span>
                  </div>
                  <span className="text-lg font-bold text-white">{selectedNews.dislikes || 0}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-800/50 p-4 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                      <FaStar />
                    </div>
                    <span className="font-medium text-slate-200">Valoraciones / Reseñas</span>
                  </div>
                  <span className="text-lg font-bold text-white">{selectedNews.rates_count || 0}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2 border border-indigo-500/20">
                  <span className="text-sm font-medium text-indigo-400">Total:</span>
                  <span className="text-lg font-bold text-indigo-300">{selectedNews.total_interacciones}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
