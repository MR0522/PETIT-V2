// API Key de CloudConvert configurada
const CLOUDCONVERT_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNGVlM2EzODdlYzIyODRjODI5NGQ1OGEzZmQ2OThlMTUyMDAwYmRmMTE1ZjM4ZjhhMTYxNGU5ZDRiNzIxMzJjMzA3ZGQ5MDhhZTBiNmE2MzAiLCJpYXQiOjE3ODU3MDEzNTcuMTIwNzQ3LCJuYmYiOjE3ODU3MDEzNTcuMTIwNzQ4LCJleHAiOjQ5NDEzNzQ5NTcuMTE1ODIxLCJzdWIiOiI0MTU2Njk5MCIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.X5lRjj96i180gCCqEPlxLFgRzEgu_rihn3LgtL-2awBDCiCymtCu14Pckr6e2X9qjxLC6pPGFeHlFjLhFTmpsJ6sCFJ78wYiihGRpXGHrkkPFlrhJKImGFbtYWJWXOiQuTD0_LJ7KiDVBeV5mKNSLWmisMxMpw6S0NFSbiaDojbnwK23jQeqXZQzqIJA555SjnUNlda_s7t61aCPVqMBS_BempynIUzakol4v2dnsaMGaFdxqh-PyHh3z2jAZ7vivR-Dc2jURH9wRFx2-kU7Ry0PdaHK0C9hUtSYEHAgcCn7CRMMscuUyRP6QeT66ulOyqC4YTf3n-O-mvCcRlHemwEWyJCVKQ2Ye8wIn8uujj8qhgwGzJT8EZTxzB0cIRR5t81NbgTLmO4HZ2lc0-3M2GjU4UzvwBaICgVDC04VZG7ahHuDvfv0ayJkB9ccq1LwLyLZLcl3EraTqBypl6Hmxefe6p1GapGs6i30jX0v7Nqfkwx78lyXKHS2tSczn_PPcQkdo-PilLdJWwJd5S_h6Mh5s4_ieK8W-czZ_u1H5hAuXwALdiwn2NuV8WRjyZKabvE4J3TYkrt3bAc6IdA-5Se3znSkCnlX8B20otkIl5jkP1vWwHSJTUe7vmclWdEovaxwU87odeBAiNuJeOeXm-4J1qGRZeST0ydSqN3uQC8";

let currentTool = "merge";

// Configuración de las herramientas
const toolConfig = {
    merge: { title: "Unir PDF", desc: "Selecciona 2 o más archivos PDF para unirlos.", accept: ".pdf", multiple: true },
    split: { title: "Dividir PDF", desc: "Selecciona un archivo PDF para extraer sus páginas.", accept: ".pdf", multiple: false },
    img2pdf: { title: "Imagen a PDF", desc: "Selecciona imágenes (JPG, PNG) para convertirlas a PDF.", accept: "image/jpeg, image/png", multiple: true },
    word2pdf: { title: "Word a PDF", desc: "Convierte tus documentos .docx a PDF.", accept: ".docx, .doc", multiple: false, convertTo: "pdf" },
    excel2pdf: { title: "Excel a PDF", desc: "Convierte tus hojas de cálculo .xlsx a PDF.", accept: ".xlsx, .xls", multiple: false, convertTo: "pdf" },
    ppt2pdf: { title: "PowerPoint a PDF", desc: "Convierte tus presentaciones .pptx a PDF.", accept: ".pptx, .ppt", multiple: false, convertTo: "pdf" },
    pdf2word: { title: "PDF a Word", desc: "Convierte tu PDF en un archivo .docx editable.", accept: ".pdf", multiple: false, convertTo: "docx" },
    pdf2excel: { title: "PDF a Excel", desc: "Convierte tu PDF en una tabla de Excel .xlsx.", accept: ".pdf", multiple: false, convertTo: "xlsx" },
    pdf2ppt: { title: "PDF a PowerPoint", desc: "Convierte tu PDF en una presentación .pptx.", accept: ".pdf", multiple: false, convertTo: "pptx" }
};

// Cambio de pestañas
document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        currentTool = button.getAttribute('data-tool');
        const config = toolConfig[currentTool];
        
        document.getElementById('tool-title').innerText = config.title;
        document.getElementById('tool-desc').innerText = config.desc;
        
        const fileInput = document.getElementById('main-file-input');
        fileInput.value = "";
        fileInput.accept = config.accept;
        fileInput.multiple = config.multiple;
        
        document.getElementById('status-box').innerText = "";
    });
});

// Botón de procesamiento
document.getElementById('btn-process').addEventListener('click', async () => {
    const input = document.getElementById('main-file-input');
    const statusBox = document.getElementById('status-box');

    if (!input.files.length) {
        alert("Por favor selecciona un archivo.");
        return;
    }

    const cleanKey = CLOUDCONVERT_API_KEY.trim();

    // Si es conversión de Office usa CloudConvert API
    if (["word2pdf", "excel2pdf", "ppt2pdf", "pdf2word", "pdf2excel", "pdf2ppt"].includes(currentTool)) {
        if (!cleanKey) {
            statusBox.style.color = "red";
            statusBox.innerText = "⚠️ Debes ingresar tu API Key de CloudConvert en script.js para usar las conversiones de Office.";
            return;
        }
        await convertWithCloudConvert(input.files[0], toolConfig[currentTool].convertTo, cleanKey);
    } else {
        statusBox.style.color = "blue";
        statusBox.innerText = "Procesando localmente...";
    }
});

// Función de Conversión usando la API de CloudConvert
async function convertWithCloudConvert(file, outputFormat, apiKey) {
    const statusBox = document.getElementById('status-box');
    try {
        statusBox.style.color = "orange";
        statusBox.innerText = "⏳ Creando tarea de conversión en la nube...";

        // 1. Crear Job (incluye el nombre exacto del archivo)
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

        // 4. Descargar archivo resultativo
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
