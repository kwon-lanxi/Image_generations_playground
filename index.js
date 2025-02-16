/*---------- Variables ------------*/
const endpoint = document.getElementById("endpoint");
const height = document.getElementById("height") || 1024;
const width = document.getElementById("width") || 1024; 
const key = document.getElementById("key");
const model = document.getElementById("model") ;
const prompt = document.getElementById("prompt")

const generar = document.getElementById("generate");
const download = document.getElementById("download");

const imagePreview = document.getElementById("image-preview");
const form = document.getElementById("image-form");

/*---------- Prewiew ------------*/
function TamañoPreview() {
    imagePreview.src = `https://fakeimg.pl/${height.value}x${width.value}/282828/eae0d0/?text=output#.png`;
}   

height.addEventListener("input", TamañoPreview);
width.addEventListener("input", TamañoPreview);

TamañoPreview();

/*---------- generar ------------*/
generar.addEventListener("click", async (e) => { 
    generar.disabled = true;
    generar.textContent = "Generando...";

    if (!endpoint.value || !key.value || !model.value || !prompt.value) {
        alert("⚠️ Completa todos los campos obligatorios");
        generar.disabled = false;
        generar.textContent = "Generar";
        return;
    }

    try {
        const response = await fetch(`${endpoint.value}/images/generations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key.value}`
            },
            body: JSON.stringify({
                prompt: prompt.value,
                n: 1,
                size: `${height.value}x${width.value}`,
                model: model.value,
                response_format: "url"
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Éxito en la generación
            const time = new Date().getTime();
            imagePreview.src = data.data[0].url;
            download.href = data.data[0].url;
            download.download = `imagen-generada-${time}.png`;
            download.textContent = "Descargar";
        } else {
            // Manejo específico de errores de la API
            const errorMessage = data.error?.message?.toLowerCase() || "";
            let userMessage = "❌ Error en la solicitud";
            
            if (errorMessage.includes("api key")) {
                userMessage = "🔑 Api key incorrecta o inválida, pon la correcta";
            } else if (errorMessage.includes("model")) {
                userMessage = "🤖 Modelo no reconocido o no disponible, busca el correcto";
            } else if (errorMessage.includes("endpoint") || errorMessage.includes("url")) {
                userMessage = "🌐 Error en el endpoint, fijate la url del servicio";
            }
            
            alert(userMessage + "\n\nDetalle técnico: " + (data.error?.message || "Sin información adicional"));
            console.error("Error detallado:", data);
        }
    } catch (error) {
        // Manejo de errores de red
        let networkMessage = "🌐 Error de conexión: ";
        if (error instanceof TypeError) {
            networkMessage += "Verifica:\n1. Si el endpoint es correcto\n2. Si Tenes conexión a Internet\n3. O si el CORS está configurado";
        } else {
            networkMessage += error.message || "Error desconocido";
        }
        alert(networkMessage);
    } finally {
        generar.disabled = false;
        generar.textContent = "Generar";
    }
});