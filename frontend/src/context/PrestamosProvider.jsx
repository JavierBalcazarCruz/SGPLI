// En: frontend/src/context/PrestamosProvider.jsx
import { useState, useEffect, createContext } from 'react';
import useAuth from '../hooks/useAuth';
import clienteAxios from '../config/axios';
import Swal from 'sweetalert2';

const PrestamosContext = createContext();

const PrestamosProvider = ({ children }) => {
    const { auth } = useAuth();
    const [prestamos, setPrestamos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [estadisticas, setEstadisticas] = useState({});
    const [prestamoActual, setPrestamoActual] = useState(null);

    // Obtener token para las peticiones
    const getConfig = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('lab_token')}`
        }
    });

    // Obtener todos los préstamos con filtros
    const obtenerPrestamos = async (filtros = {}) => {
        try {
            setCargando(true);
            const params = new URLSearchParams(filtros).toString();
            const url = params ? `/prestamos?${params}` : '/prestamos';
            
            const { data } = await clienteAxios.get(url, getConfig());
            setPrestamos(data.prestamos || []);
            return data;
        } catch (error) {
            console.error('Error al obtener préstamos:', error);
            mostrarError('Error al cargar préstamos');
            return { prestamos: [], paginacion: {} };
        } finally {
            setCargando(false);
        }
    };

    // Obtener usuarios disponibles para préstamos
    const obtenerUsuarios = async () => {
        try {
            const { data } = await clienteAxios.get('/auth/usuarios', getConfig());
            setUsuarios(data.filter(usuario => usuario.activo === 1));
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
        }
    };

    // Obtener estadísticas de préstamos
    const obtenerEstadisticasPrestamos = async () => {
        try {
            const { data } = await clienteAxios.get('/prestamos/estadisticas', getConfig());
            setEstadisticas(data);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
        }
    };

    // Nueva función para imprimir el voucher
    const imprimirVoucher = (prestamo, codigoVoucher) => {
        // Obtener datos del usuario de la sesión
        const usuarioEncargado = auth?.nombre || 'Sistema';
        
        // Crear el contenido HTML para imprimir - OPTIMIZADO PARA UNA PÁGINA
        const contenidoImpresion = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Voucher de Préstamo - ${codigoVoucher}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 15px;
                        line-height: 1.3;
                        font-size: 13px;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #0d6efd;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                    }
                    .header h1 {
                        margin: 0 0 5px 0;
                        font-size: 18px;
                    }
                    .header h2 {
                        margin: 0 0 5px 0;
                        font-size: 14px;
                    }
                    .voucher-code {
                        background: #f8f9fa;
                        border: 2px dashed #0d6efd;
                        padding: 10px;
                        text-align: center;
                        margin: 15px 0;
                        border-radius: 5px;
                    }
                    .voucher-code h2 {
                        margin: 0;
                        font-size: 20px;
                        color: #0d6efd;
                    }
                    .info-section {
                        margin: 15px 0;
                        padding: 10px;
                        background: #f8f9fa;
                        border-radius: 5px;
                    }
                    .info-section h3 {
                        margin: 0 0 10px 0;
                        font-size: 14px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 5px;
                        margin-bottom: 10px;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 3px 0;
                        font-size: 12px;
                    }
                    .info-row-full {
                        grid-column: 1 / -1;
                    }
                    .label {
                        font-weight: bold;
                        color: #495057;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                        font-size: 12px;
                    }
                    .items-table th,
                    .items-table td {
                        border: 1px solid #dee2e6;
                        padding: 4px 6px;
                        text-align: left;
                    }
                    .items-table th {
                        background: #e9ecef;
                        font-weight: bold;
                        font-size: 11px;
                    }
                    .footer {
                        margin-top: 15px;
                        padding-top: 10px;
                        border-top: 1px solid #dee2e6;
                        text-align: center;
                        font-size: 10px;
                        color: #6c757d;
                    }
                    .footer p {
                        margin: 3px 0;
                    }
                    .footer hr {
                        margin: 8px 0;
                    }
                    @media print {
                        body { 
                            margin: 0; 
                            padding: 10px;
                            font-size: 12px;
                        }
                        .no-print { display: none; }
                        @page {
                            margin: 0.5in;
                            size: A4;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🔧 Sistema de Gestión de Préstamos</h1>
                    <h2>Laboratorio de Informática</h2>
                    <p style="margin: 5px 0; font-weight: bold;">VOUCHER DE PRÉSTAMO</p>
                </div>

                <div class="voucher-code">
                    <h2>📋 ${codigoVoucher}</h2>
                    <p style="margin: 5px 0; font-size: 11px;">Código de Voucher</p>
                </div>

                <div class="info-section">
                    <h3>📋 Información del Préstamo</h3>
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="label">Fecha:</span>
                            <span>${new Date().toLocaleDateString('es-ES')}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Hora:</span>
                            <span>${new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</span>
                        </div>
                        <div class="info-row info-row-full">
                            <span class="label">Usuario Prestador:</span>
                            <span><strong>${prestamo.usuario_prestador_nombre || 'N/A'}</strong></span>
                        </div>
                        <div class="info-row info-row-full">
                            <span class="label">Email:</span>
                            <span>${prestamo.usuario_prestador_email || 'N/A'}</span>
                        </div>
                        <div class="info-row info-row-full">
                            <span class="label">Encargado que Autoriza:</span>
                            <span><strong>${usuarioEncargado}</strong></span>
                        </div>
                        ${prestamo.fecha_devolucion_estimada ? `
                        <div class="info-row info-row-full">
                            <span class="label">Fecha Estimada de Devolución:</span>
                            <span>${new Date(prestamo.fecha_devolucion_estimada).toLocaleDateString('es-ES')}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="info-section">
                    <h3>🔨 Items Prestados</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="width: 80px;">Cantidad</th>
                                <th style="width: 80px;">Condición</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${prestamo.items?.map(item => `
                                <tr>
                                    <td>${item.item_nombre || 'Sin nombre'}</td>
                                    <td style="text-align: center;">${item.cantidad || 0}</td>
                                    <td>${item.condicion_prestamo || 'N/A'}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3">No hay items registrados</td></tr>'}
                        </tbody>
                    </table>
                </div>

                ${prestamo.observaciones ? `
                <div class="info-section">
                    <h3>📝 Observaciones</h3>
                    <p style="margin: 5px 0; font-size: 12px;">${prestamo.observaciones}</p>
                </div>
                ` : ''}

                <div class="footer">
                    <p><strong>⚠️ IMPORTANTE:</strong> Conserve este voucher para la devolución</p>
                    <p>Código: <strong>${codigoVoucher}</strong></p>
                    <hr>
                    <p>Sistema desarrollado por <strong>Lic. Javier Bálcazar Cruz</strong></p>
                    <p>© 2025 • Laboratorio de Informática • Impreso: ${new Date().toLocaleString('es-ES')}</p>
                </div>
            </body>
            </html>
        `;

        // Abrir ventana de impresión
        const ventanaImpresion = window.open('', '_blank', 'width=800,height=900');
        ventanaImpresion.document.write(contenidoImpresion);
        ventanaImpresion.document.close();
        
        // Esperar un poco y luego abrir el diálogo de impresión
        setTimeout(() => {
            ventanaImpresion.focus();
            ventanaImpresion.print();
            
            // Cerrar la ventana después de imprimir (opcional)
            ventanaImpresion.onafterprint = () => {
                ventanaImpresion.close();
            };
        }, 500);
    };

    // Crear nuevo préstamo - MODIFICADO CON BOTÓN DE IMPRIMIR
    const crearPrestamo = async (prestamoData) => {
        try {
            const { data } = await clienteAxios.post('/prestamos', prestamoData, getConfig());
            
            // Agregar al estado local
            setPrestamos(prevPrestamos => [data.prestamo, ...prevPrestamos]);
            
            // Mostrar voucher con botón de imprimir
            const result = await Swal.fire({
                title: '¡Préstamo Creado!',
                html: `
                    <div class="text-center">
                        <p class="mb-3">El préstamo se ha registrado exitosamente</p>
                        <div class="card bg-light p-3 mb-3">
                            <h4 class="text-primary mb-0">
                                <i class="bi bi-ticket-perforated me-2"></i>
                                ${data.voucher_codigo}
                            </h4>
                            <small class="text-muted">Código de voucher</small>
                        </div>
                        <p class="mt-3 text-muted">
                            <small>Guarda este código para futuras consultas</small>
                        </p>
                    </div>
                `,
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Entendido',
                cancelButtonText: '🖨️ Imprimir Voucher',
                confirmButtonColor: '#0d6efd',
                cancelButtonColor: '#28a745',
                reverseButtons: true // Esto pone "Imprimir" a la izquierda
            });

            // Si presionó "Imprimir Voucher"
            if (result.dismiss === Swal.DismissReason.cancel) {
                imprimirVoucher(data.prestamo, data.voucher_codigo);
            }
            
            return { success: true, prestamo: data.prestamo, codigo: data.voucher_codigo };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al crear préstamo';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Buscar préstamo por código (voucher)
    const buscarPrestamoPorCodigo = async (codigo) => {
        try {
            setCargando(true);
            const { data } = await clienteAxios.get(`/prestamos/voucher/${codigo}`, getConfig());
            setPrestamoActual(data.prestamo);
            return { success: true, prestamo: data.prestamo };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Préstamo no encontrado';
            mostrarError(mensaje);
            setPrestamoActual(null);
            return { success: false, error: mensaje };
        } finally {
            setCargando(false);
        }
    };

    // Devolver items de un préstamo
    const devolverItems = async (codigo, itemsDevueltos, observaciones = '') => {
        try {
            const { data } = await clienteAxios.put(
                `/prestamos/${codigo}/devolver`,
                {
                    items_devueltos: itemsDevueltos,
                    observaciones
                },
                getConfig()
            );

            // Actualizar préstamo actual si es el mismo
            if (prestamoActual && prestamoActual.codigo === codigo) {
                setPrestamoActual(data.prestamo);
            }

            // Actualizar en la lista de préstamos
            setPrestamos(prevPrestamos => 
                prevPrestamos.map(prestamo => 
                    prestamo.codigo === codigo ? data.prestamo : prestamo
                )
            );

            mostrarExito(`${data.items_devueltos.length} item(s) devuelto(s) correctamente`);
            return { success: true, prestamo: data.prestamo };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al devolver items';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Obtener préstamos del usuario actual (para encargados)
    const obtenerMisPrestamos = async () => {
        try {
            const { data } = await clienteAxios.get('/prestamos?mi_usuario=true', getConfig());
            return data.prestamos || [];
        } catch (error) {
            console.error('Error al obtener mis préstamos:', error);
            return [];
        }
    };

    // Buscar usuarios por nombre/email (para el buscador)
    const buscarUsuarios = async (termino) => {
        try {
            if (!termino || termino.length < 2) return [];
            
            const usuarios = await obtenerUsuarios();
            return usuarios.filter(usuario => 
                usuario.nombre.toLowerCase().includes(termino.toLowerCase()) ||
                usuario.email.toLowerCase().includes(termino.toLowerCase())
            );
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            return [];
        }
    };

    // Utilidades para alertas
    const mostrarExito = (mensaje) => {
        Swal.fire({
            title: '¡Éxito!',
            text: mensaje,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const mostrarError = (mensaje) => {
        Swal.fire({
            title: 'Error',
            text: mensaje,
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#dc3545'
        });
    };

    const mostrarConfirmacion = async (titulo, texto) => {
        const result = await Swal.fire({
            title: titulo,
            text: texto,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });

        return result.isConfirmed;
    };

    // Limpiar préstamo actual
    const limpiarPrestamoActual = () => {
        setPrestamoActual(null);
    };

    // Cargar datos solo cuando el usuario esté autenticado
    useEffect(() => {
        const cargarDatos = async () => {
            if (auth?.id) {
                await Promise.all([
                    obtenerPrestamos(),
                    obtenerUsuarios(),
                    obtenerEstadisticasPrestamos()
                ]);
            } else {
                // Si no hay usuario, limpiar estados
                setPrestamos([]);
                setUsuarios([]);
                setEstadisticas({});
                setCargando(false);
            }
        };
        
        cargarDatos();
    }, [auth?.id]);

    return (
        <PrestamosContext.Provider value={{
            // Estado
            prestamos,
            usuarios,
            estadisticas,
            cargando,
            prestamoActual,
            
            // Funciones principales
            obtenerPrestamos,
            crearPrestamo,
            buscarPrestamoPorCodigo,
            devolverItems,
            
            // Funciones auxiliares
            obtenerUsuarios,
            obtenerEstadisticasPrestamos,
            obtenerMisPrestamos,
            buscarUsuarios,
            limpiarPrestamoActual,
            imprimirVoucher, // ← NUEVA FUNCIÓN EXPORTADA
            
            // Utilidades
            mostrarExito,
            mostrarError,
            mostrarConfirmacion
        }}>
            {children}
        </PrestamosContext.Provider>
    );
};

export { PrestamosProvider };
export default PrestamosContext;