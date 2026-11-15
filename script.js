// ==========================================================================
// PETIT-V2 - Motor de Procesamiento y PWA
// Autor: MAUU SOFT
// ==========================================================================

// Clave API de CloudConvert actualizada
const CLOUDCONVERT_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZDE1MzNjZDdmNmY5NzFjZjhjNzI3NzgzZDBmOWJjNDg5MTNjNzg4ZWVhZjUzMzAzYzkzMTMwMzM4YzcxZjlhMGI4NDMwNWM2NzFmYzVmZjEiLCJpYXQiOjE3ODYwNzE2NTMuNTUzNTg4LCJuYmYiOjE3ODYwNzE2NTMuNTUzNTksImV4cCI6NDk0MTc0NTI1My41NDQ1MzksInN1YiI6IjQxNTY2OTkwIiwic2NvcGVzIjpbInRhc2sucmVhZCIsInRhc2sud3JpdGUiXX0.jagervQvDckkwTg9aDbSB1NXIAVcsUNNmZ_i7dfB1PUJgH9W0oc4GV697oXI-FsE1DAhhFzHUy7I3gZhXqiRMwGum7UqPl7KApheVKaomP-DbDO9SdURKoYM0B2olYzJcJt7GPvqTcPH98hPU98gJYTwpJWOyVGzAH9n3dNMykNgCK0i4or8qDAw4BVUtkH2FIX01F_NVxPVGV99dAQmXFk_pUQWTAqxvvPWABdEsYp5fyrHk7MiT3DGw7yR9zM7NVp48VWTfdBwPKgLaBj5OrrqG7LC5vjZ-xcgBfJG3ObJazkzsi3jodSBsc2JZBZDR8ZP6oj-3TPgF2MgthCuIwjFl_oJ9R2Y6r7rBFUHHhSDDFxQMME9VuR08rZUMLhJfxAjHeJfDy7PhnHeCDKA_jQJX_jlDWeBmGi8Eyi6DmKRO01nnhc1IQcExlL-F8lIkOj1SsjwZ_JyKC9ZJcTmrMAvfz90PUzYs3i9uS6DzAS1kzBLnXlWCLXZffN_bpZcWwIZrV3kXlctI5n0gUz1Zn3Ws7vaLTmVwil6WAL44bINZRxcXYV3qjNl3SruWeuRj7VE0s4dvxG1KDZacBIpolDt4WStH5eVEng6QiyWhDrPWZPPrz2yomxELL-Qc6fDS-FFcv-Tog1h6oPMWl7DaUnoUy6SHcCdn3Uw5SN5kvg";

let currentTool = "merge";
let deferredPrompt = null;
let pdfFilesQueue = [];

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

// ==========================================================================
// GESTIÓN DE COLA Y REORDENAMIENTO DE ARCHIVOS (Estilo iLovePDF)
// ==========================================================================

function addFilesToQueue(fileList) {
    const newFiles = Array.from(fileList);
    const validFiles = newFiles.filter(file => file.type === 'application/pdf');

    if (validFiles.length !== newFiles.length) {
        alert("Algunos archivos fueron ignorados porque no son formato PDF.");
    }

    pdfFilesQueue = [...pdfFilesQueue, ...validFiles];
    renderFilesQueue();
}

function removeFileFromQueue(index) {
    pdfFilesQueue.splice(index, 1);
    renderFilesQueue();
}

function moveFile(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pdfFilesQueue.length) return;

    const temp = pdfFilesQueue[index];
    pdfFilesQueue[index] = pdfFilesQueue[targetIndex];
    pdfFilesQueue[targetIndex] = temp;

    renderFilesQueue();
}

function renderFilesQueue() {
    const container = document.getElementById('files-preview-container');
    if (!container) return;

    container.innerHTML = '';

    if (pdfFilesQueue.length === 0) {
        container.innerHTML = `<p class="empty-queue-text" style="color: #6c757d; text-align: center; padding: 10px;">No hay archivos seleccionados. Comienza a agregar PDFs.</p>`;
        return;
    }

    pdfFilesQueue.forEach((file, index) => {
        const fileCard = document.createElement('div');
        fileCard.className = 'pdf-card-item';
        fileCard.innerHTML = `
            <div class="file-info" style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                <span class="file-order" style="font-weight: bold; background: #e2e8f0; color: #333; padding: 2px 8px; border-radius: 4px;">#${index + 1}</span>
                <span class="file-name" title="${file.name}" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; color: #333;">${file.name}</span>
                <span class="file-size" style="color: #6c757d; font-size: 0.85rem;">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
            <div class="file-actions" style="display: flex; gap: 6px;">
                <button type="button" onclick="moveFile(${index}, -1)" ${index === 0 ? 'disabled' : ''} title="Mover arriba">⬆️</button>
                <button type="button" onclick="moveFile(${index}, 1)" ${index === indexCount() ? 'disabled' : ''} title="Mover abajo">⬇️</button>
                <button type="button" onclick="removeFileFromQueue(${index})" class="btn-delete" title="Eliminar">❌</button>
            </div>
        `;
        container.appendChild(fileCard);
    });
}

function indexCount() {
    return pdfFilesQueue.length - 1;
}

// ==========================================================================
// FLUJO GENERAL Y MODAL
// ==========================================================================

function resetWorkArea() {
    setTimeout(() => {
        const fileInput = document.getElementById('main-file-input');
        const pwdInput = document.getElementById('pdfPassword');
        const statusBox = document.getElementById('status-box');
        const modal = document.getElementById('workModal');
        const previewContainer = document.getElementById('files-preview-container');
        const addMoreContainer = document.getElementById('add-more-container');

        if (fileInput) fileInput.value = "";
        if (pwdInput) pwdInput.value = "";
        if (statusBox) {
            statusBox.innerText = "";
            statusBox.style.color = "";
        }
        if (previewContainer) previewContainer.style.display = 'none';
        if (addMoreContainer) addMoreContainer.style.display = 'none';
        if (modal) modal.style.display = 'none';
        pdfFilesQueue = [];
    }, 2000);
}

// INSTALACIÓN PWA
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

// BUSCADOR
document.getElementById('toolSearch')?.addEventListener('input', (e) => {
    const filter = e.target.value.toLowerCase();
    document.querySelectorAll('.tool-card').forEach(card => {
        const text = (card.getAttribute('data-keywords') || "") + " " + card.innerText.toLowerCase();
        card.style.display = text.includes(filter) ? "block" : "none";
    });
});

// MODAL Y PANELES
const modal = document.getElementById('workModal');
const closeModal = document.getElementById('closeModal');

document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => {
        currentTool = card.getAttribute('data-tool');
        const config = toolConfig[currentTool];

        document.getElementById('standard-pane').style.display = currentTool === 'imgconvert' ? 'none' : 'block';
        document.getElementById('imgconvert-pane').style.display = currentTool === 'imgconvert' ? 'block' : 'none';

        // Mostrar u ocultar el contenedor de cola y botón de agregar más estilo iLovePDF para 'merge'
        let previewContainer = document.getElementById('files-preview-container');
        let addMoreContainer = document.getElementById('add-more-container');
        if (previewContainer) {
            previewContainer.style.display = currentTool === 'merge' ? 'flex' : 'none';
        }
        if (addMoreContainer) {
            addMoreContainer.style.display = currentTool === 'merge' ? 'block' : 'none';
        }

        if (config) {
            document.getElementById('tool-title').innerText = config.title;
            document.getElementById('tool-desc').innerText = config.desc || "Selecciona un archivo para procesar.";
            
            const fileInput = document.getElementById('main-file-input');
            fileInput.value = "";
            fileInput.accept = config.accept || "*";
            fileInput.multiple = !!config.multiple;

            const pwdInput = document.getElementById('pdfPassword');
            if (pwdInput) pwdInput.value = "";

            document.getElementById('passwordGroup').style.display = config.askPassword ? 'block' : 'none';
            document.getElementById('rotationGroup').style.display = currentTool === 'rotate' ? 'block' : 'none';
        }

        if (currentTool === 'merge') {
            pdfFilesQueue = [];
            renderFilesQueue();
        }

        const statusBox = document.getElementById('status-box');
        if (statusBox) statusBox.innerText = "";
        modal.style.display = 'flex';
    });
});

closeModal?.addEventListener('click', () => modal.style.display = 'none');

// Escuchador para el input principal de archivos
document.getElementById('main-file-input')?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        if (currentTool === 'merge') {
            addFilesToQueue(e.target.files);
        }
        e.target.value = '';
    }
});

// BOTÓN EJECUTAR
document.getElementById('btn-process')?.addEventListener('click', async () => {
    const input = document.getElementById('main-file-input');
    const password = document.getElementById('pdfPassword')?.value || "";

    if (currentTool === "merge") {
        if (pdfFilesQueue.length === 0) {
            alert("Por favor selecciona al menos un archivo PDF para unir.");
            return;
        }
        await mergePDFs(pdfFilesQueue, password);
        return;
    }

    if (!input.files || input.files.length === 0) {
        alert("Por favor selecciona un archivo.");
        return;
    }

    if (currentTool === "split") await splitPDF(input.files[0], password);
    else if (currentTool === "unlock") await unlockPDF(input.files[0], password);
    else if (currentTool === "rotate") await rotatePDF(input.files[0], password);
    else if (currentTool === "img2pdf") await imagesToPDF(input.files);
    else if (toolConfig[currentTool]?.convertTo) {
        await convertWithCloudConvert(input.files[0], toolConfig[currentTool].convertTo, CLOUDCONVERT_API_KEY.trim());
    }
});

// ==========================================================================
// FUNCIONES DE PROCESAMIENTO PDF Y CLOUDCONVERT
// ==========================================================================

async function loadPdfWithPassword(file, pwd) {
    const bytes = await file.arrayBuffer();
    try {
        return await PDFLib.PDFDocument.load(bytes, { password: pwd || undefined });
    } catch (e) {
        return null;
    }
}

async function splitPDF(file, password) {
    const status = document.getElementById('status-box');
    status.innerText = "⏳ Leyendo documento...";

    let doc = await loadPdfWithPassword(file, password);

    if (!doc) {
        status.innerText = "🔒 PDF cifrado con alta seguridad. Desbloqueando en servidor...";
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
        resetWorkArea();
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = "❌ Error: " + e.message;
    }
}

async function unlockPDF(file, password) {
    const status = document.getElementById('status-box');
    status.innerText = "⏳ Procesando desencriptación...";

    let doc = await loadPdfWithPassword(file, password);

    if (!doc) {
        status.innerText = "🔒 PDF cifrado con alta seguridad. Procesando en servidor...";
        const unlockedBlob = await unlockWithCloudConvert(file, password);
        if (unlockedBlob) {
            downloadBlob(unlockedBlob, `${file.name.replace('.pdf', '')}_desbloqueado.pdf`, "application/pdf");
            status.style.color = "#10b981";
            status.innerText = "✅ ¡PDF desencriptado con éxito!";
            resetWorkArea();
        }
        return;
    }

    const savedBytes = await doc.save();
    downloadBlob(savedBytes, `${file.name.replace('.pdf', '')}_desbloqueado.pdf`, "application/pdf");
    status.style.color = "#10b981";
    status.innerText = "✅ ¡PDF desencriptado con éxito!";
    resetWorkArea();
}

async function mergePDFs(files, password) {
    const status = document.getElementById('status-box');
    try {
        status.innerText = "⏳ Uniendo PDFs...";
        const merged = await PDFLib.PDFDocument.create();
        for (let file of files) {
            let doc = await loadPdfWithPassword(file, password);
            if (!doc) {
                const unlockedBlob = await unlockWithCloudConvert(file, password);
                if (!unlockedBlob) throw new Error(`No se pudo desbloquear el archivo ${file.name} con la clave ingresada.`);
                const bytes = await unlockedBlob.arrayBuffer();
                doc = await PDFLib.PDFDocument.load(bytes);
            }
            const pages = await merged.copyPages(doc, doc.getPageIndices());
            pages.forEach(p => merged.addPage(p));
        }
        downloadBlob(await merged.save(), "PETIT_unido.pdf", "application/pdf");
        status.style.color = "#10b981";
        status.innerText = "✅ ¡Archivos unidos con éxito!";
        resetWorkArea();
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = "❌ " + e.message;
    }
}

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
        resetWorkArea();
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = "❌ " + e.message;
    }
}

async function imagesToPDF(files) {
    const status = document.getElementById('status-box');
    try {
        status.innerText = "⏳ Convirtiendo imágenes a PDF...";
        const pdfDoc = await PDFLib.PDFDocument.create();

        for (let file of files) {
            const imgBytes = await file.arrayBuffer();
            let img;
            if (file.type === "image/jpeg" || file.type === "image/jpg") {
                img = await pdfDoc.embedJpg(imgBytes);
            } else if (file.type === "image/png") {
                img = await pdfDoc.embedPng(imgBytes);
            } else {
                continue;
            }

            const page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        }

        const pdfBytes = await pdfDoc.save();
        downloadBlob(pdfBytes, "imagenes_convertidas.pdf", "application/pdf");
        status.style.color = "#10b981";
        status.innerText = "✅ ¡PDF creado con éxito!";
        resetWorkArea();
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = "❌ Error: " + e.message;
    }
}

async function convertWithCloudConvert(file, outputFormat, apiKey) {
    const status = document.getElementById('status-box');
    try {
        status.innerText = "⏳ Convirtiendo archivo en la nube...";
        const response = await fetch("https://api.cloudconvert.com/v2/jobs", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "tasks": {
                    "upload-file": { "operation": "import/upload" },
                    "convert-file": {
                        "operation": "convert",
                        "input": "upload-file",
                        "output_format": outputFormat
                    },
                    "export-file": {
                        "operation": "export/url",
                        "input": "convert-file"
                    }
                }
            })
        });

        const jobData = await response.json();
        if (response.status === 401 || (jobData.message && jobData.message.includes("Unauthenticated"))) {
            throw new Error("Clave API de CloudConvert no válida.");
        }
        if (!jobData.data) throw new Error(jobData.message || "Error al iniciar la conversión.");

        const uploadTask = jobData.data.tasks.find(t => t.name === 'upload-file');
        const formData = new FormData();
        for (let key in uploadTask.result.form.parameters) {
            formData.append(key, uploadTask.result.form.parameters[key]);
        }
        formData.append('file', file);

        await fetch(uploadTask.result.form.url, { method: "POST", body: formData });

        const finishedJob = await waitForCloudConvertJob(jobData.data.id);
        const exportTask = finishedJob.tasks.find(t => t.name === 'export-file');
        const fileUrl = exportTask.result.files[0].url;
        const fileRes = await fetch(fileUrl);
        const blob = await fileRes.blob();

        const newName = file.name.substring(0, file.name.lastIndexOf('.')) + '.' + outputFormat;
        downloadBlob(blob, newName, blob.type);
        status.style.color = "#10b981";
        status.innerText = "✅ ¡Conversión completada!";
        resetWorkArea();
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = "❌ Error: " + e.message;
    }
}

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

        if (response.status === 401 || (jobData.message && jobData.message.includes("Unauthenticated"))) {
            throw new Error("La clave API de CloudConvert no es válida o expiró.");
        }

        if (!jobData.data) throw new Error(jobData.message || "Error al conectar con el servidor.");

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
        status.innerText = "❌ " + err.message;
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
        if (data.data.status === 'error') throw new Error("La contraseña ingresada es incorrecta o el archivo no pudo procesarse.");
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
