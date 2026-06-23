// 1. Seleccionar elementos del DOM
const mangaForm = document.getElementById('manga-form');
const tituloInput = document.getElementById('titulo');
const estadoSelect = document.getElementById('estado');
const capituloInput = document.getElementById('capitulo');
const portadaInput = document.getElementById('portada');
const urlMangaInput = document.getElementById('url-manga'); // <-- NUEVO
const puntuacionSelect = document.getElementById('puntuacion');
const mangasContenedor = document.getElementById('mangas-contenedor');

// Elementos de filtrado y tema
const buscador = document.getElementById('buscador');
const filtroEstado = document.getElementById('filtro-estado');
const btnTema = document.getElementById('btn-tema');

// Imagen por defecto por si el usuario no pone una URL válida
const IMAGEN_DEFECTO = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop';

// 2. Cargar mangas y tema desde localStorage
let misMangas = JSON.parse(localStorage.getItem('mangas')) || [];
let temaActual = localStorage.getItem('tema') || 'light';

// Aplicar tema inicial
document.documentElement.setAttribute('data-theme', temaActual);
actualizarTextoBotonTema();

// 3. Función para pintar los mangas filtrados/buscados
function renderizarMangas() {
    mangasContenedor.innerHTML = '';

    // Obtener valores de búsqueda y filtrado
    const textoBusqueda = buscador.value.toLowerCase().trim();
    const estadoFiltrado = filtroEstado.value;

    // Filtrar arreglo original sin destruirlo
    const mangasFiltrados = misMangas.filter(manga => {
        const coincideTitulo = manga.titulo.toLowerCase().includes(textoBusqueda);
        const coincideEstado = estadoFiltrado === 'todos' || manga.estado === estadoFiltrado;
        return coincideTitulo && coincideEstado;
    });

    if (mangasFiltrados.length === 0) {
        mangasContenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No se encontraron mangas.</p>';
        return;
    }

    mangasFiltrados.forEach((manga) => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('manga-card', manga.estado);

        // Generar las estrellas visuales
        const estrellasVisuales = '⭐'.repeat(manga.puntuacion) + '☆'.repeat(5 - manga.puntuacion);

        // NUEVO: Validar si el manga tiene URL para inyectar el botón interactivo
        const botonLeer = manga.urlManga 
            ? `<a href="${manga.urlManga}" target="_blank" class="btn-leer" onclick="asistirLectura(${manga.id})">🌐 Ir a Leer</a>` 
            : '';

        tarjeta.innerHTML = `
            <img src="${manga.portada || IMAGEN_DEFECTO}" alt="Portada de ${manga.titulo}" class="manga-portada" onerror="this.src='${IMAGEN_DEFECTO}'">
            <div class="manga-info">
                <h3>${manga.titulo}</h3>
                <span class="estrellas">${estrellasVisuales}</span>
                
                ${botonLeer}

                <select class="select-cambiar-estado" onchange="actualizarEstadoManga(${manga.id}, this.value)">
                    <option value="leyendo" ${manga.estado === 'leyendo' ? 'selected' : ''}>📖 Leyendo</option>
                    <option value="pendiente" ${manga.estado === 'pendiente' ? 'selected' : ''}>⏳ Por Leer</option>
                    <option value="abandonado" ${manga.estado === 'abandonado' ? 'selected' : ''}>❌ Abandonado</option>
                </select>

                <div class="control-capitulos">
                    <button class="btn-cap" onclick="cambiarCapitulo(${manga.id}, -1)">-</button>
                    <span>Cap: ${manga.capitulo}</span>
                    <button class="btn-cap" onclick="cambiarCapitulo(${manga.id}, 1)">+</button>
                </div>

                <button class="btn-eliminar" onclick="eliminarManga(${manga.id}, '${manga.titulo}')">Eliminar</button>
            </div>
        `;

        mangasContenedor.appendChild(tarjeta);
    });
}

// 4. Función para agregar un nuevo manga
mangaForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nuevoManga = {
        id: Date.now(),
        titulo: tituloInput.value.trim(),
        estado: estadoSelect.value,
        capitulo: parseInt(capituloInput.value) || 0,
        portada: portadaInput.value.trim(),
        urlManga: urlMangaInput.value.trim(), // <-- NUEVO: Guardamos la URL
        puntuacion: parseInt(puntuacionSelect.value) || 0
    };

    misMangas.push(nuevoManga);
    guardarEnLocalStorage();
    
    mangaForm.reset();
    capituloInput.value = 0; 
    renderizarMangas();
});

// 5. Aumentar o disminuir capítulos
function cambiarCapitulo(id, cambio) {
    misMangas = misMangas.map(manga => {
        if (manga.id === id) {
            let nuevoCapitulo = manga.capitulo + cambio;
            if (nuevoCapitulo < 0) nuevoCapitulo = 0; 
            return { ...manga, capitulo: nuevoCapitulo };
        }
        return manga;
    });

    guardarEnLocalStorage();
    renderizarMangas();
}

// 6. Cambiar estado dinámicamente desde la tarjeta
function actualizarEstadoManga(id, nuevoEstado) {
    misMangas = misMangas.map(manga => {
        if (manga.id === id) {
            return { ...manga, estado: nuevoEstado };
        }
        return manga;
    });
    guardarEnLocalStorage();
    renderizarMangas();
}

// 7. Eliminar manga con confirmación nativa
function eliminarManga(id, titulo) {
    const seguro = confirm(`¿Estás seguro de que deseas eliminar "${titulo}" de tu lista?`);
    if (seguro) {
        misMangas = misMangas.filter(manga => manga.id !== id);
        guardarEnLocalStorage();
        renderizarMangas();
    }
}

// NUEVA FUNCIÓN: Suma automáticamente +1 capítulo al hacer clic en "Ir a Leer"
function asistirLectura(id) {
    misMangas = misMangas.map(manga => {
        if (manga.id === id) {
            return { ...manga, capitulo: manga.capitulo + 1 };
        }
        return manga;
    });
    guardarEnLocalStorage();
    
    // Un leve delay para asegurar la fluidez visual mientras abre la pestaña externa
    setTimeout(() => {
        renderizarMangas();
    }, 1000);
}

// 8. Lógica del Modo Oscuro
btnTema.addEventListener('click', () => {
    temaActual = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', temaActual);
    localStorage.setItem('tema', temaActual);
    actualizarTextoBotonTema();
});

function actualizarTextoBotonTema() {
    btnTema.textContent = temaActual === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
}

// 9. Eventos para Escuchar la Búsqueda y Filtrado en tiempo real
buscador.addEventListener('input', renderizarMangas);
filtroEstado.addEventListener('change', renderizarMangas);

// Auxiliar: Guardar LocalStorage
function guardarEnLocalStorage() {
    localStorage.setItem('mangas', JSON.stringify(misMangas));
}

// Ejecución Inicial
renderizarMangas();