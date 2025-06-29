import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ThemeModeComponent } from '../../../kt/layout';
// 1. Importa el LayoutService
import { LayoutService } from '../../../layout/core/layout.service';

export type ThemeModeType = 'dark' | 'light' | 'system';
const systemMode = ThemeModeComponent.getSystemMode() as 'light' | 'dark';
const themeModeSwitchHelper = (_mode: ThemeModeType) => {
  // change background image url
  const mode = _mode !== 'system' ? _mode : systemMode;
  const imageUrl =
    './assets/media/patterns/header-bg' +
    (mode === 'light' ? '.jpg' : '-dark.png');
  document.body.style.backgroundImage = `url("${imageUrl}")`;
};

const themeModeLSKey = 'kt_theme_mode_value';
const themeMenuModeLSKey = 'kt_theme_mode_menu';

const getThemeModeFromLocalStorage = (lsKey: string): ThemeModeType => {
  if (!localStorage) {
    return 'light';
  }

  const data = localStorage.getItem(lsKey);
  if (!data) {
    return 'light';
  }

  if (data === 'light') {
    return 'light';
  }

  if (data === 'dark') {
    return 'dark';
  }

  return 'system';
};

@Injectable({
  providedIn: 'root',
})
export class ThemeModeService {
  public mode: BehaviorSubject<ThemeModeType> =
    new BehaviorSubject<ThemeModeType>(
      getThemeModeFromLocalStorage(themeModeLSKey)
    );
  public menuMode: BehaviorSubject<ThemeModeType> =
    new BehaviorSubject<ThemeModeType>(
      getThemeModeFromLocalStorage(themeMenuModeLSKey)
    );

  // 2. Inyecta LayoutService en el constructor
  constructor(private layoutService: LayoutService) { }

  public updateMode(_mode: ThemeModeType) {
    const updatedMode = _mode === 'system' ? systemMode : _mode;
    this.mode.next(updatedMode);
    // themeModeSwitchHelper(updatedMode)
    if (localStorage) {
      localStorage.setItem(themeModeLSKey, updatedMode);
    }

    document.documentElement.setAttribute('data-bs-theme', updatedMode);
    ThemeModeComponent.init();

    // 3. ===== INICIO DE LA LÓGICA AÑADIDA =====
    // Obtenemos la configuración actual del layout desde el BehaviorSubject del servicio
    const currentConfig = this.layoutService.layoutConfigSubject.value;
    if (currentConfig && currentConfig.app?.sidebar?.default) {
      // Actualizamos la clase del sidebar en el objeto de configuración
      currentConfig.app.sidebar.default.class = `app-sidebar-${updatedMode}`;

      // Emitimos la configuración actualizada para que toda la app reaccione al cambio
      this.layoutService.layoutConfigSubject.next({ ...currentConfig });
    }
    // ===== FIN DE LA LÓGICA AÑADIDA =====
  }

  public updateMenuMode(_menuMode: ThemeModeType) {
    this.menuMode.next(_menuMode);
    if (localStorage) {
      localStorage.setItem(themeMenuModeLSKey, _menuMode);
    }
  }

  public init() {
    // Al llamar a updateMode aquí, nos aseguramos de que el sidebar se sincronice
    // correctamente desde la carga inicial de la aplicación.
    this.updateMode(this.mode.value);
    this.updateMenuMode(this.menuMode.value);
  }

  public switchMode(_mode: ThemeModeType) {
    // Determina el modo final (light o dark)
    const updatedMode = _mode === 'system' ? systemMode : _mode;
    // Determina el layout que corresponde al modo
    const layoutType = updatedMode === 'dark' ? 'dark-sidebar' : 'light-sidebar';

    // --- INICIO DE LA LÓGICA CORRECTA ---

    // 1. Llamamos al método público de LayoutService. Él se encargará de
    //    guardar el tipo de layout ('dark-sidebar' o 'light-sidebar')
    //    con la clave correcta en localStorage.
    this.layoutService.setBaseLayoutType(layoutType);

    // 2. Guardamos las preferencias del tema (esto ya lo hacías bien)
    if (localStorage) {
      localStorage.setItem(themeModeLSKey, updatedMode);
      localStorage.setItem(themeMenuModeLSKey, _mode);
    }

    // 3. Recargamos la página como lo hace la plantilla originalmente.
    //    Al recargar, el LayoutInitService leerá el valor que acabamos de guardar
    //    y construirá la página con el sidebar del color correcto.
    document.location.reload();

    // --- FIN DE LA LÓGICA CORRECTA ---
  }
}