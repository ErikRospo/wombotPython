import React from "react";
import "./canvas.css";
import { postData } from "../../utils";
import { getDataUrlFromArr } from "../../utilities/array-to-image";
export default class Canvas extends React.Component {
  maskstate: Uint8ClampedArray;
  props: { width: number; height: number };
  state: { val: string; image: string };
  canvasState: {
    toclear: boolean;
    ids_in_progress: Array<string>;
    mouseDown: number;
    tool: number;
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
      tool: -1,
      keysdown: new Map<string, boolean>(),
      radius: 15,
      ids_in_progress: new Array<string>(),
      preventEvents: false,
      toclear: true
    };
    console.log(this.canvasState)
    this.state = {
      val: "EMPTY",
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
    fetch("http://localhost:8080/inprogress").then((value) => {
      value.text().then((value1) => {
        let inp = JSON.parse(value1);
        console.log(inp);

        this.setState({ val: value1 });
      });
    });
  }
  fetchMine(): void {
    let Allmine: Promise<string | void>[] = []
    for (let index = 0; index < this.canvasState.ids_in_progress.length; index++) {
      const element = this.canvasState.ids_in_progress[index];

      Allmine.push(fetch("http://localhost:8080/lookup/" + element).then((value) => { value.text() }))
    }
    Promise.all(Allmine).then((values) => {
      let newText: string[] = []
      for (let index = 0; index < values.length; index++) {
        const element_text = values[index];
        if (element_text) {
          newText.push(element_text)
        }
      }
      console.log(newText)
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
  handleClick(event: {
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    screenX: number;
    screenY: number;
  }) {
    // let relativeX=event.clientX
  }
  canvasLoad(el: any) {
    console.log("canvasload");
    console.log(el);
  }

  draw(event: any) {
    if (this.ctx) {
      if (this.canvasState.tool === 0) {
        this.ctx.fillStyle = "black";
      } else if (this.canvasState.tool === 1) {
        this.ctx.fillStyle = "white";
      } else {
        this.ctx.fillStyle = "none";
      }
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
        this.canvasState.tool -= 1;
        this.canvasState.tool = Math.max(this.canvasState.tool, 0);
        break;
      case "e":
        this.canvasState.tool += 1;
        this.canvasState.tool = Math.min(this.canvasState.tool, 2);
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
    postData("http://localhost:8080/new", {
      prompt: prompt,
      mask: "./mask.jpg",
      image: "./image.jpg",
    }).then((response) => {
      console.log(this.canvasState.ids_in_progress)
      if (response) {

        this.canvasState.ids_in_progress.push(response)
      } else {
        console.error("RESPONSE IS EMPTY")
      }

      console.log(this.canvasState.ids_in_progress);
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
  render(): JSX.Element {
    return (
      <div
        id="canvas-container"
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

                postData("http://localhost:8080/upload/mask", dataurl)
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
              // const img = getImgFromArr(this.maskstate, this.width, this.height);x
              this.draw(event)
              // ctx.fillStyle = "black"
              // ctx.arc(event.clientX, event.clientY, 15, 0, 360);

              // this.maskstate[event.clientX + event.clientY * this.width] = 255
            }
          }}
          width={this.width}
          height={this.height}
          id="canvas-canvas"
          onLoad={this.canvasLoad}
        ></canvas>
        <p id="inprogress">In progress: {this.state.val}</p>
        <form action="http://localhost:8080/startnew"  encType="multipart/form-data" onSubmit={(ev)=>{
          console.log(ev)
        }} method="post">
          <label htmlFor="Prompt">Prompt: </label>
          <input type="text" name="Prompt" id="Prompt"
            onMouseOver={() => { this.canvasState.preventEvents = true }}
            onMouseOut={() => { this.canvasState.preventEvents = false }} />
          <br />
          <input type="file" name="ImageFile" accept="image/*" id="ImageFile" />
          <input type="submit"
            id="genmore"
            
            onClick={(evt) => {
              console.log(evt)
              let i = document.getElementById("Prompt");
              if (i instanceof HTMLInputElement) {
                // this.makeNew(i.value);
                
              }
              evt.stopPropagation()
            }}

              // Generate
          />
          </form>
            
      </div>
    );
  }
}
