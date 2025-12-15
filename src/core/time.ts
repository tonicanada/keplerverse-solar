export class SimClock {
  public simTimeSeconds = 0;     // tiempo “del universo” en segundos
  public speed = 60;             // 60 = 1s real = 60s simulados (1 min por segundo)
  public paused = false;
  public reverse = false;

  step(realDtSeconds: number) {
    if (this.paused) return;
    const dir = this.reverse ? -1 : 1;
    this.simTimeSeconds += dir * realDtSeconds * this.speed;
  }
}
