import React from 'react';

export default class Canvas extends React.Component {
    maskstate: Uint8ClampedArray;
    props: { width: number, height: number }
    state:{val:string}
    constructor(props: any) {

        super(props)
        this.props = props
        this.state={val:"EMPTY"}
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
        fetch("http://localhost:8080/new").then((value)=>{value.text().then((value1)=>{this.setState({val:value1})})})
    }
    handleClick(event:any){
        console.log(event)
    }
    render(): JSX.Element {
        return (<div>
            <img src="" alt="" />
            <canvas onClick={this.handleClick} width={this.width} height={this.height}></canvas>
            <p>this will be the canvas</p>
            <p>{this.state.val}</p></div>)
    }
}