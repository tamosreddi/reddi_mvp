// Helper para convertir fechas UTC a zona horaria local
export const formatToLocalTime = (dateString: string, timeZone: string = "America/Chicago") => {
    return new Date(dateString).toLocaleString("es-MX", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
};