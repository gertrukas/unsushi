import {
  Component,
  ElementRef,
  HostBinding,
  Input, OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { io } from 'socket.io-client';
import {
  MessageModel,
  UserInfoModel,
} from './dataExample';
import { environment } from "../../../../../environments/environment";
import { ChatService } from "../../../../services/chat.service";
import { AuthService, UserModel, UserType } from "../../../../modules/auth";
import { UserService } from "../../../../_fake/services/user-service";

@Component({
  selector: 'app-chat-inner',
  templateUrl: './chat-inner.component.html',
})
export class ChatInnerComponent implements OnInit, OnDestroy {
  @Input() isDrawer: boolean = false;
  @Input() userReceiving: string ='group';
  @HostBinding('class') class = 'card-body';
  @HostBinding('id') id = this.isDrawer
    ? 'kt_drawer_chat_messenger_body'
    : 'kt_chat_messenger_body';
  @ViewChild('messageInput', { static: true })
  messageInput: ElementRef<HTMLTextAreaElement>;
  user$: Subscription;
  user: any;
  userCount: number = 0;
  url: string = environment.apiUrl

  userOnline:any[] = [];
  userInfos:any[] = [];

  private messages$: BehaviorSubject<Array<MessageModel>> = new BehaviorSubject<Array<MessageModel>>([]);
  messagesObs: Observable<Array<MessageModel>>;


  constructor(private serviceChat: ChatService, private serviceUsers: UserService, private auth: AuthService) {
    this.user$ = this.auth.currentUserSubject.subscribe(user => {
      this.user = user; // Aquí accedes a las propiedades del usuario
    });
    this.messagesObs = this.messages$.asObservable();
  }

  random(){
    const colorClasses: string[] = ['success', 'info', 'warning', 'danger'];
    return colorClasses[Math.floor(Math.random() * colorClasses.length)];
  }

  ngOnInit(): void {
    this.serviceUsers.getUsersLine().subscribe(response => {
      this.userOnline = response.users;
      this.userCount = response.count;
    });
    this.serviceUsers.getUsers().subscribe(response => {
      response.data.forEach(user => {
        this.userInfos.push(user);
      })
    });
    if(this.userReceiving == 'group'){
      this.serviceChat.getChats().subscribe(response => {
        let messages: any[] = [];
        response.forEach((chat: any) => {
          const message = {
            user: chat.userSend._id,
            type: this.user._id === chat.userSend._id ? 'out' : 'in',
            text:chat.message,
            time: this.formatTimeDifference(chat.time),
          }
          messages.push(message);
        });
        this.messages$.next(messages);
      });
    }
    const socket = this.serviceChat.getSocket();
    socket.on('connect', () => {});

    socket.on('message', (msg: any) => {
      const newMessage: MessageModel = {
        user: msg.userId, // Asegúrate de que el servidor envíe el userId correspondiente
        type: msg.userId === this.user._id ? 'out' : 'in',
        text: msg.text,
        time: 'Ahora mismo',
      };
      if(msg.userId !== this.user._id){
        this.addMessage(newMessage);
      }
    });
  }

  chatPrivate(userReceiving: any){
    this.userReceiving = userReceiving;
    const user_r = userReceiving;

    const params = {
      userSend: this.user._id,
      // @ts-ignore
      userReceiving: user_r._id,
    }
    this.serviceChat.getChatsPrivate(params).subscribe(response => {
      let messages: any[] = [];
      response.forEach((chat: any) => {
        const message = {
          user: chat.userSend._id,
          type: this.user._id === chat.userSend._id ? 'out' : 'in',
          text:chat.message,
          time: this.formatTimeDifference(chat.time),
        }
        messages.push(message);
      });
      this.messages$.next(messages);
    });
  }

  formatTimeDifference(dateInput: Date | string | undefined | null): string {
    // Asegúrate de que `dateInput` sea una instancia de Date válida
    let date: Date;

    // Si `dateInput` es una cadena o algo que no sea Date, intenta convertirlo
    if (typeof dateInput === 'string' || !(dateInput instanceof Date)) {
      //@ts-ignore
      date = new Date(dateInput);
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

  submitMessage(): void {
    const text = this.messageInput.nativeElement.value;
    const newMessage: MessageModel = {
      user: this.user._id,
      type: 'out',
      text,
      time: 'Ahora mismo',
    };
    this.addMessage(newMessage);
    const messagePayload = {
      userId: this.user._id, // Cambia esto según el usuario que envía el mensaje
      text: text,
      //@ts-ignore
      userReceiving: this.userReceiving ? this.userReceiving : 'group',
    };

    const socket = this.serviceChat.getSocket();
    socket.emit('message', messagePayload);

    // clear input
    this.messageInput.nativeElement.value = '';
  }

  addMessage(newMessage: MessageModel): void {
    const messages = [...this.messages$.value];
    messages.push(newMessage);
    this.messages$.next(messages);
  }

  getUser(_user: string): UserInfoModel {
    const user = this.userInfos.find(userInfo => userInfo._id === _user);
    return user;
  }

  getMessageCssClass(message: MessageModel): string {
    return `p-5 rounded text-gray-900 fw-bold mw-lg-400px bg-light-${
      message.type === 'in' ? 'info' : 'primary'
    } text-${message.type === 'in' ? 'start' : 'end'}`;
  }

  ngOnDestroy(): void {
    const socket = this.serviceChat.getSocket();
    socket.removeAllListeners('message');
    socket.disconnect();
  }

}
