import { WindowRefService } from './../services/window-ref.service';
import { ElementRef, Injectable, NgZone } from '@angular/core';
import {
  Engine,
  FreeCamera,
  Scene,
  Light,
  Mesh,
  Color3,
  Color4,
  Vector3,
  HemisphericLight,
  StandardMaterial,
  Texture,
  DynamicTexture,
  Space,
  SceneLoader,
  AnimationGroup,
} from '@babylonjs/core';
import "@babylonjs/loaders/glTF";
import { start } from 'repl';

@Injectable({ providedIn: 'root' })
export class EngineService {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private camera: FreeCamera;
  private scene: Scene;
  private light: Light;
  private sphere: Mesh;
  private animationGroups: Array<AnimationGroup>;

  public constructor(
    private ngZone: NgZone,
    private windowRef: WindowRefService
  ) { }

  public loadScene(canvas: ElementRef<HTMLCanvasElement>) {
    this.canvas = canvas.nativeElement;
    this.engine = new Engine(this.canvas, true);
    this.scene = new Scene(this.engine);
    this.light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
    this.camera = new FreeCamera('camera1', new Vector3(10, 10, -20), this.scene);

    // target the camera to scene origin
    this.camera.setTarget(Vector3.Zero());

    SceneLoader.ImportMeshAsync(null, "assets/", 'box_open_close2.glb', this.scene)
      .then(result => {
        console.log("SceneLoader SUCCESS, result: ", result);
        this.scene.stopAllAnimations();

        this.startBoxAnimation();
      }).catch(result => {
        console.log("SceneLoader FAILED, result: ", result);
      });
  }

  public startBoxAnimation() {
    console.log("startBoxAnimation");
    console.log("scene: ", this.scene);

    const boxOpen = this.scene.getAnimationGroupByName("box_open");
    const boxClose = this.scene.getAnimationGroupByName("box_close");
    const emptyFall = this.scene.getAnimationGroupByName("empty_falling");

    boxOpen.play();

    boxOpen.onAnimationEndObservable.add(() => emptyFall.start());
    emptyFall.onAnimationEndObservable.add(() => boxClose.start())
    boxClose.onAnimationEndObservable.add(() => {

    });
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      const rendererLoopCallback = () => {
        this.scene.render();
      };

      if (this.windowRef.document.readyState !== 'loading') {
        this.engine.runRenderLoop(rendererLoopCallback);
        console.log("rendererLoopCallback", this.scene);
      } else {
        this.windowRef.window.addEventListener('DOMContentLoaded', () => {
          this.engine.runRenderLoop(rendererLoopCallback);
        });
      }

      this.windowRef.window.addEventListener('resize', () => {
        this.engine.resize();
      });
    });
  }
}
