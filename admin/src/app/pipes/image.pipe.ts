import { Pipe, PipeTransform } from '@angular/core';
import { environment } from "../../environments/environment";

const URL = environment.apiUrl

@Pipe({
  name: 'image',
  standalone: true
})
export class ImagePipe implements PipeTransform {

  transform(image: string): string {
    return `${ URL }/${image}`;
  }

}
