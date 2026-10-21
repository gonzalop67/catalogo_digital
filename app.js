// 1. Simulación de base de datos de productos
let productos = [];
let carrito = [];
const numeroWhatsApp = "593984893415";

const catalogContainer = document.getElementById('catalog');
//const searchInput = document.getElementById('search-input');
const cartBar = document.getElementById('cart-bar');
const cartCount = document.getElementById('cart-count');
const whatsappBtn = document.getElementById('whatsapp-btn');

// 🚀 NUEVA FUNCIÓN: Cargar productos desde el archivo JSON externo
async function cargarProductos() {
    try {
        const respuesta = await fetch('productos.json'); // Petición HTTP al archivo local
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        productos = await respuesta.json(); // Convertir la respuesta a un objeto/array JS
        renderProducts(productos);          // Mostrar los productos en pantalla
    } catch (error) {
        console.error("No se pudo cargar el catálogo:", error);
        catalogContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:red;">Error al cargar el catálogo de productos.</p>';
    }
}

// 2. Función para renderizar los productos en pantalla (Versión ultra-compatible)
function renderizarProductos(listaProductos) {
    catalogContainer.innerHTML = '';

    if (listaProductos.length === 0) {
        catalogContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No se encontraron productos.</p>';
        return;
    }

    listaProductos.forEach(prod => {
        const card = document.createElement('div');
        card.classList.add('product-card');

        // 📂 Obtiene la URL completa actual (ej: https://tudominio.com)
        var urlActual = window.location.href;

        // ✂️ Corta el nombre del archivo "index.html" (o lo que esté al final) para quedarse con la ruta limpia de la carpeta
        var rutaCarpeta = urlActual.substring(0, urlActual.lastIndexOf('/') + 1);

        // 🔗 Une de forma exacta la ruta de la carpeta con el archivo factura y sus variables
        var urlMiSistema = rutaCarpeta + 'factura.html?id=' + prod.id + '&nombre=' + encodeURIComponent(prod.nombre) + '&precio=' + prod.precio;

        // 2. Creamos la URL del QR uniendo los textos con el símbolo "+" (Sin usar comillas invertidas ni llaves)
        var urlCodificadaQR = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(urlMiSistema);

        // 3. Insertamos el HTML de la tarjeta (Estructura con QR Fijo)
        card.innerHTML = `
            <div class="img-container">
                <img src="${prod.imagen}" alt="${prod.nombre}" class="product-img">
            </div>
            <div class="product-info-container">
                <div class="product-info">
                    <h3 class="product-title">${prod.nombre}</h3>
                    <p class="product-price">$${prod.precio.toFixed(2)}</p>
                </div>
                <div class="qr-fixed-container">
                    <img src="${urlCodificadaQR}" alt="QR de Facturación" class="qr-code-fixed">
                    <span>Escanear 🧾</span>
                </div>
            </div>
            <button class="add-btn" id="btn-${prod.id}">Facturar Producto</button>
        `;

        catalogContainer.appendChild(card);

        // Asignamos la acción del botón de forma segura por fuera del texto
        document.getElementById('btn-' + prod.id).addEventListener('click', function () {
            window.location.href = urlMiSistema;
        });
    });
}

// 2. Función para renderizar los productos en pantalla (Versión Análisis de Costos)
function renderProducts(listaProductos) {
    catalogContainer.innerHTML = '';

    if (listaProductos.length === 0) {
        catalogContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No se encontraron productos.</p>';
        return;
    }

    listaProductos.forEach(prod => {
        const card = document.createElement('div');
        card.classList.add('product-card');

        // 📂 Obtiene la URL completa actual (ej: https://tudominio.com)
        var urlActual = window.location.href;

        // ✂️ Corta el nombre del archivo actual para quedarse con la ruta limpia de la carpeta
        var rutaCarpeta = urlActual.substring(0, urlActual.lastIndexOf('/') + 1);

        // 🔗 NUEVA RUTA: Ahora redirige a 'analisis.html' enviando el ID y el nombre del producto
        var urlMiSistema = rutaCarpeta + 'analisis.html?id=' + prod.id + '&nombre=' + encodeURIComponent(prod.nombre);

        // 🖼️ Generamos la URL del QR apuntando a la nueva página de análisis
        var urlCodificadaQR = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(urlMiSistema);

        // 3. Insertamos el HTML de la tarjeta (Cambiando el texto del botón y leyenda)
        card.innerHTML = `
            <div class="img-container">
                <img src="${prod.imagen}" alt="${prod.nombre}" class="product-img">
            </div>
            <div class="product-info-container">
                <div class="product-info">
                    <h3 class="product-title">${prod.nombre}</h3>
                    <p class="product-price">$${prod.precio.toFixed(2)}</p>
                </div>
                <div class="qr-fixed-container">
                    <img src="${urlCodificadaQR}" alt="QR de Análisis" class="qr-code-fixed">
                    <span>Ver Análisis 📊</span>
                </div>
            </div>
            <!-- 🚀 BOTÓN CAMBIADO: Nuevo texto asignado -->
            <button class="add-btn" id="btn-${prod.id}">Análisis de Costos</button>
        `;

        catalogContainer.appendChild(card);

        // Al hacer clic, redirige a la nueva página de análisis
        document.getElementById('btn-' + prod.id).addEventListener('click', function () {
            window.location.href = urlMiSistema;
        });
    });
}

// 3. Agregar productos al carrito temporal
window.agregarAlCarrito = function (id) {
    const producto = productos.find(p => p.id === id);
    carrito.push(producto);
    actualizarInterfazCarrito();
}

// 4. Actualizar la barra flotante del carrito
function actualizarInterfazCarrito() {
    if (carrito.length > 0) {
        cartBar.classList.add('active');
        cartCount.innerText = `${carrito.length} producto${carrito.length > 1 ? 's' : ''} seleccionado${carrito.length > 1 ? 's' : ''}`;
    } else {
        cartBar.classList.remove('active');
    }
}

// 5. Filtrar productos en tiempo real con el buscador
/*searchInput.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase();
    const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(texto));
    renderProducts(productosFiltrados);
});*/

// 6. Enviar el pedido formateado a WhatsApp
whatsappBtn.addEventListener('click', () => {
    let mensaje = "¡Hola! Me interesa comprar los siguientes productos:\n\n";
    let total = 0;

    // Agrupar productos para no repetir texto (opcional, aquí sumamos directo)
    carrito.forEach((prod, index) => {
        mensaje += `${index + 1}. ${prod.nombre} - $${prod.precio.toFixed(2)}\n`;
        total += prod.precio;
    });

    mensaje += `\n*Total estimado: $${total.toFixed(2)}*`;

    // Codificar el texto para la URL de WhatsApp
    const urlUrl = `https://wa.me{numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlUrl, '_blank');
});

// 🎬 Inicializar la aplicación llamando a la nueva función asíncrona
cargarProductos();
