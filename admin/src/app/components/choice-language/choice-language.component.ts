import { Component, EventEmitter, HostBinding, Output } from '@angular/core';
import { TranslationService } from '../../modules/i18n';

@Component({
  selector: 'app-choice-language',
  templateUrl: './choice-language.component.html',
  styleUrl: './choice-language.component.scss'
})
export class ChoiceLanguageComponent {

  @Output() setLanguageEmit = new EventEmitter<string>();
  @HostBinding('class')
  class = `menu menu-column menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  language: LanguageFlag;
  langs = languages;
  show = false;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.setLanguage(this.translationService.getSelectedLanguage());
  }

  selectLanguage(lang: string) {
    this.translationService.setLanguage(lang);
    this.setLanguage(lang);
    this.setLanguageEmit.emit(lang);
    // document.location.reload();
  }

  setLanguage(lang: string) {
    this.langs.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
        this.language = language;
      } else {
        language.active = false;
      }
    });
  }

  

}

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  active?: boolean;
}

const languages = [
  {
    lang: 'en',
    name: 'Ingles',
    flag: './assets/media/flags/united-states.svg',
  },
  // {
  //   lang: 'zh',
  //   name: 'Mandarin',
  //   flag: './assets/media/flags/china.svg',
  // },
  {
    lang: 'es',
    name: 'Español',
    flag: './assets/media/flags/mexico.svg',
  },
  // {
  //   lang: 'ja',
  //   name: 'Japanes',
  //   flag: './assets/media/flags/japan.svg',
  // },
  // {
  //   lang: 'de',
  //   name: 'Aleman',
  //   flag: './assets/media/flags/germany.svg',
  // },
  // {
  //   lang: 'fr',
  //   name: 'Frances',
  //   flag: './assets/media/flags/france.svg',
  // },
];
