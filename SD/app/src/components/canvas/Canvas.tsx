import React, { ChangeEvent, KeyboardEvent, MouseEvent } from "react";
import "./canvas.css";
import { getDataUrlFromArr } from "../../utilities/array-to-image";
import { SERVER_URL, Tools } from "../../constants";
import { BsEraserFill, BsPenFill } from 'react-icons/bs'
import { TfiClose, TfiMenu } from 'react-icons/tfi'
import { GrClearOption } from 'react-icons/gr'
import { FaMagic } from 'react-icons/fa'
import { Rectangle, ImageRectangle, createImageTile } from '../../utilities/imagetile'
import { grid, floorto, sleep, postData } from "../../utilities/general";
const floor = Math.floor
export default class Canvas extends React.Component {
  maskstate: Uint8ClampedArray;
  props: { width: number; height: number };
  state: {
    scale: number;
    strength: number;
    steps: number;
    val: string;
    image: string;
    tool: number;
    toolboxClosed: boolean;
    radius: number;
    imageGenRect: Rectangle;
    gridOffset: { x: number, y: number }
  };
  canvasState: {
    prompt: string;
    hasGenerated: boolean;
    toclear: boolean;
    ids_in_progress: Array<string>;
    mouseDown: number;
    keysdown: Map<string, boolean>;
    preventEvents: boolean;
  };
  ctx?: CanvasRenderingContext2D
  ctx2?: CanvasRenderingContext2D
  ids: String[];
  getstatus?: NodeJS.Timer;
  mousedown: boolean;
  imageGridSize: { width: number, height: number }
  imageGrid: ImageRectangle[][]
  imageTimer?: boolean;
  active: number;
  maxActive: number;
  constructor(props: any) {
    super(props);
    this.props = props;
    this.ids = [];
    this.imageGridSize = { width: 100, height: 100 }
    this.canvasState = {
      mouseDown: 0,
      hasGenerated: false,
      keysdown: new Map<string, boolean>(),
      ids_in_progress: new Array<string>(),
      preventEvents: false,
      toclear: true,
      prompt: ""
    };
    let tempgrid: string[][] = grid(this.width / this.imageGridSize.width, this.height / this.imageGridSize.height, "https://i.imgur.com/NuUoA9Z.jpeg");
    this.imageGrid = createImageTile(this.imageGridSize.width, this.imageGridSize.height, tempgrid)
    this.active = 0;
    this.maxActive = 1;
    this.state = {
      radius: 15,
      tool: Tools.GENERATE,
      toolboxClosed: false,
      val: "EMPTY",
      image: "https://i.imgur.com/NuUoA9Z.jpeg",
      imageGenRect: { x: 0, y: 0, width: this.imageGridSize.width, height: this.imageGridSize.height },

      gridOffset: { x: 0, y: 0 },
      steps: 50,
      strength: 0.8,
      scale: 5,


      // grey and white 2x2 checkerboard image.
      // "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII",
    };
    this.mousedown = false
    this.maskstate = new Uint8ClampedArray(props.width * props.height * 4);
  }

  public get shouldShowRadius(): boolean {
    return !(this.state.tool === Tools.ERASER || this.state.tool === Tools.PEN);
  }
  public get width(): number {
    return this.props.width;
  }
  public set width(v: number) {

    this.props.width = v;
  }
  public get height(): number {
    return this.props.height;
  }
  public set height(v: number) {
    this.props.height = v;
  }
  public get w(): number {
    return this.width;
  }
  public set w(v: number) {
    this.width = v;
  }
  public get h(): number {
    return this.height;
  }
  public set h(v: number) {
    this.height = v;
  }

  fetchInprogress() {
    fetch(SERVER_URL + "/inprogress").then((value) => {
      value.text().then((value1) => {
        let inp = JSON.parse(value1);
        for (const key in inp) {
          let url = inp[key]
          console.log(url[0])
          // this.deleteKey(key)
        }
        // this.setState({image:createImageTile(this.width,this.height,)})
        this.setState({ val: value1 });
      });
    });
  }
  fetchMine(): void {
    let Allmine: Promise<string | void>[] = []
    for (let index = 0; index < this.canvasState.ids_in_progress.length; index++) {
      const element = this.canvasState.ids_in_progress[index];

      Allmine.push(fetch(SERVER_URL + "/lookup/" + element).then((value) => { value.text() }))
    }
    Promise.all(Allmine).then((values) => {
      let newText: string[] = []
      for (let index = 0; index < values.length; index++) {
        const element_text = values[index];
        if (element_text) {
          newText.push(element_text)
          this.setState({ "val": newText.join("|||") })
        }
      }
    })
  }
  componentDidMount(): void {
    console.log(this);
    if (!this.ctx) {
      let ctx: CanvasRenderingContext2D | null = (document.getElementById("mask-canvas") as HTMLCanvasElement)?.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        this.ctx = ctx

      }
    }
    if (!this.ctx2) {
      let ctx: CanvasRenderingContext2D | null = (document.getElementById("grid-canvas") as HTMLCanvasElement)?.getContext("2d");
      if (ctx) {
        this.ctx2 = ctx

      }
    }
  }
  componentWillUnmount(): void {
    clearInterval(this.getstatus);
  }
  deleteKey(key: string) {
    fetch(SERVER_URL + "/delete/" + key).then(() => {
      this.fetchMine()
    })
  }

  canvasLoad(el: any) {
    console.log("canvasload");
    this.updateCtx(el)
    console.log("MaskCanvas Loaded")


  }

  draw(event: MouseEvent<HTMLCanvasElement>): void {
    if (this.ctx) {
      switch (this.state.tool) {
        case Tools.ERASER:
          this.ctx.fillStyle = "#ffffffff"
          this.ctx.beginPath();
          this.ctx.arc(event.clientX, event.clientY, this.state.radius, 0, 360);
          this.ctx.fill();
          break
        case Tools.PEN:
          this.ctx.fillStyle = "#000000ff"
          this.ctx.beginPath();
          this.ctx.arc(event.clientX, event.clientY, this.state.radius, 0, 360);
          this.ctx.fill();
          break
        case Tools.GENERATE:
          if (!this.canvasState.hasGenerated) {
            this.generate(event.clientX, event.clientY)
            this.canvasState.hasGenerated = true;
          }
          break
        default:
          break
      }
    }
  }
  generate(x: number, y: number) {
    if (this.ctx2) {
      if (this.active < this.maxActive) {

        this.active += 1

        this.ctx2.strokeStyle = "black"
        this.ctx2.lineWidth = 2
        this.ctx2.clearRect(0, 0, this.w, this.h)
        let { x: aagridx, y: aagridy } = this.toLocalCoordinates(x, y)
        this.ctx2.strokeRect(aagridx, aagridy, this.imageGridSize.width, this.imageGridSize.height)
        if (this.ctx) {
          let jdata = {
            image: this.state.image,
            pos_original: this.toLocalCoordinates(x, y),
            pos_px: this.toLocalCoordinates(x, y, { "x": 1 }),
            pos_nx: this.toLocalCoordinates(x, y, { "x": -1 }),
            pos_py: this.toLocalCoordinates(x, y, { "y": 1 }),
            pos_ny: this.toLocalCoordinates(x, y, { "y": -1 }),
            pos_pxpy: this.toLocalCoordinates(x, y, { "x": 1, "y": 1 }),
            pos_pxny: this.toLocalCoordinates(x, y, { "x": 1, "y": -1 }),
            pos_nxpy: this.toLocalCoordinates(x, y, { "x": -1, "y": 1 }),
            pos_nxny: this.toLocalCoordinates(x, y, { "x": -1, "y": -1 }),
            current: {
              w: this.width,
              h: this.height
            },
            grid: {
              w: this.imageGridSize.width,
              h: this.imageGridSize.height
            },
            prompt: this.canvasState.prompt
          }
          this.imageTimer = false;

          postData(`${SERVER_URL}/crop`, jdata).then((response) => {
            this.active -= 1;

            response.text().then(async (uu): Promise<void> => {
              console.log(uu);
              if (uu.length === 0) {
                throw Error("uuid length must be greater than zero.")
              }
              let responseString = "T"
              while (responseString === "T") {

                await sleep(4000)
                let pr = await fetch(`${SERVER_URL}/isactive?uuid=${uu}`)
                responseString = await pr.text()
              }
              this.imageTimer = true;
              this.reloadImage();
            }).catch((e) => {
              console.log("ERROR: " + e)
            })

          })

        }
      } else {
        this.ctx2.strokeStyle = "red"
        this.ctx2.lineWidth = 3
        this.ctx2.clearRect(0, 0, this.w, this.h)
        let { x: aagridx, y: aagridy } = this.toLocalCoordinates(x, y)
        this.ctx2.strokeRect(aagridx, aagridy, this.imageGridSize.width, this.imageGridSize.height)
      }
    }


  }
  private toLocalCoordinates(xi: number, yi: number, offset?: { x?: number, y?: number }): { x: number; y: number; } {
    let endwidth = floor(this.width / this.imageGridSize.width);
    let endheight = floor(this.height / this.imageGridSize.height);
    let x_prop = (xi + ((offset?.x || 0) * this.imageGridSize.width)) / this.width;
    let y_prop = (yi + ((offset?.y || 0) * this.imageGridSize.height)) / this.height;

    let gridx = endwidth * x_prop * this.imageGridSize.width;
    let gridy = endheight * y_prop * this.imageGridSize.height;
    let x = floorto(gridx, this.imageGridSize.width);
    let y = floorto(gridy, this.imageGridSize.height);

    return { x, y };
  }
  reloadImage(): void {
    if (this.imageTimer) {
      this.imageTimer = false
      this.setState({ "image": `${SERVER_URL}/image.png?${Date.now().toString(10)}` })
    }
  }
  white2transparency(): void {
    if (this.ctx) {
      let index = 0
      console.log("starting to modify the canvas")
      let n = 0;
      let imgd = this.ctx.getImageData(0, 0, this.width, this.height);
      for (let i = 0; i < imgd.height; i++) {
        for (let j = 0; j < imgd.width; j++) {
          index = ((i * (imgd.width * 4)) + (j * 4))
          if (imgd.data[index] > 0 &&
            imgd.data[index + 1] > 0 &&
            imgd.data[index + 2] > 0 &&
            imgd.data[index + 3] > 0) {
            imgd.data[index + 3] = 0;
            n += 1;
          }
        }
      }
      this.ctx.putImageData(imgd, 0, 0); //put image data back
      console.log("done modifying canvas, " + n.toString() + " Modifications")
    }
  }
  handleKeypress(event: any): void {
    this.canvasState.keysdown.set(event.key, true);
    console.log(event.key);
    switch (event.key) {
      case "q":
      
        this.setState({ tool: Math.max(this.state.tool - 1, 0) })
        break;
      case "e":
        this.setState({ tool: Math.min(this.state.tool - 1, 2) })
        break;
      case "w":
        this.setState({ radius: Math.max(this.state.radius - 5, 0) })
        break;
      case "s":
        this.setState({ radius: Math.min(this.state.radius + 5, 50) })
        break;
      case "r":
        this.clearCanvas();
        break
      default:
      
        break;

    }
  }


  clearCanvas() {
    console.log("Attempting to clear")
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height)
      this.ctx.fillStyle = "#ffffff00";
      this.ctx.fillRect(0, 0, this.width, this.height);

    };
  }

  handleKeyup(event: any) {
    this.canvasState.keysdown.set(event.key, false);
  }
  makeNew(prompt: string) {
    postData(SERVER_URL + "/new", {
      prompt: prompt,
      mask: "./mask.png",
      image: "./image.png",
    }).then((response) => {
      if (response) {
        response.text().then((text: string) => {
          this.canvasState.ids_in_progress.push(text)

        })
      } else {
        console.log("RESPONSE IS EMPTY:" + response)
      }

    });
  }
  updateCtx(event: any) {
    if (!this.ctx) {
      let ctx: CanvasRenderingContext2D | null = (event.target as HTMLCanvasElement).getContext("2d", { willReadFrequently: true });
      if (ctx) {
        this.ctx = ctx

      }
    }
  }
  updateCtx2(event: any) {
    if (!this.ctx2) {
      let ctx: CanvasRenderingContext2D | null = (event.target as HTMLCanvasElement).getContext("2d");
      if (ctx) {
        this.ctx2 = ctx

      }
    }
  }
  onDragEnter(e: React.DragEvent<HTMLInputElement>): void {
    e.stopPropagation();
    e.preventDefault();
  }
  onDragOver(e: React.DragEvent<HTMLInputElement>): void {
    e.stopPropagation();
    e.preventDefault();
  }
  onDrop(e: React.DragEvent<HTMLInputElement>): void {
    e.stopPropagation();
    e.preventDefault();

    const dt = e.dataTransfer;
    const files = dt.files;

    this.handleFiles(files, (e) => { console.log(e) });
  }
  handleFiles(files: FileList, onloaded: (e: string) => void): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) { continue }

      // const img = document.createElement("img");
      // img.classList.add("obj");
      // img.file = file;
      // preview.appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.

      const reader = new FileReader();
      reader.onload = (e) => {
        // console.log(e)
        this.setState({ "image": e.target?.result })
        let res = e.target?.result
        if (res) {
          postData(SERVER_URL + "/upload/image", res.toString()).then((r) => { r.text().then(onloaded) })
        }

      }
      // reader.onload = (e) => { img.src = e.target?.result; };
      reader.readAsDataURL(file);
    }
  }
  toggleClose() {
    this.setState({ toolboxClosed: !this.state.toolboxClosed })
  }

  setColor(ev: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ color: ev.target.value });
  }

  setRadius(ev: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ radius: ev.target.valueAsNumber });
  }

  setTool(tool: number): void {
    this.setState({ 'tool': tool });
  }

  getNewImage() {

    postData(`${SERVER_URL}/splitimages`,
      {
        "width": this.width,
        "height": this.height,
        "imagesWidth": this.imageGridSize.width,
        "imagesHeight": this.imageGridSize.height,
        "image": this.state.image,
        "oldImage": this.imageGrid
      }).then((v) =>
        v.text()
      ).then((value) => {
        console.log(value.length)
      })
  }
  postStats() {
    postData(`${SERVER_URL}/stats`,
      {
        "width": this.width,
        "height": this.height,
        "imagesWidth": this.imageGridSize.width,
        "imagesHeight": this.imageGridSize.height,
      }).then((v: Response): Promise<string> => v.text()
      ).then((value: string) => {
        console.log(value.length)
      })
  }


  postMask(event?: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>): boolean {
    if (event) {
      this.updateCtx(event);
    }
    if (this.ctx) {
      this.ctx.fill();
      this.maskstate = this.ctx.getImageData(0, 0, this.width, this.height).data;
      let dataurl = getDataUrlFromArr(this.maskstate, this.width, this.height);

      postData(SERVER_URL + "/upload/mask", dataurl);
      return true
    }
    else {
      return false
    }
  }
  render(): JSX.Element {

    return (
      <div
        id="canvas-container"
        onResize={(e) => {
          this.width = window.innerWidth
          this.height = window.innerHeight
        }}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (!this.canvasState.preventEvents) {
            this.handleKeypress(event);
          }
        }}
        onKeyUp={(event: KeyboardEvent<HTMLDivElement>) => {
          if (!this.canvasState.preventEvents) {
            this.handleKeyup(event);

          }
        }}
      >
        <img
          src={this.state.image}
          alt=""
          width={this.width}
          height={this.height}
          id="clickable-image"
          onLoad={() => {
            this.reloadImage()
          }}
        />

        <canvas


          onMouseDown={
            (event: any) => {
              this.canvasState.mouseDown = event.buttons;
              this.mousedown = true
              this.draw(event);

              this.updateCtx(event)
              this.ctx?.beginPath()

            }
          }
          onMouseUp={
            (event) => {
              this.mousedown = false
              this.canvasState.mouseDown = event.buttons;
              this.canvasState.hasGenerated = false;
              if (this.state.tool === Tools.ERASER) {
                this.white2transparency()

              } else if (this.state.tool === Tools.PEN) {
                this.postMask(event);
              }
            }
          }

          onMouseMove={(event) => {
            this.updateCtx(event)
            if (this.mousedown) {
              this.draw(event)
            }
          }}
          width={this.width}
          height={this.height}
          id="mask-canvas"
        // onLoad={()=>this.canvasLoad()}
        ></canvas>
        <canvas
          // onLoadStart={(event:any ): void => {
          //   console.log(event);
          //   console.log("GridCanvas Loaded")
          //   this.updateCtx2(event)
          //   console.log(this.ctx2)
          // }}
          width={this.width}
          height={this.height}
          id="grid-canvas"
        ></canvas>
        <div id="toolbar-base" style={{ "height": (this.state.toolboxClosed ? "3em" : "400px") }}>
          <div >
            <div className="toggleButton" hidden={!this.state.toolboxClosed} onClick={(_ev) => this.toggleClose()}>
              <TfiClose></TfiClose>
            </div>
            <div className="toggleButton" hidden={this.state.toolboxClosed} onClick={(_ev) => this.toggleClose()}>
              <TfiMenu></TfiMenu>
            </div>
            <br />
            <div id="selector" style={{ "opacity": (this.state.toolboxClosed ? "0%" : "100%") }}>

              <div >
                <label>
                  <input type="radio" name="Tool" className="toolSelectorButton" onChange={() => this.setTool(Tools.ERASER)} onClick={() => this.setTool(Tools.ERASER)} checked={this.state.tool === Tools.ERASER} />
                  Eraser <BsEraserFill></BsEraserFill>
                </label>
                <br />
                <label>
                  <input type="radio" name="Tool" className="toolSelectorButton" onChange={() => this.setTool(Tools.PEN)} onClick={() => this.setTool(Tools.PEN)} checked={this.state.tool === Tools.PEN} />

                  Pen <BsPenFill></BsPenFill>
                </label>
                <br />
                <label>
                  <input type="radio" name="Tool" className="toolSelectorButton" onChange={() => this.setTool(Tools.GENERATE)} onClick={() => this.setTool(Tools.GENERATE)} checked={this.state.tool === Tools.GENERATE} />

                  Generate <FaMagic></FaMagic>
                </label>
                <br />

              </div>
              <hr />
              <section>
                <div id="Radius" hidden={this.shouldShowRadius} >
                  <label htmlFor="RadiusInput">Radius: </label>
                  <input type="number" name="Radius" id="RadiusInput" onChange={(ev) => { this.setRadius(ev); }} defaultValue={this.state.radius} />
                </div>
                <br />
              </section>
              <hr hidden={this.shouldShowRadius} />
              <section>
                <div id="clear">
                  <button id="clearButton" onClick={() => { this.clearCanvas(); this.postMask() }}> Clear <GrClearOption></GrClearOption></button>
                </div>
              </section>
              <section>
                <button onClick={() => { this.getNewImage() }}>this.getNewImage()</button>
              </section>
              <section>
                <button onClick={() => { this.postStats() }}>this.postStats()</button>
              </section>
            </div>
            <hr style={{ "opacity": (this.state.toolboxClosed ? "0%" : "100%") }} />
            <div id="OptionsMenu" style={{ "opacity": (this.state.toolboxClosed ? "0%" : "100%") }} hidden={this.state.tool !== Tools.GENERATE}>
              <div className="slidecontainer">
                <label htmlFor="ScaleInput">
                  Guidence Scale: {this.state.scale}
                </label>
                <input type="range" name="Scale" id="ScaleInput" className="slider" min={0} max={10} step={0.1} defaultValue={this.state.scale} onChange={(ev) => {
                  this.setState({ scale: ev.target.valueAsNumber })
                }} />
              </div>
              <div className="slidecontainer">
                <label htmlFor="StrengthInput">
                  Prompt Strength: {this.state.strength}
                </label>
                <input type="range" name="Strength" id="StrengthInput" className="slider" max={1} min={0} step={0.05} defaultValue={this.state.strength} onChange={(ev) => {
                  this.setState({ strength: ev.target.valueAsNumber })

                }} />
              </div>
              <div className="slidecontainer">
                <label htmlFor="StepsInput">
                  Steps: {this.state.steps}
                </label>
                <input type="range" name="Steps" id="StepsInput" className="slider" min={0} max={500} step={10} defaultValue={this.state.steps} onChange={(ev) => {
                  this.setState({ steps: ev.target.valueAsNumber })
                }} />
              </div>
            </div>
          </div>
        </div>
        <div >
          <p id="inprogress">In progress: {this.state.val}</p>


          <label htmlFor="Prompt">Prompt: </label>
          <input type="text" name="Prompt" id="Prompt"
            onInput={() => { this.canvasState.preventEvents = true }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              this.canvasState.preventEvents = false;
              this.canvasState.prompt = e.target.value;

            }} />
          <br />
          <input type="file" name="ImageFile" accept="image/png" id="ImageFile"
            onDragEnter={(e) => { this.onDragEnter(e) }}
            onDragOver={(e) => { this.onDragOver(e) }}
            onDrop={(e) => { this.onDrop(e) }}
            onChange={(e) => {
              if (e.target.files) {
                this.handleFiles(e.target.files, (s) => { })
              }
            }} />

          <button
            id="genmore"

            onClick={(evt) => {
              console.log(evt)
              let prompt_elm = document.getElementById("Prompt");
              let file_elm = document.getElementById("ImageFile")
              // this.makeNew(i.value);

              if (prompt_elm instanceof HTMLInputElement) {
                if (file_elm instanceof HTMLInputElement) {
                  if (file_elm.files) {
                    this.handleFiles(file_elm.files, () => {
                      console.log("files handled")
                      this.makeNew((file_elm as HTMLInputElement).value)
                    })
                  }
                }
              }
            }
            }

          >
            Generate
          </button>



        </div>

      </div>
    );
  }

}
