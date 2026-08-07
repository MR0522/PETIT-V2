// ==========================================================================
// PETIT-V2 - Convertidor y Editor Multiherramienta
// Autor: MAUU SOFT (ING. MAURICIO RAMÍREZ ALVARADO)
// ==========================================================================

// API Key de CloudConvert configurada
const CLOUDCONVERT_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNGVlM2EzODdlYzIyODRjODI5NGQ1OGEzZmQ2OThlMTUyMDAwYmRmMTE1ZjM4ZjhhMTYxNGU5ZDRiNzIxMzJjMzA3ZGQ5MDhhZTBiNmE2MzAiLCJpYXQiOjE3ODU3MDEzNTcuMTIwNzQ3LCJuYmYiOjE3ODU3MDEzNTcuMTIwNzQ4LCJleHAiOjQ5NDEzTZQzg0OThlMTUyMDAwYmRmMTE1ZjM4ZjhhMTYxNGU5ZDRiNzIxMzJjMzA3ZGQ5MDhhZTBiNmE2MzAiLCJpYXQiOjE3ODU3MDEzNTcuMTIwNzQ3LCJuYmYiOjE3ODU3MDEzNTcuMTIwNzQ4LCJleHAiOjQ5NDEzNzQ5NTcuMTE1ODIxLCJzdWIiOiI0MTU2Njk5MCIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.X5lRjj96i180gCCqEPlxLFgRzEgu_rihn3LgtL-2awBDCiCymtCu14Pckr6e2X9qjxLC6pPGFeHlFjLhFTmpsJ6sCFJ78wYiihGRpXGHrkkPFlrhJKImGFbtYWJWXOiQuTD0_LJ7KiDVBeV5mKNSLWmisMxMpw6S0NFSbiaDojbnwK23jQeqXZQzqIJA555SjnUNlda_s7t61aCPVqMBS_BempynIUzakol4v2dnsaMGaFdxqh-PyHh3z2jAZ7vivR-Dc2jURH9wRFx2-kU7Ry0PdaHK0C9hUtSYEHAgcCn7CRMMscuUyRP6QeT66ulOyqC4YTf3n-O-mvCcRlHemwEWyJCVKQ2Ye8wIn8uujj8qhgwGzJT8EZTxzB0cIRR5t81NbgTLmO4HZ2lc0-3M2GjU4UzvwBaICgVDC04VZG7ahHuDvfv0ayJkB9ccq1LwLyLZLcl3EraTqBypl6Hmxefe6p1GapGs6i30jX0v7Nqfkwx78lyXKHS2tSczn_PPcQkdo-PilLdJWwJd5S_h6Mh5s4_ieK8W-czZ_u1H5hAuXwALdiwn2NuV8WRjyZKabvE4J3TYkrt3bAc6IdA-5Se3znSkCnlX8B20otkIl5jkP1vWwHSJTUe7vmclWdEovaxwU87odeBAiNuJeOeXm-4J1qGRZeST0ydSqN3uQC8";

let currentTool = "merge";

// Configuración de las herramientas
const toolConfig = {
    merge: { title: "Unir PDF", desc: "Selecciona 2 o más archivos PDF para unirlos en uno solo.", accept: ".pdf", multiple: true },
    split: { title: "Dividir PDF", desc: "Selecciona un archivo PDF para extraer sus páginas.", accept: ".pdf", multiple: false },
    img2pdf: { title: "Imagen a PDF", desc: "Selecciona imágenes (JPG, PNG) para convertirlas a PDF.", accept: "image/jpeg, image/png", multiple: true },
    imgconvert: { title: "JPG ↔ PNG", desc: "Convierte imágenes entre JPG y PNG localmente.", accept: "image/jpeg, image/png", multiple: false },
    word2pdf: { title: "Word a PDF", desc: "Convierte tus documentos .docx a PDF.", accept: ".docx, .doc", multiple: false, convertTo: "pdf" },
    excel2pdf: { title: "Excel a PDF", desc: "Convierte tus hojas de cálculo .xlsx a PDF.", accept: ".xlsx, .xls", multiple: false, convertTo: "pdf" },
    ppt2pdf: { title: "PowerPoint a PDF", desc: "Convierte tus presentaciones .pptx a PDF.", accept: ".pptx, .ppt", multiple: false, convertTo: "pdf" },
    pdf2word: { title: "PDF a Word", desc: "Convierte tu PDF en un archivo .docx editable.", accept: ".pdf", multiple: false, convertTo: "docx" },
    pdf2excel: { title: "PDF a Excel", desc: "Convierte tu PDF en una tabla de Excel .xlsx.", accept: ".pdf", multiple: false, convertTo: "xlsx" },
    pdf2ppt: { title: "PDF a PowerPoint", desc: "Convierte tu PDF en una presentación .pptx.", accept: ".pdf", multiple: false, convertTo: "pptx" }
};

// =======================================================
// CAMBIO DE PESTAÑAS Y NAVEGACIÓN
// =======================================================
document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        currentTool = button.getAttribute('data-tool');
        const config = toolConfig[currentTool];
        
        const standardPane = document.getElementById('standard-pane');
        const imgConvertPane = document.getElementById('imgconvert-pane');

        // Alternar entre panel estándar y el panel especial de imágenes
        if (currentTool === 'imgconvert') {
            if (standardPane) standardPane.style.display = 'none';
            if (imgConvertPane) imgConvertPane.style.display = 'block';
        } else {
            if (standardPane) standardPane.style.display = 'block';
            if (imgConvertPane) imgConvertPane.style.display = 'none';

            document.getElementById('tool-title').innerText = config.title;
            document.getElementById('tool-desc').innerText = config.desc;
            
            const fileInput = document.getElementById('main-file-input');
            fileInput.value = "";
            fileInput.accept = config.accept;
            fileInput.multiple = config.multiple;
            
            document.getElementById('status-box').innerText = "";
        }
    });
});

// =======================================================
// BOTÓN DE PROCESAMIENTO PRINCIPAL (PANEL ESTÁNDAR)
// =======================================================
document.getElementById('btn-process').addEventListener('click', async () => {
    const input = document.getElementById('main-file-input');
    const statusBox = document.getElementById('status-box');

    if (!input.files || input.files.length === 0) {
        alert("Por favor selecciona al menos un archivo.");
        return;
    }

    const cleanKey = CLOUDCONVERT_API_KEY.trim();

    // 1. Procesamiento local (pdf-lib & JSZip)
    if (currentTool === "merge") {
        await mergePDFs(input.files);
    } else if (currentTool === "split") {
        await splitPDF(input.files[0]);
    } else if (currentTool === "img2pdf") {
        await imagesToPDF(input.files);
    } 
    // 2. Procesamiento en la nube (CloudConvert)
    else if (["word2pdf", "excel2pdf", "ppt2pdf", "pdf2word", "pdf2excel", "pdf2ppt"].includes(currentTool)) {
        if (!cleanKey) {
            statusBox.style.color = "red";
            statusBox.innerText = "⚠️ Debes ingresar tu API Key de CloudConvert para usar esta función.";
            return;
        }
        await convertWithCloudConvert(input.files[0], toolConfig[currentTool].convertTo, cleanKey);
    }
});

// =======================================================
// FUNCIONES DE PROCESAMIENTO LOCAL (pdf-lib & JSZip)
// =======================================================

// 1. Unir archivos PDF
async function mergePDFs(files) {
    const statusBox = document.getElementById('status-box');
    if (files.length < 2) {
        alert("Por favor selecciona al menos 2 archivos PDF para unirlos.");
        return;
    }

    statusBox.style.color = "orange";
    statusBox.innerText = "⏳ Uniendo archivos PDF localmente...";

    try {
        const mergedPdf = await PDFLib.PDFDocument.create();

        for (let file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        downloadBlob(mergedPdfBytes, "PETIT_unido.pdf", "application/pdf");

        statusBox.style.color = "green";
        statusBox.innerText = "✅ ¡Archivos unidos con éxito! La descarga ha comenzado.";
    } catch (err) {
        console.error(err);
        statusBox.style.color = "red";
        statusBox.innerText = "❌ Error al unir los PDF. Asegúrate de que los archivos no estén protegidos con contraseña.";
    }
}

// 2. Dividir archivo PDF en páginas individuales (Zip)
async function splitPDF(file) {
    const statusBox = document.getElementById('status-box');
    statusBox.style.color = "orange";
    statusBox.innerText = "⏳ Dividiendo PDF página por página...";

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();

        const zip = new JSZip();

        for (let i = 0; i < pageCount; i++) {
            const newPdf = await PDFLib.PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdf, [i]);
            newPdf.addPage(copiedPage);
            const pdfBytes = await newPdf.save();
            zip.file(`pagina_${i + 1}.pdf`, pdfBytes);
        }

        statusBox.innerText = "⏳ Empaquetando en archivo ZIP...";
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, "PETIT_paginas_divididas.zip", "application/zip");

        statusBox.style.color = "green";
        statusBox.innerText = "✅ ¡PDF dividido con éxito! Descargando paquete ZIP.";
    } catch (err) {
        console.error(err);
        statusBox.style.color = "red";
        statusBox.innerText = "❌ Ocurrió un error al intentar dividir el archivo PDF.";
    }
}

// 3. Convertir imágenes (JPG, PNG) a PDF
async function imagesToPDF(files) {
    const statusBox = document.getElementById('status-box');
    statusBox.style.color = "orange";
    statusBox.innerText = "⏳ Convirtiendo imágenes a PDF...";

    try {
        const pdfDoc = await PDFLib.PDFDocument.create();

        for (let file of files) {
            const imageBytes = await file.arrayBuffer();
            let image;
            if (file.type === "image/png") {
                image = await pdfDoc.embedPng(imageBytes);
            } else {
                image = await pdfDoc.embedJpg(imageBytes);
            }

            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
        }

        const pdfBytes = await pdfDoc.save();
        downloadBlob(pdfBytes, "PETIT_imagenes.pdf", "application/pdf");

        statusBox.style.color = "green";
        statusBox.innerText = "✅ ¡Imágenes convertidas a PDF con éxito!";
    } catch (err) {
        console.error(err);
        statusBox.style.color = "red";
        statusBox.innerText = "❌ Error al procesar las imágenes. Asegúrate de que sean formato JPG o PNG.";
    }
}

// =======================================================
// CONVERTIDOR LOCAL DE IMÁGENES (JPEG ↔ PNG via Canvas)
// =======================================================
let imgConvertFile = null;
let imgConvertLoaded = null;

const imgDropZone = document.getElementById('imgDropZone');
const imgInput = document.getElementById('imgInput');
const imgPreviewCard = document.getElementById('imgPreviewCard');
const imgPreview = document.getElementById('imgPreview');
const imgName = document.getElementById('imgName');
const imgFormat = document.getElementById('imgFormat');
const imgSize = document.getElementById('imgSize');
const imgDimensions = document.getElementById('imgDimensions');
const targetFormat = document.getElementById('targetFormat');
const qualityControl = document.getElementById('qualityControl');
const jpegQuality = document.getElementById('jpegQuality');
const qualityVal = document.getElementById('qualityVal');
const convertImgBtn = document.getElementById('convertImgBtn');
const imgResultCard = document.getElementById('imgResultCard');
const resFormat = document.getElementById('resFormat');
const resSize = document.getElementById('resSize');
const downloadImgLink = document.getElementById('downloadImgLink');

if (imgDropZone && imgInput) {
    imgDropZone.addEventListener('click', () => imgInput.click());

    ['dragenter', 'dragover'].forEach(evt => {
        imgDropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            imgDropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        imgDropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            imgDropZone.classList.remove('dragover');
        });
    });

    imgDropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) handleImgConvertFile(files[0]);
    });

    imgInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleImgConvertFile(e.target.files[0]);
    });
}

function handleImgConvertFile(file) {
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        alert('Por favor selecciona una imagen en formato JPG, JPEG o PNG.');
        return;
    }

    imgConvertFile = file;
    if (imgName) imgName.textContent = file.name;
    if (imgFormat) imgFormat.textContent = file.type === 'image/png' ? 'PNG' : 'JPEG/JPG';
    if (imgSize) imgSize.textContent = formatBytes(file.size);

    if (targetFormat) {
        if (file.type === 'image/png') {
            targetFormat.value = 'image/jpeg';
            if (qualityControl) qualityControl.style.display = 'block';
        } else {
            targetFormat.value = 'image/png';
            if (qualityControl) qualityControl.style.display = 'none';
        }
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imgConvertLoaded = new Image();
        imgConvertLoaded.onload = () => {
            if (imgDimensions) imgDimensions.textContent = `${imgConvertLoaded.width} x ${imgConvertLoaded.height} px`;
            if (imgPreview) imgPreview.src = e.target.result;
            if (imgPreviewCard) imgPreviewCard.style.display = 'block';
            if (imgResultCard) imgResultCard.style.display = 'none';
        };
        imgConvertLoaded.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

if (targetFormat) {
    targetFormat.addEventListener('change', () => {
        if (qualityControl) {
            qualityControl.style.display = targetFormat.value === 'image/jpeg' ? 'block' : 'none';
        }
    });
}

if (jpegQuality && qualityVal) {
    jpegQuality.addEventListener('input', () => {
        qualityVal.textContent = `${jpegQuality.value}%`;
    });
}

if (convertImgBtn) {
    convertImgBtn.addEventListener('click', () => {
        if (!imgConvertLoaded || !imgConvertFile) return;

        const canvas = document.createElement('canvas');
        canvas.width = imgConvertLoaded.width;
        canvas.height = imgConvertLoaded.height;
        const ctx = canvas.getContext('2d');

        // Si se convierte a JPEG, rellenar fondo blanco para evitar opacidad negra en transparencias
        if (targetFormat.value === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(imgConvertLoaded, 0, 0);

        const format = targetFormat.value;
        const quality = parseFloat(jpegQuality ? jpegQuality.value : 90) / 100;

        canvas.toBlob((blob) => {
            if (!blob) return;

            const ext = format === 'image/png' ? 'png' : 'jpg';
            const baseName = imgConvertFile.name.substring(0, imgConvertFile.name.lastIndexOf('.')) || 'imagen';
            const newFileName = `${baseName}_PETIT.${ext}`;

            const blobUrl = URL.createObjectURL(blob);
            if (downloadImgLink) {
                downloadImgLink.href = blobUrl;
                downloadImgLink.download = newFileName;
            }

            if (resFormat) resFormat.textContent = ext.toUpperCase();
            if (resSize) resSize.textContent = formatBytes(blob.size);
            if (imgResultCard) {
                imgResultCard.style.display = 'block';
                imgResultCard.scrollIntoView({ behavior: 'smooth' });
            }
        }, format, quality);
    });
}

// =======================================================
// FUNCIÓN DE CONVERSIÓN EN LA NUBE (CloudConvert API V2)
// =======================================================
async function convertWithCloudConvert(file, outputFormat, apiKey) {
    const statusBox = document.getElementById('status-box');
    try {
        statusBox.style.color = "orange";
        statusBox.innerText = "⏳ Creando tarea de conversión en la nube...";

        // 1. Crear Job
        const jobResponse = await fetch('https://api.cloudconvert.com/v2/jobs', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "tasks": {
                    "import-file": { 
                        "operation": "import/upload",
                        "filename": file.name 
                    },
                    "convert-file": { 
                        "operation": "convert", 
                        "input": "import-file", 
                        "output_format": outputFormat 
                    },
                    "export-file": { 
                        "operation": "export/url", 
                        "input": "convert-file" 
                    }
                }
            })
        });

        const jobData = await jobResponse.json();

        if (!jobResponse.ok) {
            const detailMsg = jobData.message || (jobData.errors && jobData.errors[0] ? jobData.errors[0].message : "Datos inválidos");
            throw new Error(`CloudConvert: ${detailMsg}`);
        }

        const uploadTask = jobData.data.tasks.find(t => t.name === 'import-file');

        // 2. Subir Archivo
        statusBox.innerText = "⏳ Subiendo archivo...";
        const formData = new FormData();
        for (let p in uploadTask.result.form.parameters) {
            formData.append(p, uploadTask.result.form.parameters[p]);
        }
        formData.append('file', file);

        const uploadRes = await fetch(uploadTask.result.form.url, { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error("Error al subir el archivo a la nube.");

        // 3. Esperar finalización
        statusBox.innerText = "⏳ Convirtiendo documento...";
        let exportTask;
        while (true) {
            await new Promise(r => setTimeout(r, 2000));
            const checkRes = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobData.data.id}`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            const checkData = await checkRes.json();
            exportTask = checkData.data.tasks.find(t => t.name === 'export-file');
            
            if (exportTask.status === 'finished') break;
            if (exportTask.status === 'error') throw new Error("Error durante la conversión.");
        }

        // 4. Descargar
        statusBox.style.color = "green";
        statusBox.innerText = "✅ ¡Conversión exitosa! Descargando...";
        const fileUrl = exportTask.result.files[0].url;
        
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = file.name.substring(0, file.name.lastIndexOf('.')) + '.' + outputFormat;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

    } catch (error) {
        console.error(error);
        statusBox.style.color = "red";
        statusBox.innerText = `❌ ${error.message || "Ocurrió un error durante la conversión."}`;
    }
}

// =======================================================
// FUNCIONES AUXILIARES
// =======================================================

// Forzar descarga de archivos Blob
function downloadBlob(data, fileName, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Formatear tamaño de archivos
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
