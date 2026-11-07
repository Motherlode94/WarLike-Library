// Attacher à un objectif 3D. Les acteurs participants portent team et playable3d ou tacticalUnit.
export const fields = { radius: 6, seconds: 10, progress: 0, capturingTeam: -1, ownerTeam: -1 };
export function Update(ctx) {
    const f = ctx.fields;
    const teams = new Set();
    for (const actor of ctx.entities) {
        if (actor === ctx.entity || actor.enabled === false || !(actor.playable3d || actor.tacticalUnit)) continue;
        if ((actor.stats?.health ?? actor.hp ?? 100) <= 0 || !Number.isInteger(actor.team)) continue;
        if (Math.hypot(actor.x - ctx.entity.x, actor.y - ctx.entity.y) <= f.radius * 64) teams.add(actor.team);
    }
    if (teams.size !== 1) return; // Aucun participant ou objectif contesté : capture en pause.
    const team = [...teams][0];
    if (team === f.ownerTeam) return;
    if (f.capturingTeam !== team) { f.progress = 0; f.capturingTeam = team; }
    f.progress = Math.min(100, f.progress + ctx.Time.deltaTime / Math.max(0.1, f.seconds) * 100);
    if (f.progress >= 100) {
        f.ownerTeam = team;
        ctx.Signal("objectif:captured");
        ctx.Log("Objectif capturé par équipe " + team);
    }
}
