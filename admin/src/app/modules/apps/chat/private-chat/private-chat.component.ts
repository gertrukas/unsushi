import { ChangeDetectorRef, Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { UserService } from "../../../../_fake/services/user-service";
import { environment } from "../../../../../environments/environment";
import { ChatInnerComponent } from "../../../../_metronic/partials/content/chat-inner/chat-inner.component";
import { AuthService, UserType } from "../../../auth";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.scss'],
})
export class PrivateChatComponent implements OnInit {

  @HostBinding('class') class = 'd-flex flex-column flex-lg-row';
  @ViewChild(ChatInnerComponent) chatInner!: ChatInnerComponent;

  userCount: number;
  isLoading: boolean = true;
  url = environment.apiUrl;
  user$: Subscription;
  user: UserType;
  userOnline:any[] = [];
  userInfos:any[] = [];
  userReceiving: any;

  constructor(private service: UserService, private cdr: ChangeDetectorRef, private auth: AuthService) {
    this.user$ = this.auth.currentUserSubject.subscribe(user => {
      this.user = user;
      this.userReceiving = user;
    });
  }

  isConexion(id: string): boolean {
    return this.userOnline.some(item => item._id === id);
  }

  setHors(dateInput: Date | string | undefined | null): string {
    // Asegúrate de que `dateInput` sea una instancia de Date válida
    let date: Date;

    // Si `dateInput` es una cadena o algo que no sea Date, intenta convertirlo
    if (typeof dateInput === 'string' || !(dateInput instanceof Date)) {
      //@ts-ignore
      date = new Date(dateInput);
    } else if(dateInput === null) {
      return "Sin conexión";
    } else {
      date = dateInput;
    }

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return "Sin conexión";
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime(); // Diferencia en milisegundos

    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays >= 1) {
      // Si es mayor o igual a un día, retorna la fecha en formato dd/mm/yyyy
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    } else if (diffHours >= 1) {
      // Si es mayor o igual a una hora, retorna la diferencia en horas
      return diffHours === 1 ? `${diffHours} hora` : `${diffHours} horas`;
    } else if (diffMinutes === 0) {
      return `Ahora`;
    } else {
      // Si es menos de una hora, retorna la diferencia en minutos
      return diffMinutes === 1 ? `${diffMinutes} minuto` : `${diffMinutes} minutos`;
    }
  }

  random(){
    const colorClasses: string[] = ['success', 'info', 'warning', 'danger'];
    return colorClasses[Math.floor(Math.random() * colorClasses.length)];
  }

  setUser(id: string) {
    this.userReceiving = this.userInfos.find(user => user._id === id);
    // Asegúrate de que chatInner esté inicializado
    if (this.chatInner) {
      this.chatInner.chatPrivate(this.userReceiving);
    } else {
      console.error("chatInner no está inicializado");
    }
  }

  getActive(id: string){
    if(this.userOnline.find(user => user._id ===id)){
      return true;
    }
    return false;
  }

  ngOnInit(): void {
    this.service.getUsers().subscribe(response => {
      response.data.forEach(user => {
        this.userInfos.push(user);
      });
    }, (error) => {
      console.error('Error fetching user info:', error);
      this.isLoading = false;
      this.cdr.detectChanges();
    });
    this.service.getUsersLine().subscribe(response => {
      this.userOnline = response.users;
      this.userCount = response.count;
      this.isLoading = false;
      this.cdr.detectChanges();
    }, (error) => {
      console.error('Error fetching user info:', error);
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  // ngAfterViewInit() {
  //   if (this.chatInner) {
  //     // Llama a setUser con el id apropiado
  //     if (this.userReceiving) {
  //       this.setUser(this.userReceiving._id);
  //     }
  //   }
  // }
}
