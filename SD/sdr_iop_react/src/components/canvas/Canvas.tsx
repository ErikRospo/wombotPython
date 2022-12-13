import React from "react";
import "./canvas.css";

export default class Canvas extends React.Component {
  maskstate: Uint8ClampedArray;
  props: { width: number; height: number };
  state: { val: string; image: string };
  canvasState: {
    mouseDown: boolean;
    tool: number;
    keysdown: Map<string, boolean>;
    radius: number;
  };
  ids: String[];
  getstatus?: NodeJS.Timer;
  constructor(props: any) {
    super(props);
    this.props = props;
    this.ids = [];
    this.canvasState = {
      mouseDown: false,
      tool: -1,
      keysdown: new Map<string, boolean>(),
      radius: 15,
    };
    this.state = {
      val: "EMPTY",
      image:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII",
    };
    this.maskstate = new Uint8ClampedArray(props.width * props.height);
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

  componentDidMount(): void {
    console.log(this);
    this.getstatus = setInterval(() => {
      fetch("http://localhost:8080/inprogress").then((value) => {
        value.text().then((value1) => {
          let inp=JSON.parse(value1)
          this.setState({ val: value1 });
        });
      });
    }, 1000);
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
    let ctx = event.target.getContext("2d");
    if (ctx) {
      if (this.canvasState.tool === 0) {
        ctx.fillStyle = "black";
      } else if (this.canvasState.tool === 1) {
        ctx.fillStyle = "white";
      } else {
        ctx.fillStyle = "none";
      }
      ctx.beginPath();
      ctx.arc(event.clientX, event.clientY, this.canvasState.radius, 0, 360);
      ctx.fill();
    }
  }
  handleKeypress(event: any) {
    this.canvasState.keysdown.set(event.key, true);
    console.log(this.canvasState);

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
      default:
        break;
    }
    console.log(this.canvasState);
    console.log(this);
    console.log(event);
  }
  handleKeyup(event: any) {
    this.canvasState.keysdown.set(event.key, false);
  }
  render(): JSX.Element {
    return (
      <div
        id="canvas-container"
        onKeyDown={(event: any) => {
          console.log(event);
          this.handleKeypress(event);
        }}
        onKeyUp={(event: any) => {
          this.handleKeyup(event);
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
          onMouseDown={(event: any) => {
            this.canvasState.mouseDown = event.buttons;
            this.draw(event);
          }}
          //whenever a key is pressed, set its variable in a dict to true, and when it is released, set it to false
          // if it isn't in there already, add it to the dict.

          onMouseUp={(event: any) => {
            this.canvasState.mouseDown = event.buttons;
          }}
          onMouseMove={(event: any) => {
            if (this.canvasState.mouseDown) {
              this.draw(event);
            }
          }}
          width={this.width}
          height={this.height}
          id="canvas-canvas"
          onLoad={this.canvasLoad}
        ></canvas>
        <p id="inprogress">In progress: {this.state.val}</p>
      </div>
    );
  }
}
