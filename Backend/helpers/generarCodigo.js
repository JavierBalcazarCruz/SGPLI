// helpers/generarCodigo.js (NUEVO - para códigos de préstamos)
const generarCodigoPrestamo = () => {
    const fecha = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const aleatorio = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PRES-${fecha}-${aleatorio}`; // Ej: PRES-20241223-A4B2
}

export default generarCodigoPrestamo;