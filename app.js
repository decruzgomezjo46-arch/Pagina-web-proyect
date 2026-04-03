// app.js

let recuerdos = JSON.parse(localStorage.getItem('amorRecuerdos')) || [];
let editandoId = null;

// Evento de Carga Inicial
document.addEventListener('DOMContentLoaded', () => {
    renderRecuerdos();
    setupForm();
});

// Manejo de Pestañas
function switchTab(tabId) {
    // Esconder todas las pestañas
    document.querySelectorAll('.tab-pane').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Quitar "active" de la barra de navegación
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    // Marcar el enlace en el navbar como activo (ignorando el botón modal)
    const activeLink = document.querySelector(`.nav-links a[onclick="switchTab('${tabId}')"]`);
    if(activeLink) activeLink.classList.add('active');
}

// Modal Logic
function openModal() {
    document.getElementById('uploadModal').style.display = 'block';
    // Por defecto limpiar el form
    document.getElementById('uploadForm').reset();
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imagePreviewImg').src = '';
    currentPhotoBase64 = null;
    editandoId = null;
    document.querySelector('.modal-title').innerText = 'Guardar un Nuevo Recuerdo';
    toggleFormFields();
}

function editarRecuerdo(id) {
    const recuerdo = recuerdos.find(r => r.id === id);
    if (!recuerdo) return;
    
    editandoId = id;
    document.getElementById('uploadModal').style.display = 'block';
    document.querySelector('.modal-title').innerText = 'Editar Recuerdo';
    
    document.getElementById('tipoRecuerdo').value = recuerdo.tipo;
    document.getElementById('titulo').value = recuerdo.titulo || '';
    document.getElementById('fecha').value = recuerdo.fecha || '';
    document.getElementById('descripcion').value = recuerdo.descripcion || '';
    
    currentPhotoBase64 = recuerdo.foto;
    if (currentPhotoBase64) {
        document.getElementById('imagePreviewImg').src = currentPhotoBase64;
        document.getElementById('imagePreviewContainer').style.display = 'block';
    } else {
        document.getElementById('imagePreviewContainer').style.display = 'none';
        document.getElementById('imagePreviewImg').src = '';
    }
    
    toggleFormFields();
}

function eliminarRecuerdo(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este recuerdo para siempre?")) {
        recuerdos = recuerdos.filter(r => r.id !== id);
        try {
            localStorage.setItem('amorRecuerdos', JSON.stringify(recuerdos));
            renderRecuerdos();
        } catch (error) {
            console.error("Error al eliminar", error);
        }
    }
}

function closeModal() {
    document.getElementById('uploadModal').style.display = 'none';
}

// Cerrar modal al hacer clic afuera
window.onclick = function(event) {
    const modal = document.getElementById('uploadModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Dinámica del Formulario
function toggleFormFields() {
    const tipo = document.getElementById('tipoRecuerdo').value;
    
    const titulo = document.getElementById('group-titulo');
    const fecha = document.getElementById('group-fecha');
    const descripcion = document.getElementById('group-descripcion');
    const foto = document.getElementById('group-foto');
    
    // Reset requirements
    document.getElementById('titulo').required = false;
    document.getElementById('fecha').required = false;
    document.getElementById('descripcion').required = false;
    
    if (tipo === 'ambos') {
        titulo.style.display = 'block'; document.getElementById('titulo').required = true;
        fecha.style.display = 'block'; document.getElementById('fecha').required = true;
        descripcion.style.display = 'block'; document.getElementById('descripcion').required = true;
        foto.style.display = 'block';
    } else if (tipo === 'historia') {
        titulo.style.display = 'block'; document.getElementById('titulo').required = true;
        fecha.style.display = 'block'; document.getElementById('fecha').required = true;
        descripcion.style.display = 'block'; document.getElementById('descripcion').required = true;
        foto.style.display = 'none';
    } else if (tipo === 'foto') {
        titulo.style.display = 'block'; document.getElementById('titulo').required = true;
        fecha.style.display = 'block'; document.getElementById('fecha').required = true;
        descripcion.style.display = 'none';
        foto.style.display = 'block';
    }
}

// Previsualización y Carga de Imagen
let currentPhotoBase64 = null;

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        // Chequeo básico de seguridad (solo imágenes)
        if (!file.type.startsWith('image/')) {
            alert("Por favor selecciona una imagen.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            currentPhotoBase64 = e.target.result;
            const preview = document.getElementById('imagePreviewImg');
            preview.src = currentPhotoBase64;
            document.getElementById('imagePreviewContainer').style.display = 'block';
        }
        
        // Comprimir/Escalar un poco para no llenar el localStorage
        // Si el archivo es grande se sugeriría un canvas resize, pero por ahora lo leemos directo.
        reader.readAsDataURL(file);
    }
}

// Configuración del Submit del Formulario
function setupForm() {
    const form = document.getElementById('uploadForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const tipo = document.getElementById('tipoRecuerdo').value;
        const titulo = document.getElementById('titulo').value;
        const fecha = document.getElementById('fecha').value;
        const descripcion = document.getElementById('descripcion').value;
        
        // Validación de foto
        if ((tipo === 'ambos' || tipo === 'foto') && !currentPhotoBase64) {
            alert('Por favor selecciona una fotografía.');
            return;
        }
        
        // Guardar y renderizar
        if (editandoId) {
            // Actualizar existente
            const index = recuerdos.findIndex(r => r.id === editandoId);
            if (index !== -1) {
                recuerdos[index] = {
                    ...recuerdos[index],
                    tipo: tipo,
                    titulo: titulo,
                    fecha: fecha,
                    descripcion: descripcion,
                    foto: currentPhotoBase64
                };
            }
        } else {
            // Nuevo recuerdo
            const nuevoRecuerdo = {
                id: Date.now().toString(),
                tipo: tipo,
                titulo: titulo,
                fecha: fecha,
                descripcion: descripcion,
                foto: currentPhotoBase64
            };
            recuerdos.push(nuevoRecuerdo);
        }
        // Ordenar por fecha cronológica (mas antiguos primero, o más recientes primero)
        recuerdos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        try {
            localStorage.setItem('amorRecuerdos', JSON.stringify(recuerdos));
            renderRecuerdos();
            closeModal();
            
            // Navegar a la pestaña correcta
            if (tipo === 'foto') switchTab('galeria');
            else switchTab('historia');
            
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                alert('El espacio de memoria del navegador está lleno (las fotos son muy pesadas).');
            } else {
                console.error("Error al guardar", error);
            }
        }
    });
}

// Renderizado de Datos
function renderRecuerdos() {
    const timelineContainer = document.getElementById('timeline-container');
    const emptyTimeline = document.getElementById('empty-timeline');
    const galleryContainer = document.getElementById('gallery-container');
    
    // Limpiar contenedores
    document.querySelectorAll('.timeline-item').forEach(item => item.remove());
    galleryContainer.innerHTML = '';
    
    if (recuerdos.length === 0) {
        emptyTimeline.style.display = 'block';
        // Añadir empty state a galeria
        galleryContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 50px; color: var(--text-muted);">Aún no hay fotos en su galería.</div>';
        return;
    }
    
    emptyTimeline.style.display = 'none';
    
    let isLeft = true;
    recuerdos.forEach((recuerdo) => {
        // Render Timeline
        if (recuerdo.tipo === 'ambos' || recuerdo.tipo === 'historia') {
            const dateObj = new Date(recuerdo.fecha + 'T00:00:00'); // Evita timezone offset
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const fechaFormateada = dateObj.toLocaleDateString('es-ES', options);

            const div = document.createElement('div');
            div.className = `timeline-item ${isLeft ? 'left' : 'right'}`;
            
            let imgHTML = '';
            if (recuerdo.foto) {
                imgHTML = `<img src="${recuerdo.foto}" alt="${recuerdo.titulo}" loading="lazy">`;
            }
            
            div.innerHTML = `
                <div class="timeline-card">
                    <div class="card-actions">
                        <button class="action-btn" onclick="editarRecuerdo('${recuerdo.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn delete" onclick="eliminarRecuerdo('${recuerdo.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <span class="timeline-date">${fechaFormateada}</span>
                    <h3 class="timeline-title">${recuerdo.titulo}</h3>
                    <p class="timeline-content">${recuerdo.descripcion}</p>
                    ${imgHTML}
                </div>
            `;
            timelineContainer.appendChild(div);
            isLeft = !isLeft; // Alternar lado
        }
        
        // Render Gallery
        if (recuerdo.tipo === 'ambos' || recuerdo.tipo === 'foto') {
            if (recuerdo.foto) {
                const dateObj = new Date(recuerdo.fecha + 'T00:00:00'); 
                const anio = dateObj.getFullYear();
                
                const div = document.createElement('div');
                div.className = 'gallery-item';
                div.innerHTML = `
                    <img src="${recuerdo.foto}" alt="${recuerdo.titulo}" loading="lazy">
                    <div class="gallery-caption">
                        <h4>${recuerdo.titulo}</h4>
                        <p>${anio}</p>
                        <div class="gallery-actions">
                            <button class="action-btn btn-small" onclick="editarRecuerdo('${recuerdo.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                            <button class="action-btn btn-small delete" onclick="eliminarRecuerdo('${recuerdo.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `;
                galleryContainer.appendChild(div);
            }
        }
    });
}
