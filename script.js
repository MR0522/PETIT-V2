// ==========================================================================
// PETIT-V2 - Motor de Procesamiento y PWA
// Autor: MAUU SOFT
// ==========================================================================

// Clave API de CloudConvert actualizada
const CLOUDCONVERT_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZDE1MzNjZDdmNmY5NzFjZjhjNzI3NzgzZDBmOWJjNDg5MTNjNzg4ZWVhZjUzMzAzYzkzMTMwMzM4YzcxZjlhMGI4NDMwNWM2NzFmYzVmZjEiLCJpYXQiOjE3ODYwNzE2NTMuNTUzNTg4LCJuYmYiOjE3ODYwNzE2NTMuNTUzNTksImV4cCI6NDk0MTc0NTI1My41NDQ1MzksInN1YiI6IjQxNTY2OTkwIiwic2NvcGVzIjpbInRhc2sucmVhZCIsInRhc2sud3JpdGUiXX0.jagervQvDckkwTg9aDbSB1NXIAVcsUNNmZ_i7dfB1PUJgH9W0oc4GV697oXI-FsE1DAhhFzHUy7I3gZhXqiRMwGum7UqPl7KApheVKaomP-DbDO9SdURKoYM0B2olYzJcJt7GPvqTcPH98hPU98gJYTwpJWOyVGzAH9n3dNMykNgCK0i4or8qDAw4BVUtkH2FIX01F_NVxPVGV99dAQmXFk_pUQWTAqxvvPWABdEsYp5fyrHk7MiT3DGw7yR9zM7NVp48VWTfdBwPKgLaBj5OrrqG7LC5vjZ-xcgBfJG3ObJazkzsi3jodSBsc2JZBZDR8ZP6oj-3TPgF2MgthCuIwjFl_oJ9R2Y6r7rBFUHHhSDDFxQMME9VuR08rZUMLhJfxAjHeJfDy7PhnHeCDKA_jQJX_jlDWeBmGi8Eyi6DmKRO01nnhc1IQcExlL-F8lIkOj1SsjwZ_JyKC9ZJcTmrMAvfz90PUzYs3i9uS6DzAS1kzBLnXlWCLXZffN_bpZcWwIZrV3kXlctI5n0gUz1Zn3Ws7vaLTmVwil6WAL44bINZRxcXYV3qjNl3SruWeuRj7VE0s4dvxG1KDZacBIpolDt4WStH5eVEng6QiyWhDrPWZPPrz2yomxELL-Qc6fDS-FFcv-Tog1h6oPMWl7DaUnoUy6SHcCdn3Uw5SN5kvg";

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

// 1. REINICIO Y LIMPIEZA AUTOMÁTICA DE CAMPOS AL FINALIZAR
function resetWorkArea() {
    setTimeout(() => {
        const fileInput = document.getElementById('main-file-input');
        const pwdInput = document.getElementById('pdfPassword');
        const statusBox = document.getElementById('status-box');
        const modal = document.getElementById('workModal');

        if (fileInput) fileInput.value = "";
        if (pwdInput) pwdInput.value = "";
        if (statusBox) {
            statusBox.innerText = "";
            statusBox.style.color = "";
        }
        if (modal) modal.style.display = 'none';
    }, 2000); // Se limpia y cierra 2 segundos después de descargar
}

// 2. INSTALACIÓN PWA
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

// 3. BUSCADOR
document.getElementById('toolSearch')?.addEventListener('input', (e) => {
    const filter = e.target.value.toLowerCase();
    document.querySelectorAll('.tool-card').forEach(card => {
        const text = (card.getAttribute('data-keywords') || "") + " " + card.innerText.toLowerCase();
        card.style.display = text.includes(filter) ? "block" : "none";
    });
});

// 4. MODAL Y PANELES
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

            const pwdInput = document.getElementById('pdfPassword');
            if (pwdInput) pwdInput.value = "";

            document.getElementById('passwordGroup').style.display = config.askPassword ? 'block' : 'none';
            document.getElementById('rotationGroup').style.display = currentTool === 'rotate' ? 'block' : 'none';
        }

        const statusBox = document.getElementById('status-box');
        if (statusBox) statusBox.innerText = "";
        modal.style.display = 'flex';
    });
});

closeModal?.addEventListener('click', () => modal.style.display = 'none');

// 5. BOTÓN EJECUTAR
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

// 6. LECTURA DE PDF LOCAL
async function loadPdfWithPassword(file, pwd) {
    const bytes = await file.arrayBuffer();
    try {
        return await PDFLib.PDFDocument.load(bytes, { password: pwd || undefined });
    } catch (e) {
        return null;
    }
}

// 7. DIVIDIR PDF
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

// 8. DESBLOQUEAR PDF
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

// 9. UNIR PDF
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
        resetWorkArea();
    } catch (e) {
        status.style.color = "#ef4444";
        status.innerText = "❌ " + e.message;
    }
}

// 10. GIRAR PDF
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

// 11. IMÁGENES A PDF
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

// 12. CONVERSIÓN DE DOCUMENTOS VÍA CLOUDCONVERT (Word, Excel, PPT, etc.)
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

// 13. DESBLOQUEAR PDF CIFRADO (AES) VÍA CLOUDCONVERT API
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

// 14. ESPERA DE PROCESO EN SERVIDOR
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

// 15. DESCARGAR ARCHIVO AL DISPOSITIVO
function downloadBlob(data, fileName, mimeType) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}
