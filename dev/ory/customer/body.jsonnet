function(ctx) {
    identity_id: if std.objectHas(ctx, "identity") then ctx.identity.id else null,
    email: if std.objectHas(ctx.identity.traits, "email") then ctx.identity.traits.email else null,
    transient_payload: if std.objectHas(ctx.flow, "transient_payload") then ctx.flow.transient_payload else null,
    schema_id: ctx.identity.schema_id,
    flow_id: ctx.flow.id,
    flow_type: ctx.flow.type
}
