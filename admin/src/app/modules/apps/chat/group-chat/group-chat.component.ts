import { ChangeDetectorRef, Component, HostBinding, OnInit } from '@angular/core';
import { UserService } from "../../../../_fake/services/user-service";
import { environment } from "../../../../../environments/environment";

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss'],
})
export class GroupChatComponent implements OnInit {
  @HostBinding('class') class = 'd-flex flex-column flex-lg-row';

  userCount: number;
  isLoading: boolean = true;
  url = environment.apiUrl;
  userOnline:any[] = [];
  userInfos:any[] = [];

  constructor(private service: UserService, private cdr: ChangeDetectorRef) {}

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

  isConexion(id: string): boolean {
    return this.userOnline.some(item => item._id === id);
  }

  random(){
    const colorClasses: string[] = ['success', 'info', 'warning', 'danger'];
    return colorClasses[Math.floor(Math.random() * colorClasses.length)];
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
}
