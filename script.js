// ==========================================================================
// PETIT-V2 - Motor de Procesamiento y PWA
// Autor: MAUU SOFT
// ==========================================================================

const CLOUDCONVERT_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNGVlM2EzODdlYzIyODRjODI5NGQ1OGEzZmQ2OThlMTUyMDAwYmRmMTE1ZjM4ZjhhMTYxNGU5ZDRiNzIxMzJjMzA3ZGQ5MDhhZTBiNmE2MzAiLCJpYXQiOjE3ODU3MDEzNTcuMTIwNzQ3LCJuYmYiOjE3ODU3MDEzNTcuMTIwNzQ4LCJuYmYiOjE3ODU3MDEzNTcuMTIwNzQ4LCJleHAiOjQ5NDEzNzQ5NTcuMTE1ODIxLCJzdWIiOiI0MTU2Njk5MCIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.X5lRjj96i180gCCqEPlxLFgRzEgu_rihn3LgtL-2awBDCiCymtCu14Pckr6e2X9qjxLC6pPGFeHlFjLhFTmpsJ6sCFJ78wYiihGRpXGHrkkPFlrhJKImGFbtYWJWXOiQuTD0_LJ7KiDVBeV5mKNSLWmisMxMpw6S0NFSbiaDojbnwK23jQeqXZQzqIJA555SjnUNlda_s7t61aCPVqMBS_BempynIUzakol4v2dnsaMGaFdxqh-PyHh3z2jAZ7vivR-Dc2jURH9wRFx2-kU7Ry0PdaHK0C9hUtSYEHAgcCn7CRMMscuUyRP6QeT66ulOyqC4YTf3n-O-mvCcRlHemwEWyJCVKQ2Ye8wIn8uujj8qhgwGzJT8EZTxzB0cIRR5t81NbgTLmO4HZ2lc0-3M2GjU4UzvwBaICgVDC04VZG7ahHuDvfv0ayJkB9ccq1LwLyLZLcl3EraTqBypl6Hmxefe6p1GapGs6i30jX0v7Nqfkwx78lyXKHS2tSczn_PPcQkdo-PilLdJWwJd5S_h6Mh5s4_ieK8W-czZ_u1H5hAuXwALdiwn2NuV8WRjyZKabvE4J3TYkrt3bAc6IdA-5Se3znSkCnlX8B20otkIl5jkP1vWwHSJTUe7vmclWdEovaxwU87odeBAiNuJeOeXm-4J1qGRZeST0ydSqN3uQC8";

let currentTool = "merge";
let deferredPrompt = null;

// Configuración de herramientas
const toolConfig = {
    merge: { title: "Unir PDF", desc: "Unir varios PDF en uno solo.", accept: ".pdf", multiple: true, askPassword: true },
    split: { title: "Dividir PDF", desc: "Separa las páginas de tu PDF.", accept: ".pdf", multiple: false, askPassword: true },
    unlock: { title: "Desbloquear PDF", desc: "Remueve la contraseña de protección.", accept: ".pdf", multiple: false, askPassword: true },
    protect: { title: "Proteger PDF", desc: "Añade una contraseña al PDF.", accept: ".pdf", multiple: false },
    rotate: { title: "Girar PDF", desc: "Gira la orientación de las páginas.", accept: ".pdf", multiple: false, askPassword: true },
    img2pdf: { title: "Imágenes a PDF", desc: "Convierte imágenes JPG/PNG a PDF.", accept: "image/jpeg, image/png", multiple: true },
    imgconvert: { title: "JPG ↔ PNG", desc: "Convertidor local de imágenes.", accept: "image/jpeg, image/png", multiple: false },
    word2pdf: { title: "Word a PDF", accept: ".docx, .doc", convertTo: "pdf" },
    excel2pdf: { title: "Excel a PDF", accept: ".xlsx, .xls", convertTo: "pdf" },
    ppt2pdf: { title: "PPT a PDF", accept: ".pptx, .ppt", convertTo: "pdf" },
    pdf2word: { title: "PDF a Word", accept: ".pdf", convertTo: "docx" },
    pdf2excel: { title: "PDF a Excel", accept: ".pdf", convertTo: "xlsx" }
};

// 1. CONTROL DE INSTALACIÓN PWA (ANDROID Y WINDOWS)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

document.getElementById('btnInstallAndroid').addEventListener('click', triggerInstall);
document.getElementById('btnInstallWindows').addEventListener('click', triggerInstall);

function triggerInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => deferredPrompt = null);
    } else {
        alert("Para instalar PETIT en tu dispositivo:\n- En Android/Chrome: Menú (⋮) -> 'Añadir a la pantalla de inicio'.\n- En Windows/Edge/Chrome: Haz clic en el ícono de instalar en la barra de direcciones.");
    }
}

// 2. BUSCADOR DE HERRAMIENTAS
document.getElementById('toolSearch').addEventListener('input', (e) => {
    const filter = e.target.value.toLowerCase();
    document.querySelectorAll('.tool-card').forEach(card => {
        const text = card.getAttribute('data-keywords') + " " + card.innerText.toLowerCase();
        card.style.display = text.includes(filter) ? "block" : "none";
    });
});

// 3. ABRIR Y CERRAR MODAL
const modal = document.getElementById('workModal');
const closeModal = document.getElementById('closeModal');

document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => {
        currentTool = card.getAttribute('data-tool');
        const config = toolConfig[currentTool];

        document.getElementById('standard-pane').style.display = currentTool === 'imgconvert' ? 'none' : 'block';
        document.getElementById('imgconvert-pane').style.display = currentTool === 'imgconvert' ? 'block' : 'none';

        if (config) {
            document.getElementById('tool-title').innerText = config.title;
            document.getElementById('tool-desc').innerText = config.desc || "Selecciona un archivo para procesar.";
            
            const fileInput = document.getElementById('main-file-input');
            fileInput.value = "";
            fileInput.accept = config.accept || "*";
            fileInput.multiple = !!config.multiple;

            document.getElementById('passwordGroup').style.display = config.askPassword ? 'block' : 'none';
            document.getElementById('rotationGroup').style.display = currentTool === 'rotate' ? 'block' : 'none';
        }

        document.getElementById('status-box').innerText = "";
        modal.style.display = 'flex';
    });
});

closeModal.addEventListener('click', () => modal.style.display = 'none');

// 4. EJECUTAR ACCIÓN CON SOPORTE DE CONTRASEÑA
document.getElementById('btn-process').addEventListener('click', async () => {
    const input = document.getElementById('main-file-input');
    const password = document.getElementById('pdfPassword').value;

    if (!input.files || input.files.length === 0) {
        alert("Por favor selecciona un archivo.");
        return;
    }

    if (currentTool === "merge") await mergePDFs(input.files, password);
    else if (currentTool === "split") await splitPDF(input.files[0], password);
    else if (currentTool === "unlock") await unlockPDF(input.files[0], password);
    else if (currentTool === "rotate") await rotatePDF(input.files[0], password);
    else if (currentTool === "img2pdf") await imagesToPDF(input.files);
    else if (toolConfig[currentTool]?.convertTo) {
        await convertWithCloudConvert(input.files[0], toolConfig[currentTool].convertTo, CLOUDCONVERT_API_KEY.trim());
    }
});

// 5. FUNCIONES PDF CON SOPORTE PARA CLAVE DE SEGURIDAD
async function loadPdfWithPassword(file, pwd) {
    const bytes = await file.arrayBuffer();
    try {
        return await PDFLib.PDFDocument.load(bytes, { password: pwd || undefined });
    } catch (e) {
        throw new Error("El PDF tiene clave de seguridad. Ingrésala en el campo correspondiente.");
    }
}

async function mergePDFs(files, password) {
    const status = document.getElementById('status-box');
    try {
        status.innerText = "⏳ Uniendo PDFs...";
        const merged = await PDFLib.PDFDocument.create();
        for (let file of files) {
            const doc = await loadPdfWithPassword(file, password);
            const pages = await merged.copyPages(doc, doc.getPageIndices());
            pages.forEach(p => merged.addPage(p));
        }
        downloadBlob(await merged.save(), "PETIT_unido.pdf", "application/pdf");
        status.style.color = "#10b981";
        status.innerText = "✅ ¡Archivos unidos con éxito!";
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = e.message;
    }
}

async function splitPDF(file, password) {
    const status = document.getElementById('status-box');
    try {
        status.innerText = "⏳ Dividiendo PDF...";
        const doc = await loadPdfWithPassword(file, password);
        const zip = new JSZip();
        for (let i = 0; i < doc.getPageCount(); i++) {
            const newDoc = await PDFLib.PDFDocument.create();
            const [page] = await newDoc.copyPages(doc, [i]);
            newDoc.addPage(page);
            zip.file(`pagina_${i + 1}.pdf`, await newDoc.save());
        }
        const blob = await zip.generateAsync({ type: "blob" });
        downloadBlob(blob, "PETIT_dividido.zip", "application/zip");
        status.style.color = "#10b981";
        status.innerText = "✅ ¡PDF dividido correctamente!";
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = e.message;
    }
}

async function unlockPDF(file, password) {
    const status = document.getElementById('status-box');
    try {
        status.innerText = "⏳ Desbloqueando PDF...";
        const doc = await loadPdfWithPassword(file, password);
        downloadBlob(await doc.save(), "PETIT_desbloqueado.pdf", "application/pdf");
        status.style.color = "#10b981";
        status.innerText = "✅ ¡PDF desencriptado con éxito!";
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = e.message;
    }
}

async function rotatePDF(file, password) {
    const status = document.getElementById('status-box');
    const deg = parseInt(document.getElementById('rotateDegrees').value);
    try {
        status.innerText = "⏳ Girando páginas...";
        const doc = await loadPdfWithPassword(file, password);
        doc.getPages().forEach(p => p.setRotation(PDFLib.degrees(deg)));
        downloadBlob(await doc.save(), "PETIT_girado.pdf", "application/pdf");
        status.style.color = "#10b981";
        status.innerText = "✅ ¡Páginas giradas con éxito!";
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = e.message;
    }
}

function downloadBlob(data, fileName, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}
