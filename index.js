window.onload = () => {
  const canvas = document.getElementById('root');
  const c = canvas.getContext('2d');

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  const FOCAL_LENGTH = 500;
  const strokeStyle = '#ffffff';

  let mouseX = 0;
  let mouseY = 0;
  let mouseUp = true;

  const Point2D = function(x, y) {
    this.x = x;
    this.y = y;
  };

  const Point3D = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  };

  const Cube = function(x, y, z, size) {
    Point3D.call(this, x, y, z);

    this.vxStack = 0;
    this.vyStack = 0;
    this.vx = 0;
    this.vy = 0;
    this.start = y - size / 16;
    this.end = y + size / 16;
    this.yAddition = 1.5;

    size *= 0.5;

    this.vertices = [
      new Point3D(x - size, y - size, z - size),
      new Point3D(x + size, y - size, z - size),
      new Point3D(x + size, y + size, z - size),
      new Point3D(x - size, y + size, z - size),
      new Point3D(x - size, y - size, z + size),
      new Point3D(x + size, y - size, z + size),
      new Point3D(x + size, y + size, z + size),
      new Point3D(x - size, y + size, z + size),
    ];

    this.faces = [
      [3, 0, 1, 2],
      [4, 5, 1, 0],
      [2, 1, 5, 6],
      [2, 6, 7, 3],
      [7, 4, 0, 3],
      [6, 5, 4, 7],
    ];
  };

  Cube.prototype = {
    __calculateVel: function(vel, stack) {
      let resVel = vel;
      let resStack = stack;

      if (stack) {
        resStack = stack + (stack < 0 ? 1 : -1);

        if (Math.abs(vel) < 8 && resStack !== 0) {
          resVel = vel + (resStack < 0 ? 0.5 : -0.5);
        } else {
          resVel = vel + (vel < 0 ? 0.5 : -0.5);
        }

        return [resVel, resStack];
      }

      if (Math.abs(vel) > 0.5) {
        resVel = vel + (vel < 0 ? 0.5 : -0.5);
      } else {
        resVel = 0;
      }

      return [resVel, 0];
    },

    __rotateX: function(radian) {
      const cosine = Math.cos(radian);
      const sine = Math.sin(radian);

      for (const index = this.vertices.length - 1; index > -1; --index) {
        const p = this.vertices[index];

        const y = (p.y - this.y) * cosine - (p.z - this.z) * sine;
        const z = (p.y - this.y) * sine + (p.z - this.z) * cosine;

        p.y = y + this.y;
        p.z = z + this.z;
      }
    },

    __rotateY: function(radian) {
      const cosine = Math.cos(radian);
      const sine = Math.sin(radian);

      for (let index = this.vertices.length - 1; index > -1; --index) {
        const p = this.vertices[index];

        const x = (p.z - this.z) * sine + (p.x - this.x) * cosine;
        const z = (p.z - this.z) * cosine - (p.x - this.x) * sine;

        p.x = x + this.x;
        p.z = z + this.z;
      }
    },

    changeCenter: function(x, y) {
      this.x += x;
      this.y += y;

      for (let point of this.vertices) {
        point.x += x;
        point.y += y;
      }
    },

    setFloatYCoords: function(start, end) {
      this.start = start;
      this.end = end;
    },

    floatY: function(addition) {
      if (Math.abs(this.vyStack) < 5) {
        this.vyStack += mouseUp ? this.yAddition : addition;
      }

      const [vy, stack] = this.__calculateVel(this.vy, this.vyStack);
      this.vy = vy;
      this.vyStack = stack;

      if (this.y <= this.start) {
        this.yAddition = Math.abs(this.yAddition) * -1;
      } else if (this.y >= this.end) {
        this.yAddition = Math.abs(this.yAddition);
      }

      this.changeCenter(0, vy);
    },

    rotateY: function(addition) {
      if (addition && Math.abs(this.vxStack) < 30) {
        this.vxStack -= addition;
      }

      const [vx, stack] = this.__calculateVel(this.vx, this.vxStack);
      this.vx = vx;
      this.vxStack = stack;

      this.__rotateY(this.vx / 100);
    },
  };

  function project(points3d, width, height) {
    const points2d = new Array(points3d.length);

    for (let index = points3d.length - 1; index > -1; --index) {
      const p = points3d[index];

      const x = p.x * (FOCAL_LENGTH / p.z) + width * 0.5;
      const y = p.y * (FOCAL_LENGTH / p.z) + height * 0.5;

      points2d[index] = new Point2D(x, y);
    }

    return points2d;
  }

  function loop() {
    c.clearRect(0, 0, canvas.width, canvas.height);

    cube.floatY();
    cube.rotateY();

    c.strokeStyle = strokeStyle;
    c.fillStyle = '#0080f0';

    let vertices = project(cube.vertices, canvas.width, canvas.height);

    for (let index = cube.faces.length - 1; index > -1; --index) {
      const face = cube.faces[index];

      const p1 = cube.vertices[face[0]];
      const p2 = cube.vertices[face[1]];
      const p3 = cube.vertices[face[2]];

      const v1 = new Point3D(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
      const v2 = new Point3D(p3.x - p1.x, p3.y - p1.y, p3.z - p1.z);

      const n = new Point3D(
        v1.y * v2.z - v1.z * v2.y,
        v1.z * v2.x - v1.x * v2.z,
        v1.x * v2.y - v1.y * v2.x,
      );

      if (-p1.x * n.x + -p1.y * n.y + -p1.z * n.z <= 0) {
        const grad = c.createLinearGradient(
          parseFloat(vertices[face[1]].x),
          parseFloat(vertices[face[1]].y),
          parseFloat(vertices[face[3]].x),
          parseFloat(vertices[face[3]].y),
        );
        if ([1, 3].includes(index)) {
          grad.addColorStop(0, 'orange');
          grad.addColorStop(1, 'orange');
        } else {
          grad.addColorStop(0, 'orange');
          grad.addColorStop(1, 'red');
        }
        c.fillStyle = grad;

        c.beginPath();
        c.moveTo(vertices[face[0]].x, vertices[face[0]].y);
        c.lineTo(vertices[face[1]].x, vertices[face[1]].y);
        c.lineTo(vertices[face[2]].x, vertices[face[2]].y);
        c.lineTo(vertices[face[3]].x, vertices[face[3]].y);
        c.closePath();

        c.fill();
        c.stroke();
      }
    }

    window.requestAnimationFrame(loop);
  }

  window.addEventListener('mousedown', e => {
    mouseUp = false;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    mouseUp = true;
  });

  window.addEventListener('mousemove', e => {
    if (mouseUp) {
      return;
    }

    cube.floatY(Math.round((mouseY - e.clientY) / 10));
    cube.rotateY(Math.round((mouseX - e.clientX) / 10));

    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('resize', () => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
  });

  const cube = new Cube(0, 150, 400, 150);

  loop();
};
