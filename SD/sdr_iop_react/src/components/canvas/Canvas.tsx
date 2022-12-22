import React, { KeyboardEvent, MouseEvent } from "react";
import "./canvas.css";
import { postData } from "../../utils";
import { getDataUrlFromArr } from "../../utilities/array-to-image";
import { SERVER_URL } from "../../constants";
import { BsEraserFill, BsPenFill } from 'react-icons/bs'
import { TfiClose, TfiMenu } from 'react-icons/tfi'
import { GrClearOption } from 'react-icons/gr'
export default class Canvas extends React.Component {
  maskstate: Uint8ClampedArray;
  props: { width: number; height: number };
  state: {
    val: string;
    image: string;
    tool: number;
    toolboxClosed: boolean;
    color: string
    radius: number;
  };
  canvasState: {
    toclear: boolean;
    ids_in_progress: Array<string>;
    mouseDown: number;
    keysdown: Map<string, boolean>;
    preventEvents: boolean;
  };
  ctx?: CanvasRenderingContext2D
  ids: String[];
  getstatus?: NodeJS.Timer;
  mousedown: boolean;
  constructor(props: any) {
    super(props);
    this.props = props;
    this.ids = [];
    this.canvasState = {
      mouseDown: 0,
      keysdown: new Map<string, boolean>(),
      ids_in_progress: new Array<string>(),
      preventEvents: false,
      toclear: true
    };
    this.state = {
      radius: 15,
      tool: 1,
      toolboxClosed: false,
      val: "EMPTY",
      color: "black",
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII",
    };
    this.mousedown = false
    this.maskstate = new Uint8ClampedArray(props.width * props.height * 4);
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
  fetchInprogress() {
    fetch(SERVER_URL + "/inprogress").then((value) => {
      value.text().then((value1) => {
        let inp = JSON.parse(value1);
        for (const key in inp) {
          let url = inp[key]
          console.log(url[0])
          // this.setState({image:url})
          // this.deleteKey(key)
        }
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
    this.getstatus = setInterval(() => {
      this.fetchInprogress();
      this.fetchMine();
    }, 5000);
  }
  componentWillUnmount(): void {
    clearInterval(this.getstatus);
  }
  deleteKey(key: string) {
    fetch(SERVER_URL + "/delete/" + key).then(() => {
      this.fetchMine()
    })
  }
  // handleClick(event: {
  //   clientX: number;
  //   clientY: number;
  //   pageX: number;
  //   pageY: number;
  //   screenX: number;
  //   screenY: number;
  // }) {
  //   // let relativeX=event.clientX
  // }
  canvasLoad(el: any) {
    console.log("canvasload");
    console.log(el);
  }

  draw(event: MouseEvent<HTMLCanvasElement>) {
    if (this.ctx) {
      if (this.state.tool === 0) {
        this.ctx.fillStyle = "white"
        this.ctx.beginPath();
        this.ctx.arc(event.clientX, event.clientY, this.state.radius, 0, 360);
        this.ctx.fill();

      }
      else if (this.state.tool === 1) {
        this.ctx.fillStyle = this.state.color
        this.ctx.beginPath();
        this.ctx.arc(event.clientX, event.clientY, this.state.radius, 0, 360);
        this.ctx.fill();
      }
    }
  }
  handleKeypress(event: any) {
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

        this.canvasState.ids_in_progress.push(response)
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
          postData(SERVER_URL + "/upload/image", res.toString()).then(onloaded)
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
        />

        <canvas
          onLoadStart={(event: any) => {

            this.updateCtx(event)
          }}

          onMouseDown={
            (event: any) => {
              this.canvasState.mouseDown = event.buttons;
              this.mousedown = true
              this.draw(event);

              this.updateCtx(event)
              if (this.ctx) {
                this.ctx.beginPath()
              }
              //set the mousedown property on the parent object, then unset it on mouseup.
              //onmousemove, if the mousedown property is set, we draw the stuff.
            }
          }
          onMouseUp={
            (event) => {
              this.mousedown = false
              this.canvasState.mouseDown = event.buttons;

              this.postMask(event);
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
          id="canvas-canvas"
          onLoad={this.canvasLoad}
        ></canvas>
        <p id="inprogress">In progress: {this.state.val}</p>
        <div >
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
                    <input type="radio" name="Tool" className="toolSelectorButton" onChange={() => this.setTool(0)} onClick={() => this.setTool(0)} checked={this.state.tool === 0} />
                    Eraser <BsEraserFill></BsEraserFill>
                  </label>
                  <br />
                  <label>
                    <input type="radio" name="Tool" className="toolSelectorButton" onChange={() => this.setTool(1)} onClick={() => this.setTool(1)} checked={this.state.tool === 1} />

                    Pen <BsPenFill></BsPenFill>
                  </label><br />

                </div>
                <hr />
                <section>
                  <div id="Radius" >
                    <label htmlFor="RadiusInput">Radius: </label>
                    <input type="number" name="Radius" id="RadiusInput" onChange={(ev) => { this.setRadius(ev); }} defaultValue={this.state.radius} />
                  </div>
                  <br />
                  <div id="Color" >
                    <label htmlFor="ColorInput">Color: </label>
                    <input type="color" name="Color" id="ColorInput" onChange={(ev) => { this.setColor(ev); }} />
                  </div>
                </section>
                <hr />
                <section>
                  <div id="clear">
                    <button id="clearButton" onClick={() => { this.clearCanvas();this.postMask() }}> Clear <GrClearOption></GrClearOption></button>
                  </div>
                </section>
              </div>
            </div>
          </div>
          <label htmlFor="Prompt">Prompt: </label>
          <input type="text" name="Prompt" id="Prompt"
            onMouseOver={() => { this.canvasState.preventEvents = true }}
            onMouseOut={() => { this.canvasState.preventEvents = false }} />
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
    else{
      return false
    }
  }
}
