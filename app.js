// 1. Seleccionar elementos del DOM
const mangaForm = document.getElementById('manga-form');
const tituloInput = document.getElementById('titulo');
const estadoSelect = document.getElementById('estado');
const capituloInput = document.getElementById('capitulo');
const mangasContenedor = document.getElementById('mangas-contenedor');

// 2. Cargar mangas desde localStorage al iniciar
let misMangas = JSON.parse(localStorage.getItem('mangas')) || [];

// 3. Función para pintar los mangas en el HTML
function renderizarMangas() {
    mangasContenedor.innerHTML = '';

    if (misMangas.length === 0) {
        mangasContenedor.innerHTML = '<p>Aún no has agregado mangas a tu lista.</p>';
        return;
    }

    misMangas.forEach((manga) => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('manga-card', manga.estado);

        tarjeta.innerHTML = `
            <h3>${manga.titulo}</h3>
            <p>Estado: <strong>${manga.estado}</strong></p>
            
            <div class="control-capitulos">
                <button class="btn-cap" onclick="cambiarCapitulo(${manga.id}, -1)">-</button>
                <span>Cap: ${manga.capitulo}</span>
                <button class="btn-cap" onclick="cambiarCapitulo(${manga.id}, 1)">+</button>
            </div>

            <button class="btn-eliminar" onclick="eliminarManga(${manga.id})">Eliminar</button>
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
        capitulo: parseInt(capituloInput.value) || 0
    };

    misMangas.push(nuevoManga);
    guardarEnLocalStorage();
    
    mangaForm.reset();
    capituloInput.value = 0; // Reinicia el input de capítulo a 0
    renderizarMangas();
});

// 5. Función para aumentar o disminuir capítulos
function cambiarCapitulo(id, cambio) {
    misMangas = misMangas.map(manga => {
        if (manga.id === id) {
            let nuevoCapitulo = manga.capitulo + cambio;
            if (nuevoCapitulo < 0) nuevoCapitulo = 0; // Evita capítulos negativos
            
            return { ...manga, capitulo: nuevoCapitulo };
        }
        return manga;
    });

    guardarEnLocalStorage();
    renderizarMangas();
}

// 6. Función para eliminar un manga
function eliminarManga(id) {
    misMangas = misMangas.filter(manga => manga.id !== id);
    guardarEnLocalStorage();
    renderizarMangas();
}

// Función auxiliar para actualizar LocalStorage
function guardarEnLocalStorage() {
    localStorage.setItem('mangas', JSON.stringify(misMangas));
}

// 7. Ejecutar al iniciar la página
renderizarMangas();