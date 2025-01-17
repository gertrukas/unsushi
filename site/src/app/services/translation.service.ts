// src/app/translation.service.ts

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {

  constructor(private translate: TranslateService) {
    // Establecer el idioma por defecto
    this.translate.setDefaultLang('es');
    this.translate.use('es'); // Cambia a 'es' si prefieres español como idioma por defecto
  }

  // Método para cambiar el idioma
  setLanguage(language: string): void {
    this.translate.use(language);
  }

  // Obtener el idioma actual
  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.getDefaultLang();
  }

  // Método para obtener la traducción directamente desde el servicio
  getTranslation(key: string): string {
    let translation = '';
    this.translate.get(key).subscribe((res: string) => {
      translation = res;
    });
    return translation;
  }
}

