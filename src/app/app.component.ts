import { Component, HostListener } from '@angular/core';
import { EngineService } from './engine/engine.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  public constructor(private engServ: EngineService) { }

  // @HostListener('click', ['$event']) onClick(event) {
  //   this.engServ.printCameraInformation();
  // }
}
