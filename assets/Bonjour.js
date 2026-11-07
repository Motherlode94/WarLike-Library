export const fields = { speed: 45 };
export function Update(ctx) {
  ctx.Rotate(ctx.fields.speed * ctx.Time.deltaTime);
}
