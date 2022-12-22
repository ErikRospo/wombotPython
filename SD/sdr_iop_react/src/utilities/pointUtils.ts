export class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}
export class BBox {
    tl: Point;
    br: Point;
    constructor(x1?: Point | number, y1?: Point | number, x2?: number, y2?: number) {
        if (x2 && y2) {
            if (typeof x1 === "number" && typeof y1 == "number") {
                this.tl = { x: x1, y: y1 };
                this.br = { x: x2, y: y2 };
            } else {
                this.br = new Point(0, 0);
                this.tl = new Point(0, 0);
            }
        } else if (x1&&y1) {
            if (x1 instanceof Point && y1 instanceof Point) {
                this.tl = x1
                this.br = y1
            } else {
                this.br = new Point(0, 0);
                this.tl = new Point(0, 0);
            }

        }
        else{
            this.br=new Point(0, 0);
            this.tl=new Point(0, 0);
        }
    }
    
    public get width() : number {
        return this.tl.x-this.br.x;
    }
    public get height():number{
        return this.tl.y-this.br.y;
    }    

};
