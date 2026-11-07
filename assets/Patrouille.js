// Attacher au soldat 3D. Le déplacement passe par les collisions du moteur.
export const fields = { speed: 2, distance: 4, originX: 0, direction: 1 };
export function Start(ctx) { ctx.fields.originX = ctx.entity.x / 64; }
export function Update(ctx) {
    const f = ctx.fields;
    const offset = ctx.entity.x / 64 - f.originX;
    if (offset >= f.distance) f.direction = -1;
    if (offset <= -f.distance) f.direction = 1;
    ctx.Move(f.direction * f.speed * ctx.Time.deltaTime, 0, 0);
}
