// ==========================================================================
// PETIT-V2 - Motor de Procesamiento y PWA
// Autor: MAUU SOFT
// ==========================================================================

const CLOUDCONVERT_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNGVlM2EzODdlYzIyODRjODI5NGQ1OGEzZmQ2OThlMTUyMDAwYmRmMTE1ZjM4ZjhhMTYxNGU5ZDRiNzIxMzJjMzA3ZGQ5MDhhZTBiNmE2MzAiLCJpYXQiOjE3ODU3MDEzNTcuMTIwNzQ3LCJuYmYiOjE3ODU3MDEzNTcuMTIwNzQ4LCJuYmYiOjE3ODU3MDEzNTcuMTIwNzQ4LCJleHAiOjQ5NDEzNzQ5NTcuMTE1ODIxLCJzdWIiOiI0MTU2Njk5MCIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.X5lRjj96i180gCCqEPlxLFgRzEgu_rihn3LgtL-2awBDCiCymtCu14Pckr6e2X9qjxLC6pPGFeHlFjLhFTmpsJ6sCFJ78wYiihGRpXGHrkkPFlrhJKImGFbtYWJWXOiQuTD0_LJ7KiDVBeV5mKNSLWmisMxMpw6S0NFSbiaDojbnwK23jQeqXZQzqIJA555SjnUNlda_s7t61aCPVqMBS_BempynIUzakol4v2dnsaMGaFdxqh-PyHh3z2jAZ7vivR-Dc2jURH9wRFx2-kU7Ry0PdaHK0C9hUtSYEHAgcCn7CRMMscuUyRP6QeT66ulOyqC4YTf3n-O-mvCcRlHemwEWyJCVKQ2Ye8wIn8uujj8qhgwGzJT8EZTxzB0cIRR5t81NbgTLmO4HZ2lc0-3M2GjU4UzvwBaICgVDC04VZG7ahHuDvfv0ayJkB9ccq1LwLyLZLcl3EraTqBypl6Hmxefe6p1GapGs6i30jX0v7Nqfkwx78lyXKHS2tSczn_PPcQkdo-PilLdJWwJd5S_h6Mh5s4_ieK8W-czZ_u1H5hAuXwALdiwn2NuV8WRjyZKabvE4J3TYkrt3bAc6IdA-5Se3znSkCnlX8B20otkIl5jkP1vWwHSJTUe7vmclWdEovaxwU87odeBAiNuJeOeXm-4J1qGRZeST0ydSqN3uQC8";

let currentTool = "merge";
let deferredPrompt = null;

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

// 1. INSTALACIÓN PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

document.getElementById('btnInstallAndroid')?.addEventListener('click', triggerInstall);
document.getElementById('btnInstallWindows')?.addEventListener('click', triggerInstall);

function triggerInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => deferredPrompt = null);
    } else {
        alert("Para instalar PETIT en tu dispositivo:\n- En Android: Menú (⋮) -> 'Añadir a la pantalla de inicio'.\n- En PC: Haz clic en el ícono de instalar en la barra de navegación.");
    }
}

// 2. BUSCADOR
document.getElementById('toolSearch')?.addEventListener('input', (e) => {
    const filter = e.target.value.toLowerCase();
    document.querySelectorAll('.tool-card').forEach(card => {
        const text = (card.getAttribute('data-keywords') || "") + " " + card.innerText.toLowerCase();
        card.style.display = text.includes(filter) ? "block" : "none";
    });
});

// 3. MODAL Y PANELES
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

closeModal?.addEventListener('click', () => modal.style.display = 'none');

// 4. BOTÓN EJECUTAR
document.getElementById('btn-process')?.addEventListener('click', async () => {
    const input = document.getElementById('main-file-input');
    const password = document.getElementById('pdfPassword')?.value || "";

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

// 5. LECTURA DE PDF CON RESPALDO CLOUDCONVERT PARA ARCHIVOS CIFRADOS (AES)
async function loadPdfWithPassword(file, pwd) {
    const bytes = await file.arrayBuffer();
    try {
        return await PDFLib.PDFDocument.load(bytes, { password: pwd || undefined });
    } catch (e) {
        // Si el lector local no puede abrir el cifrado AES, se devuelve null para usar CloudConvert
        return null;
    }
}

// 6. HERRAMIENTA DIVIDIR PDF
async function splitPDF(file, password) {
    const status = document.getElementById('status-box');
    status.innerText = "⏳ Leyendo documento...";

    let doc = await loadPdfWithPassword(file, password);

    // Si pdf-lib falla por cifrado AES, usamos la API de CloudConvert con la contraseña
    if (!doc) {
        status.innerText = "🔒 PDF cifrado con seguridad alta. Desbloqueando en servidor seguro...";
        const unlockedBlob = await unlockWithCloudConvert(file, password);
        if (!unlockedBlob) return;
        const bytes = await unlockedBlob.arrayBuffer();
        doc = await PDFLib.PDFDocument.load(bytes);
    }

    try {
        status.innerText = "⏳ Generando páginas divididas...";
        const zip = new JSZip();
        for (let i = 0; i < doc.getPageCount(); i++) {
            const newDoc = await PDFLib.PDFDocument.create();
            const [page] = await newDoc.copyPages(doc, [i]);
            newDoc.addPage(page);
            zip.file(`pagina_${i + 1}.pdf`, await newDoc.save());
        }
        const blob = await zip.generateAsync({ type: "blob" });
        downloadBlob(blob, `${file.name.replace('.pdf', '')}_dividido.zip`, "application/zip");
        status.style.color = "#10b981";
        status.innerText = "✅ ¡PDF dividido correctamente!";
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = "❌ Error: " + e.message;
    }
}

// 7. HERRAMIENTA DESBLOQUEAR PDF
async function unlockPDF(file, password) {
    const status = document.getElementById('status-box');
    status.innerText = "⏳ Procesando desencriptación...";

    let doc = await loadPdfWithPassword(file, password);

    if (!doc) {
        status.innerText = "🔒 PDF cifrado con seguridad alta. Procesando con CloudConvert...";
        const unlockedBlob = await unlockWithCloudConvert(file, password);
        if (unlockedBlob) {
            downloadBlob(unlockedBlob, `${file.name.replace('.pdf', '')}_desbloqueado.pdf`, "application/pdf");
            status.style.color = "#10b981";
            status.innerText = "✅ ¡PDF desencriptado con éxito!";
        }
        return;
    }

    const savedBytes = await doc.save();
    downloadBlob(savedBytes, `${file.name.replace('.pdf', '')}_desbloqueado.pdf`, "application/pdf");
    status.style.color = "#10b981";
    status.innerText = "✅ ¡PDF desencriptado con éxito!";
}

// 8. UNIR PDF
async function mergePDFs(files, password) {
    const status = document.getElementById('status-box');
    try {
        status.innerText = "⏳ Uniendo PDFs...";
        const merged = await PDFLib.PDFDocument.create();
        for (let file of files) {
            let doc = await loadPdfWithPassword(file, password);
            if (!doc) {
                const unlockedBlob = await unlockWithCloudConvert(file, password);
                if (!unlockedBlob) throw new Error("No se pudo desbloquear el archivo con la clave ingresada.");
                const bytes = await unlockedBlob.arrayBuffer();
                doc = await PDFLib.PDFDocument.load(bytes);
            }
            const pages = await merged.copyPages(doc, doc.getPageIndices());
            pages.forEach(p => merged.addPage(p));
        }
        downloadBlob(await merged.save(), "PETIT_unido.pdf", "application/pdf");
        status.style.color = "#10b981";
        status.innerText = "✅ ¡Archivos unidos con éxito!";
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = "❌ " + e.message;
    }
}

// 9. GIRAR PDF
async function rotatePDF(file, password) {
    const status = document.getElementById('status-box');
    const deg = parseInt(document.getElementById('rotateDegrees').value);
    try {
        status.innerText = "⏳ Girando páginas...";
        let doc = await loadPdfWithPassword(file, password);
        if (!doc) {
            const unlockedBlob = await unlockWithCloudConvert(file, password);
            if (!unlockedBlob) throw new Error("Clave incorrecta o error al procesar.");
            const bytes = await unlockedBlob.arrayBuffer();
            doc = await PDFLib.PDFDocument.load(bytes);
        }
        doc.getPages().forEach(p => p.setRotation(PDFLib.degrees(deg)));
        downloadBlob(await doc.save(), "PETIT_girado.pdf", "application/pdf");
        status.style.color = "#10b981";
        status.innerText = "✅ ¡Páginas giradas con éxito!";
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = "❌ " + e.message;
    }
}

// 10. FUNCIÓN SECUNDARIA: DESBLOQUEAR VÍA CLOUDCONVERT API
async function unlockWithCloudConvert(file, password) {
    const status = document.getElementById('status-box');
    try {
        const response = await fetch("https://api.cloudconvert.com/v2/jobs", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${CLOUDCONVERT_API_KEY.trim()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "tasks": {
                    "upload-file": { "operation": "import/upload" },
                    "process-pdf": {
                        "operation": "convert",
                        "input": "upload-file",
                        "output_format": "pdf",
                        "password": password
                    },
                    "export-file": {
                        "operation": "export/url",
                        "input": "process-pdf"
                    }
                }
            })
        });

        const jobData = await response.json();
        if (!jobData.data) throw new Error(jobData.message || "Error de autorización en la API.");

        const uploadTask = jobData.data.tasks.find(t => t.name === 'upload-file');
        const formData = new FormData();
        for (let key in uploadTask.result.form.parameters) {
            formData.append(key, uploadTask.result.form.parameters[key]);
        }
        formData.append('file', file);

        await fetch(uploadTask.result.form.url, { method: "POST", body: formData });

        const finishedJob = await waitForCloudConvertJob(jobData.data.id);
        const exportTask = finishedJob.tasks.find(t => t.name === 'export-file');

        if (!exportTask || !exportTask.result || !exportTask.result.files) {
            throw new Error("La contraseña ingresada es incorrecta.");
        }

        const fileUrl = exportTask.result.files[0].url;
        const fileRes = await fetch(fileUrl);
        return await fileRes.blob();
    } catch (err) {
        status.style.color = "#ef4444";
        status.innerText = "❌ Contraseña incorrecta o fallo en desencriptación: " + err.message;
        return null;
    }
}

async function waitForCloudConvertJob(jobId) {
    while (true) {
        await new Promise(r => setTimeout(r, 2000));
        const res = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
            headers: { "Authorization": `Bearer ${CLOUDCONVERT_API_KEY.trim()}` }
        });
        const data = await res.json();
        if (data.data.status === 'finished') return data.data;
        if (data.data.status === 'error') throw new Error("Error en el procesamiento del servidor.");
    }
}

function downloadBlob(data, fileName, mimeType) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}
