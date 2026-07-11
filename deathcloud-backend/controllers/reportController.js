const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const pool = require('../config/db');
const logger = require('../config/logger');

// Mapa de consultas según el tipo de reporte
const getReportData = async (type) => {
  let query = '';
  let title = '';
  let columns = [];
  
  switch (type) {
    case 'usuarios':
      query = 'SELECT id, nombre_usuario, email, rol, baneado, credits, fecha_creacion FROM usuarios ORDER BY id DESC';
      title = 'Reporte de Usuarios';
      columns = ['ID', 'Usuario', 'Email', 'Rol', 'Baneado', 'Créditos', 'Fecha Creación'];
      break;
    case 'tickets':
      query = 'SELECT t.id, u.nombre_usuario, t.titulo, t.categoria, t.estado, t.fecha_creacion FROM tickets t JOIN usuarios u ON t.usuario_id = u.id ORDER BY t.id DESC';
      title = 'Reporte de Tickets';
      columns = ['ID', 'Usuario', 'Título', 'Categoría', 'Estado', 'Fecha Creación'];
      break;
    default:
      throw new Error('Tipo de reporte no soportado');
  }

  const { rows } = await pool.query(query);
  return { rows, title, columns };
};

const generatePdf = async (req, res) => {
  try {
    const { type } = req.params;
    const { rows, title, columns } = await getReportData(type);

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_${type}.pdf`);
    
    doc.pipe(res);

    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();
    
    const tableTop = 100;
    const itemMargin = 20;
    const startX = 30;
    const colWidth = (595 - 60) / columns.length; // A4 width is 595

    doc.fontSize(10).font('Helvetica-Bold');
    columns.forEach((col, i) => {
      doc.text(col, startX + (i * colWidth), tableTop, { width: colWidth, align: 'left' });
    });

    let currentY = tableTop + itemMargin;

    doc.font('Helvetica');
    rows.forEach(row => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
      }
      
      const values = Object.values(row).map(v => v !== null && v !== undefined ? String(v) : '');
      values.forEach((val, i) => {
        let displayVal = val;
        // Format dates simply
        if (displayVal.includes('GMT')) {
            displayVal = new Date(val).toLocaleDateString();
        }
        doc.text(displayVal.substring(0, 20), startX + (i * colWidth), currentY, { width: colWidth, align: 'left' });
      });
      currentY += itemMargin;
    });

    doc.end();
  } catch (error) {
    logger.error('Error generando PDF', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Error generando reporte PDF' });
    }
  }
};

const generateExcel = async (req, res) => {
  try {
    const { type } = req.params;
    const { rows, title, columns } = await getReportData(type);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(title);

    sheet.columns = columns.map(col => ({ header: col, key: col, width: 20 }));

    rows.forEach(row => {
      const rowValues = Object.values(row).map(v => {
          if (v instanceof Date) return v.toLocaleDateString();
          return v;
      });
      sheet.addRow(rowValues);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_${type}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    logger.error('Error generando Excel', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Error generando reporte Excel' });
    }
  }
};

module.exports = {
  generatePdf,
  generateExcel
};
