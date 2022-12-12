import React, { BaseSyntheticEvent } from "react";
import "./canvas.css";
export default class Canvas extends React.Component {
  maskstate: Uint8ClampedArray;
  props: { width: number; height: number };
  state: { val: string; image: string };
  constructor(props: any) {
    super(props);
    this.props = props;
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
    // fetch("http://localhost:8080/new").then((value)=>{value.text().then((value1)=>{this.setState({val:value1})})})
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
    console.log("canvasload")
    console.log(el);
  }
  render(): JSX.Element {
    return (
      <div id="canvas-container">
        <img
          src={this.state.image}
          alt=""
          width={this.width}
          height={this.height}
          id="clickable-image"
        />
        <canvas
          onClick={(event:MouseEvent)=>{
            let ctx=event.target.getContext("2d");
            console.log(ctx);
            console.log(event.target)
            console.log(event);
            ctx.arc(event.clientX,event.clientY);
        }}
          width={this.width}
          height={this.height}
          id="canvas-canvas"
          onLoad={this.canvasLoad}
        ></canvas>
        <p>this will be the canvas</p>
        <p>{this.state.val}</p>
      </div>
    );
  }
}
