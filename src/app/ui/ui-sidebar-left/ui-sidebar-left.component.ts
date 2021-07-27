import { Component, OnInit } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';

@Component({
  selector: 'app-ui-sidebar-left',
  templateUrl: './ui-sidebar-left.component.html'
})
export class UiSidebarLeftComponent implements OnInit {

  public constructor(private engServ: EngineService) { }

  public ngOnInit(): void {
  }

  textInput: string = "";

  myMouseClicked() {
    this.engServ.startBoxAnimation();
  }

  onTextChange(textInput: string) {
    console.log("new text input: ", textInput);
    this.engServ.createTextWithDynamicTexture(textInput);
  }
}
