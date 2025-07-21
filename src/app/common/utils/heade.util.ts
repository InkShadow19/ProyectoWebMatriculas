import { HttpHeaders } from "@angular/common/http";

/**
 * Construye los encabezados HTTP para las peticiones a la API.
 * Busca el usuario actual en el localStorage y, si encuentra un token,
 * lo añade a la cabecera 'Authorization'.
 *
 * @returns Un objeto HttpHeaders con 'Content-Type' y, opcionalmente, 'Authorization'.
 */
export function buildHeader(): HttpHeaders {
  // Siempre empezamos con el Content-Type
  let headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  // Intentamos obtener los datos del usuario desde el localStorage
  const userString = localStorage.getItem('currentUser');

  if (userString) {
    try {
      const user = JSON.parse(userString);
      
      // Si el objeto de usuario existe y tiene una propiedad 'token', la añadimos
      if (user && user.token) {
        headers = headers.set('Authorization', `Bearer ${user.token}`);
      }
    } catch (e) {
      console.error('Error al parsear el usuario desde localStorage', e);
    }
  }

  return headers;
}