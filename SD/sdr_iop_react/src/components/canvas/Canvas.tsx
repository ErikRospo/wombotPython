import React from "react";
import "./canvas.css";
import { postData } from "../../utils";
import { getDataUrlFromArr } from "../../utilities/array-to-image";
import { SERVER_URL } from "../../constants";
import { Toolbox } from "../toolbox/Toolbox";
export default class Canvas extends React.Component {
  maskstate: Uint8ClampedArray;
  props: { width: number; height: number };
  state: { val: string; image: string, tool: number, toolboxClosed: boolean, color: string };
  canvasState: {
    toclear: boolean;
    ids_in_progress: Array<string>;
    mouseDown: number;

    keysdown: Map<string, boolean>;
    radius: number;
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
      radius: 15,
      ids_in_progress: new Array<string>(),
      preventEvents: false,
      toclear: true
    };
    console.log(this.canvasState)
    this.state = {
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

  draw(event: any) {
    if (this.ctx) {
      this.ctx.fillStyle = this.state.color
      this.ctx.beginPath();
      this.ctx.arc(event.clientX, event.clientY, this.canvasState.radius, 0, 360);
      this.ctx.fill();
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
        this.canvasState.radius -= 5;
        this.canvasState.radius = Math.max(this.canvasState.radius, 0);
        break;
      case "s":
        this.canvasState.radius += 5;
        this.canvasState.radius = Math.min(this.canvasState.radius, 50);
        break;
      case "r":
        this.canvasState.toclear = true;
        break
      default:
        break;
    }
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
  render(): JSX.Element {
    return (
      <div
        id="canvas-container"
        onResize={(e) => {
          this.width = window.innerWidth
          this.height = window.innerHeight
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
          onKeyDown={(event: any) => {
            if (!this.canvasState.preventEvents) {
              this.handleKeypress(event);
            }
          }}
          onKeyUp={(event: any) => {
            if (!this.canvasState.preventEvents) {
              this.handleKeyup(event);

            }
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

              this.updateCtx(event)
              if (this.ctx) {
                this.ctx.fill()
                this.maskstate = this.ctx.getImageData(0, 0, this.width, this.height).data
                let dataurl = getDataUrlFromArr(this.maskstate, this.width, this.height)

                postData(SERVER_URL + "/upload/mask", dataurl)
              }
            }
          }

          onMouseMove={(event) => {
            this.updateCtx(event)
            if (this.canvasState.toclear && this.ctx) {
              if (this.ctx) {
                this.ctx.clearRect(0, 0, this.width, this.height)
                this.ctx?.getContextAttributes()
              }
              this.canvasState.toclear = false
            }
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
          <Toolbox closed={this.state.toolboxClosed} tool={this.state.tool} />
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
}
