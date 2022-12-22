/**
 * Bresenham Curve Rasterizing Algorithms
 * @author  Zingl Alois
 * @date    17.12.2014
 * @version 1.3
 * @url     http://members.chello.at/easyfilter/bresenham.html

*/
//adapted for typescript by Erik Rospo (2022)
export class Brensenham{
   ctx:CanvasRenderingContext2D
   constructor(ctx:CanvasRenderingContext2D){
      this.ctx=ctx
   }
 setPixel(x:number,y:number){
   this.ctx.fillRect(x,y,1,1)
}
 assert(a: string | boolean) {
    if (!a) console.log("Assertion failed in bresenham.js "+a);
    return a;
 }
    
  plotLine(x0: number, y0: number, x1: number, y1: number)
 {
    var dx =  Math.abs(x1-x0), sx = x0<x1 ? 1 : -1;
    var dy = -Math.abs(y1-y0), sy = y0<y1 ? 1 : -1;
    var err = dx+dy, e2;                                   /* error value e_xy */
 
    for (;;){                                                          /* loop */
       this.setPixel(x0,y0);
       if (x0 === x1 && y0 === y1) break;
       e2 = 2*err;
       if (e2 >= dy) { err += dy; x0 += sx; }                        /* x step */
       if (e2 <= dx) { err += dx; y0 += sy; }                        /* y step */
    }
 }
 
  plotEllipse(xm: number, ym: number, a: number, b: number)
 {
    var x = -a, y = 0;           /* II. quadrant from bottom left to top right */
    var e2, dx = (1+2*x)*b*b;                              /* error increment  */
    var dy = x*x, err = dx+dy;                              /* error of 1.step */
 
    do {
        this.setPixel(xm-x, ym+y);                                 /*   I. Quadrant */
        this.setPixel(xm+x, ym+y);                                 /*  II. Quadrant */
        this.setPixel(xm+x, ym-y);                                 /* III. Quadrant */
        this.setPixel(xm-x, ym-y);                                 /*  IV. Quadrant */
        e2 = 2*err;                                        
        if (e2 >= dx) { x++; err += dx += 2*b*b; }                   /* x step */
        if (e2 <= dy) { y++; err += dy += 2*a*a; }                   /* y step */
    } while (x <= 0);
 
    while (y++ < b) {            /* too early stop for flat ellipses with a=1, */
        this.setPixel(xm, ym+y);                        /* -> finish tip of ellipse */
        this.setPixel(xm, ym-y);
    }
 }
 
  plotCircle(xm: number, ym: number, r: number)
 {
    var x = -r, y = 0, err = 2-2*r;                /* bottom left to top right */
    do {
       this.setPixel(xm-x, ym+y);                            /*   I. Quadrant +x +y */
       this.setPixel(xm-y, ym-x);                            /*  II. Quadrant -x +y */
       this.setPixel(xm+x, ym-y);                            /* III. Quadrant -x -y */
       this.setPixel(xm+y, ym+x);                            /*  IV. Quadrant +x -y */
       r = err;                                       
       if (r <= y) err += ++y*2+1;                                   /* y step */
       if (r > x || err > y) err += ++x*2+1;                         /* x step */
    } while (x < 0);
 }
 
  plotEllipseRect(x0: number, y0: number, x1: number, y1: number)
 {                              /* rectangular parameter enclosing the ellipse */
    var a = Math.abs(x1-x0), b = Math.abs(y1-y0), b1 = b&1;        /* diameter */
    var dx = 4*(1.0-a)*b*b, dy = 4*(b1+1)*a*a;              /* error increment */
    var err = dx+dy+b1*a*a, e2;                             /* error of 1.step */
 
    if (x0 > x1) { x0 = x1; x1 += a; }        /* if called with swapped points */
    if (y0 > y1) y0 = y1;                                  /* .. exchange them */
    y0 += (b+1)>>1; y1 = y0-b1;                              /* starting pixel */
    a = 8*a*a; b1 = 8*b*b;                               
                                                         
    do {                                                 
       this.setPixel(x1, y0);                                      /*   I. Quadrant */
       this.setPixel(x0, y0);                                      /*  II. Quadrant */
       this.setPixel(x0, y1);                                      /* III. Quadrant */
       this.setPixel(x1, y1);                                      /*  IV. Quadrant */
       e2 = 2*err;
       if (e2 <= dy) { y0++; y1--; err += dy += a; }                 /* y step */
       if (e2 >= dx || 2*err > dy) { x0++; x1--; err += dx += b1; }       /* x */
    } while (x0 <= x1);
 
    while (y0-y1 <= b) {                /* too early stop of flat ellipses a=1 */
       this.setPixel(x0-1, y0);                         /* -> finish tip of ellipse */
       this.setPixel(x1+1, y0++);
       this.setPixel(x0-1, y1);
       this.setPixel(x1+1, y1--);
    }
 }
 
  plotQuadBezierSeg(x0: number, y0: number, x1: number, y1: number , x2: number, y2: number)
 {                                  /* plot a limited quadratic Bezier segment */
   var sx = x2-x1, sy = y2-y1;
   var xx = x0-x1, yy = y0-y1, xy;               /* relative values for checks */
   var dx, dy, err, cur = xx*sy-yy*sx;                            /* curvature */
 
   this.assert(xx*sx <= 0 && yy*sy <= 0);       /* sign of gradient must not change */
 
   if (sx*sx+sy*sy > xx*xx+yy*yy) {                 /* begin with shorter part */
     x2 = x0; x0 = sx+x1; y2 = y0; y0 = sy+y1; cur = -cur;       /* swap P0 P2 */
   }
   if (cur !== 0) {                                         /* no straight line */
     xx += sx; xx *= sx = x0 < x2 ? 1 : -1;                /* x step direction */
     yy += sy; yy *= sy = y0 < y2 ? 1 : -1;                /* y step direction */
     xy = 2*xx*yy; xx *= xx; yy *= yy;               /* differences 2nd degree */
     if (cur*sx*sy < 0) {                                /* negated curvature? */
       xx = -xx; yy = -yy; xy = -xy; cur = -cur;
     }
     dx = 4.0*sy*cur*(x1-x0)+xx-xy;                  /* differences 1st degree */
     dy = 4.0*sx*cur*(y0-y1)+yy-xy;
     xx += xx; yy += yy; err = dx+dy+xy;                     /* error 1st step */
     do {
       this.setPixel(x0,y0);                                          /* plot curve */
       if (x0 === x2 && y0 === y2) return;       /* last pixel -> curve finished */
       y1 = +(2*err < dx);                       /* save value for test of y step */
       if (2*err > dy) { x0 += sx; dx -= xy; err += dy += yy; }      /* x step */
       if (    y1    ) { y0 += sy; dy -= xy; err += dx += xx; }      /* y step */
     } while (dy < 0 && dx > 0);        /* gradient negates -> algorithm fails */
   }
   this.plotLine(x0,y0, x2,y2);                       /* plot remaining part to end */
 }
 
  plotQuadBezier(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number)
 {                                          /* plot any quadratic Bezier curve */
    var x = x0-x1, y = y0-y1, t = x0-2*x1+x2, r;
 
    if (x*(x2-x1) > 0) {                              /* horizontal cut at P4? */
       if (y*(y2-y1) > 0)                           /* vertical cut at P6 too? */
          if (Math.abs((y0-2*y1+y2)/t*x) > Math.abs(y)) {      /* which first? */
             x0 = x2; x2 = x+x1; y0 = y2; y2 = y+y1;            /* swap points */
          }                            /* now horizontal cut at P4 comes first */
       t = (x0-x1)/t;
       r = (1-t)*((1-t)*y0+2.0*t*y1)+t*t*y2;                       /* By(t=P4) */
       t = (x0*x2-x1*x1)*t/(x0-x1);                       /* gradient dP4/dx=0 */
       x = Math.floor(t+0.5); y = Math.floor(r+0.5);
       r = (y1-y0)*(t-x0)/(x1-x0)+y0;                  /* intersect P3 | P0 P1 */
       this.plotQuadBezierSeg(x0,y0, x,Math.floor(r+0.5), x,y);
       r = (y1-y2)*(t-x2)/(x1-x2)+y2;                  /* intersect P4 | P1 P2 */
       x0 = x1 = x; y0 = y; y1 = Math.floor(r+0.5);        /* P0 = P4, P1 = P8 */
    }
    if ((y0-y1)*(y2-y1) > 0) {                          /* vertical cut at P6? */
       t = y0-2*y1+y2; t = (y0-y1)/t;
       r = (1-t)*((1-t)*x0+2.0*t*x1)+t*t*x2;                       /* Bx(t=P6) */
       t = (y0*y2-y1*y1)*t/(y0-y1);                       /* gradient dP6/dy=0 */
       x = Math.floor(r+0.5); y = Math.floor(t+0.5);
       r = (x1-x0)*(t-y0)/(y1-y0)+x0;                  /* intersect P6 | P0 P1 */
       this.plotQuadBezierSeg(x0,y0, Math.floor(r+0.5),y, x,y);
       r = (x1-x2)*(t-y2)/(y1-y2)+x2;                  /* intersect P7 | P1 P2 */
       x0 = x; x1 = Math.floor(r+0.5); y0 = y1 = y;        /* P0 = P6, P1 = P7 */
    }
    this.plotQuadBezierSeg(x0,y0, x1,y1, x2,y2);                  /* remaining part */
 }
 
  plotQuadRationalBezierSeg(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, w: number)
 {                   /* plot a limited rational Bezier segment, squared weight */
   var sx = x2-x1, sy = y2-y1;                   /* relative values for checks */
   var dx = x0-x2, dy = y0-y2, xx = x0-x1, yy = y0-y1;
   var xy = xx*sy+yy*sx, cur = xx*sy-yy*sx, err;                  /* curvature */
 
   this.assert(xx*sx <= 0.0 && yy*sy <= 0.0);   /* sign of gradient must not change */
 
   if (cur !== 0.0 && w > 0.0) {                            /* no straight line */
     if (sx*sx+sy*sy > xx*xx+yy*yy) {               /* begin with shorter part */
       x2 = x0; x0 -= dx; y2 = y0; y0 -= dy; cur = -cur;         /* swap P0 P2 */
     }
     xx = 2.0*(4.0*w*sx*xx+dx*dx);                   /* differences 2nd degree */
     yy = 2.0*(4.0*w*sy*yy+dy*dy);
     sx = x0 < x2 ? 1 : -1;                                /* x step direction */
     sy = y0 < y2 ? 1 : -1;                                /* y step direction */
     xy = -2.0*sx*sy*(2.0*w*xy+dx*dy);
 
     if (cur*sx*sy < 0.0) {                              /* negated curvature? */
       xx = -xx; yy = -yy; xy = -xy; cur = -cur;
     }
     dx = 4.0*w*(x1-x0)*sy*cur+xx/2.0+xy;            /* differences 1st degree */
     dy = 4.0*w*(y0-y1)*sx*cur+yy/2.0+xy;
 
     if (w < 0.5 && (dy > xy || dx < xy)) {   /* flat ellipse, algorithm fails */
        cur = (w+1.0)/2.0; w = Math.sqrt(w); xy = 1.0/(w+1.0);
        sx = Math.floor((x0+2.0*w*x1+x2)*xy/2.0+0.5);/*subdivide curve in half */
        sy = Math.floor((y0+2.0*w*y1+y2)*xy/2.0+0.5);
        dx = Math.floor((w*x1+x0)*xy+0.5); dy = Math.floor((y1*w+y0)*xy+0.5);
        this.plotQuadRationalBezierSeg(x0,y0, dx,dy, sx,sy, cur);/* plot separately */
        dx = Math.floor((w*x1+x2)*xy+0.5); dy = Math.floor((y1*w+y2)*xy+0.5);
        this.plotQuadRationalBezierSeg(sx,sy, dx,dy, x2,y2, cur);
        return;
     }
     err = dx+dy-xy;                                           /* error 1.step */
     do {
       this.setPixel(x0,y0);                                          /* plot curve */
       if (x0 === x2 && y0 === y2) return;       /* last pixel -> curve finished */
       x1 = +(2*err > dy); y1 = +(2*(err+yy) < -dy);/* save value for test of x step */
       if (2*err < dx || y1) { y0 += sy; dy += xy; err += dx += xx; }/* y step */
       if (2*err > dx || x1) { x0 += sx; dx += xy; err += dy += yy; }/* x step */
     } while (dy <= xy && dx >= xy);    /* gradient negates -> algorithm fails */
   }
   this.plotLine(x0,y0, x2,y2);                     /* plot remaining needle to end */
 }
 
  plotQuadRationalBezier(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, w: number)
 {                                 /* plot any quadratic rational Bezier curve */
    var x = x0-2*x1+x2, y = y0-2*y1+y2;
    var xx = x0-x1, yy = y0-y1, ww, t, q;
 
    this.assert(w >= 0.0);
 
    if (xx*(x2-x1) > 0) {                             /* horizontal cut at P4? */
       if (yy*(y2-y1) > 0)                          /* vertical cut at P6 too? */
          if (Math.abs(xx*y) > Math.abs(yy*x)) {               /* which first? */
             x0 = x2; x2 = xx+x1; y0 = y2; y2 = yy+y1;          /* swap points */
          }                            /* now horizontal cut at P4 comes first */
       if (x0 === x2 || w === 1.0) t = (x0-x1)/x;
       else {                                 /* non-rational or rational case */
          q = Math.sqrt(4.0*w*w*(x0-x1)*(x2-x1)+(x2-x0)*(x2-x0));
          if (x1 < x0) q = -q;
          t = (2.0*w*(x0-x1)-x0+x2+q)/(2.0*(1.0-w)*(x2-x0));        /* t at P4 */
       }
       q = 1.0/(2.0*t*(1.0-t)*(w-1.0)+1.0);                 /* sub-divide at t */
       xx = (t*t*(x0-2.0*w*x1+x2)+2.0*t*(w*x1-x0)+x0)*q;               /* = P4 */
       yy = (t*t*(y0-2.0*w*y1+y2)+2.0*t*(w*y1-y0)+y0)*q;
       ww = t*(w-1.0)+1.0; ww *= ww*q;                    /* squared weight P3 */
       w = ((1.0-t)*(w-1.0)+1.0)*Math.sqrt(q);                    /* weight P8 */
       x = Math.floor(xx+0.5); y = Math.floor(yy+0.5);                   /* P4 */
       yy = (xx-x0)*(y1-y0)/(x1-x0)+y0;                /* intersect P3 | P0 P1 */
       this.plotQuadRationalBezierSeg(x0,y0, x,Math.floor(yy+0.5), x,y, ww);
       yy = (xx-x2)*(y1-y2)/(x1-x2)+y2;                /* intersect P4 | P1 P2 */
       y1 = Math.floor(yy+0.5); x0 = x1 = x; y0 = y;       /* P0 = P4, P1 = P8 */
    }
    if ((y0-y1)*(y2-y1) > 0) {                          /* vertical cut at P6? */
       if (y0 === y2 || w === 1.0) t = (y0-y1)/(y0-2.0*y1+y2);
       else {                                 /* non-rational or rational case */
          q = Math.sqrt(4.0*w*w*(y0-y1)*(y2-y1)+(y2-y0)*(y2-y0));
          if (y1 < y0) q = -q;
          t = (2.0*w*(y0-y1)-y0+y2+q)/(2.0*(1.0-w)*(y2-y0));        /* t at P6 */
       }
       q = 1.0/(2.0*t*(1.0-t)*(w-1.0)+1.0);                 /* sub-divide at t */
       xx = (t*t*(x0-2.0*w*x1+x2)+2.0*t*(w*x1-x0)+x0)*q;               /* = P6 */
       yy = (t*t*(y0-2.0*w*y1+y2)+2.0*t*(w*y1-y0)+y0)*q;
       ww = t*(w-1.0)+1.0; ww *= ww*q;                    /* squared weight P5 */
       w = ((1.0-t)*(w-1.0)+1.0)*Math.sqrt(q);                    /* weight P7 */
       x = Math.floor(xx+0.5); y = Math.floor(yy+0.5);           /* P6 */
       xx = (x1-x0)*(yy-y0)/(y1-y0)+x0;                /* intersect P6 | P0 P1 */
       this.plotQuadRationalBezierSeg(x0,y0, Math.floor(xx+0.5),y, x,y, ww);
       xx = (x1-x2)*(yy-y2)/(y1-y2)+x2;                /* intersect P7 | P1 P2 */
       x1 = Math.floor(xx+0.5); x0 = x; y0 = y1 = y;       /* P0 = P6, P1 = P7 */
    }
    this.plotQuadRationalBezierSeg(x0,y0, x1,y1, x2,y2, w*w);          /* remaining */
 }
 
  plotRotatedEllipse(x: number, y: number, a: number, b: number, angle: number)
 {                                   /* plot ellipse rotated by angle (radian) */
    var xd = a*a, yd = b*b;
    var s = Math.sin(angle)
   let zd = (xd-yd)*s;               /* ellipse rotation */
    xd = Math.sqrt(xd-zd*s);
     yd = Math.sqrt(yd+zd*s);      /* surrounding rect */
    a = Math.floor(xd+0.5); b = Math.floor(yd+0.5); zd = zd*a*b/(xd*yd);  
    this.plotRotatedEllipseRect(x-a,y-b, x+a,y+b, (4*zd*Math.cos(angle)));
 }
 
  plotRotatedEllipseRect(x0: number, y0: number, x1: number, y1: number, zd: number)
 {                  /* rectangle enclosing the ellipse, integer rotation angle */
    var xd = x1-x0, yd = y1-y0, w = xd*yd;
    if (zd === 0) return this.plotEllipseRect(x0,y0, x1,y1);          /* looks nicer */
    if (w !== 0.0) w = (w-zd)/(w+w);                    /* squared weight of P1 */
    this.assert(w <= 1.0 && w >= 0.0);                /* limit angle to |zd|<=xd*yd */
    xd = Math.floor(xd*w+0.5); yd = Math.floor(yd*w+0.5);       /* snap to int */
    this.plotQuadRationalBezierSeg(x0,y0+yd, x0,y0, x0+xd,y0, 1.0-w);
    this.plotQuadRationalBezierSeg(x0,y0+yd, x0,y1, x1-xd,y1, w);
    this.plotQuadRationalBezierSeg(x1,y1-yd, x1,y1, x1-xd,y1, 1.0-w);
    this.plotQuadRationalBezierSeg(x1,y1-yd, x1,y0, x0+xd,y0, w);
 }
 
  plotCubicBezierSeg(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number)
 {                                        /* plot limited cubic Bezier segment */
    var f, fx, fy, leg = 1;
    var sx = x0 < x3 ? 1 : -1, sy = y0 < y3 ? 1 : -1;        /* step direction */
    var xc = -Math.abs(x0+x1-x2-x3), xa = xc-4*sx*(x1-x2), xb = sx*(x0-x1-x2+x3);
    var yc = -Math.abs(y0+y1-y2-y3), ya = yc-4*sy*(y1-y2), yb = sy*(y0-y1-y2+y3);
    var ab, ac, bc, cb, xx, xy, yy, dx, dy, ex, pxy, EP = 0.01;
                                                  /* check for curve restrains */
    /* slope P0-P1 === P2-P3    and  (P0-P3 === P1-P2      or  no slope change)  */
    this.assert((x1-x0)*(x2-x3) < EP && ((x3-x0)*(x1-x2) < EP || xb*xb < xa*xc+EP));
    this.assert((y1-y0)*(y2-y3) < EP && ((y3-y0)*(y1-y2) < EP || yb*yb < ya*yc+EP));
 
    if (xa === 0 && ya === 0)                                /* quadratic Bezier */
       return this.plotQuadBezierSeg(x0,y0, (3*x1-x0)>>1,(3*y1-y0)>>1, x3,y3);
    x1 = (x1-x0)*(x1-x0)+(y1-y0)*(y1-y0)+1;                    /* line lengths */
    x2 = (x2-x3)*(x2-x3)+(y2-y3)*(y2-y3)+1;
 
    do {                                                /* loop over both ends */
       ab = xa*yb-xb*ya; ac = xa*yc-xc*ya; bc = xb*yc-xc*yb;
       ex = ab*(ab+ac-3*bc)+ac*ac;       /* P0 part of self-intersection loop? */
       f = ex > 0 ? 1 : Math.floor(Math.sqrt(1+1024/x1));   /* calc resolution */
       ab *= f; ac *= f; bc *= f; ex *= f*f;            /* increase resolution */
       xy = 9*(ab+ac+bc)/8; cb = 8*(xa-ya);  /* init differences of 1st degree */
       dx = 27*(8*ab*(yb*yb-ya*yc)+ex*(ya+2*yb+yc))/64-ya*ya*(xy-ya);
       dy = 27*(8*ab*(xb*xb-xa*xc)-ex*(xa+2*xb+xc))/64-xa*xa*(xy+xa);
                                             /* init differences of 2nd degree */
       xx = 3*(3*ab*(3*yb*yb-ya*ya-2*ya*yc)-ya*(3*ac*(ya+yb)+ya*cb))/4;
       yy = 3*(3*ab*(3*xb*xb-xa*xa-2*xa*xc)-xa*(3*ac*(xa+xb)+xa*cb))/4;
       xy = xa*ya*(6*ab+6*ac-3*bc+cb); ac = ya*ya; cb = xa*xa;
       xy = 3*(xy+9*f*(cb*yb*yc-xb*xc*ac)-18*xb*yb*ab)/8;
 
       if (ex < 0) {         /* negate values if inside self-intersection loop */
          dx = -dx; dy = -dy; xx = -xx; yy = -yy; xy = -xy; ac = -ac; cb = -cb;
       }                                     /* init differences of 3rd degree */
       ab = 6*ya*ac; ac = -6*xa*ac; bc = 6*ya*cb; cb = -6*xa*cb;
       dx += xy; ex = dx+dy; dy += xy;                    /* error of 1st step */
 exit: 
       for (pxy = 0, fx = fy = f; x0 !== x3 && y0 !== y3; ) {
          this.setPixel(x0,y0);                                       /* plot curve */
          do {                                  /* move sub-steps of one pixel */
             if (pxy === 0) if (dx > xy || dy < xy) break exit;    /* confusing */
             if (pxy === 1) if (dx > 0 || dy < 0) break exit;         /* values */
             y1 = 2*ex-dy;                    /* save value for test of y step */
             if (2*ex >= dx) {                                   /* x sub-step */
                fx--; ex += dx += xx; dy += xy += ac; yy += bc; xx += ab;
             } else if (y1 > 0) break exit;
             if (y1 <= 0) {                                      /* y sub-step */
                fy--; ex += dy += yy; dx += xy += bc; xx += ac; yy += cb;
             }
          } while (fx > 0 && fy > 0);                       /* pixel complete? */
          if (2*fx <= f) { x0 += sx; fx += f; }                      /* x step */
          if (2*fy <= f) { y0 += sy; fy += f; }                      /* y step */
          if (pxy === 0 && dx < 0 && dy > 0) pxy = 1;      /* pixel ahead valid */
       }
       xx = x0; x0 = x3; x3 = xx; sx = -sx; xb = -xb;             /* swap legs */
       yy = y0; y0 = y3; y3 = yy; sy = -sy; yb = -yb; x1 = x2;
    } while (leg--);                                          /* try other end */
    this.plotLine(x0,y0, x3,y3);       /* remaining part in case of cusp or crunode */
 }
 
  plotCubicBezier(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number)
 {                                              /* plot any cubic Bezier curve */
    var n = 0, i = 0;
    var xc = x0+x1-x2-x3, xa = xc-4*(x1-x2);
    var xb = x0-x1-x2+x3, xd = xb+4*(x1+x2);
    var yc = y0+y1-y2-y3, ya = yc-4*(y1-y2);
    var yb = y0-y1-y2+y3, yd = yb+4*(y1+y2);
    var fx0 = x0, fx1, fx2, fx3, fy0 = y0, fy1, fy2, fy3;
    var t1 = xb*xb-xa*xc, t2, t = new Array(5);
                                  /* sub-divide curve at gradient sign changes */
    if (xa === 0) {                                               /* horizontal */
       if (Math.abs(xc) < 2*Math.abs(xb)) t[n++] = xc/(2.0*xb);  /* one change */
    } else if (t1 > 0.0) {                                      /* two changes */
       t2 = Math.sqrt(t1);
       t1 = (xb-t2)/xa; if (Math.abs(t1) < 1.0) t[n++] = t1;
       t1 = (xb+t2)/xa; if (Math.abs(t1) < 1.0) t[n++] = t1;
    }
    t1 = yb*yb-ya*yc;
    if (ya === 0) {                                                 /* vertical */
       if (Math.abs(yc) < 2*Math.abs(yb)) t[n++] = yc/(2.0*yb);  /* one change */
    } else if (t1 > 0.0) {                                      /* two changes */
       t2 = Math.sqrt(t1);
       t1 = (yb-t2)/ya; if (Math.abs(t1) < 1.0) t[n++] = t1;
       t1 = (yb+t2)/ya; if (Math.abs(t1) < 1.0) t[n++] = t1;
    }
    for (i = 1; i < n; i++)                         /* bubble sort of 4 points */
       if ((t1 = t[i-1]) > t[i]) { t[i-1] = t[i]; t[i] = t1; i = 0; }
 
    t1 = -1.0; t[n] = 1.0;                                /* begin / end point */
    for (i = 0; i <= n; i++) {                 /* plot each segment separately */
       t2 = t[i];                                /* sub-divide at t[i-1], t[i] */
       fx1 = (t1*(t1*xb-2*xc)-t2*(t1*(t1*xa-2*xb)+xc)+xd)/8-fx0;
       fy1 = (t1*(t1*yb-2*yc)-t2*(t1*(t1*ya-2*yb)+yc)+yd)/8-fy0;
       fx2 = (t2*(t2*xb-2*xc)-t1*(t2*(t2*xa-2*xb)+xc)+xd)/8-fx0;
       fy2 = (t2*(t2*yb-2*yc)-t1*(t2*(t2*ya-2*yb)+yc)+yd)/8-fy0;
       fx0 -= fx3 = (t2*(t2*(3*xb-t2*xa)-3*xc)+xd)/8;
       fy0 -= fy3 = (t2*(t2*(3*yb-t2*ya)-3*yc)+yd)/8;
       x3 = Math.floor(fx3+0.5); y3 = Math.floor(fy3+0.5);     /* scale bounds */
       if (fx0 !== 0.0) { fx1 *= fx0 = (x0-x3)/fx0; fx2 *= fx0; }
       if (fy0 !== 0.0) { fy1 *= fy0 = (y0-y3)/fy0; fy2 *= fy0; }
       if (x0 !== x3 || y0 !== y3)                            /* segment t1 - t2 */
          this.plotCubicBezierSeg(x0,y0, x0+fx1,y0+fy1, x0+fx2,y0+fy2, x3,y3);
       x0 = x3; y0 = y3; fx0 = fx3; fy0 = fy3; t1 = t2;
    }
 }
}