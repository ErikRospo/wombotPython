import React from "react";
import { BsEraserFill, BsPenFill } from 'react-icons/bs'
import { TfiPaintBucket, TfiClose, TfiMenu } from 'react-icons/tfi'
import './toolbox.css'
export class Toolbox extends React.Component {
    state: { closed: boolean, tool: number, radius: number, color: string }
    props: { closed: boolean, tool: number, radius: number, color: string }

    constructor(props: { closed: boolean, tool: number, radius: number, color: string }) {
        super(props)
        this.props = props;
        this.state = props;

    }
    toggleClose() {
        this.setState({ closed: !this.state.closed })
        console.log(this)
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
                        <label>
                            <input type="radio" name="Tool" className="toolSelectorButton" onClick={() => this.setState({ tool: 0 })} checked={this.state.tool === 0} />
                            Eraser <BsEraserFill></BsEraserFill>
                        </label>
                        <br />
                        <label>
                            <input type="radio" name="Tool" className="toolSelectorButton" onClick={() => this.setState({ tool: 1 })} checked={this.state.tool === 1} />

                            Pen <BsPenFill></BsPenFill>
                        </label><br />
                        <label>
                            <input type="radio" name="Tool" className="toolSelectorButton" onClick={() => this.setState({ tool: 2 })} checked={this.state.tool === 2} />

                            Fill <TfiPaintBucket></TfiPaintBucket>
                        </label>
                        <div></div>
                    </div>
                    <hr />
                    <section>
                        <div id="Radius" >
                            <label htmlFor="RadiusInput">Radius: </label>
                            <input type="number" name="Radius" id="RadiusInput" onChange={(ev) => { this.setState({ radius: ev.target.valueAsNumber }); }} defaultValue={this.state.radius} />
                        </div>
                        <br />
                        <div id="Color" >
                            <label htmlFor="ColorInput">Color: </label>
                            <input type="color" name="Color" id="ColorInput" onChange={(ev) => { this.setState({ color: ev.target.value }) }} />
                        </div>
                    </section>
                </div>
            </div>
        )
    }


}