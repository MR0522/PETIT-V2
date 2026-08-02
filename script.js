const CLOUDCONVERT_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNGVlM2EzODdlYzIyODRjODI5NGQ1OGEzZmQ2OThlMTUyMDAwYmRmMTE1ZjM4ZjhhMTYxNGU5ZDRiNzIxMzJjMzA3ZGQ5MDhhZTBiNmE2MzAiLCJpYXQiOjE3ODU3MDEzNTcuMTIwNzQ3LCJuYmYiOjE3ODU3MDEzNTcuMTIwNzQ4LCJleHAiOjQ5NDEzNzQ5NTcuMTE1ODIxLCJzdWIiOiI0MTU2Njk5MCIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.X5lRjj96i180gCCqEPlxLFgRzEgu_rihn3LgtL-2awBDCiCymtCu14Pckr6e2X9qjxLC6pPGFeHlFjLhFTmpsJ6sCFJ78wYiihGRpXGHrkkPFlrhJKImGFbtYWJWXOiQuTD0_LJ7KiDVBeV5mKNSLWmisMxMpw6S0NFSbiaDojbnwK23jQeqXZQzqIJA555SjnUNlda_s7t61aCPVqMBS_BempynIUzakol4v2dnsaMGaFdxqh-PyHh3z2jAZ7vivR-Dc2jURH9wRFx2-kU7Ry0PdaHK0C9hUtSYEHAgcCn7CRMMscuUyRP6QeT66ulOyqC4YTf3n-O-mvCcRlHemwEWyJCVKQ2Ye8wIn8uujj8qhgwGzJT8EZTxzB0cIRR5t81NbgTLmO4HZ2lc0-3M2GjU4UzvwBaICgVDC04VZG7ahHuDvfv0ayJkB9ccq1LwLyLZLcl3EraTqBypl6Hmxefe6p1GapGs6i30jX0v7Nqfkwx78lyXKHS2tSczn_PPcQkdo-PilLdJWwJd5S_h6Mh5s4_ieK8W-czZ_u1H5hAuXwALdiwn2NuV8WRjyZKabvE4J3TYkrt3bAc6IdA-5Se3znSkCnlX8B20otkIl5jkP1vWwHSJTUe7vmclWdEovaxwU87odeBAiNuJeOeXm-4J1qGRZeST0ydSqN3uQC8";
// Constantes globales
const PDFLib = window.PDFLib;
const JSZip = window.JSZip;

// --- FUNCIONES DE UTILIDAD GENERAL ---

// Función para descargar archivos generados
function downloadFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Función para mostrar mensajes de estado actualizados
function setStatus(elementId, message, type) {
    const statusMsg = document.getElementById(elementId);
    statusMsg.innerText = message;
    statusMsg.className = `status ${type}`; // type: 'loading', 'success', 'error'
}

// Función para activar los inputs ocultos desde los botones bonitos
function setUpVisualButtons() {
    document.getElementById('btn-upload-merge').addEventListener('click', () => {
        document.getElementById('merge-files').click();
    });
    
    document.getElementById('btn-upload-split').addEventListener('click', () => {
        document.getElementById('split-file').click();
    });
    
    document.getElementById('btn-upload-img').addEventListener('click', () => {
        document.getElementById('img-files').click();
    });
}

// --- GESTIÓN VISUAL DE ARCHIVOS (Evolución Futura) ---
// Aquí iría el código para mostrar la lista de archivos con iconos de mover/borrar
// como se ve en la imagen. Por ahora, nos basamos en los inputs estándar.

// --- CONTROLADOR DE PESTAÑAS (TABS) ---
function initTabs() {
    const navItems = document.querySelectorAll('.nav-item:not(:disabled)');
    const panes = document.querySelectorAll('.tool-pane');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const toolId = item.getAttribute('data-tool');

            // Desactivar todas las pestañas y paneles
            navItems.forEach(i => i.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            // Activar la pestaña y el panel correspondiente
            item.classList.remove('loading', 'success', 'error'); // Limpiar estados al cambiar
            item.classList.add('active');
            
            // Mapear data-tool al ID del panel
            const targetPaneId = `pane-${toolId}`;
            const targetPane = document.getElementById(targetPaneId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// --- LÓGICA DE LAS HERRAMIENTAS (RE-INTEGRADA) ---

// 1. Unir PDFs
async function mergePDFs() {
    const files = document.getElementById('merge-files').files;
    
    if (files.length < 2) {
        setStatus('merge-status', '⚠️ Por favor, selecciona al menos 2 archivos PDF.', 'error');
        return;
    }

    try {
        setStatus('merge-status', '⏳ Procesando archivos... por favor espera.', 'loading');
        const pdfDoc = await PDFLib.PDFDocument.create();

        for (let file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const loadedPdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await pdfDoc.copyPages(loadedPdf, loadedPdf.getPageIndices());
            copiedPages.forEach((page) => pdfDoc.addPage(page));
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        downloadFile(blob, 'PETIT_Unido.pdf');
        setStatus('merge-status', '✅ ¡Archivos unidos con éxito y descargados!', 'success');
    } catch (error) {
        console.error(error);
        setStatus('merge-status', '❌ Hubo un error al procesar los archivos.', 'error');
    }
}

// 2. Dividir PDF
async function splitPDF() {
    const file = document.getElementById('split-file').files[0];

    if (!file) {
        setStatus('split-status', '⚠️ Por favor, selecciona un archivo PDF.', 'error');
        return;
    }

    try {
        setStatus('split-status', '⏳ Dividiendo... preparando archivo ZIP.', 'loading');
        const arrayBuffer = await file.arrayBuffer();
        const loadedPdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const totalPages = loadedPdf.getPageCount();
        
        const zip = new JSZip();

        for (let i = 0; i < totalPages; i++) {
            const newPdf = await PDFLib.PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(loadedPdf, [i]);
            newPdf.addPage(copiedPage);
            const pdfBytes = await newPdf.save();
            zip.file(`PETIT_Pagina_${i + 1}.pdf`, pdfBytes);
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadFile(zipBlob, 'PETIT_Dividido.zip');
        setStatus('split-status', '✅ ¡Archivo dividido y descargado en ZIP!', 'success');
    } catch (error) {
        console.error(error);
        setStatus('split-status', '❌ Hubo un error al dividir el archivo.', 'error');
    }
}

// 3. Convertir de Imagen a PDF
async function imagesToPDF() {
    const files = document.getElementById('img-files').files;

    if (files.length === 0) {
        setStatus('img2pdf-status', '⚠️ Por favor, selecciona al menos una imagen (JPG o PNG).', 'error');
        return;
    }

    try {
        setStatus('img2pdf-status', '⏳ Convirtiendo imágenes a PDF...', 'loading');
        const pdfDoc = await PDFLib.PDFDocument.create();

        for (let file of files) {
            const arrayBuffer = await file.arrayBuffer();
            let img;
            
            if (file.type === 'image/jpeg') {
                img = await pdfDoc.embedJpg(arrayBuffer);
            } else if (file.type === 'image/png') {
                img = await pdfDoc.embedPng(arrayBuffer);
            } else {
                continue; // Ignora otros archivos
            }

            // Crear una página del mismo tamaño que la imagen
            const page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(img, {
                x: 0,
                y: 0,
                width: img.width,
                height: img.height,
            });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        downloadFile(blob, 'PETIT_Imagenes.pdf');
        setStatus('img2pdf-status', '✅ ¡PDF creado con éxito!', 'success');
    } catch (error) {
        console.error(error);
        setStatus('img2pdf-status', '❌ Hubo un error al convertir las imágenes.', 'error');
    }
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    setUpVisualButtons();

    // Asignar los eventos a los botones de procesar finales
    document.getElementById('btn-process-merge').addEventListener('click', mergePDFs);
    document.getElementById('btn-process-split').addEventListener('click', splitPDF);
    document.getElementById('btn-process-img').addEventListener('click', imagesToPDF);
});
