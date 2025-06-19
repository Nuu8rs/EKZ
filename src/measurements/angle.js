export function measureAngle(v1, v2) {
    return v1.angleTo(v2) * (180 / Math.PI); // возвращаем в градусах
  }
  