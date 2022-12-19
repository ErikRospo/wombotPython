import React from "react";
import { BsEraserFill, BsPenFill } from 'react-icons/bs'
import { TfiPaintBucket, TfiClose, TfiMenu } from 'react-icons/tfi'
import Canvas from "../canvas/Canvas";
import './toolbox.css'
export class Toolbox extends React.Component {
    state: { closed: boolean, tool: number, radius: number, color: string, parent: Canvas }
    props: { closed: boolean, tool: number, radius: number, color: string, parent: Canvas }

    constructor(props: { closed: boolean, tool: number, radius: number, color: string, parent: Canvas }) {
        super(props)
        this.props = props;
        this.state = {...props};
    }

    render(): React.ReactNode {

        return (
            <div id="toolbar-base" style={{ "height": (this.state.closed ? "3em" : "400px") }}>
                <div >
                    <div className="toggleButton" hidden={!this.state.closed} onClick={(_ev) => this.toggleClose()}>
                        <TfiClose></TfiClose>
                    </div>
                    <div className="toggleButton" hidden={this.state.closed} onClick={(_ev) => this.toggleClose()}>
                        <TfiMenu></TfiMenu>
                    </div>
                    <br />
                    <div id="selector" style={{ "opacity": (this.state.closed ? "0%" : "100%") }}>

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
                            <label>
                                <input type="radio" name="Tool" className="toolSelectorButton" onChange={() => this.setTool(2)} onClick={() => this.setTool(2)} checked={this.state.tool === 2} />

                                Fill <TfiPaintBucket></TfiPaintBucket>
                            </label>
                            <div></div>
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
                    </div>
                </div>
            </div>
        )
    }

    toggleClose() {
        this.props.parent.setState({'closed':!this.state.closed})
        this.setState({ closed: !this.state.closed })
        console.log(this)
    }

    private setColor(ev: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ color: ev.target.value });
        this.props.parent.setState({ 'color': ev.target.value })
    }

    private setRadius(ev: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ radius: ev.target.valueAsNumber });
        this.props.parent.setState({ 'radius': ev.target.valueAsNumber })
    }

    private setTool(tool: number): void {
        this.setState({ 'tool': tool });
        this.props.parent.setState({ 'tool': tool })
    }
}