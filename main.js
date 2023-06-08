"use strict";
class Agent {
  constructor(exp) {
    this.eps = 0.2;
    this.exp = exp;
  }
  action(x, j) {
    if (this.getPlanRand()) {
      return this.randomAction();
    }
    return this.actionPlan(x, j);
  }
  actionPlan(x, j) {
    let state = this.exp.filter((el) => {
      return this.eq(el[0], x);
    });
    if (state.length == 0) {
      return this.randomAction();
    }
    let maxPoint = -100;
    let maxMv = null;
    let ptList = [];
    for (let i = -2; i < 3; i++) {
      let point = this.getPoint(i, 0, state);
      if (point > maxPoint) {
        maxMv = [i, 0];
        maxPoint = point;
      }
      if (j) {
        point = this.getPoint(i, 1, state);
        if (point > maxPoint) {
          maxMv = [i, 1];
          maxPoint = point;
        }
      }
    }
    return maxMv;
  }
  getPoint(ac1, ac2, state) {
    let point = 0;
    let num = 0;
    for (let i = 0; i < state.length; i++) {
      if (state[i][1][0] == ac1 && state[i][1][1] == ac2) {
        point += state[i][2][0];
        num++;
      }
    }
    if (num == 0) {
      return 0;
    }
    return point / num;
  }
  eq(a, b) {
    if (a.length != b.length) {
      return false;
    }
    for (var i = 0, n = a.length; i < n; ++i) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  randomAction() {
    return [this.getRandomInt(5) - 2, this.getRandomInt(2)];
  }
  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  getPlanRand() {
    if (Math.random() < this.eps) {
      return true;
    } else {
      return false;
    }
  }
}
class Obj {
  constructor(x1, x2, y1, y2, mvX, mvY) {
    tihs.x1 = x1;
    tihs.x2 = x2;
    tihs.y1 = y1;
    tihs.y2 = y2;
    tihs.mvX = mvX;
    tihs.mvY = mvY;
  }
  check(ex1, ex2, ey1, ey2) {
    if (ex1 > this.x2) {
      return false;
    }
    if (ex2 < this.x1) {
      return false;
    }
    if (ey1 > this.y2) {
      return false;
    }
    if (ey2 < this.y1) {
      return false;
    }
    return true;
  }
}
class Manager {
  constructor() {
    this.course = new Course([]);
    this.exp = [];
    this.before_pos = 100;
    this.count = 0;
  }
  draw() {
    ctx.fillStyle = "#FFF";
    ctx.fillText(pos, 10, 10);
    this.course.draw();
  }
  action() {
    this.count++;
    const isReset = this.course.action();
    if (count % 10 == 0) {
      this.get_exp();
      this.before_pos = pos;
    }
    if (isReset) {
      this.get_exp();
      this.before_pos = 100;
      this.reset();
    }
  }
  reset() {
    this.course = new Course(this.exp);
  }
  get_exp() {
    console.log("reset");
    let hist = this.course.mvHistory;
    let score = pos - this.before_pos;
    let point = 0;
    let newNum = null;
    for (let i = 0; i < hist.length; i++) {
      let tmv = this.exp.filter((el) => {
        if (!this.eq(el[0], hist[i][0])) {
          return false;
        }
        if (!this.eq(el[1], hist[i][1])) {
          return false;
        }
        return true;
      });
      if (tmv.length == 0) {
        newNum = [hist[i][0], hist[i][1], [score, 1]];
      } else if (tmv[0][2][1] >= THR) {
        newNum = [
          hist[i][0],
          hist[i][1],
          [(tmv[0][2][0] * THR + score) / (THR + 1), THR + 1],
        ];
      } else {
        newNum = [
          hist[i][0],
          hist[i][1],
          [
            (tmv[0][2][0] * tmv[0][2][1] + score) / (tmv[0][2][1] + 1),
            tmv[0][2][1] + 1,
          ],
        ];
      }

      let numCount = 0;
      let delNum = this.exp.findIndex((el) => {
        if (!this.eq(el[0], hist[i][0])) {
          return false;
        }
        if (!this.eq(el[1], hist[i][1])) {
          return false;
        }
        numCount = 1;
        return true;
      });
      if (numCount != 0) {
        this.exp.splice(delNum, 1);
      }
      this.exp.push(newNum);
    }
  }

  eq(a, b) {
    if (a.length != b.length) {
      return false;
    }
    for (var i = 0, n = a.length; i < n; ++i) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
}
class Course {
  constructor(exp) {
    height = 0;
    pos = 100;
    this.cVec = 0;
    this.cWidth = 25;
    this.cHeight = 50;
    this.age = new Agent(exp);
    this.enm = [];
    this.hole = [];
    this.count = 0;
    this.LIMIT = 200;
    this.mvHistory = [];
    this.dead = false;
  }
  draw() {
    if (this.count > this.LIMIT) {
      return;
    }
    ctx.drawImage(
      chara,
      pos,
      canvasY - 150 - height,
      this.cWidth,
      this.cHeight
    );
  }
  action() {
    if (this.count == this.LIMIT) {
      return true;
    }
    this.count++;
    let state = [-1, 0, 0, 0, 0, 0, 0, 0, 0];
    let hole_p = parseInt((HOLE_R1 - pos) / 30);
    if (hole_p >= -1 && hole_p < 2) {
      state[hole_p + 3] = 1;
    }
    hole_p = parseInt((HOLE_R2 - pos) / 30);
    if (hole_p >= -1 && hole_p < 2) {
      state[hole_p + 3] = 1;
    }
    if (height != 0) {
      state[8] = 1;
    }
    let x = this.age.action(state, height == 0);

    if (x == null) {
      console.log(state);
    }
    this.mvHistory.push([state, x]);
    if (height == 0 && this.cVec == 0 && x[1]) {
      this.cVec += 25;
    }
    if (this.cVec != 0) {
      this.cVec--;
      height += 8;
      pos += x[0] * 4;
    } else {
      pos += x[0] * 5;
    }
    height -= 4;
    if (height < 0) {
      height = 0;
    }
    if (pos < 0) {
      pos = 0;
    }
    if (
      (this.check_hole(HOLE_R1, HOLE_L1) ||
        this.check_hole(HOLE_R2, HOLE_L2)) &&
      height == 0
    ) {
      this.dead = true;
      console.log("dead");
      return true;
    }
    return false;
  }
  check_hole(r, l) {
    return r < pos && l > this.cWidth + pos;
  }
}

const canvasX = 10000;
const canvasY = 500;
const THR = 100;
let can = document.getElementById("canvas");
let ctx = can.getContext("2d");
const chara = new Image();
const HOLE_R1 = 280;
const HOLE_L1 = 360;
const HOLE_R2 = 600;
const HOLE_L2 = 680;
chara.src =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAABYSURBVGhD7c/BCYBAAAPBaP89qw+LmIMdCHnvte35drz7/+MVoilEU4imEE0hmkI0hWgK0RSiKURTiKYQTSGaQjSFaArRFKIpRFOIphBNIZpCNIVoCrFsL+uaAWNMad0+AAAAAElFTkSuQmCC";
let count = 0;
let height = 0;
let pos = 0;
let manager = new Manager();
let timer = setInterval(function () {
  ctx.clearRect(0, 0, canvasX, canvasY);
  ctx.fillStyle = "#88F";
  ctx.fillRect(0, 0, canvasX, canvasY);
  ctx.fillStyle = "#C96";
  ctx.fillRect(0, canvasY - 100, canvasX, 100);
  ctx.fillStyle = "#88F";
  ctx.fillRect(HOLE_R1, canvasY - 100, HOLE_L1 - HOLE_R1, 100);
  ctx.fillStyle = "#88F";
  ctx.fillRect(HOLE_R2, canvasY - 100, HOLE_L2 - HOLE_R2, 100);
  manager.draw();
  manager.action();
  count++;
}, 10);