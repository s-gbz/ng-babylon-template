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

  myMouseClicked() {
    this.engServ.startBoxAnimation();
  }

  myMouseClickedCallback(){
    this.engServ.startBoxAnimationWithCallbacks();
  }

}
