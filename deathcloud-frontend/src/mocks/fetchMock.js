import { dbMethods, initDb } from './browserDb';
import * as XLSX from 'xlsx';
import axios from 'axios';

initDb();

const getAuthToken = (headers) => {
  if (!headers) return null;
  let auth = '';
  if (headers instanceof Headers) {
    auth = headers.get('Authorization') || '';
  } else if (typeof headers === 'object') {
    auth = headers['Authorization'] || headers['authorization'] || '';
  }
  if (auth.startsWith('Bearer ')) {
    return auth.substring(7);
  }
  return localStorage.getItem('jwt_token');
};

const getRequestBody = async (body) => {
  if (!body) return {};
  if (typeof body === 'string') {
    try { return JSON.parse(body); } catch { return {}; }
  }
  if (body instanceof FormData) {
    return body;
  }
  return body;
};

// Mock Fetch Router
export const mockFetch = async (url, options = {}) => {
  const parsedUrl = new URL(url, window.location.origin);
  const path = parsedUrl.pathname;
  const method = (options.method || 'GET').toUpperCase();
  const token = getAuthToken(options.headers);
  const body = await getRequestBody(options.body);

  console.log(`[Mock API Request] ${method} ${path}`, { token, body });

  let status = 200;
  let responseData = { success: true };

  try {
    // --- 1. AUTENTICACIÓN Y SESIONES ---
    if (path.endsWith('/api/login') && method === 'POST') {
      responseData = dbMethods.login(body.email, body.password);
      if (!responseData.success) status = 401;
    } else if (path.endsWith('/api/register') && method === 'POST') {
      responseData = dbMethods.register(body.username, body.email, body.password);
      if (!responseData.success) status = 400;
    } else if (path.endsWith('/api/logout') && method === 'POST') {
      responseData = { success: true, message: 'Sesión cerrada.' };
    } else if (path.endsWith('/api/profile') && method === 'GET') {
      responseData = dbMethods.getProfile(token);
      if (!responseData.success) status = 401;
    } else if (path.endsWith('/api/profile') && method === 'PUT') {
      responseData = dbMethods.updateProfile(token, body);
      if (!responseData.success) status = 401;
    } else if (path.endsWith('/api/profile/password') && method === 'PUT') {
      responseData = dbMethods.changePassword(token, body.oldPassword, body.newPassword);
      if (!responseData.success) status = 400;
    } else if (path.endsWith('/api/profile/deathcloud-id') && method === 'PUT') {
      responseData = dbMethods.changeDeathCloudId(token, body.password, body.newDeathCloudId);
      if (!responseData.success) status = 400;
    } else if (path.endsWith('/api/sesiones') && method === 'GET') {
      responseData = dbMethods.getSessions(token);
      if (!responseData.success) status = 401;
    } else if (path.match(/\/api\/sesiones\/\d+$/) && method === 'DELETE') {
      const sessionId = path.split('/').pop();
      responseData = dbMethods.revokeSession(token, sessionId);
    } 

    // --- 2. CRÉDITOS E INVENTARIO ---
    else if (path.endsWith('/api/credits') && method === 'GET') {
      responseData = dbMethods.getCredits(token);
      if (!responseData.success) status = 401;
    } else if (path.endsWith('/api/inventory') && method === 'GET') {
      responseData = dbMethods.getInventory(token);
      if (!responseData.success) status = 401;
    } else if (path.match(/\/api\/game\/[^/]+\/skins\/buy$/) && method === 'POST') {
      const parts = path.split('/');
      const gameId = parts[parts.indexOf('game') + 1];
      responseData = dbMethods.buySkin(token, gameId, body.skinId, body.price);
      if (!responseData.success) status = 400;
    }

    // --- 3. CATÁLOGO JUEGOS, STORE, NEWS (ADMIN & USER) ---
    else if (path.endsWith('/api/catalog/games') && method === 'GET') {
      responseData = { success: true, games: dbMethods.getGames() };
    } else if (path.endsWith('/api/catalog/games') && method === 'POST') {
      const gameId = dbMethods.createGame(body);
      responseData = { success: true, gameId, message: 'Juego creado en catálogo.' };
    } else if (path.match(/\/api\/catalog\/games\/[^/]+$/) && method === 'PUT') {
      const gameId = path.split('/').pop();
      const success = dbMethods.updateGame(gameId, body);
      responseData = { success, message: success ? 'Juego actualizado.' : 'Juego no encontrado.' };
      if (!success) status = 404;
    } else if (path.match(/\/api\/catalog\/games\/[^/]+$/) && method === 'DELETE') {
      const gameId = path.split('/').pop();
      dbMethods.deleteGame(gameId);
      responseData = { success: true, message: 'Juego eliminado.' };
    } else if (path.endsWith('/api/catalog/store') && method === 'POST') {
      responseData = { success: dbMethods.createStoreItem(body) };
    } else if (path.match(/\/api\/catalog\/store\/[^/]+$/) && method === 'PUT') {
      const itemId = path.split('/').pop();
      responseData = { success: dbMethods.updateStoreItem(itemId, body) };
    } else if (path.match(/\/api\/catalog\/store\/[^/]+$/) && method === 'DELETE') {
      const itemId = path.split('/').pop();
      responseData = { success: dbMethods.deleteStoreItem(itemId) };
    } else if (path.endsWith('/api/catalog/news') && method === 'POST') {
      responseData = { success: dbMethods.createNews(body) };
    } else if (path.match(/\/api\/catalog\/news\/[^/]+$/) && method === 'PUT') {
      const newsId = path.split('/').pop();
      responseData = { success: dbMethods.updateNews(newsId, body) };
    } else if (path.match(/\/api\/catalog\/news\/[^/]+$/) && method === 'DELETE') {
      const newsId = path.split('/').pop();
      responseData = { success: dbMethods.deleteNews(newsId) };
    }

    // --- 4. CLASIFICACIÓN Y NOTICIAS POR JUEGO ---
    else if (path.match(/\/api\/game\/[^/]+\/leaderboard$/) && method === 'GET') {
      const parts = path.split('/');
      const gameId = parts[parts.indexOf('game') + 1];
      responseData = dbMethods.getLeaderboard(gameId);
    } else if (path.match(/\/api\/game\/news\/[^/]+\/comments$/) && method === 'GET') {
      const parts = path.split('/');
      const newsId = parts[parts.indexOf('news') + 1];
      responseData = dbMethods.getNewsComments(newsId);
    } else if (path.match(/\/api\/game\/news\/[^/]+\/comments$/) && method === 'POST') {
      const parts = path.split('/');
      const newsId = parts[parts.indexOf('news') + 1];
      responseData = dbMethods.addNewsComment(token, newsId, body);
    } else if (path.match(/\/api\/game\/news\/[^/]+\/react$/) && method === 'POST') {
      const parts = path.split('/');
      const newsId = parts[parts.indexOf('news') + 1];
      responseData = dbMethods.reactToNews(newsId, body.tipo);
    } else if (path.match(/\/api\/game\/news\/[^/]+\/rate$/) && method === 'POST') {
      const parts = path.split('/');
      const newsId = parts[parts.indexOf('news') + 1];
      responseData = dbMethods.rateNews(newsId, body.estrellas || body.rating);
    }

    // --- 5. COMUNIDAD HUB ---
    else if (path.match(/\/api\/community\/[^/]+\/news$/) && method === 'GET') {
      const parts = path.split('/');
      const gameId = parts[parts.indexOf('community') + 1];
      responseData = dbMethods.getNewsByGame(gameId);
    } else if (path.match(/\/api\/community\/[^/]+\/posts$/) && method === 'GET') {
      const parts = path.split('/');
      const gameId = parts[parts.indexOf('community') + 1];
      responseData = dbMethods.getPosts(gameId);
    } else if (path.match(/\/api\/community\/[^/]+\/posts$/) && method === 'POST') {
      const parts = path.split('/');
      const gameId = parts[parts.indexOf('community') + 1];
      responseData = dbMethods.createPost(token, gameId, body.title, body.content);
    } else if (path.match(/\/api\/community\/[^/]+\/posts\/[^/]+\/replies$/) && method === 'GET') {
      const parts = path.split('/');
      const postId = parts[parts.indexOf('posts') + 1];
      responseData = dbMethods.getReplies(postId);
    } else if (path.match(/\/api\/community\/[^/]+\/posts\/[^/]+\/replies$/) && method === 'POST') {
      const parts = path.split('/');
      const gameId = parts[parts.indexOf('community') + 1];
      const postId = parts[parts.indexOf('posts') + 1];
      responseData = dbMethods.createReply(token, gameId, postId, body.content);
    } else if (path.match(/\/api\/community\/[^/]+\/posts\/[^/]+\/like$/) && method === 'POST') {
      const parts = path.split('/');
      const postId = parts[parts.indexOf('posts') + 1];
      responseData = dbMethods.likePost(postId);
    } else if (path.match(/\/api\/community\/[^/]+\/replies\/[^/]+\/like$/) && method === 'POST') {
      const parts = path.split('/');
      const replyId = parts[parts.indexOf('replies') + 1];
      // mock post ID resolver
      responseData = dbMethods.likeReply(1, replyId);
    }

    // --- 6. MODERACIÓN Y REPORTES ---
    else if (path.endsWith('/api/moderacion/reportar') && method === 'POST') {
      responseData = dbMethods.reportComment(token, body.comentario_id, body.motivo);
    } else if (path.endsWith('/api/moderacion/lista') && method === 'GET') {
      responseData = dbMethods.getReportsList();
    } else if (path.match(/\/api\/moderacion\/aprobar\/[^/]+$/) && method === 'PUT') {
      const reportId = path.split('/').pop();
      responseData = dbMethods.approveReport(reportId);
    } else if (path.match(/\/api\/moderacion\/comentario\/[^/]+$/) && method === 'DELETE') {
      const commentId = path.split('/').pop();
      responseData = dbMethods.deleteComment(commentId);
    }

    // --- 7. TECHNICAL SUPPORT TICKETS ---
    else if (path.endsWith('/api/tickets') && method === 'GET') {
      responseData = dbMethods.getTickets(token);
    } else if (path.endsWith('/api/tickets') && method === 'POST') {
      responseData = dbMethods.createTicket(token, body.title, body.description, body.category);
    }

    // --- 8. CENTRO SOCIAL Y AMIGOS ---
    else if (path.endsWith('/api/friends') && method === 'GET') {
      responseData = dbMethods.getFriends(token);
    } else if (path.endsWith('/api/friends/request') && method === 'POST') {
      responseData = dbMethods.sendFriendRequest(token, body.friendUsername);
    } else if (path.endsWith('/api/friends/respond') && method === 'PUT') {
      responseData = dbMethods.respondFriendRequest(token, body.requestId, body.action);
    } else if (path.match(/\/api\/friends\/remove\/[^/]+$/) && method === 'DELETE') {
      const friendshipId = path.split('/').pop();
      responseData = dbMethods.removeFriend(token, friendshipId);
    } else if (path.match(/\/api\/profile\/public\/[^/]+$/) && method === 'GET') {
      const username = path.split('/').pop();
      responseData = dbMethods.getPublicProfile(token, username);
    }

    // --- 9. TERMINAL CONTROL ADMIN & ANALYTICS ---
    else if (path.endsWith('/api/admin/users') && method === 'GET') {
      responseData = dbMethods.getUsersList();
    } else if (path.endsWith('/api/admin/tickets') && method === 'GET') {
      responseData = dbMethods.getAdminTickets();
    } else if (path.match(/\/api\/admin\/tickets\/[^/]+\/status$/) && method === 'PUT') {
      const ticketId = path.split('/').slice(-2)[0];
      responseData = dbMethods.updateTicketStatus(ticketId, body.estado);
    } else if (path.match(/\/api\/admin\/users\/[^/]+\/ban$/) && method === 'PUT') {
      const userId = path.split('/').slice(-2)[0];
      responseData = dbMethods.toggleBan(userId, body.baneado, body.motivo_ban);
    } else if (path.match(/\/api\/admin\/users\/[^/]+\/role$/) && method === 'PUT') {
      const userId = path.split('/').slice(-2)[0];
      responseData = dbMethods.toggleRole(userId, body.rol);
    } else if (path.endsWith('/api/analytics/dashboard') && method === 'GET') {
      responseData = dbMethods.getAnalyticsDashboard();
    } else if (path.endsWith('/api/admin/news/stats') && method === 'GET') {
      responseData = dbMethods.getNewsStats();
    } else if (path.endsWith('/api/admin/users/stats') && method === 'GET') {
      responseData = dbMethods.getUserStats();
    } 

    // --- 10. MOCK FILE UPLOAD ---
    else if (path.endsWith('/api/admin/upload') && method === 'POST') {
      if (body instanceof FormData) {
        const file = body.get('image');
        if (file) {
          const reader = new FileReader();
          const filePromise = new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          const base64Url = await filePromise;
          responseData = { success: true, imageUrl: base64Url };
        } else {
          responseData = { success: false, message: 'No se envió imagen' };
          status = 400;
        }
      } else {
        responseData = { success: true, imageUrl: 'assets/logo.png' }; // Fallback
      }
    }

    // --- 11. EXCEL EXPORTS (BLOB DOWNLOAD) ---
    else if (path.match(/\/api\/reports\/[^/]+\/excel$/) && method === 'GET') {
      const type = path.split('/').slice(-2)[0];
      const excelData = dbMethods.getReportExcel(type);
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      console.log(`[Mock Excel Export] Generated real client-side sheet for ${type}`);

      return new Response(blob, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="reporte_${type}.xlsx"`
        }
      });
    }

    // --- CUALQUIER OTRA API (FALLBACK) ---
    else {
      console.warn(`[Mock API Warning] Unhandled API request to ${path}`);
      status = 404;
      responseData = { success: false, message: 'Controlador simulado no configurado.' };
    }
  } catch (err) {
    console.error('[Mock API Error]', err);
    status = 500;
    responseData = { success: false, message: err.message };
  }

  // Retornar respuesta simulada estándar
  const responseBlob = new Blob([JSON.stringify(responseData)], { type: 'application/json' });
  return new Response(responseBlob, {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' }
  });
};

// Registro de Interceptor Global
export const registerInterceptors = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async function (input, init) {
    let requestUrl = '';
    if (typeof input === 'string') {
      requestUrl = input;
    } else if (input instanceof Request) {
      requestUrl = input.url;
    }

    // Interceptar llamadas dirigidas a /api o relativas que contengan /api/ o catalog/games
    if (requestUrl.includes('/api/') || requestUrl.includes('catalog/games') || requestUrl.includes('/catalog/')) {
      // Normalizar rutas relativas/absolutas
      let mockUrl = requestUrl;
      if (!requestUrl.startsWith('http') && !requestUrl.startsWith('/api') && !requestUrl.startsWith('api')) {
        mockUrl = '/api/' + requestUrl.replace(/^\.\//, '').replace(/^\//, '');
      }
      return mockFetch(mockUrl, init);
    }
    
    // De lo contrario, dejar pasar (ej. assets locales, css, js)
    return originalFetch.apply(this, arguments);
  };

  // Interceptar llamadas Axios
  try {
    axios.defaults.adapter = async (config) => {
      let requestUrl = config.url || '';
      const method = config.method || 'GET';
      const headers = config.headers || {};
      const data = config.data;

      // Convertir parámetros de Axios a Request options de Fetch
      const options = {
        method,
        headers,
        body: data
      };

      const response = await window.fetch(requestUrl, options);
      const text = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }

      if (response.ok) {
        return {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: {},
          config
        };
      } else {
        const error = new Error('Request failed with status code ' + response.status);
        error.response = {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: {},
          config
        };
        throw error;
      }
    };
    console.log('🔌 Axios mock adapter inyectado con éxito.');
  } catch (err) {
    console.warn('Fallo al registrar interceptores en Axios:', err);
  }
};
