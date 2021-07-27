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
  MeshBuilder,
  UniversalCamera,
  ArcRotateCamera,
} from '@babylonjs/core';
import "@babylonjs/loaders/glTF";

// Es erscheint das erste 'H'. Danach:
// TypeError: I.addQuadraticCurveTo is not a function
import MeshWriter from 'src/assets/meshwriter.min.js';

// TypeError: w.StandardMaterial is not a constructor
// import MeshWriter from 'node_modules/meshwriter/dist/meshwriter.min.js'

// TypeError: w.StandardMaterial is not a constructor
// import MeshWriter from 'meshwriter';

import * as BABYLON from '@babylonjs/core';
(window as any).BABYLON = BABYLON;


@Injectable({ providedIn: 'root' })
export class EngineService {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private camera;
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
    this.light.intensity = 2;

    this.camera = new ArcRotateCamera('camera1', 0, 0, 0, new Vector3(8, 5, -10), this.scene);
    // target the camera to scene origin
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(this.canvas, true);

    SceneLoader.ImportMeshAsync(null, "assets/", 'box_open_close2.glb', this.scene)
      .then(result => {
        console.log("SceneLoader SUCCESS, result: ", result);
        this.scene.stopAllAnimations();

        this.startBoxAnimation();
        // this.useMeshWriter();
        this.createTextWithDynamicTexture();
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

  public createTextWithDynamicTexture() {
    const emptyMesh = this.scene.getMeshByName("EMPTY");
    const boxMesh = this.scene.getMeshByName("box");

    const font_type = "ComicSansMS";

    //Set width an height for plane
    // const planeWidth = boxMesh.scaling.x;
    // const planeHeight = boxMesh.scaling.y;
    const planeWidth = 1.5;
    const planeHeight = 1.2;

    //Create plane
    const plane = MeshBuilder.CreatePlane("plane", { width: planeWidth, height: planeHeight }, this.scene);

    //Set width and height for dynamic texture using same multiplier
    const DTWidth = planeWidth * 20;
    const DTHeight = planeHeight * 20;

    const text = "Hello! 👋";

    const dynamicTexture = new DynamicTexture("DynamicTexture", { width: DTWidth, height: DTHeight }, this.scene, false);

    //Check width of text for given font type at any size of font
    const ctx = dynamicTexture.getContext();
    const size = 11; //any value will work
    ctx.font = size + "px " + font_type;
    const textWidth = ctx.measureText(text).width;

    //Calculate ratio of text width to size of font used
    const ratio = textWidth / size;

    //set font to be actually used to write text on dynamic texture
    const font_size = Math.floor(DTWidth / (ratio * 1)); //size of multiplier (1) can be adjusted, increase for smaller text
    const font = font_size + "px " + font_type;

    //Draw text
    dynamicTexture.drawText(text, null, null, font, "#000000", "#ffffff", true);

    //create material
    const mat = new BABYLON.StandardMaterial("mat", this.scene);
    mat.diffuseTexture = dynamicTexture;

    //apply material
    plane.material = mat;
    plane.position = new Vector3(plane.position.x, emptyMesh.position.y + 0.5, plane.position.z);
    plane.setParent(emptyMesh);

    console.log("box: ", boxMesh);
    console.log("plane: ", plane.position);
    console.log("empty: ", emptyMesh.position);
  }

  public createTextWithMeshWriter() {
    console.log("createTextMesh");
    console.log("MeshWriter", MeshWriter);

    let Writer = MeshWriter(this.scene, { scale: .25, defaultFont: "Arial" });
    console.log("Writer", Writer);

    let textMesh = new Writer("Hello World", {
      "font-family": "Arial",
      "letter-height": 30,
      "letter-thickness": 12,
      color: "#1C3870",
      anchor: "center",
      colors: {
        diffuse: "#F0F0F0",
        specular: "#000000",
        ambient: "#F0F0F0",
        emissive: "#ff00f0"
      },
      position: {
        x: 0,
        y: 10,
        z: 0
      }
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
