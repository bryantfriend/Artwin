export function createCharacterController(world) {
  const controller=world.createCharacterController(.015);
  controller.setUp({x:0,y:1,z:0});
  controller.enableSnapToGround(.18);
  controller.setSlideEnabled(true);
  controller.setNormalNudgeFactor(.001);
  return controller;
}

export function computeCharacterMovement(controller,collider,x,z) {
  // The flat apartment needs no steps or jumping. Snap-to-ground maintains
  // contact while grounded; downward movement resumes if support is lost.
  // Avoid forcing the capsule skin into the floor on every grounded step.
  const y=controller.computedGrounded()?0:-.045;
  controller.computeColliderMovement(collider,{x,y,z},undefined,undefined,c=>c.handle!==collider.handle);
  return controller.computedMovement();
}
